// WhatsApp connector using Baileys

import type { ConnectorConfig, ConnectorInterface, ConnectorStatus, InboundMessage, OutboundMessage } from './types.js';
import { logger } from '../lib/logger.js';

type MessageCallback = (message: InboundMessage, config: ConnectorConfig) => void;

export class WhatsAppConnector implements ConnectorInterface {
  readonly platform = 'whatsapp' as const;
  private socket: unknown = null;
  private status: ConnectorStatus = 'disconnected';
  private config: ConnectorConfig | null = null;
  private onMessage: MessageCallback;

  constructor(onMessage: MessageCallback) {
    this.onMessage = onMessage;
  }

  async start(config: ConnectorConfig): Promise<void> {
    this.config = config;
    this.status = 'connecting';

    try {
      const baileys = await import('@whiskeysockets/baileys');
      const makeWASocket = baileys.default;
      const DisconnectReason = baileys.DisconnectReason;
      const authState = await baileys.useMultiFileAuthState('./data/whatsapp-auth');
      const { state, saveCreds } = authState;

      this.socket = makeWASocket({
        auth: state,
        printQRInTerminal: true,
      });

      const sock = this.socket as Record<string, unknown>;

      // Handle connection events
      const ev = sock.ev as { on: (event: string, handler: (...args: unknown[]) => void) => void };

      ev.on('connection.update', (update: Record<string, unknown>) => {
        const { connection, lastDisconnect } = update as { connection?: string; lastDisconnect?: { error?: { output?: { statusCode?: number } } } };

        if (connection === 'close') {
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
          if (shouldReconnect) {
            this.status = 'connecting';
            this.start(config).catch(() => { this.status = 'error'; });
          } else {
            this.status = 'disconnected';
          }
        } else if (connection === 'open') {
          this.status = 'connected';
          logger.info('WhatsApp connected');
        }
      });

      ev.on('creds.update', saveCreds);

      ev.on('messages.upsert', (m: Record<string, unknown>) => {
        const messages = (m.messages ?? []) as Array<Record<string, unknown>>;
        for (const msg of messages) {
          const key = msg.key as Record<string, unknown>;
          if (key.fromMe) continue;

          const messageContent = msg.message as Record<string, unknown>;
          const text = (messageContent?.conversation ?? messageContent?.extendedTextMessage?.text ?? '') as string;
          if (!text) continue;

          this.onMessage({
            externalId: key.id as string,
            platform: 'whatsapp',
            channelId: key.remoteJid as string,
            sender: {
              externalId: key.participant as string ?? key.remoteJid as string,
              name: (msg.pushName ?? 'Unknown') as string,
            },
            content: text,
            type: 'text',
            timestamp: ((msg.messageTimestamp as number) ?? Date.now() / 1000) * 1000,
            raw: msg,
          }, config);
        }
      });

    } catch (err) {
      this.status = 'error';
      throw err;
    }
  }

  async stop(): Promise<void> {
    if (this.socket) {
      const sock = this.socket as { end: (reason: unknown) => void };
      sock.end(undefined);
      this.socket = null;
    }
    this.status = 'disconnected';
  }

  async send(message: OutboundMessage): Promise<void> {
    if (!this.socket || this.status !== 'connected') {
      throw new Error('WhatsApp not connected');
    }

    const sock = this.socket as { sendMessage: (jid: string, content: Record<string, unknown>) => Promise<unknown> };
    await sock.sendMessage(message.channelId, { text: message.content });
  }

  getStatus(): ConnectorStatus {
    return this.status;
  }
}
