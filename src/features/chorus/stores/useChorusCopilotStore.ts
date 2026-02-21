import { create } from 'zustand'
import { useChorusStore } from './useChorusStore'
import { useChorusMessageStore } from './useChorusMessageStore'
import { copilotChat, copilotAnalysis } from '../../ai/lib/copilotLLM'

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

export interface CopilotSuggestion {
  id: string
  type: 'tip' | 'warning' | 'deduction' | 'missing_info' | 'review'
  title: string
  description: string
  action?: { label: string; route?: string }
  dismissed: boolean
  sectionId?: string
}

// ─── Response Generator ─────────────────────────────────────────────

function generateResponse(userMessage: string, context?: string): string {
  const msg = userMessage.toLowerCase()

  const chorusState = useChorusStore.getState()
  const messageState = useChorusMessageStore.getState()

  // Keyword: summary / summarize / recap
  if (msg.includes('summary') || msg.includes('summarize') || msg.includes('recap')) {
    const channels = chorusState.channels
    const totalMessages = Object.values(messageState.messages).reduce(
      (sum, msgs) => sum + (msgs?.length ?? 0), 0
    )
    return `You have ${channels.length} channel(s) with ${totalMessages} total message(s). I can summarize a specific channel — just tell me which one, or say "summarize #general".`
  }

  // Keyword: thread / threads
  if (msg.includes('thread')) {
    const allMsgs = Object.values(messageState.messages).flat()
    const threadsWithReplies = allMsgs.filter((m) => m.threadReplyCount > 0)
    return `There are ${threadsWithReplies.length} thread(s) with replies across all channels. I can summarize a specific thread if you open it.`
  }

  // Keyword: activity / active / busy
  if (msg.includes('activity') || msg.includes('active') || msg.includes('busy')) {
    const channels = chorusState.channels
    const sorted = [...channels].sort((a, b) => b.unreadCount - a.unreadCount)
    const top3 = sorted.slice(0, 3)
    if (top3.length === 0) return 'No channel activity detected yet.'
    return `Most active channels:\n${top3.map((ch) => `- #${ch.name}: ${ch.unreadCount} unread`).join('\n')}`
  }

  // Keyword: unread / new messages
  if (msg.includes('unread') || msg.includes('new message')) {
    const totalUnread = chorusState.getTotalUnreadCount()
    const totalMentions = chorusState.getTotalMentionCount()
    return `You have ${totalUnread} unread message(s) and ${totalMentions} mention(s) across all channels.`
  }

  // Keyword: search / find
  if (msg.includes('search') || msg.includes('find')) {
    return 'I can help you search messages. Try telling me what you\'re looking for, like "find decisions" or "search for project updates".'
  }

  // Keyword: mention / mentioned
  if (msg.includes('mention')) {
    const totalMentions = chorusState.getTotalMentionCount()
    return `You have ${totalMentions} mention(s) across all channels. Check the channels with mention badges for details.`
  }

  // Keyword: channel / channels
  if (msg.includes('channel')) {
    const channels = chorusState.channels
    const publicChannels = channels.filter((ch) => ch.type === 'public')
    const privateChannels = channels.filter((ch) => ch.type === 'private')
    return `You have ${channels.length} channel(s): ${publicChannels.length} public, ${privateChannels.length} private.${channels.length > 0 ? `\n\nChannels:\n${channels.map((ch) => `- #${ch.name} (${ch.memberIds.length} members)`).join('\n')}` : ''}`
  }

  // Context-aware
  if (context) {
    const sectionContextMap: Record<string, string> = {
      channel_list: 'the channel list, where you browse and join channels',
      dm_list: 'the DM list, where you manage direct conversations',
      channel_view: 'a channel conversation, where you send and read messages',
      dm_view: 'a direct message conversation',
      thread_view: 'a thread, where you follow a specific discussion',
    }
    const sectionDesc = sectionContextMap[context]
    if (sectionDesc) {
      return `You're currently in ${sectionDesc}. I can help you understand messages, summarize discussions, or find specific content. What would you like to know?`
    }
  }

  // Fallback
  const channelCount = chorusState.channels.length
  const totalUnread = chorusState.getTotalUnreadCount()
  const totalMessages = Object.values(messageState.messages).reduce(
    (sum, msgs) => sum + (msgs?.length ?? 0), 0
  )

  return `I'm your Chorus Copilot — here to help manage your messaging. You currently have ${channelCount} channel(s), ${totalMessages} message(s), and ${totalUnread} unread. I can help with:\n- Channel and thread summaries\n- Finding decisions and action items\n- Activity analysis\n- Unread and mention tracking\n- Message search\n\nWhat would you like to know?`
}

// ─── Store Interface ────────────────────────────────────────────────

interface ChorusCopilotState {
  // Panel visibility
  isOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void

  // Messages
  messages: CopilotMessage[]
  isTyping: boolean
  sendMessage: (content: string, context?: string) => void
  clearMessages: () => void

  // Suggestions
  suggestions: CopilotSuggestion[]
  addSuggestion: (suggestion: Omit<CopilotSuggestion, 'id' | 'dismissed'>) => void
  dismissSuggestion: (id: string) => void
  getSuggestionsForSection: (sectionId: string) => CopilotSuggestion[]
  clearSuggestions: () => void

  // Analysis
  isAnalyzing: boolean
  lastAnalysis: {
    type: 'channel_summary' | 'thread_summary' | 'activity'
    summary: string
    items: string[]
    timestamp: string
  } | null
  summarizeChannel: (channelId: string) => void
  summarizeThread: (channelId: string, threadId: string) => void
  analyzeActivity: (channelId: string) => void
}

// ─── Store ──────────────────────────────────────────────────────────

export const useChorusCopilotStore = create<ChorusCopilotState>()(
  (set, get) => ({
    isOpen: false,
    messages: [],
    isTyping: false,
    suggestions: [],
    isAnalyzing: false,
    lastAnalysis: null,

    // ─── Panel ───────────────────────────────────────────────────────

    openPanel: () => set({ isOpen: true }),

    closePanel: () => set({ isOpen: false }),

    togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

    // ─── Messages ────────────────────────────────────────────────────

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

      const cs = useChorusStore.getState()
      const ms = useChorusMessageStore.getState()
      const totalMessages = Object.values(ms.messages).reduce(
        (sum, msgs) => sum + (msgs?.length ?? 0), 0
      )
      const contextSummary = `${cs.channels.length} channels, ${totalMessages} messages`

      copilotChat('Chorus', content, contextSummary, () => generateResponse(content, context))
        .then((responseContent) => {
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
        })
    },

    clearMessages: () => set({ messages: [], isTyping: false }),

    // ─── Suggestions ─────────────────────────────────────────────────

    addSuggestion: (suggestion) =>
      set((state) => ({
        suggestions: [
          ...state.suggestions,
          { ...suggestion, id: generateId(), dismissed: false },
        ],
      })),

    dismissSuggestion: (id) =>
      set((state) => ({
        suggestions: state.suggestions.map((s) =>
          s.id === id ? { ...s, dismissed: true } : s
        ),
      })),

    getSuggestionsForSection: (sectionId) => {
      return get().suggestions.filter(
        (s) => s.sectionId === sectionId && !s.dismissed
      )
    },

    clearSuggestions: () => set({ suggestions: [] }),

    // ─── Analysis ────────────────────────────────────────────────────

    summarizeChannel: (channelId) => {
      set({ isAnalyzing: true })

      const chorusState = useChorusStore.getState()
      const messageState = useChorusMessageStore.getState()
      const channel = chorusState.channels.find((ch) => ch.id === channelId)
      const msgs = messageState.messages[channelId] ?? []
      const dataContext = `Channel: ${channel?.name ?? channelId}, ${msgs.length} messages`

      const fallbackFn = () => {
        const items: string[] = []

        if (msgs.length === 0) {
          return { summary: `No messages in #${channel?.name ?? 'unknown'} yet.`, items: ['No messages found'] }
        }

        // Count messages and unique senders
        const senders = new Set(msgs.map((m) => m.senderName))
        items.push(`${msgs.length} message(s) from ${senders.size} participant(s)`)

        // Extract topics: find messages with questions or key phrases
        const questions = msgs.filter((m) => m.content.includes('?'))
        if (questions.length > 0) {
          items.push(`${questions.length} question(s) raised`)
        }

        // Find pinned messages
        const pinned = msgs.filter((m) => m.isPinned)
        if (pinned.length > 0) {
          items.push(`${pinned.length} pinned message(s)`)
        }

        // Find threads
        const threads = msgs.filter((m) => m.threadReplyCount > 0)
        if (threads.length > 0) {
          items.push(`${threads.length} active thread(s)`)
        }

        // High-activity senders
        const senderCounts: Record<string, number> = {}
        for (const m of msgs) {
          senderCounts[m.senderName] = (senderCounts[m.senderName] ?? 0) + 1
        }
        const topSenders = Object.entries(senderCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
        if (topSenders.length > 0) {
          items.push(`Top contributors: ${topSenders.map(([name, count]) => `${name} (${count})`).join(', ')}`)
        }

        const summary = `Channel #${channel?.name ?? 'unknown'}: ${msgs.length} message(s) from ${senders.size} participant(s), ${questions.length} question(s), ${threads.length} thread(s).`
        return { summary, items }
      }

      copilotAnalysis('Chorus', 'channel summary', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'channel_summary', ...result, timestamp: new Date().toISOString() } })
        })
    },

    summarizeThread: (channelId, threadId) => {
      set({ isAnalyzing: true })

      const messageState = useChorusMessageStore.getState()
      const msgs = messageState.messages[channelId] ?? []
      const parentMsg = msgs.find((m) => m.id === threadId)
      const threadMsgs = msgs.filter((m) => m.threadId === threadId)
      const dataContext = `Thread: ${threadMsgs.length} replies to "${parentMsg?.content.slice(0, 50) ?? '...'}"`

      const fallbackFn = () => {
        const items: string[] = []

        if (!parentMsg) {
          return { summary: 'Thread not found.', items: ['Parent message not found'] }
        }

        items.push(`Original: "${parentMsg.content.slice(0, 100)}${parentMsg.content.length > 100 ? '...' : ''}"`)

        const participants = new Set([parentMsg.senderName, ...threadMsgs.map((m) => m.senderName)])
        items.push(`${threadMsgs.length} reply(ies) from ${participants.size} participant(s)`)

        // Find questions in thread
        const questions = threadMsgs.filter((m) => m.content.includes('?'))
        if (questions.length > 0) {
          items.push(`${questions.length} question(s) in thread`)
        }

        // Participant list
        items.push(`Participants: ${[...participants].join(', ')}`)

        const summary = `Thread with ${threadMsgs.length} reply(ies) from ${participants.size} participant(s).`
        return { summary, items }
      }

      copilotAnalysis('Chorus', 'thread summary', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'thread_summary', ...result, timestamp: new Date().toISOString() } })
        })
    },

    analyzeActivity: (channelId) => {
      set({ isAnalyzing: true })

      const chorusState = useChorusStore.getState()
      const messageState = useChorusMessageStore.getState()
      const channel = chorusState.channels.find((ch) => ch.id === channelId)
      const msgs = messageState.messages[channelId] ?? []
      const dataContext = `Channel: ${channel?.name ?? channelId}, ${msgs.length} messages`

      const fallbackFn = () => {
        const items: string[] = []

        if (msgs.length === 0) {
          return { summary: `No activity in #${channel?.name ?? 'unknown'} yet.`, items: ['No messages found'] }
        }

        // Message volume
        items.push(`Total messages: ${msgs.length}`)

        // Per-sender counts
        const senderCounts: Record<string, number> = {}
        for (const m of msgs) {
          senderCounts[m.senderName] = (senderCounts[m.senderName] ?? 0) + 1
        }
        for (const [name, count] of Object.entries(senderCounts).sort(([, a], [, b]) => b - a)) {
          items.push(`${name}: ${count} message(s)`)
        }

        // Peak hours
        const hourCounts: Record<number, number> = {}
        for (const m of msgs) {
          const hour = new Date(m.timestamp).getHours()
          hourCounts[hour] = (hourCounts[hour] ?? 0) + 1
        }
        const peakHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]
        if (peakHour) {
          items.push(`Peak hour: ${peakHour[0]}:00 (${peakHour[1]} messages)`)
        }

        // Thread participation
        const threads = msgs.filter((m) => m.threadReplyCount > 0)
        if (threads.length > 0) {
          const avgReplies = threads.reduce((sum, m) => sum + m.threadReplyCount, 0) / threads.length
          items.push(`${threads.length} thread(s), avg ${avgReplies.toFixed(1)} replies`)
        }

        // Reaction activity
        const reactedMsgs = msgs.filter((m) => m.reactions.length > 0)
        if (reactedMsgs.length > 0) {
          items.push(`${reactedMsgs.length} message(s) with reactions`)
        }

        const senderCount = Object.keys(senderCounts).length
        const summary = `Channel #${channel?.name ?? 'unknown'}: ${msgs.length} message(s) from ${senderCount} participant(s), ${threads.length} thread(s), ${reactedMsgs.length} reacted message(s).`
        return { summary, items }
      }

      copilotAnalysis('Chorus', 'activity', dataContext, fallbackFn)
        .then((result) => {
          set({ isAnalyzing: false, lastAnalysis: { type: 'activity', ...result, timestamp: new Date().toISOString() } })
        })
    },
  })
)
