// WebSocket server for Command Center real-time gateway

import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { handleChatMessage } from './messageHandler.js';
import type { IncomingMessage } from './messageHandler.js';
import { createSession, closeSession } from './sessionStore.js';
import { logger } from '../lib/logger.js';

interface WSMessage {
  event: string;
  data: Record<string, unknown>;
}

interface WsRateTracker {
  count: number;
  resetAt: number;
}

// Module-level reference for connection count queries
let wssInstance: WebSocketServer | null = null;

// Store current soul config in memory (updated via soul.update events)
let currentSoulConfig: Record<string, unknown> | null = null;

export function getCurrentSoulConfig(): Record<string, unknown> | null {
  return currentSoulConfig;
}

export function getWSConnectionCount(): number {
  if (!wssInstance) return 0;
  return wssInstance.clients.size;
}

function send(ws: WebSocket, event: string, data: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ event, data, timestamp: Date.now() }));
  }
}

function parseMessage(raw: Buffer | ArrayBuffer | Buffer[]): WSMessage | null {
  try {
    const text = typeof raw === 'string' ? raw : Buffer.from(raw as Buffer).toString('utf-8');
    const parsed: unknown = JSON.parse(text);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'event' in parsed &&
      'data' in parsed &&
      typeof (parsed as Record<string, unknown>).event === 'string'
    ) {
      return parsed as WSMessage;
    }
    return null;
  } catch {
    return null;
  }
}

const WS_CHAT_RATE_LIMIT = 10; // max chat.message events per minute
const WS_CHAT_RATE_WINDOW = 60_000; // 1 minute

export function createWebSocketServer(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer });
  wssInstance = wss;
  const authenticatedClients = new Set<WebSocket>();
  const chatRateLimits = new Map<WebSocket, WsRateTracker>();

  // Heartbeat: 30s ping to keep connections alive
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeat);
  });

  wss.on('connection', (ws) => {
    const apiKey = process.env.ORCHESTREE_API_KEY;

    // Send current gateway status on connect
    send(ws, 'gateway.status', { status: 'online', timestamp: Date.now() });

    // Dev mode: if no API key configured, auto-authenticate
    if (!apiKey) {
      authenticatedClients.add(ws);
    }

    // Auth timeout: close connection if not authenticated within 5 seconds
    const authTimer = !apiKey ? null : setTimeout(() => {
      if (!authenticatedClients.has(ws)) {
        send(ws, 'error', { message: 'Authentication timeout' });
        ws.close(4001, 'Authentication timeout');
      }
    }, 5000);

    ws.on('message', (raw) => {
      const msg = parseMessage(raw);
      if (!msg) {
        send(ws, 'error', { message: 'Invalid message format. Expected { event, data }.' });
        return;
      }

      // Handle auth event
      if (msg.event === 'auth') {
        const token = (msg.data as Record<string, unknown>).token as string | undefined;
        if (!apiKey || token === apiKey) {
          authenticatedClients.add(ws);
          if (authTimer) clearTimeout(authTimer);
          send(ws, 'auth.success', { authenticated: true });
        } else {
          send(ws, 'error', { message: 'Invalid API key' });
          ws.close(4003, 'Invalid API key');
        }
        return;
      }

      // Reject non-auth messages from unauthenticated clients
      if (!authenticatedClients.has(ws)) {
        send(ws, 'error', { message: 'Not authenticated. Send auth event first.' });
        return;
      }

      // Rate limit chat.message events
      if (msg.event === 'chat.message') {
        const now = Date.now();
        let tracker = chatRateLimits.get(ws);
        if (!tracker || now >= tracker.resetAt) {
          tracker = { count: 0, resetAt: now + WS_CHAT_RATE_WINDOW };
          chatRateLimits.set(ws, tracker);
        }
        tracker.count++;
        if (tracker.count > WS_CHAT_RATE_LIMIT) {
          send(ws, 'error', { message: 'Rate limit exceeded for chat messages. Max 10 per minute.' });
          return;
        }
      }

      handleEvent(ws, msg.event, msg.data).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error';
        logger.error('WebSocket event error', { event: msg.event, error: message });
        send(ws, 'error', { message });
      });
    });

    ws.on('close', () => {
      authenticatedClients.delete(ws);
      chatRateLimits.delete(ws);
      if (authTimer) clearTimeout(authTimer);
    });
  });

  logger.info('WebSocket server attached');
  return wss;
}

async function handleEvent(ws: WebSocket, event: string, data: Record<string, unknown>): Promise<void> {
  switch (event) {
    case 'chat.message': {
      const sessionId = data.sessionId as string;
      if (!sessionId || !data.content) {
        send(ws, 'error', { message: 'chat.message requires sessionId and content' });
        return;
      }

      // Send typing indicator
      send(ws, 'chat.typing', { sessionId });

      // Build the incoming message
      const incoming: IncomingMessage = {
        sessionId,
        content: data.content as string,
        soulConfig: data.soulConfig as IncomingMessage['soulConfig'],
        skills: data.skills as IncomingMessage['skills'],
        senderName: data.senderName as string | undefined,
        channelId: data.channelId as string | undefined,
        channelType: data.channelType as string | undefined,
      };

      const response = await handleChatMessage(incoming);
      send(ws, 'chat.response', { sessionId, message: response });
      break;
    }

    case 'session.create': {
      const session = await createSession({
        channelId: (data.channelId as string) ?? 'webchat',
        channelType: (data.channelType as string) ?? 'webchat',
        contactId: (data.contactId as string) ?? 'anonymous',
        contactName: (data.contactName as string) ?? 'Anonymous',
      });
      send(ws, 'session.created', session);
      break;
    }

    case 'session.close': {
      const sessionId = data.sessionId as string;
      if (!sessionId) {
        send(ws, 'error', { message: 'session.close requires sessionId' });
        return;
      }
      await closeSession(sessionId);
      send(ws, 'session.closed', { sessionId });
      break;
    }

    case 'soul.update': {
      currentSoulConfig = data;
      send(ws, 'soul.updated', { success: true });
      break;
    }

    default: {
      send(ws, 'error', { message: `Unknown event: ${event}` });
    }
  }
}
