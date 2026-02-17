// WebSocket server for Command Center real-time gateway

import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { handleChatMessage } from './messageHandler.js';
import type { IncomingMessage } from './messageHandler.js';
import { createSession, closeSession } from './sessionStore.js';

interface WSMessage {
  event: string;
  data: Record<string, unknown>;
}

// Store current soul config in memory (updated via soul.update events)
let currentSoulConfig: Record<string, unknown> | null = null;

export function getCurrentSoulConfig(): Record<string, unknown> | null {
  return currentSoulConfig;
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

export function createWebSocketServer(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer });

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
    // Send current gateway status on connect
    send(ws, 'gateway.status', { status: 'online', timestamp: Date.now() });

    ws.on('message', (raw) => {
      const msg = parseMessage(raw);
      if (!msg) {
        send(ws, 'error', { message: 'Invalid message format. Expected { event, data }.' });
        return;
      }

      handleEvent(ws, msg.event, msg.data).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[ws error] ${msg.event}:`, message);
        send(ws, 'error', { message });
      });
    });

    ws.on('close', () => {
      // Client disconnected — nothing to clean up for now
    });
  });

  console.log('[ws] WebSocket server attached');
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
      const session = createSession({
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
      closeSession(sessionId);
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
