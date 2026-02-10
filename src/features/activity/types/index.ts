// ─── Activity Type Enums (const object pattern) ────────────────────

export const ActivityType = {
  Document: 'document',
  Page: 'page',
  Issue: 'issue',
  Booking: 'booking',
  Database: 'database',
  Team: 'team',
} as const

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType]

export const ActivityAction = {
  Created: 'created',
  Updated: 'updated',
  Deleted: 'deleted',
  Signed: 'signed',
  Sent: 'sent',
  Completed: 'completed',
  Commented: 'commented',
  Assigned: 'assigned',
} as const

export type ActivityAction = (typeof ActivityAction)[keyof typeof ActivityAction]

// ─── Core Interface ────────────────────────────────────────────────

export interface Activity {
  id: string
  type: ActivityType
  action: ActivityAction
  title: string
  description: string
  entityId: string
  entityPath: string
  timestamp: string
  userId: string
  userName: string
  icon: string
}

// ─── Filter Types ──────────────────────────────────────────────────

export const ActivityFilterTab = {
  All: 'all',
  Documents: 'document',
  Pages: 'page',
  Issues: 'issue',
  Bookings: 'booking',
} as const

export type ActivityFilterTab = (typeof ActivityFilterTab)[keyof typeof ActivityFilterTab]

export const ACTIVITY_FILTER_LABELS: Record<ActivityFilterTab, string> = {
  [ActivityFilterTab.All]: 'All',
  [ActivityFilterTab.Documents]: 'Documents',
  [ActivityFilterTab.Pages]: 'Pages',
  [ActivityFilterTab.Issues]: 'Issues',
  [ActivityFilterTab.Bookings]: 'Bookings',
}
