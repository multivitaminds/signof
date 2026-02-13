import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AIChatMessage } from '../types'
import { FEATURE_CONTEXTS, type FeatureKey } from '../lib/featureContexts'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

interface FeatureChatSession {
  messages: AIChatMessage[]
  isOpen: boolean
}

interface AIFeatureChatState {
  sessions: Record<FeatureKey, FeatureChatSession>

  openChat: (featureKey: FeatureKey) => void
  closeChat: (featureKey: FeatureKey) => void
  addMessage: (featureKey: FeatureKey, role: 'user' | 'assistant', content: string) => void
  clearMessages: (featureKey: FeatureKey) => void
}

function createEmptySession(): FeatureChatSession {
  return { messages: [], isOpen: false }
}

const useAIFeatureChatStore = create<AIFeatureChatState>()(
  persist(
    (set, get) => ({
      sessions: {
        home: createEmptySession(),
        workspace: createEmptySession(),
        projects: createEmptySession(),
        documents: createEmptySession(),
        scheduling: createEmptySession(),
        databases: createEmptySession(),
        inbox: createEmptySession(),
      },

      openChat: (featureKey) => {
        const session = get().sessions[featureKey]
        const updates: Partial<FeatureChatSession> = { isOpen: true }

        // Add greeting message if no messages yet
        if (session.messages.length === 0) {
          const context = FEATURE_CONTEXTS[featureKey]
          updates.messages = [
            {
              id: generateId(),
              role: 'assistant',
              content: context.greeting,
              timestamp: new Date().toISOString(),
            },
          ]
        }

        set((state) => ({
          sessions: {
            ...state.sessions,
            [featureKey]: { ...state.sessions[featureKey], ...updates },
          },
        }))
      },

      closeChat: (featureKey) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [featureKey]: { ...state.sessions[featureKey], isOpen: false },
          },
        }))
      },

      addMessage: (featureKey, role, content) => {
        const msg: AIChatMessage = {
          id: generateId(),
          role,
          content,
          timestamp: new Date().toISOString(),
        }
        set((state) => ({
          sessions: {
            ...state.sessions,
            [featureKey]: {
              ...state.sessions[featureKey],
              messages: [...state.sessions[featureKey].messages, msg],
            },
          },
        }))
      },

      clearMessages: (featureKey) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [featureKey]: { ...state.sessions[featureKey], messages: [] },
          },
        }))
      },
    }),
    {
      name: 'orchestree-ai-feature-chat',
      partialize: (state) => ({
        sessions: Object.fromEntries(
          Object.entries(state.sessions).map(([key, session]) => [
            key,
            { messages: session.messages, isOpen: false },
          ])
        ),
      }),
    }
  )
)

export default useAIFeatureChatStore
