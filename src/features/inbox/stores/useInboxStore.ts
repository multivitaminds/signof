import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification, DigestFrequency } from '../types'
import { NotificationType, NotificationCategory, TYPE_TO_CATEGORY } from '../types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: NotificationType.SignatureRequest,
    category: NotificationCategory.Documents,
    title: 'Document awaiting your signature',
    message: 'Alex Johnson sent you "Q4 Partnership Agreement" for signing',
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/documents',
    actorName: 'Alex Johnson',
    actorAvatar: null,
    actionUrl: '/documents',
    actionLabel: 'Sign Now',
    sourceId: 'doc-q4-partnership',
  },
  {
    id: 'notif-2',
    type: NotificationType.Mention,
    category: NotificationCategory.Workspace,
    title: 'You were mentioned',
    message: 'Sarah Chen mentioned you in "Sprint Planning" page',
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: '/pages',
    actorName: 'Sarah Chen',
    actorAvatar: null,
    actionUrl: '/pages',
    actionLabel: 'View Comment',
    sourceId: 'page-sprint-planning',
  },
  {
    id: 'notif-3',
    type: NotificationType.Assignment,
    category: NotificationCategory.Projects,
    title: 'New task assigned',
    message: 'Mike Rivera assigned you "Implement OAuth flow" in Projects',
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    link: '/projects',
    actorName: 'Mike Rivera',
    actorAvatar: null,
    actionUrl: '/projects',
    actionLabel: 'View Issue',
    sourceId: 'issue-oauth',
  },
  {
    id: 'notif-4',
    type: NotificationType.Comment,
    category: NotificationCategory.Workspace,
    title: 'New comment on your document',
    message: 'Emma Davis commented on "Design System Spec"',
    read: true,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/documents',
    actorName: 'Emma Davis',
    actorAvatar: null,
    actionUrl: '/documents',
    actionLabel: 'View Comment',
    sourceId: 'doc-design-system',
  },
  {
    id: 'notif-5',
    type: NotificationType.DocumentSigned,
    category: NotificationCategory.Documents,
    title: 'Document completed',
    message: '"NDA - Acme Corp" has been signed by all parties',
    read: true,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    link: '/documents',
    actorName: null,
    actorAvatar: null,
    actionUrl: '/documents',
    actionLabel: 'View Document',
    sourceId: 'doc-nda-acme',
  },
  {
    id: 'notif-6',
    type: NotificationType.Booking,
    category: NotificationCategory.Scheduling,
    title: 'New booking received',
    message: 'Lisa Park booked a "Design Review" session for tomorrow at 2pm',
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    link: '/scheduling',
    actorName: 'Lisa Park',
    actorAvatar: null,
    actionUrl: '/scheduling',
    actionLabel: 'View Booking',
    sourceId: 'booking-design-review',
  },
  {
    id: 'notif-7',
    type: NotificationType.Reminder,
    category: NotificationCategory.Scheduling,
    title: 'Meeting reminder',
    message: 'Your meeting "Weekly Standup" starts in 15 minutes',
    read: true,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    link: '/scheduling',
    actorName: null,
    actorAvatar: null,
    actionUrl: '/scheduling',
    actionLabel: 'View Booking',
    sourceId: null,
  },
  {
    id: 'notif-8',
    type: NotificationType.StatusChange,
    category: NotificationCategory.Projects,
    title: 'Issue status changed',
    message: '"API Integration" moved from In Progress to Done',
    read: true,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    link: '/projects',
    actorName: 'Mike Rivera',
    actorAvatar: null,
    actionUrl: '/projects',
    actionLabel: 'View Issue',
    sourceId: 'issue-api-integration',
  },
  {
    id: 'notif-9',
    type: NotificationType.Invitation,
    category: NotificationCategory.System,
    title: 'Team invitation',
    message: 'You have been invited to join the "Engineering" team',
    read: true,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    link: '/settings/members',
    actorName: 'Alex Johnson',
    actorAvatar: null,
    actionUrl: '/settings/members',
    actionLabel: 'View Invitation',
    sourceId: null,
  },
  {
    id: 'notif-10',
    type: NotificationType.System,
    category: NotificationCategory.System,
    title: 'Welcome to SignOf!',
    message: 'Get started by creating your first document or exploring the workspace',
    read: true,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
    link: '/',
    actorName: null,
    actorAvatar: null,
    actionUrl: null,
    actionLabel: null,
    sourceId: null,
  },
  {
    id: 'notif-11',
    type: NotificationType.Comment,
    category: NotificationCategory.Workspace,
    title: 'New comment on "Design System Spec"',
    message: 'Tom Wilson replied to your comment on "Design System Spec"',
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    link: '/documents',
    actorName: 'Tom Wilson',
    actorAvatar: null,
    actionUrl: '/documents',
    actionLabel: 'View Comment',
    sourceId: 'doc-design-system',
  },
  {
    id: 'notif-12',
    type: NotificationType.Comment,
    category: NotificationCategory.Workspace,
    title: 'New comment on "Design System Spec"',
    message: 'Nina Patel also commented on "Design System Spec"',
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    link: '/documents',
    actorName: 'Nina Patel',
    actorAvatar: null,
    actionUrl: '/documents',
    actionLabel: 'View Comment',
    sourceId: 'doc-design-system',
  },
]

interface AddNotificationOptions {
  link?: string
  actorName?: string
  actionUrl?: string
  actionLabel?: string
  sourceId?: string
}

interface InboxState {
  notifications: Notification[]
  simulatorEnabled: boolean
  digestFrequency: DigestFrequency

  addNotification: (type: NotificationType, title: string, message: string, options?: AddNotificationOptions) => void
  markAsRead: (id: string) => void
  toggleRead: (id: string) => void
  markSelectedAsRead: (ids: string[]) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  deleteMultiple: (ids: string[]) => void
  archiveNotification: (id: string) => void
  archiveMultiple: (ids: string[]) => void
  clearAll: () => void
  getUnreadCount: () => number
  getUnreadCountByCategory: (category: NotificationCategory) => number
  setSimulatorEnabled: (enabled: boolean) => void
  setDigestFrequency: (frequency: DigestFrequency) => void

  // Clear data
  clearData: () => void
}

export const useInboxStore = create<InboxState>()(
  persist(
    (set, get) => ({
      notifications: SAMPLE_NOTIFICATIONS,
      simulatorEnabled: false,
      digestFrequency: 'weekly' as DigestFrequency,

      addNotification: (type, title, message, options) => {
        const notification: Notification = {
          id: rid(),
          type,
          category: TYPE_TO_CATEGORY[type],
          title,
          message,
          read: false,
          archived: false,
          createdAt: new Date().toISOString(),
          link: options?.link ?? null,
          actorName: options?.actorName ?? null,
          actorAvatar: null,
          actionUrl: options?.actionUrl ?? null,
          actionLabel: options?.actionLabel ?? null,
          sourceId: options?.sourceId ?? null,
        }
        set((s) => ({ notifications: [notification, ...s.notifications] }))
      },

      markAsRead: (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }))
      },

      toggleRead: (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
        }))
      },

      markSelectedAsRead: (ids) => {
        const idSet = new Set(ids)
        set((s) => ({
          notifications: s.notifications.map((n) => (idSet.has(n.id) ? { ...n, read: true } : n)),
        }))
      },

      markAllAsRead: () => {
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        }))
      },

      deleteNotification: (id) => {
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }))
      },

      deleteMultiple: (ids) => {
        const idSet = new Set(ids)
        set((s) => ({ notifications: s.notifications.filter((n) => !idSet.has(n.id)) }))
      },

      archiveNotification: (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, archived: true, read: true } : n)),
        }))
      },

      archiveMultiple: (ids) => {
        const idSet = new Set(ids)
        set((s) => ({
          notifications: s.notifications.map((n) =>
            idSet.has(n.id) ? { ...n, archived: true, read: true } : n
          ),
        }))
      },

      clearAll: () => {
        set({ notifications: [] })
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read && !n.archived).length
      },

      getUnreadCountByCategory: (category) => {
        return get().notifications.filter(
          (n) => !n.read && !n.archived && n.category === category
        ).length
      },

      setSimulatorEnabled: (enabled) => {
        set({ simulatorEnabled: enabled })
      },

      setDigestFrequency: (frequency) => {
        set({ digestFrequency: frequency })
      },

      clearData: () => {
        set({ notifications: [] })
      },
    }),
    {
      name: 'signof-inbox-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        simulatorEnabled: state.simulatorEnabled,
        digestFrequency: state.digestFrequency,
      }),
    }
  )
)
