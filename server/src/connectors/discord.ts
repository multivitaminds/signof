// Discord connector using Discord.js

import type { ConnectorConfig, ConnectorInterface, ConnectorStatus, InboundMessage, OutboundMessage } from './types.js';
import { logger } from '../lib/logger.js';

type MessageCallback = (message: InboundMessage, config: ConnectorConfig) => void;

export class DiscordConnector implements ConnectorInterface {
  readonly platform = 'discord' as const;
  private client: unknown = null;
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
      throw new Error('Discord bot token is required');
    }

    try {
      const { Client, GatewayIntentBits } = await import('discord.js');
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.DirectMessages,
        ],
      });

      const client = this.client as InstanceType<typeof Client>;

      client.on('ready', () => {
        this.status = 'connected';
        logger.info('Discord bot connected', { username: client.user?.username });
      });

      client.on('messageCreate', (msg) => {
        // Ignore bot messages
        if (msg.author.bot) return;

        this.onMessage({
          externalId: msg.id,
          platform: 'discord',
          channelId: msg.channelId,
          channelName: msg.channel.isDMBased() ? 'DM' : (msg.channel as unknown as { name: string }).name,
          sender: {
            externalId: msg.author.id,
            name: msg.author.displayName ?? msg.author.username,
            username: msg.author.username,
            avatarUrl: msg.author.avatarURL() ?? undefined,
          },
          content: msg.content,
          type: 'text',
          replyToId: msg.reference?.messageId ?? undefined,
          threadId: msg.thread?.id,
          timestamp: msg.createdTimestamp,
          raw: msg,
        }, config);
      });

      await client.login(botToken);

    } catch (err) {
      this.status = 'error';
      throw err;
    }
  }

  async stop(): Promise<void> {
    if (this.client) {
      const client = this.client as { destroy: () => void };
      client.destroy();
      this.client = null;
    }
    this.status = 'disconnected';
  }

  async send(message: OutboundMessage): Promise<void> {
    if (!this.client || this.status !== 'connected') {
      throw new Error('Discord bot not connected');
    }

    const client = this.client as { channels: { fetch: (id: string) => Promise<{ send: (content: string | Record<string, unknown>) => Promise<unknown> } | null> } };
    const channel = await client.channels.fetch(message.channelId);
    if (!channel) throw new Error(`Channel ${message.channelId} not found`);

    await channel.send({
      content: message.content,
      reply: message.replyToId ? { messageReference: message.replyToId } : undefined,
    } as unknown as string);
  }

  getStatus(): ConnectorStatus {
    return this.status;
  }
}
