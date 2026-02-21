// Common message format for all messaging connectors

export interface InboundMessage {
  /** Unique message ID from the source platform */
  externalId: string;
  /** Connector type (telegram, whatsapp, discord, slack) */
  platform: ConnectorPlatform;
  /** Channel/chat/group ID on the platform */
  channelId: string;
  /** Channel name (if available) */
  channelName?: string;
  /** Sender information */
  sender: {
    externalId: string;
    name: string;
    username?: string;
    avatarUrl?: string;
  };
  /** Message content */
  content: string;
  /** Message type */
  type: 'text' | 'image' | 'audio' | 'video' | 'file' | 'sticker' | 'location';
  /** Attachment URL (for non-text messages) */
  attachmentUrl?: string;
  /** Reply-to message ID */
  replyToId?: string;
  /** Thread ID (for threaded platforms) */
  threadId?: string;
  /** Raw platform-specific data */
  raw?: unknown;
  /** Timestamp from the platform */
  timestamp: number;
}

export interface OutboundMessage {
  /** Platform to send to */
  platform: ConnectorPlatform;
  /** Target channel/chat ID */
  channelId: string;
  /** Message content */
  content: string;
  /** Optional reply-to message ID */
  replyToId?: string;
  /** Optional thread ID */
  threadId?: string;
  /** Format options */
  format?: {
    markdown?: boolean;
    html?: boolean;
  };
}

export type ConnectorPlatform = 'telegram' | 'whatsapp' | 'discord' | 'slack' | 'webhook';

export type ConnectorStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface ConnectorConfig {
  id: string;
  tenantId: string;
  platform: ConnectorPlatform;
  name: string;
  enabled: boolean;
  credentials: Record<string, string>;
  settings: Record<string, unknown>;
  status: ConnectorStatus;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorInterface {
  platform: ConnectorPlatform;
  start(config: ConnectorConfig): Promise<void>;
  stop(): Promise<void>;
  send(message: OutboundMessage): Promise<void>;
  getStatus(): ConnectorStatus;
}
