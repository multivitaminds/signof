import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BrainMessage } from '../types'
import { MessageDirection, MessageStatus } from '../types'
import type { ChannelType as ChannelTypeT, MessageStatus as MessageStatusT } from '../types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

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
  updateMessageStatus: (id: string, status: MessageStatusT) => void
  loadMessages: (messages: BrainMessage[]) => void
}

export const useMessageStore = create<MessageState>()(
  persist(
    (_set, get) => ({
      messages: [],
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
          senderName: 'You',
          senderAvatar: null,
          toolCalls: null,
          agentId: null,
          status: MessageStatus.Sending,
        }
        _set((s) => ({
          messages: [...s.messages, msg],
        }))

        // Send via gateway client
        import('../lib/gatewayClient').then(({ sendChatMessage }) => {
          import('./useSoulStore').then(({ useSoulStore }) => {
            import('./useSkillStore').then(({ useSkillStore }) => {
              const soulConfig = useSoulStore.getState().soulConfig
              const skills = useSkillStore.getState().skills
                .filter((sk) => sk.installed && sk.enabled)
                .map((sk) => ({
                  id: sk.id,
                  name: sk.name,
                  description: sk.description,
                  handler: sk.actions[0]?.handler ?? sk.id,
                }))
              sendChatMessage(sessionId, content, soulConfig, skills, channelId, channelType)
            })
          })
        })

        // Increment message count
        import('./useGatewayStore').then(({ useGatewayStore }) => {
          useGatewayStore.getState().incrementMessageCount()
        })
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
            m.sessionId === sessionId ? { ...m, status: MessageStatus.Read as MessageStatusT } : m
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

      updateMessageStatus: (id, status) => {
        _set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, status } : m
          ),
        }))
      },

      loadMessages: (messages) => {
        _set((s) => {
          const existingIds = new Set(s.messages.map((m) => m.id))
          const newMessages = messages.filter((m) => !existingIds.has(m.id))
          return { messages: [...s.messages, ...newMessages] }
        })
      },
    }),
    {
      name: 'origina-message-storage',
      partialize: (state) => ({
        messages: state.messages.slice(-1000),
        activeSessionId: state.activeSessionId,
        searchQuery: state.searchQuery,
      }),
    }
  )
)
