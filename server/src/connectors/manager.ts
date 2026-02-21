// Connector lifecycle manager — start/stop/health for all messaging connectors

import type { ConnectorConfig, ConnectorInterface, ConnectorPlatform, InboundMessage, ConnectorStatus } from './types.js';
import { processMessage } from '../ai/kernel.js';
import { query } from '../db/postgres.js';
import { logger } from '../lib/logger.js';

type MessageHandler = (message: InboundMessage, config: ConnectorConfig) => Promise<void>;

const activeConnectors = new Map<string, ConnectorInterface>();
let messageHandler: MessageHandler | null = null;

/**
 * Set the handler for incoming messages from all connectors.
 */
export function setMessageHandler(handler: MessageHandler): void {
  messageHandler = handler;
}

/**
 * Default message handler: routes through AI kernel.
 */
export async function defaultMessageHandler(
  message: InboundMessage,
  config: ConnectorConfig
): Promise<void> {
  try {
    const response = await processMessage({
      tenantId: config.tenantId,
      userId: message.sender.externalId,
      message: message.content,
      channel: message.platform,
      channelId: message.channelId,
    });

    // Send response back through the connector
    const connector = activeConnectors.get(config.id);
    if (connector) {
      await connector.send({
        platform: config.platform,
        channelId: message.channelId,
        content: response.content,
        replyToId: message.externalId,
        threadId: message.threadId,
      });
    }

    // Log the message exchange
    await query(
      `INSERT INTO messages (id, session_id, channel_id, channel_type, direction, content, timestamp, sender_name, status, tenant_id)
       VALUES ($1, $2, $3, $4, 'inbound', $5, $6, $7, 'delivered', $8)`,
      [
        `${message.platform}_${message.externalId}`,
        message.channelId,
        message.channelId,
        message.platform,
        message.content,
        new Date(message.timestamp).toISOString(),
        message.sender.name,
        config.tenantId,
      ]
    ).catch(() => { /* non-critical */ });

  } catch (err) {
    logger.error('Message handler error', {
      platform: message.platform,
      error: (err as Error).message,
    });
  }
}

/**
 * Start a connector.
 */
export async function startConnector(config: ConnectorConfig): Promise<void> {
  if (activeConnectors.has(config.id)) {
    logger.warn('Connector already running', { id: config.id, platform: config.platform });
    return;
  }

  const connector = await createConnector(config.platform);
  if (!connector) {
    logger.error('Unknown connector platform', { platform: config.platform });
    return;
  }

  try {
    await connector.start(config);
    activeConnectors.set(config.id, connector);

    await query(
      "UPDATE connectors SET status = 'connected', last_error = NULL, updated_at = NOW() WHERE id = $1",
      [config.id]
    ).catch(() => { /* table may not exist yet */ });

    logger.info('Connector started', { id: config.id, platform: config.platform });
  } catch (err) {
    const error = (err as Error).message;
    await query(
      "UPDATE connectors SET status = 'error', last_error = $1, updated_at = NOW() WHERE id = $2",
      [error, config.id]
    ).catch(() => { /* table may not exist yet */ });

    logger.error('Connector start failed', { id: config.id, platform: config.platform, error });
    throw err;
  }
}

/**
 * Stop a connector.
 */
export async function stopConnector(connectorId: string): Promise<void> {
  const connector = activeConnectors.get(connectorId);
  if (!connector) return;

  try {
    await connector.stop();
    activeConnectors.delete(connectorId);

    await query(
      "UPDATE connectors SET status = 'disconnected', updated_at = NOW() WHERE id = $1",
      [connectorId]
    ).catch(() => { /* non-critical */ });

    logger.info('Connector stopped', { id: connectorId });
  } catch (err) {
    logger.error('Connector stop error', { id: connectorId, error: (err as Error).message });
  }
}

/**
 * Get status of all active connectors.
 */
export function getConnectorStatuses(): Array<{ id: string; platform: ConnectorPlatform; status: ConnectorStatus }> {
  const statuses: Array<{ id: string; platform: ConnectorPlatform; status: ConnectorStatus }> = [];
  for (const [id, connector] of activeConnectors) {
    statuses.push({
      id,
      platform: connector.platform,
      status: connector.getStatus(),
    });
  }
  return statuses;
}

/**
 * Start all enabled connectors for a tenant.
 */
export async function startTenantConnectors(tenantId: string): Promise<void> {
  try {
    const result = await query<ConnectorConfig>(
      "SELECT * FROM connectors WHERE tenant_id = $1 AND enabled = TRUE",
      [tenantId]
    );

    for (const config of result.rows) {
      await startConnector(config).catch(err => {
        logger.error('Failed to start connector', {
          id: config.id,
          platform: config.platform,
          error: (err as Error).message,
        });
      });
    }
  } catch {
    // Connectors table may not exist yet
    logger.debug('No connectors table found, skipping connector initialization');
  }
}

/**
 * Stop all active connectors.
 */
export async function stopAllConnectors(): Promise<void> {
  for (const [id] of activeConnectors) {
    await stopConnector(id);
  }
}

// Initialize message handler
setMessageHandler(defaultMessageHandler);

// ─── Connector factory ──────────────────────────────────────────────

async function createConnector(platform: ConnectorPlatform): Promise<ConnectorInterface | null> {
  switch (platform) {
    case 'telegram': {
      const { TelegramConnector } = await import('./telegram.js');
      return new TelegramConnector(handleInboundMessage);
    }
    case 'discord': {
      const { DiscordConnector } = await import('./discord.js');
      return new DiscordConnector(handleInboundMessage);
    }
    case 'slack': {
      const { SlackConnector } = await import('./slack.js');
      return new SlackConnector(handleInboundMessage);
    }
    case 'whatsapp': {
      const { WhatsAppConnector } = await import('./whatsapp.js');
      return new WhatsAppConnector(handleInboundMessage);
    }
    case 'webhook': {
      const { WebhookConnector } = await import('./webhook.js');
      return new WebhookConnector(handleInboundMessage);
    }
    default:
      return null;
  }
}

function handleInboundMessage(message: InboundMessage, config: ConnectorConfig): void {
  if (messageHandler) {
    messageHandler(message, config).catch(err => {
      logger.error('Inbound message handling failed', { error: (err as Error).message });
    });
  }
}
