import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NotificationPrefs, Integration, WorkspaceSettings } from '../types'

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
  notifications: NotificationPrefs
  integrations: Integration[]

  updateWorkspace: (updates: Partial<WorkspaceSettings>) => void
  updateNotifications: (updates: Partial<NotificationPrefs>) => void
  toggleIntegration: (id: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      workspace: {
        name: 'Orchestree Workspace',
        slug: 'orchestree-workspace',
        logo: null,
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
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
    { name: 'orchestree-settings-storage' }
  )
)
