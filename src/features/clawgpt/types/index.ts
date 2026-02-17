// ─── Channel Types ──────────────────────────────────────────────

export const ChannelType = {
  WhatsApp: 'whatsapp',
  Telegram: 'telegram',
  Slack: 'slack',
  Discord: 'discord',
  Matrix: 'matrix',
  Sms: 'sms',
  Email: 'email',
  Teams: 'teams',
  Signal: 'signal',
  Irc: 'irc',
  Webhook: 'webhook',
  WebChat: 'web_chat',
  Custom: 'custom',
} as const
export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType]

export const ChannelStatus = {
  Connected: 'connected',
  Disconnected: 'disconnected',
  Connecting: 'connecting',
  Error: 'error',
  Paused: 'paused',
} as const
export type ChannelStatus = (typeof ChannelStatus)[keyof typeof ChannelStatus]

export const ChannelAuthType = {
  OAuth2: 'oauth2',
  ApiKey: 'api_key',
  BotToken: 'bot_token',
  Webhook: 'webhook',
  Smtp: 'smtp',
  None: 'none',
} as const
export type ChannelAuthType = (typeof ChannelAuthType)[keyof typeof ChannelAuthType]

export const ChannelCapability = {
  Text: 'text',
  Media: 'media',
  Voice: 'voice',
  Reactions: 'reactions',
  Threads: 'threads',
  ReadReceipts: 'read_receipts',
} as const
export type ChannelCapability = (typeof ChannelCapability)[keyof typeof ChannelCapability]

// ─── Channel Interfaces ─────────────────────────────────────────

export interface ChannelConfigField {
  key: string
  label: string
  type: 'text' | 'password' | 'url' | 'checkbox'
  required: boolean
  placeholder?: string
}

export interface ChannelConfig {
  apiKey?: string
  webhookUrl?: string
  botToken?: string
  phoneNumber?: string
  authType: ChannelAuthType
  customHeaders?: Record<string, string>
  [key: string]: unknown
}

export interface Channel {
  id: string
  type: ChannelType
  name: string
  status: ChannelStatus
  config: ChannelConfig
  icon: string
  description: string
  authType: ChannelAuthType
  capabilities: ChannelCapability[]
  unreadCount: number
  lastActivity: string | null
  assignedAgentId: string | null
}

// ─── Gateway Types ──────────────────────────────────────────────

export const GatewayStatus = {
  Online: 'online',
  Offline: 'offline',
  Degraded: 'degraded',
} as const
export type GatewayStatus = (typeof GatewayStatus)[keyof typeof GatewayStatus]

export const MessageDirection = {
  Inbound: 'inbound',
  Outbound: 'outbound',
} as const
export type MessageDirection = (typeof MessageDirection)[keyof typeof MessageDirection]

export const MessageStatus = {
  Sending: 'sending',
  Sent: 'sent',
  Delivered: 'delivered',
  Read: 'read',
  Failed: 'failed',
} as const
export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus]

export interface Session {
  id: string
  channelId: string
  channelType: ChannelType
  contactId: string
  contactName: string
  contactAvatar: string | null
  lastMessage: string
  lastMessageAt: string
  startedAt: string
  agentId: string | null
  isActive: boolean
}

export interface BrainMessage {
  id: string
  sessionId: string
  channelId: string
  channelType: ChannelType
  direction: MessageDirection
  content: string
  timestamp: string
  senderName: string
  senderAvatar: string | null
  toolCalls: string[] | null
  agentId: string | null
  status: MessageStatus
}

// ─── Skill Types ────────────────────────────────────────────────

export const SkillCategory = {
  Productivity: 'productivity',
  Communication: 'communication',
  Data: 'data',
  Creative: 'creative',
  Developer: 'developer',
  Custom: 'custom',
} as const
export type SkillCategory = (typeof SkillCategory)[keyof typeof SkillCategory]

export const SkillTriggerType = {
  Keyword: 'keyword',
  Regex: 'regex',
  Event: 'event',
  Schedule: 'schedule',
} as const
export type SkillTriggerType = (typeof SkillTriggerType)[keyof typeof SkillTriggerType]

export interface SkillTrigger {
  type: SkillTriggerType
  pattern: string
}

export interface SkillAction {
  id: string
  name: string
  description: string
  handler: string
}

export interface Skill {
  id: string
  name: string
  description: string
  category: SkillCategory
  version: string
  author: string
  icon: string
  installed: boolean
  enabled: boolean
  config: Record<string, unknown>
  triggers: SkillTrigger[]
  actions: SkillAction[]
}

// ─── Soul Types ─────────────────────────────────────────────────

export const ResponseStyle = {
  Professional: 'professional',
  Casual: 'casual',
  Concise: 'concise',
  Detailed: 'detailed',
  Friendly: 'friendly',
  Technical: 'technical',
} as const
export type ResponseStyle = (typeof ResponseStyle)[keyof typeof ResponseStyle]

export interface SoulConfig {
  name: string
  personality: string
  systemPrompt: string
  rules: string[]
  context: string[]
  responseStyle: ResponseStyle
  language: string
  timezone: string
}

export interface SoulPreset {
  id: string
  name: string
  description: string
  config: SoulConfig
}

// ─── Device Types ───────────────────────────────────────────────

export const DevicePlatform = {
  MacOS: 'macos',
  Windows: 'windows',
  Linux: 'linux',
  IOS: 'ios',
  Android: 'android',
  Web: 'web',
} as const
export type DevicePlatform = (typeof DevicePlatform)[keyof typeof DevicePlatform]

export const DeviceCapability = {
  Shell: 'shell',
  Notifications: 'notifications',
  Camera: 'camera',
  Screen: 'screen',
  Clipboard: 'clipboard',
  Browser: 'browser',
} as const
export type DeviceCapability = (typeof DeviceCapability)[keyof typeof DeviceCapability]

export const DeviceStatus = {
  Online: 'online',
  Offline: 'offline',
  Pairing: 'pairing',
} as const
export type DeviceStatus = (typeof DeviceStatus)[keyof typeof DeviceStatus]

export interface DeviceNode {
  id: string
  name: string
  platform: DevicePlatform
  status: DeviceStatus
  capabilities: DeviceCapability[]
  lastSeen: string
  pairedAt: string
}

// ─── Channel Definition (for channel config UI) ─────────────────

export interface ChannelDefinition {
  type: ChannelType
  name: string
  icon: string
  description: string
  authType: ChannelAuthType
  configFields: ChannelConfigField[]
  capabilities: ChannelCapability[]
}

// ─── Gateway Protocol Messages ──────────────────────────────────

export const GatewayEventType = {
  SessionCreated: 'session.created',
  SessionClosed: 'session.closed',
  MessageReceived: 'message.received',
  MessageSent: 'message.sent',
  AgentAssigned: 'agent.assigned',
  AgentResponded: 'agent.responded',
  DevicePaired: 'device.paired',
  DeviceCommand: 'device.command',
} as const
export type GatewayEventType = (typeof GatewayEventType)[keyof typeof GatewayEventType]

export interface GatewayEvent {
  type: GatewayEventType
  payload: Record<string, unknown>
  timestamp: string
}

// ─── Fleet Types (Agent OS) ─────────────────────────────────────

export const FleetAgentStatus = {
  Spawning: 'spawning',
  Idle: 'idle',
  Working: 'working',
  WaitingApproval: 'waiting_approval',
  Error: 'error',
  Retiring: 'retiring',
} as const
export type FleetAgentStatus = (typeof FleetAgentStatus)[keyof typeof FleetAgentStatus]

export const TaskPriority = {
  Critical: 'critical',
  High: 'high',
  Normal: 'normal',
  Low: 'low',
} as const
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority]

export const TaskStatus = {
  Queued: 'queued',
  Routed: 'routed',
  InProgress: 'in_progress',
  Completed: 'completed',
  Failed: 'failed',
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export const TaskSource = {
  User: 'user',
  Agent: 'agent',
  Workflow: 'workflow',
  Channel: 'channel',
  Schedule: 'schedule',
} as const
export type TaskSource = (typeof TaskSource)[keyof typeof TaskSource]

export const AlertSeverity = {
  Info: 'info',
  Warning: 'warning',
  Critical: 'critical',
} as const
export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity]

export interface FleetAgentInstance {
  instanceId: string
  registryId: string
  runtimeAgentId: string
  domain: string
  status: FleetAgentStatus
  currentTask: string | null
  spawnedAt: string
  lastHeartbeat: string
  tokensConsumed: number
  costUsd: number
  cycleCount: number
  errorCount: number
}

export interface TaskQueueItem {
  id: string
  description: string
  domain: string | null
  priority: TaskPriority
  status: TaskStatus
  assignedInstanceId: string | null
  submittedAt: string
  startedAt: string | null
  completedAt: string | null
  source: TaskSource
  result: string | null
}

export interface FleetMetrics {
  totalRegistered: number
  totalActive: number
  totalIdle: number
  totalErrored: number
  tasksTodayCompleted: number
  tasksTodayFailed: number
  totalTokensToday: number
  totalCostToday: number
  avgTaskDurationMs: number
}

export interface FleetAlert {
  id: string
  severity: AlertSeverity
  message: string
  agentInstanceId: string | null
  timestamp: string
  acknowledged: boolean
}

// ─── Labels ─────────────────────────────────────────────────────

export const CHANNEL_STATUS_LABELS: Record<ChannelStatus, string> = {
  [ChannelStatus.Connected]: 'Connected',
  [ChannelStatus.Disconnected]: 'Disconnected',
  [ChannelStatus.Connecting]: 'Connecting',
  [ChannelStatus.Error]: 'Error',
  [ChannelStatus.Paused]: 'Paused',
}

export const GATEWAY_STATUS_LABELS: Record<GatewayStatus, string> = {
  [GatewayStatus.Online]: 'Online',
  [GatewayStatus.Offline]: 'Offline',
  [GatewayStatus.Degraded]: 'Degraded',
}

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  [SkillCategory.Productivity]: 'Productivity',
  [SkillCategory.Communication]: 'Communication',
  [SkillCategory.Data]: 'Data',
  [SkillCategory.Creative]: 'Creative',
  [SkillCategory.Developer]: 'Developer',
  [SkillCategory.Custom]: 'Custom',
}

export const DEVICE_PLATFORM_LABELS: Record<DevicePlatform, string> = {
  [DevicePlatform.MacOS]: 'macOS',
  [DevicePlatform.Windows]: 'Windows',
  [DevicePlatform.Linux]: 'Linux',
  [DevicePlatform.IOS]: 'iOS',
  [DevicePlatform.Android]: 'Android',
  [DevicePlatform.Web]: 'Web',
}

export const RESPONSE_STYLE_LABELS: Record<ResponseStyle, string> = {
  [ResponseStyle.Professional]: 'Professional',
  [ResponseStyle.Casual]: 'Casual',
  [ResponseStyle.Concise]: 'Concise',
  [ResponseStyle.Detailed]: 'Detailed',
  [ResponseStyle.Friendly]: 'Friendly',
  [ResponseStyle.Technical]: 'Technical',
}
