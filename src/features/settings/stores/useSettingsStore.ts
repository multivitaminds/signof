import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkspaceMember, NotificationPrefs, Integration, WorkspaceSettings } from '../types'
import { ThemeMode, MemberRole } from '../types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const SAMPLE_MEMBERS: WorkspaceMember[] = [
  { id: 'member-1', name: 'Alex Johnson', email: 'alex@signof.com', role: MemberRole.Owner, avatarUrl: null, joinedAt: '2024-01-15T00:00:00Z' },
  { id: 'member-2', name: 'Sarah Chen', email: 'sarah@signof.com', role: MemberRole.Admin, avatarUrl: null, joinedAt: '2024-02-20T00:00:00Z' },
  { id: 'member-3', name: 'Mike Rivera', email: 'mike@signof.com', role: MemberRole.Member, avatarUrl: null, joinedAt: '2024-03-10T00:00:00Z' },
  { id: 'member-4', name: 'Emma Davis', email: 'emma@signof.com', role: MemberRole.Member, avatarUrl: null, joinedAt: '2024-04-05T00:00:00Z' },
  { id: 'member-5', name: 'Chris Lee', email: 'chris@external.com', role: MemberRole.Guest, avatarUrl: null, joinedAt: '2024-05-12T00:00:00Z' },
]

const SAMPLE_INTEGRATIONS: Integration[] = [
  { id: 'int-1', name: 'Slack', icon: '\u{1F4AC}', description: 'Get notifications and updates in Slack channels', connected: true, connectedAt: '2024-02-01T00:00:00Z' },
  { id: 'int-2', name: 'Google Drive', icon: '\u{1F4C1}', description: 'Import and sync documents from Google Drive', connected: false, connectedAt: null },
  { id: 'int-3', name: 'GitHub', icon: '\u{1F419}', description: 'Link issues and pull requests to projects', connected: true, connectedAt: '2024-03-15T00:00:00Z' },
  { id: 'int-4', name: 'Zapier', icon: '\u{26A1}', description: 'Automate workflows with 5000+ apps', connected: false, connectedAt: null },
  { id: 'int-5', name: 'Figma', icon: '\u{1F3A8}', description: 'Embed Figma designs in documents and pages', connected: false, connectedAt: null },
  { id: 'int-6', name: 'Stripe', icon: '\u{1F4B3}', description: 'Accept payments and manage billing', connected: false, connectedAt: null },
]

interface SettingsState {
  workspace: WorkspaceSettings
  members: WorkspaceMember[]
  notifications: NotificationPrefs
  integrations: Integration[]

  updateWorkspace: (updates: Partial<WorkspaceSettings>) => void
  addMember: (name: string, email: string, role: MemberRole) => void
  removeMember: (id: string) => void
  updateMemberRole: (id: string, role: MemberRole) => void
  updateNotifications: (updates: Partial<NotificationPrefs>) => void
  toggleIntegration: (id: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      workspace: {
        name: 'SignOf Workspace',
        logo: null,
        theme: ThemeMode.System,
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      members: SAMPLE_MEMBERS,
      notifications: {
        emailDigest: true,
        mentionAlerts: true,
        signatureRequests: true,
        weeklyReport: false,
        desktopNotifications: true,
      },
      integrations: SAMPLE_INTEGRATIONS,

      updateWorkspace: (updates) => {
        set((s) => ({ workspace: { ...s.workspace, ...updates } }))
      },

      addMember: (name, email, role) => {
        const member: WorkspaceMember = { id: rid(), name, email, role, avatarUrl: null, joinedAt: new Date().toISOString() }
        set((s) => ({ members: [...s.members, member] }))
      },

      removeMember: (id) => {
        set((s) => ({ members: s.members.filter((m) => m.id !== id) }))
      },

      updateMemberRole: (id, role) => {
        set((s) => ({
          members: s.members.map((m) => (m.id === id ? { ...m, role } : m)),
        }))
      },

      updateNotifications: (updates) => {
        set((s) => ({ notifications: { ...s.notifications, ...updates } }))
      },

      toggleIntegration: (id) => {
        set((s) => ({
          integrations: s.integrations.map((i) =>
            i.id === id ? { ...i, connected: !i.connected, connectedAt: !i.connected ? new Date().toISOString() : null } : i
          ),
        }))
      },
    }),
    { name: 'signof-settings-storage' }
  )
)
