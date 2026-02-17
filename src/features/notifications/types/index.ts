export const NotificationType = {
  DocumentSigned: 'document_signed',
  DocumentSent: 'document_sent',
  IssueAssigned: 'issue_assigned',
  IssueCompleted: 'issue_completed',
  BookingConfirmed: 'booking_confirmed',
  BookingCancelled: 'booking_cancelled',
  AgentCompleted: 'agent_completed',
  AgentFailed: 'agent_failed',
  InvoicePaid: 'invoice_paid',
  PageMentioned: 'page_mentioned',
  CommentAdded: 'comment_added',
  SystemAlert: 'system_alert',
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  module: string
  entityId: string | null
  entityPath: string | null
  read: boolean
  dismissed: boolean
  createdAt: string
  icon: string
}

export interface NotificationGroup {
  label: string
  notifications: Notification[]
}
