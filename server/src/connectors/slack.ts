// Slack connector using Bolt

import type { ConnectorConfig, ConnectorInterface, ConnectorStatus, InboundMessage, OutboundMessage } from './types.js';
import { logger } from '../lib/logger.js';

type MessageCallback = (message: InboundMessage, config: ConnectorConfig) => void;

export class SlackConnector implements ConnectorInterface {
  readonly platform = 'slack' as const;
  private app: unknown = null;
  private status: ConnectorStatus = 'disconnected';
  private config: ConnectorConfig | null = null;
  private onMessage: MessageCallback;

  constructor(onMessage: MessageCallback) {
    this.onMessage = onMessage;
  }

  async start(config: ConnectorConfig): Promise<void> {
    this.config = config;
    this.status = 'connecting';

    const { botToken, signingSecret, appToken } = config.credentials;
    if (!botToken || !signingSecret) {
      this.status = 'error';
      throw new Error('Slack bot token and signing secret are required');
    }

    try {
      const { App } = await import('@slack/bolt');
      this.app = new App({
        token: botToken,
        signingSecret,
        socketMode: !!appToken,
        appToken,
      });

      const app = this.app as InstanceType<typeof App>;

      // Handle messages
      app.message(async ({ message }) => {
        const msg = message as Record<string, unknown>;
        if (msg.subtype) return; // Ignore system messages

        this.onMessage({
          externalId: msg.ts as string,
          platform: 'slack',
          channelId: msg.channel as string,
          sender: {
            externalId: msg.user as string,
            name: msg.user as string, // Will be resolved by Slack API in production
          },
          content: msg.text as string,
          type: 'text',
          threadId: msg.thread_ts as string | undefined,
          timestamp: parseFloat(msg.ts as string) * 1000,
          raw: msg,
        }, config);
      });

      await app.start();
      this.status = 'connected';
      logger.info('Slack bot started');

    } catch (err) {
      this.status = 'error';
      throw err;
    }
  }

  async stop(): Promise<void> {
    if (this.app) {
      const app = this.app as { stop: () => Promise<void> };
      await app.stop();
      this.app = null;
    }
    this.status = 'disconnected';
  }

  async send(message: OutboundMessage): Promise<void> {
    if (!this.app || this.status !== 'connected') {
      throw new Error('Slack bot not connected');
    }

    const app = this.app as { client: { chat: { postMessage: (opts: Record<string, unknown>) => Promise<unknown> } } };
    await app.client.chat.postMessage({
      channel: message.channelId,
      text: message.content,
      thread_ts: message.threadId,
    });
  }

  getStatus(): ConnectorStatus {
    return this.status;
  }
}
