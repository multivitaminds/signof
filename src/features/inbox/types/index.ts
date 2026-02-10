export const NotificationType = {
  Mention: 'mention',
  SignatureRequest: 'signature_request',
  Comment: 'comment',
  Assignment: 'assignment',
  StatusChange: 'status_change',
  Invitation: 'invitation',
  Reminder: 'reminder',
  System: 'system',
  Booking: 'booking',
  DocumentSigned: 'document_signed',
  TeamJoined: 'team_joined',
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export const NotificationCategory = {
  All: 'all',
  Documents: 'documents',
  Projects: 'projects',
  Scheduling: 'scheduling',
  Workspace: 'workspace',
  System: 'system',
} as const

export type NotificationCategory = (typeof NotificationCategory)[keyof typeof NotificationCategory]

/** Maps notification types to their category */
export const TYPE_TO_CATEGORY: Record<NotificationType, NotificationCategory> = {
  [NotificationType.SignatureRequest]: NotificationCategory.Documents,
  [NotificationType.DocumentSigned]: NotificationCategory.Documents,
  [NotificationType.Comment]: NotificationCategory.Workspace,
  [NotificationType.Mention]: NotificationCategory.Workspace,
  [NotificationType.Assignment]: NotificationCategory.Projects,
  [NotificationType.StatusChange]: NotificationCategory.Projects,
  [NotificationType.Booking]: NotificationCategory.Scheduling,
  [NotificationType.Reminder]: NotificationCategory.Scheduling,
  [NotificationType.Invitation]: NotificationCategory.System,
  [NotificationType.System]: NotificationCategory.System,
  [NotificationType.TeamJoined]: NotificationCategory.System,
}

export const DigestFrequency = {
  Daily: 'daily',
  Weekly: 'weekly',
  Never: 'never',
} as const

export type DigestFrequency = (typeof DigestFrequency)[keyof typeof DigestFrequency]

export interface Notification {
  id: string
  type: NotificationType
  category: NotificationCategory
  title: string
  message: string
  read: boolean
  archived: boolean
  createdAt: string
  link: string | null
  actorName: string | null
  actorAvatar: string | null
  actionUrl: string | null
  actionLabel: string | null
  /** Grouping key for source-based grouping (e.g., document id) */
  sourceId: string | null
}
