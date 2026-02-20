// ─── Chorus Module Types ────────────────────────────────────────────
// Slack-like messaging for Orchestree. Uses const object + type extraction pattern.

// ─── Channel Type ──────────────────────────────────────────────────

export const ChorusChannelType = {
  Public: 'public',
  Private: 'private',
  Shared: 'shared',
  Archived: 'archived',
} as const

export type ChorusChannelType = (typeof ChorusChannelType)[keyof typeof ChorusChannelType]

// ─── Presence Status ───────────────────────────────────────────────

export const ChorusPresenceStatus = {
  Online: 'online',
  Away: 'away',
  DND: 'dnd',
  Offline: 'offline',
} as const

export type ChorusPresenceStatus = (typeof ChorusPresenceStatus)[keyof typeof ChorusPresenceStatus]

// ─── Message Type ──────────────────────────────────────────────────

export const ChorusMessageType = {
  Text: 'text',
  System: 'system',
  FileShare: 'file_share',
  Poll: 'poll',
  FormResponse: 'form_response',
  AgentAction: 'agent_action',
} as const

export type ChorusMessageType = (typeof ChorusMessageType)[keyof typeof ChorusMessageType]

// ─── Conversation Type ─────────────────────────────────────────────

export const ConversationType = {
  Channel: 'channel',
  DM: 'dm',
  GroupDM: 'group_dm',
} as const

export type ConversationType = (typeof ConversationType)[keyof typeof ConversationType]

// ─── Label Records ─────────────────────────────────────────────────

export const CHANNEL_TYPE_LABELS: Record<ChorusChannelType, string> = {
  [ChorusChannelType.Public]: 'Public',
  [ChorusChannelType.Private]: 'Private',
  [ChorusChannelType.Shared]: 'Shared',
  [ChorusChannelType.Archived]: 'Archived',
}

export const PRESENCE_LABELS: Record<ChorusPresenceStatus, string> = {
  [ChorusPresenceStatus.Online]: 'Online',
  [ChorusPresenceStatus.Away]: 'Away',
  [ChorusPresenceStatus.DND]: 'Do Not Disturb',
  [ChorusPresenceStatus.Offline]: 'Offline',
}

// ─── Interfaces ────────────────────────────────────────────────────

export interface ChorusUser {
  id: string
  name: string
  displayName: string
  email: string
  avatarUrl: string
  presence: ChorusPresenceStatus
  customStatus: string | null
  customStatusEmoji: string | null
  timezone: string
  lastSeenAt: string
}

export interface ChorusChannel {
  id: string
  name: string
  displayName: string
  type: ChorusChannelType
  topic: string
  description: string
  createdBy: string
  createdAt: string
  memberIds: string[]
  pinnedMessageIds: string[]
  isStarred: boolean
  isMuted: boolean
  lastMessageAt: string
  unreadCount: number
  mentionCount: number
}

export interface ChorusDirectMessage {
  id: string
  type: ConversationType
  participantIds: string[]
  name: string
  lastMessageAt: string
  unreadCount: number
  isStarred: boolean
  isMuted: boolean
}

export interface ChorusReaction {
  emoji: string
  userIds: string[]
  count: number
}

export interface ChorusAttachment {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  url: string
  thumbnailUrl: string | null
}

export interface ChorusPollOption {
  id: string
  text: string
  voterIds: string[]
}

export interface ChorusPoll {
  question: string
  options: ChorusPollOption[]
  isAnonymous: boolean
  allowMultiple: boolean
  closesAt: string | null
}

export interface CrossModuleRef {
  moduleType: string
  entityId: string
  entityTitle: string
  entityPath: string
}

export interface ChorusMessage {
  id: string
  conversationId: string
  conversationType: ConversationType
  senderId: string
  senderName: string
  senderAvatarUrl: string
  content: string
  messageType: ChorusMessageType
  timestamp: string
  editedAt: string | null
  isEdited: boolean
  threadId: string | null
  threadReplyCount: number
  threadParticipantIds: string[]
  threadLastReplyAt: string | null
  reactions: ChorusReaction[]
  isPinned: boolean
  isBookmarked: boolean
  isDeleted: boolean
  attachments: ChorusAttachment[]
  mentions: string[]
  pollData: ChorusPoll | null
  crossModuleRef: CrossModuleRef | null
}

export interface ChorusSearchFilter {
  from?: string
  in?: string
  has?: string
  before?: string
  after?: string
}

export interface ChorusSearchResult {
  message: ChorusMessage
  channelName: string
  highlights: string[]
}

export interface TypingUser {
  userId: string
  userName: string
  conversationId: string
  startedAt: number
}

// ─── Message Group (for display) ───────────────────────────────────

export interface MessageGroup {
  senderId: string
  senderName: string
  senderAvatarUrl: string
  messages: ChorusMessage[]
  timestamp: string
}
