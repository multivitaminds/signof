import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification, NotificationGroup } from '../types'
import { NotificationType } from '../types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const MAX_NOTIFICATIONS = 200

function generateSampleNotifications(): Notification[] {
  const now = Date.now()
  return [
    {
      id: rid(),
      type: NotificationType.DocumentSigned,
      title: 'Document signed',
      body: 'Alex Johnson signed "Q4 Partnership Agreement"',
      module: 'documents',
      entityId: 'doc-001',
      entityPath: '/documents',
      read: false,
      dismissed: false,
      createdAt: new Date(now - 1000 * 60 * 5).toISOString(),
      icon: 'file-signature',
    },
    {
      id: rid(),
      type: NotificationType.DocumentSent,
      title: 'Document sent',
      body: 'You sent "NDA 2026" to 3 recipients',
      module: 'documents',
      entityId: 'doc-002',
      entityPath: '/documents',
      read: false,
      dismissed: false,
      createdAt: new Date(now - 1000 * 60 * 15).toISOString(),
      icon: 'send',
    },
    {
      id: rid(),
      type: NotificationType.IssueAssigned,
      title: 'Issue assigned to you',
      body: 'Sarah Chen assigned you "Implement OAuth flow"',
      module: 'projects',
      entityId: 'issue-101',
      entityPath: '/projects',
      read: false,
      dismissed: false,
      createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
      icon: 'circle-dot',
    },
    {
      id: rid(),
      type: NotificationType.IssueCompleted,
      title: 'Issue completed',
      body: 'Mike Rivera completed "Setup CI pipeline"',
      module: 'projects',
      entityId: 'issue-102',
      entityPath: '/projects',
      read: true,
      dismissed: false,
      createdAt: new Date(now - 1000 * 60 * 60).toISOString(),
      icon: 'check-circle',
    },
    {
      id: rid(),
      type: NotificationType.AgentCompleted,
      title: 'Agent task completed',
      body: 'Research Agent finished "Competitive analysis report"',
      module: 'copilot',
      entityId: 'agent-task-01',
      entityPath: '/copilot',
      read: false,
      dismissed: false,
      createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
      icon: 'sparkles',
    },
    {
      id: rid(),
      type: NotificationType.AgentFailed,
      title: 'Agent encountered an error',
      body: 'Code Review Agent failed on "PR #42 analysis"',
      module: 'copilot',
      entityId: 'agent-task-02',
      entityPath: '/copilot',
      read: false,
      dismissed: false,
      createdAt: new Date(now - 1000 * 60 * 120).toISOString(),
      icon: 'alert-triangle',
    },
    {
      id: rid(),
      type: NotificationType.BookingConfirmed,
      title: 'Booking confirmed',
      body: 'Meeting with Lisa Park confirmed for tomorrow at 2pm',
      module: 'calendar',
      entityId: 'booking-201',
      entityPath: '/calendar',
      read: true,
      dismissed: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
      icon: 'calendar-check',
    },
    {
      id: rid(),
      type: NotificationType.BookingCancelled,
      title: 'Booking cancelled',
      body: 'John Smith cancelled "Design Review" on Friday',
      module: 'calendar',
      entityId: 'booking-202',
      entityPath: '/calendar',
      read: false,
      dismissed: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      icon: 'calendar-x',
    },
    {
      id: rid(),
      type: NotificationType.InvoicePaid,
      title: 'Invoice payment received',
      body: 'Invoice #1042 for $2,500 was paid by Acme Corp',
      module: 'accounting',
      entityId: 'inv-1042',
      entityPath: '/accounting/invoices',
      read: false,
      dismissed: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
      icon: 'dollar-sign',
    },
    {
      id: rid(),
      type: NotificationType.PageMentioned,
      title: 'You were mentioned',
      body: 'Emma Davis mentioned you in "Product Roadmap Q2"',
      module: 'pages',
      entityId: 'page-301',
      entityPath: '/pages/page-301',
      read: false,
      dismissed: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      icon: 'at-sign',
    },
    {
      id: rid(),
      type: NotificationType.CommentAdded,
      title: 'New comment',
      body: 'Tom Wilson commented on "API Design Doc"',
      module: 'pages',
      entityId: 'page-302',
      entityPath: '/pages/page-302',
      read: true,
      dismissed: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
      icon: 'message-circle',
    },
    {
      id: rid(),
      type: NotificationType.SystemAlert,
      title: 'System maintenance scheduled',
      body: 'OriginA will undergo maintenance on Sunday 2am-4am UTC',
      module: 'system',
      entityId: null,
      entityPath: null,
      read: false,
      dismissed: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
      icon: 'alert-circle',
    },
    {
      id: rid(),
      type: NotificationType.DocumentSigned,
      title: 'Document signed',
      body: 'Rachel Green signed "Vendor Contract 2026"',
      module: 'documents',
      entityId: 'doc-003',
      entityPath: '/documents',
      read: true,
      dismissed: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
      icon: 'file-signature',
    },
  ]
}

function getDateGroupLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  if (date >= today) return 'Today'
  if (date >= yesterday) return 'Yesterday'
  if (date >= weekAgo) return 'This Week'
  return 'Older'
}

interface NotificationState {
  notifications: Notification[]
  soundEnabled: boolean
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'dismissed' | 'createdAt'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
  dismissAll: () => void
  getUnreadCount: () => number
  getByModule: (module: string) => Notification[]
  getGroupedByDate: () => NotificationGroup[]
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: generateSampleNotifications(),
      soundEnabled: true,

      addNotification: (n) =>
        set((state) => {
          const newNotification: Notification = {
            ...n,
            id: rid(),
            read: false,
            dismissed: false,
            createdAt: new Date().toISOString(),
          }
          const updated = [newNotification, ...state.notifications]
          // Trim to max capacity
          if (updated.length > MAX_NOTIFICATIONS) {
            updated.length = MAX_NOTIFICATIONS
          }
          return { notifications: updated }
        }),

      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      dismiss: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, dismissed: true } : n
          ),
        })),

      dismissAll: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, dismissed: true })),
        })),

      getUnreadCount: () =>
        get().notifications.filter((n) => !n.read && !n.dismissed).length,

      getByModule: (module) =>
        get().notifications.filter((n) => n.module === module && !n.dismissed),

      getGroupedByDate: () => {
        const active = get().notifications.filter((n) => !n.dismissed)
        const groups = new Map<string, Notification[]>()
        const order = ['Today', 'Yesterday', 'This Week', 'Older']

        for (const n of active) {
          const label = getDateGroupLabel(n.createdAt)
          if (!groups.has(label)) groups.set(label, [])
          groups.get(label)!.push(n)
        }

        const result: NotificationGroup[] = []
        for (const label of order) {
          const items = groups.get(label)
          if (items && items.length > 0) {
            result.push({ label, notifications: items })
          }
        }
        return result
      },
    }),
    {
      name: 'origina-notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
)
