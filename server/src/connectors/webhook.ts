// Generic webhook connector for custom integrations

import type { ConnectorConfig, ConnectorInterface, ConnectorStatus, InboundMessage, OutboundMessage } from './types.js';
import { logger } from '../lib/logger.js';

type MessageCallback = (message: InboundMessage, config: ConnectorConfig) => void;

// Store incoming webhook messages in a queue for processing
const messageQueues = new Map<string, InboundMessage[]>();

export class WebhookConnector implements ConnectorInterface {
  readonly platform = 'webhook' as const;
  private status: ConnectorStatus = 'disconnected';
  private config: ConnectorConfig | null = null;
  private onMessage: MessageCallback;

  constructor(onMessage: MessageCallback) {
    this.onMessage = onMessage;
  }

  async start(config: ConnectorConfig): Promise<void> {
    this.config = config;
    this.status = 'connected';
    messageQueues.set(config.id, []);
    logger.info('Webhook connector started', { id: config.id });
  }

  async stop(): Promise<void> {
    if (this.config) {
      messageQueues.delete(this.config.id);
    }
    this.status = 'disconnected';
  }

  /**
   * Process an incoming webhook payload.
   * Called by the webhook HTTP endpoint.
   */
  processWebhook(payload: Record<string, unknown>): void {
    if (!this.config) return;

    const message: InboundMessage = {
      externalId: (payload.id as string) ?? Date.now().toString(),
      platform: 'webhook',
      channelId: (payload.channelId as string) ?? this.config.id,
      sender: {
        externalId: (payload.senderId as string) ?? 'webhook',
        name: (payload.senderName as string) ?? 'Webhook',
      },
      content: (payload.content as string) ?? (payload.text as string) ?? JSON.stringify(payload),
      type: 'text',
      timestamp: (payload.timestamp as number) ?? Date.now(),
      raw: payload,
    };

    this.onMessage(message, this.config);
  }

  async send(message: OutboundMessage): Promise<void> {
    if (!this.config || this.status !== 'connected') {
      throw new Error('Webhook connector not connected');
    }

    const webhookUrl = this.config.credentials.responseUrl ?? this.config.settings.responseUrl as string;
    if (!webhookUrl) {
      logger.warn('No response URL configured for webhook connector');
      return;
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: message.content,
        channelId: message.channelId,
        replyToId: message.replyToId,
      }),
    });
  }

  getStatus(): ConnectorStatus {
    return this.status;
  }
}

/**
 * Get the webhook connector queue for processing.
 */
export function getWebhookQueue(connectorId: string): InboundMessage[] {
  return messageQueues.get(connectorId) ?? [];
}
