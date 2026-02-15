import { create } from 'zustand'
import { MessagePriority } from '../types'
import type { AgentMessage } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const DEFAULT_TOPICS = [
  'system.alerts',
  'domain.finance',
  'domain.health',
  'domain.work',
  'coordination.handoff',
  'healing.report',
] as const

export interface MessageBusState {
  topics: Map<string, string[]>
  messages: AgentMessage[]
  unacknowledged: Map<string, AgentMessage[]>

  subscribe: (agentId: string, topic: string) => void
  unsubscribe: (agentId: string, topic: string) => void
  publish: (fromAgentId: string, topic: string, content: string, priority?: MessagePriority) => void
  directMessage: (fromId: string, toId: string, content: string, priority?: MessagePriority) => void
  acknowledge: (agentId: string, messageId: string) => void
  getUnread: (agentId: string) => AgentMessage[]
  getTopics: () => string[]
  getSubscribers: (topic: string) => string[]
  getMessagesByTopic: (topic: string) => AgentMessage[]
}

const useMessageBusStore = create<MessageBusState>()((set, get) => {
  const initialTopics = new Map<string, string[]>()
  for (const topic of DEFAULT_TOPICS) {
    initialTopics.set(topic, [])
  }

  return {
    topics: initialTopics,
    messages: [],
    unacknowledged: new Map(),

    subscribe: (agentId, topic) => {
      set((state) => {
        const next = new Map(state.topics)
        const subscribers = next.get(topic) ?? []
        if (!subscribers.includes(agentId)) {
          next.set(topic, [...subscribers, agentId])
        }
        return { topics: next }
      })
    },

    unsubscribe: (agentId, topic) => {
      set((state) => {
        const next = new Map(state.topics)
        const subscribers = next.get(topic) ?? []
        next.set(topic, subscribers.filter((id) => id !== agentId))
        return { topics: next }
      })
    },

    publish: (fromAgentId, topic, content, priority = MessagePriority.Normal) => {
      const message: AgentMessage = {
        id: generateId(),
        fromAgentId,
        toAgentId: null,
        topic,
        content,
        priority,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      }

      const subscribers = get().topics.get(topic) ?? []

      set((state) => {
        const nextUnack = new Map(state.unacknowledged)
        for (const subId of subscribers) {
          if (subId !== fromAgentId) {
            const existing = nextUnack.get(subId) ?? []
            nextUnack.set(subId, [...existing, message])
          }
        }
        return {
          messages: [...state.messages, message],
          unacknowledged: nextUnack,
        }
      })
    },

    directMessage: (fromId, toId, content, priority = MessagePriority.Normal) => {
      const message: AgentMessage = {
        id: generateId(),
        fromAgentId: fromId,
        toAgentId: toId,
        topic: 'direct',
        content,
        priority,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      }

      set((state) => {
        const nextUnack = new Map(state.unacknowledged)
        const existing = nextUnack.get(toId) ?? []
        nextUnack.set(toId, [...existing, message])
        return {
          messages: [...state.messages, message],
          unacknowledged: nextUnack,
        }
      })
    },

    acknowledge: (agentId, messageId) => {
      set((state) => {
        const nextUnack = new Map(state.unacknowledged)
        const agentMessages = nextUnack.get(agentId) ?? []
        nextUnack.set(agentId, agentMessages.filter((m) => m.id !== messageId))
        return {
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, acknowledged: true } : m,
          ),
          unacknowledged: nextUnack,
        }
      })
    },

    getUnread: (agentId) => {
      return get().unacknowledged.get(agentId) ?? []
    },

    getTopics: () => {
      return Array.from(get().topics.keys())
    },

    getSubscribers: (topic) => {
      return get().topics.get(topic) ?? []
    },

    getMessagesByTopic: (topic) => {
      return get().messages.filter((m) => m.topic === topic)
    },
  }
})

export default useMessageBusStore
