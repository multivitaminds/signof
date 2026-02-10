export const NotificationType = {
  Mention: 'mention',
  SignatureRequest: 'signature_request',
  Comment: 'comment',
  Assignment: 'assignment',
  StatusChange: 'status_change',
  Invitation: 'invitation',
  Reminder: 'reminder',
  System: 'system',
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  link: string | null
  actorName: string | null
  actorAvatar: string | null
}
