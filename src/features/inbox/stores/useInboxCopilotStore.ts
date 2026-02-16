import { create } from 'zustand'
import { useInboxStore } from './useInboxStore'

// ─── ID Generator ────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Types ──────────────────────────────────────────────────────────

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: string
}

// ─── Response Generator ─────────────────────────────────────────────

function generateResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase()
  const inbox = useInboxStore.getState()
  const unreadCount = inbox.getUnreadCount()
  const notifications = inbox.notifications

  if (msg.includes('unread') || msg.includes('how many')) {
    if (unreadCount === 0) {
      return 'Inbox zero! You have no unread notifications. Well done staying on top of things.'
    }
    return `You have ${unreadCount} unread notification(s). Use "Mark all as read" to clear them, or review each one individually. Focus on action-required items first (signature requests, assignments, mentions).`
  }

  if (msg.includes('priority') || msg.includes('important') || msg.includes('urgent')) {
    const actionRequired = notifications.filter((n) =>
      !n.read && (n.type === 'signature_request' || n.type === 'assignment' || n.type === 'mention')
    )
    const informational = notifications.filter((n) =>
      !n.read && (n.type === 'status_change' || n.type === 'system' || n.type === 'reminder')
    )
    return `Priority triage:\n- 🔴 Action required: ${actionRequired.length} (signatures, assignments, mentions)\n- 🟡 Informational: ${informational.length} (status changes, reminders, system)\n\nRecommendation: Handle action-required items first, then batch-review informational updates.`
  }

  if (msg.includes('digest') || msg.includes('summary') || msg.includes('batch')) {
    const freq = inbox.digestFrequency
    return `Your notification digest is set to: ${freq}.\n\nDigest options:\n- **Instant**: Get each notification as it arrives\n- **Hourly**: Batch digest every hour\n- **Daily**: One summary email per day (morning)\n- **Weekly**: Weekly digest (Monday morning)\n\nFor high-volume workspaces, daily or weekly digests reduce notification fatigue. Keep instant for critical items.`
  }

  if (msg.includes('mention') || msg.includes('@')) {
    const mentions = notifications.filter((n) => n.type === 'mention')
    const unreadMentions = mentions.filter((n) => !n.read)
    return `Mentions: ${mentions.length} total, ${unreadMentions.length} unread.\n\n@mentions are used when someone needs your attention on a specific page, comment, or issue. Respond promptly to keep collaboration flowing.\n\nTip: You can adjust mention notification settings in Settings > Notifications.`
  }

  if (msg.includes('signature') || msg.includes('sign')) {
    const signatureRequests = notifications.filter((n) => n.type === 'signature_request')
    const pending = signatureRequests.filter((n) => !n.read)
    return `Signature requests: ${signatureRequests.length} total, ${pending.length} pending.\n\nPending signatures should be completed within 24-48 hours. Delayed signatures hold up the entire workflow for all parties.\n\nTip: Set up automatic reminders in Settings to get nudged about pending signatures.`
  }

  if (msg.includes('clean') || msg.includes('clear') || msg.includes('archive')) {
    const read = notifications.filter((n) => n.read && !n.archived)
    return `Inbox cleanup:\n- ${read.length} read notification(s) can be archived\n- Use "Mark all as read" to clear the unread badge\n- Archive old notifications to keep your inbox focused\n- Delete notifications you'll never need again\n\nA clean inbox = a clear mind. Aim for inbox zero at the end of each day.`
  }

  if (msg.includes('setting') || msg.includes('preference') || msg.includes('configure')) {
    return 'Notification preferences:\n- **Email**: Toggle per notification type (mentions, assignments, signatures)\n- **Push**: Browser push notifications for real-time alerts\n- **In-app**: Always on — visible in the inbox bell icon\n- **Digest**: Set frequency (instant, hourly, daily, weekly)\n- **Do Not Disturb**: Pause all notifications during focus time\n\nConfigure in Settings > Notifications.'
  }

  return `I'm your Inbox Copilot — here to help you stay on top of notifications. You have ${unreadCount} unread notification(s) out of ${notifications.length} total.\n\nI can help with:\n- Priority triage (what needs attention now)\n- Notification digest settings\n- Inbox cleanup and archiving\n- Understanding notification types\n- Mention and signature request tracking\n\nWhat would you like to know?`
}

// ─── Store Interface ────────────────────────────────────────────────

interface InboxCopilotState {
  isOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void

  messages: CopilotMessage[]
  isTyping: boolean
  sendMessage: (content: string, context?: string) => void
  clearMessages: () => void

  isAnalyzing: boolean
  lastAnalysis: {
    type: 'triage' | 'digest' | 'cleanup'
    summary: string
    items: string[]
    timestamp: string
  } | null
  triageInbox: () => void
  smartDigest: () => void
  prioritySummary: () => void
}

// ─── Store ──────────────────────────────────────────────────────────

export const useInboxCopilotStore = create<InboxCopilotState>()(
  (set) => ({
    isOpen: false,
    messages: [],
    isTyping: false,
    isAnalyzing: false,
    lastAnalysis: null,

    openPanel: () => set({ isOpen: true }),
    closePanel: () => set({ isOpen: false }),
    togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

    sendMessage: (content, context) => {
      const userMessage: CopilotMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        context,
      }

      set((state) => ({
        messages: [...state.messages, userMessage],
        isTyping: true,
      }))

      const delay = 500 + Math.random() * 1000
      setTimeout(() => {
        const responseContent = generateResponse(content)
        const assistantMessage: CopilotMessage = {
          id: generateId(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString(),
        }

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isTyping: false,
        }))
      }, delay)
    },

    clearMessages: () => set({ messages: [], isTyping: false }),

    triageInbox: () => {
      set({ isAnalyzing: true })
      setTimeout(() => {
        const inbox = useInboxStore.getState()
        const items: string[] = []
        const unread = inbox.notifications.filter((n) => !n.read)

        const actionRequired = unread.filter((n) =>
          n.type === 'signature_request' || n.type === 'assignment' || n.type === 'mention'
        )
        const informational = unread.filter((n) =>
          n.type === 'status_change' || n.type === 'system' || n.type === 'reminder'
        )
        const social = unread.filter((n) =>
          n.type === 'comment' || n.type === 'invitation'
        )

        if (actionRequired.length > 0) items.push(`🔴 ${actionRequired.length} action-required notification(s)`)
        if (social.length > 0) items.push(`🟡 ${social.length} social notification(s) (comments, invitations)`)
        if (informational.length > 0) items.push(`🟢 ${informational.length} informational notification(s)`)
        if (unread.length === 0) items.push('Inbox zero — no unread notifications!')

        set({
          isAnalyzing: false,
          lastAnalysis: {
            type: 'triage',
            summary: unread.length > 0 ? `Triaged ${unread.length} unread notification(s).` : 'Inbox is clear!',
            items,
            timestamp: new Date().toISOString(),
          },
        })
      }, 600)
    },

    smartDigest: () => {
      set({ isAnalyzing: true })
      setTimeout(() => {
        const inbox = useInboxStore.getState()
        const items: string[] = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const todayNotifications = inbox.notifications.filter((n) =>
          new Date(n.createdAt) >= today
        )

        items.push(`${todayNotifications.length} notification(s) today`)
        items.push(`Current digest frequency: ${inbox.digestFrequency}`)

        const avgPerDay = Math.round(inbox.notifications.length / 7) // rough estimate
        if (avgPerDay > 20) {
          items.push(`High volume (~${avgPerDay}/day) — consider switching to daily digest`)
        } else if (avgPerDay < 5) {
          items.push(`Low volume (~${avgPerDay}/day) — instant notifications work well`)
        }

        set({
          isAnalyzing: false,
          lastAnalysis: {
            type: 'digest',
            summary: `Digest analysis: ~${avgPerDay} notification(s) per day.`,
            items,
            timestamp: new Date().toISOString(),
          },
        })
      }, 700)
    },

    prioritySummary: () => {
      set({ isAnalyzing: true })
      setTimeout(() => {
        const inbox = useInboxStore.getState()
        const items: string[] = []

        const types = ['signature_request', 'assignment', 'mention', 'comment', 'status_change', 'booking', 'reminder', 'system'] as const
        for (const type of types) {
          const count = inbox.notifications.filter((n) => n.type === type && !n.read).length
          if (count > 0) {
            const label = type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
            items.push(`${label}: ${count} unread`)
          }
        }

        if (items.length === 0) {
          items.push('No unread notifications by type')
        }

        set({
          isAnalyzing: false,
          lastAnalysis: {
            type: 'cleanup',
            summary: `Priority breakdown across ${items.length} category(ies).`,
            items,
            timestamp: new Date().toISOString(),
          },
        })
      }, 500)
    },
  })
)
