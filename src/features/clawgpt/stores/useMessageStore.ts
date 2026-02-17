import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BrainMessage } from '../types'
import { ChannelType, MessageDirection, MessageStatus } from '../types'
import type { ChannelType as ChannelTypeT } from '../types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const SAMPLE_MESSAGES: BrainMessage[] = [
  {
    id: 'msg-1',
    sessionId: 'session-1',
    channelId: 'ch-slack',
    channelType: ChannelType.Slack,
    direction: MessageDirection.Inbound,
    content: 'Hey, I need help with setting up the project board.',
    timestamp: '2025-06-15T09:00:00Z',
    senderName: 'Sarah Connor',
    senderAvatar: null,
    toolCalls: null,
    agentId: null,
    status: MessageStatus.Read,
  },
  {
    id: 'msg-2',
    sessionId: 'session-1',
    channelId: 'ch-slack',
    channelType: ChannelType.Slack,
    direction: MessageDirection.Outbound,
    content: 'Of course! I can help you create a new project board. What would you like to name it?',
    timestamp: '2025-06-15T09:00:30Z',
    senderName: 'Atlas',
    senderAvatar: null,
    toolCalls: null,
    agentId: null,
    status: MessageStatus.Delivered,
  },
  {
    id: 'msg-3',
    sessionId: 'session-1',
    channelId: 'ch-slack',
    channelType: ChannelType.Slack,
    direction: MessageDirection.Inbound,
    content: 'Call it "Q3 Marketing Campaign"',
    timestamp: '2025-06-15T09:01:00Z',
    senderName: 'Sarah Connor',
    senderAvatar: null,
    toolCalls: null,
    agentId: null,
    status: MessageStatus.Read,
  },
  {
    id: 'msg-4',
    sessionId: 'session-1',
    channelId: 'ch-slack',
    channelType: ChannelType.Slack,
    direction: MessageDirection.Outbound,
    content: 'Done! I created the "Q3 Marketing Campaign" board with default columns: To Do, In Progress, Review, and Done. Want me to add any team members?',
    timestamp: '2025-06-15T09:01:15Z',
    senderName: 'Atlas',
    senderAvatar: null,
    toolCalls: null,
    agentId: null,
    status: MessageStatus.Delivered,
  },
  {
    id: 'msg-5',
    sessionId: 'session-2',
    channelId: 'ch-email',
    channelType: ChannelType.Email,
    direction: MessageDirection.Inbound,
    content: 'Can you send me the latest invoice for project Alpha?',
    timestamp: '2025-06-15T08:45:00Z',
    senderName: 'John Doe',
    senderAvatar: null,
    toolCalls: null,
    agentId: null,
    status: MessageStatus.Read,
  },
  {
    id: 'msg-6',
    sessionId: 'session-2',
    channelId: 'ch-email',
    channelType: ChannelType.Email,
    direction: MessageDirection.Outbound,
    content: 'Hi John, I found invoice #INV-2025-0042 for Project Alpha dated June 10, 2025. The total is $12,500. Shall I forward it to you?',
    timestamp: '2025-06-15T08:46:00Z',
    senderName: 'Atlas',
    senderAvatar: null,
    toolCalls: null,
    agentId: null,
    status: MessageStatus.Sent,
  },
  {
    id: 'msg-7',
    sessionId: 'session-3',
    channelId: 'ch-webchat',
    channelType: ChannelType.WebChat,
    direction: MessageDirection.Inbound,
    content: 'What pricing plans do you offer?',
    timestamp: '2025-06-15T10:00:00Z',
    senderName: 'Anonymous Visitor',
    senderAvatar: null,
    toolCalls: null,
    agentId: null,
    status: MessageStatus.Delivered,
  },
  {
    id: 'msg-8',
    sessionId: 'session-3',
    channelId: 'ch-webchat',
    channelType: ChannelType.WebChat,
    direction: MessageDirection.Outbound,
    content: 'We offer three plans: Starter ($9/mo), Pro ($29/mo), and Enterprise (custom pricing). Would you like me to go over the features of each?',
    timestamp: '2025-06-15T10:00:15Z',
    senderName: 'Atlas',
    senderAvatar: null,
    toolCalls: null,
    agentId: null,
    status: MessageStatus.Delivered,
  },
  {
    id: 'msg-9',
    sessionId: 'session-3',
    channelId: 'ch-webchat',
    channelType: ChannelType.WebChat,
    direction: MessageDirection.Inbound,
    content: 'Yes please, especially the Pro plan.',
    timestamp: '2025-06-15T10:01:00Z',
    senderName: 'Anonymous Visitor',
    senderAvatar: null,
    toolCalls: null,
    agentId: null,
    status: MessageStatus.Delivered,
  },
  {
    id: 'msg-10',
    sessionId: 'session-2',
    channelId: 'ch-email',
    channelType: ChannelType.Email,
    direction: MessageDirection.Inbound,
    content: 'Yes, please forward it to john@acme.com. Thanks!',
    timestamp: '2025-06-15T09:15:00Z',
    senderName: 'John Doe',
    senderAvatar: null,
    toolCalls: null,
    agentId: null,
    status: MessageStatus.Read,
  },
]

interface MessageState {
  messages: BrainMessage[]
  activeSessionId: string | null
  searchQuery: string

  sendMessage: (sessionId: string, channelId: string, channelType: ChannelTypeT, content: string) => void
  receiveMessage: (msg: Omit<BrainMessage, 'id' | 'timestamp'>) => void
  markRead: (sessionId: string) => void
  deleteMessage: (id: string) => void
  setActiveSession: (sessionId: string | null) => void
  setSearchQuery: (query: string) => void
  searchMessages: (query: string) => BrainMessage[]
  getMessagesBySession: (sessionId: string) => BrainMessage[]
  getUnreadCount: () => number
}

export const useMessageStore = create<MessageState>()(
  persist(
    (_set, get) => ({
      messages: SAMPLE_MESSAGES,
      activeSessionId: null,
      searchQuery: '',

      sendMessage: (sessionId, channelId, channelType, content) => {
        const id = rid()
        const msg: BrainMessage = {
          id,
          sessionId,
          channelId,
          channelType,
          direction: MessageDirection.Outbound,
          content,
          timestamp: new Date().toISOString(),
          senderName: 'Atlas',
          senderAvatar: null,
          toolCalls: null,
          agentId: null,
          status: MessageStatus.Sent,
        }
        _set((s) => ({
          messages: [...s.messages, msg],
        }))
      },

      receiveMessage: (msg) => {
        const fullMsg: BrainMessage = {
          ...msg,
          id: rid(),
          timestamp: new Date().toISOString(),
        }
        _set((s) => ({
          messages: [...s.messages, fullMsg],
        }))
      },

      markRead: (sessionId) => {
        _set((s) => ({
          messages: s.messages.map((m) =>
            m.sessionId === sessionId ? { ...m, status: MessageStatus.Read as MessageStatus } : m
          ),
        }))
      },

      deleteMessage: (id) => {
        _set((s) => ({
          messages: s.messages.filter((m) => m.id !== id),
        }))
      },

      setActiveSession: (sessionId) => {
        _set({ activeSessionId: sessionId })
      },

      setSearchQuery: (query) => {
        _set({ searchQuery: query })
      },

      searchMessages: (query) => {
        const lower = query.toLowerCase()
        return get().messages.filter(
          (m) =>
            m.content.toLowerCase().includes(lower) ||
            m.senderName.toLowerCase().includes(lower)
        )
      },

      getMessagesBySession: (sessionId) => {
        return get().messages.filter((m) => m.sessionId === sessionId)
      },

      getUnreadCount: () => {
        return get().messages.filter((m) => m.status !== MessageStatus.Read).length
      },
    }),
    {
      name: 'orchestree-message-storage',
      partialize: (state) => ({
        messages: state.messages.slice(-1000),
        activeSessionId: state.activeSessionId,
        searchQuery: state.searchQuery,
      }),
    }
  )
)
