// Telegram connector using Grammy

import type { ConnectorConfig, ConnectorInterface, ConnectorStatus, InboundMessage, OutboundMessage } from './types.js';
import { logger } from '../lib/logger.js';

type MessageCallback = (message: InboundMessage, config: ConnectorConfig) => void;

export class TelegramConnector implements ConnectorInterface {
  readonly platform = 'telegram' as const;
  private bot: unknown = null;
  private status: ConnectorStatus = 'disconnected';
  private config: ConnectorConfig | null = null;
  private onMessage: MessageCallback;

  constructor(onMessage: MessageCallback) {
    this.onMessage = onMessage;
  }

  async start(config: ConnectorConfig): Promise<void> {
    this.config = config;
    this.status = 'connecting';

    const botToken = config.credentials.botToken;
    if (!botToken) {
      this.status = 'error';
      throw new Error('Telegram bot token is required');
    }

    try {
      // Dynamic import — Grammy is optional
      const { Bot } = await import('grammy');
      this.bot = new Bot(botToken);

      const bot = this.bot as InstanceType<typeof Bot>;

      // Handle text messages
      bot.on('message:text', (ctx) => {
        const msg = ctx.message;
        this.onMessage({
          externalId: msg.message_id.toString(),
          platform: 'telegram',
          channelId: msg.chat.id.toString(),
          channelName: msg.chat.type === 'private'
            ? msg.from?.first_name
            : (msg.chat as unknown as { title?: string }).title,
          sender: {
            externalId: msg.from.id.toString(),
            name: [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' '),
            username: msg.from.username,
          },
          content: msg.text,
          type: 'text',
          replyToId: msg.reply_to_message?.message_id.toString(),
          timestamp: msg.date * 1000,
          raw: msg,
        }, config);
      });

      // Start polling
      bot.start();
      this.status = 'connected';
      logger.info('Telegram bot started', { botToken: `${botToken.slice(0, 8)}...` });

    } catch (err) {
      this.status = 'error';
      throw err;
    }
  }

  async stop(): Promise<void> {
    if (this.bot) {
      const bot = this.bot as { stop: () => void };
      bot.stop();
      this.bot = null;
    }
    this.status = 'disconnected';
  }

  async send(message: OutboundMessage): Promise<void> {
    if (!this.bot || this.status !== 'connected') {
      throw new Error('Telegram bot not connected');
    }

    const bot = this.bot as { api: { sendMessage: (chatId: string, text: string, options?: Record<string, unknown>) => Promise<unknown> } };
    await bot.api.sendMessage(message.channelId, message.content, {
      reply_to_message_id: message.replyToId ? parseInt(message.replyToId) : undefined,
      parse_mode: message.format?.markdown ? 'MarkdownV2' : undefined,
    });
  }

  getStatus(): ConnectorStatus {
    return this.status;
  }
}
