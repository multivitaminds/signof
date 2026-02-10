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
  logo: string | null
  theme: ThemeMode
  language: string
  dateFormat: string
  timezone: string
}
