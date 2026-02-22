import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ModelId, Conversation, ConversationSettings, PlaygroundMessage } from '../types'
import { DEFAULT_MODEL_ID, MODEL_CATALOG } from '../lib/models'
import { estimateTokens } from '../lib/tokenCounter'
import { generateResponse } from '../lib/playgroundResponder'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const MAX_CONVERSATIONS = 50
const MAX_MESSAGES_PER_CONVERSATION = 200

const DEFAULT_SETTINGS: ConversationSettings = {
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  streaming: true,
  agentMode: false,
}

function createDefaultConversation(modelId: ModelId = DEFAULT_MODEL_ID): Conversation {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    title: 'New Chat',
    modelId,
    settings: { ...DEFAULT_SETTINGS },
    messages: [],
    createdAt: now,
    updatedAt: now,
    totalTokens: 0,
  }
}

export interface PlaygroundState {
  conversations: Conversation[]
  activeConversationId: string | null
  isTyping: boolean
  searchQuery: string
  settingsPanelOpen: boolean

  createConversation: () => void
  deleteConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  setActiveConversation: (id: string) => void
  sendMessage: (content: string) => void
  clearMessages: () => void
  setModel: (modelId: ModelId) => void
  updateSettings: (settings: Partial<ConversationSettings>) => void
  toggleSettingsPanel: () => void
  setSearchQuery: (query: string) => void
  exportConversation: (id: string) => string
}

const usePlaygroundStore = create<PlaygroundState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isTyping: false,
      searchQuery: '',
      settingsPanelOpen: false,

      createConversation: () => {
        const conversation = createDefaultConversation()
        set((state) => {
          let convos = [conversation, ...state.conversations]
          // FIFO eviction if over limit
          if (convos.length > MAX_CONVERSATIONS) {
            convos = convos.slice(0, MAX_CONVERSATIONS)
          }
          return {
            conversations: convos,
            activeConversationId: conversation.id,
          }
        })
      },

      deleteConversation: (id) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id)
          const newActiveId =
            state.activeConversationId === id
              ? filtered[0]?.id ?? null
              : state.activeConversationId
          return {
            conversations: filtered,
            activeConversationId: newActiveId,
          }
        })
      },

      renameConversation: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c
          ),
        }))
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id })
      },

      sendMessage: (content) => {
        const state = get()
        const activeId = state.activeConversationId
        if (!activeId) return

        const conversation = state.conversations.find((c) => c.id === activeId)
        if (!conversation) return

        const tokenCount = estimateTokens(content)
        const userMessage: PlaygroundMessage = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
          modelId: null,
          tokenCount,
          toolCalls: [],
        }

        // Auto-title from first message
        const isFirstMessage = conversation.messages.length === 0
        const autoTitle = isFirstMessage
          ? content.slice(0, 40) + (content.length > 40 ? '...' : '')
          : conversation.title

        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id !== activeId) return c
            let messages = [...c.messages, userMessage]
            if (messages.length > MAX_MESSAGES_PER_CONVERSATION) {
              messages = messages.slice(messages.length - MAX_MESSAGES_PER_CONVERSATION)
            }
            return {
              ...c,
              title: autoTitle,
              messages,
              totalTokens: c.totalTokens + tokenCount,
              updatedAt: new Date().toISOString(),
            }
          }),
          isTyping: true,
        }))

        // Generate response
        generateResponse(content, conversation.modelId, conversation.settings.agentMode)
          .then(({ content: responseContent, toolCalls }) => {
            const responseTokenCount = estimateTokens(responseContent)
            const assistantMessage: PlaygroundMessage = {
              id: generateId(),
              role: 'assistant',
              content: responseContent,
              timestamp: new Date().toISOString(),
              modelId: conversation.modelId,
              tokenCount: responseTokenCount,
              toolCalls,
            }

            set((state) => ({
              conversations: state.conversations.map((c) => {
                if (c.id !== activeId) return c
                let messages = [...c.messages, assistantMessage]
                if (messages.length > MAX_MESSAGES_PER_CONVERSATION) {
                  messages = messages.slice(messages.length - MAX_MESSAGES_PER_CONVERSATION)
                }
                return {
                  ...c,
                  messages,
                  totalTokens: c.totalTokens + responseTokenCount,
                  updatedAt: new Date().toISOString(),
                }
              }),
              isTyping: false,
            }))
          })
      },

      clearMessages: () => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === state.activeConversationId
              ? { ...c, messages: [], totalTokens: 0, updatedAt: new Date().toISOString() }
              : c
          ),
        }))
      },

      setModel: (modelId) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === state.activeConversationId
              ? { ...c, modelId, updatedAt: new Date().toISOString() }
              : c
          ),
        }))
      },

      updateSettings: (settings) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === state.activeConversationId
              ? { ...c, settings: { ...c.settings, ...settings }, updatedAt: new Date().toISOString() }
              : c
          ),
        }))
      },

      toggleSettingsPanel: () => {
        set((state) => ({ settingsPanelOpen: !state.settingsPanelOpen }))
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      exportConversation: (id) => {
        const conversation = get().conversations.find((c) => c.id === id)
        if (!conversation) return '{}'
        const model = MODEL_CATALOG[conversation.modelId]
        return JSON.stringify({
          title: conversation.title,
          model: model.name,
          settings: conversation.settings,
          messages: conversation.messages.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })),
          exportedAt: new Date().toISOString(),
        }, null, 2)
      },
    }),
    {
      name: 'origina-playground',
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
)

export default usePlaygroundStore
