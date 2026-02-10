import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification } from '../types'
import { NotificationType } from '../types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: NotificationType.SignatureRequest,
    title: 'Document awaiting your signature',
    message: 'Alex Johnson sent you "Q4 Partnership Agreement" for signing',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/documents',
    actorName: 'Alex Johnson',
    actorAvatar: null,
  },
  {
    id: 'notif-2',
    type: NotificationType.Mention,
    title: 'You were mentioned',
    message: 'Sarah Chen mentioned you in "Sprint Planning" page',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: '/pages',
    actorName: 'Sarah Chen',
    actorAvatar: null,
  },
  {
    id: 'notif-3',
    type: NotificationType.Assignment,
    title: 'New task assigned',
    message: 'Mike Rivera assigned you "Implement OAuth flow" in Projects',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    link: '/projects',
    actorName: 'Mike Rivera',
    actorAvatar: null,
  },
  {
    id: 'notif-4',
    type: NotificationType.Comment,
    title: 'New comment on your document',
    message: 'Emma Davis commented on "Design System Spec"',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/documents',
    actorName: 'Emma Davis',
    actorAvatar: null,
  },
  {
    id: 'notif-5',
    type: NotificationType.StatusChange,
    title: 'Document completed',
    message: '"NDA - Acme Corp" has been signed by all parties',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    link: '/documents',
    actorName: null,
    actorAvatar: null,
  },
  {
    id: 'notif-6',
    type: NotificationType.Reminder,
    title: 'Meeting reminder',
    message: 'Your meeting "Weekly Standup" starts in 15 minutes',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    link: '/calendar',
    actorName: null,
    actorAvatar: null,
  },
  {
    id: 'notif-7',
    type: NotificationType.Invitation,
    title: 'Team invitation',
    message: 'You have been invited to join the "Engineering" team',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    link: '/settings/members',
    actorName: 'Alex Johnson',
    actorAvatar: null,
  },
  {
    id: 'notif-8',
    type: NotificationType.System,
    title: 'Welcome to SignOf!',
    message: 'Get started by creating your first document or exploring the workspace',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
    link: '/',
    actorName: null,
    actorAvatar: null,
  },
]

interface InboxState {
  notifications: Notification[]

  addNotification: (type: NotificationType, title: string, message: string, link?: string, actorName?: string) => void
  markAsRead: (id: string) => void
  toggleRead: (id: string) => void
  markSelectedAsRead: (ids: string[]) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  deleteMultiple: (ids: string[]) => void
  clearAll: () => void
  getUnreadCount: () => number
}

export const useInboxStore = create<InboxState>()(
  persist(
    (set, get) => ({
      notifications: SAMPLE_NOTIFICATIONS,

      addNotification: (type, title, message, link, actorName) => {
        const notification: Notification = {
          id: rid(),
          type,
          title,
          message,
          read: false,
          createdAt: new Date().toISOString(),
          link: link ?? null,
          actorName: actorName ?? null,
          actorAvatar: null,
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

      clearAll: () => {
        set({ notifications: [] })
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length
      },
    }),
    {
      name: 'signof-inbox-storage',
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
)
