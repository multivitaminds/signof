export const ThemeMode = {
  Light: 'light',
  Dark: 'dark',
  System: 'system',
} as const

export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode]

export const MemberRole = {
  Owner: 'owner',
  Admin: 'admin',
  Member: 'member',
  Guest: 'guest',
} as const

export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole]

export interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: MemberRole
  avatarUrl: string | null
  joinedAt: string
}

export interface NotificationPrefs {
  emailDigest: boolean
  mentionAlerts: boolean
  signatureRequests: boolean
  weeklyReport: boolean
  desktopNotifications: boolean
}

export interface Integration {
  id: string
  name: string
  icon: string
  description: string
  connected: boolean
  connectedAt: string | null
}

export interface WorkspaceSettings {
  name: string
  slug: string
  logo: string | null
  theme: ThemeMode
  language: string
  dateFormat: string
  timezone: string
}

// ─── Notification Categories ──────────────────────────────────

export interface NotificationToggle {
  inApp: boolean
  email: boolean
}

export interface DocumentNotificationPrefs {
  newDocument: NotificationToggle
  signatureRequest: NotificationToggle
  documentCompleted: NotificationToggle
  documentExpired: NotificationToggle
}

export interface ProjectNotificationPrefs {
  issueAssigned: NotificationToggle
  statusChanged: NotificationToggle
  commentMention: NotificationToggle
  cycleCompleted: NotificationToggle
}

export interface SchedulingNotificationPrefs {
  newBooking: NotificationToggle
  bookingCancelled: NotificationToggle
  bookingReminder: NotificationToggle
}

export interface WorkspaceNotificationPrefs {
  pageShared: NotificationToggle
  commentOnPage: NotificationToggle
  teamInvite: NotificationToggle
}

export interface QuietHours {
  enabled: boolean
  startTime: string
  endTime: string
}

export interface NotificationCategoryPrefs {
  documents: DocumentNotificationPrefs
  projects: ProjectNotificationPrefs
  scheduling: SchedulingNotificationPrefs
  workspace: WorkspaceNotificationPrefs
  quietHours: QuietHours
}

// ─── Appearance ───────────────────────────────────────────────

export const SidebarDensity = {
  Compact: 'compact',
  Default: 'default',
  Spacious: 'spacious',
} as const

export type SidebarDensity = (typeof SidebarDensity)[keyof typeof SidebarDensity]

export const FontSize = {
  Small: 'small',
  Default: 'default',
  Large: 'large',
} as const

export type FontSize = (typeof FontSize)[keyof typeof FontSize]

export interface AppearanceSettings {
  theme: ThemeMode
  accentColor: string
  sidebarDensity: SidebarDensity
  fontSize: FontSize
}

// ─── Billing ──────────────────────────────────────────────────

export const PlanId = {
  Starter: 'starter',
  Pro: 'pro',
  Business: 'business',
  Enterprise: 'enterprise',
} as const

export type PlanId = (typeof PlanId)[keyof typeof PlanId]

export const BillingCycle = {
  Monthly: 'monthly',
  Yearly: 'yearly',
} as const

export type BillingCycle = (typeof BillingCycle)[keyof typeof BillingCycle]

export const InvoiceStatus = {
  Paid: 'paid',
  Pending: 'pending',
  Failed: 'failed',
} as const

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus]

export interface PaymentMethod {
  brand: string
  last4: string
  expiry: string
}

export interface BillingRecord {
  id: string
  date: string
  description: string
  amount: string
  status: InvoiceStatus
  invoiceUrl: string
}
