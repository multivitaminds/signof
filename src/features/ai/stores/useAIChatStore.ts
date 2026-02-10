import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AIChatMessage } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const AI_RESPONSES: Record<string, string> = {
  summarize: 'Here is a summary of the current page content. The key points are the main objectives, action items, and any outstanding decisions that need to be made.',
  action: 'I identified the following action items:\n1. Review the pending documents\n2. Follow up with team members on their assignments\n3. Update the project timeline\n4. Schedule a review meeting',
  translate: 'I can help translate content. Please specify the target language and I will provide the translation.',
  explain: 'This page contains information about your current workspace. It includes project details, team member assignments, and relevant documentation. Let me know if you need clarification on any specific section.',
  help: 'I can assist you with:\n- Summarizing page content\n- Creating action items\n- Translating text\n- Explaining complex concepts\n- Answering questions about your workspace',
  default: 'I understand your request. Let me process that for you. Based on the context of your current workspace, here is my response. Please let me know if you need anything else.',
}

function getAIResponse(content: string): string {
  const lower = content.toLowerCase()
  if (lower.includes('summarize') || lower.includes('summary')) return AI_RESPONSES.summarize!
  if (lower.includes('action') || lower.includes('todo') || lower.includes('items')) return AI_RESPONSES.action!
  if (lower.includes('translate') || lower.includes('translation')) return AI_RESPONSES.translate!
  if (lower.includes('explain') || lower.includes('what')) return AI_RESPONSES.explain!
  if (lower.includes('help') || lower.includes('can you')) return AI_RESPONSES.help!
  return AI_RESPONSES.default!
}

export interface AIChatState {
  messages: AIChatMessage[]
  isOpen: boolean
  contextLabel: string

  sendMessage: (content: string) => void
  toggleOpen: () => void
  setOpen: (open: boolean) => void
  setContextLabel: (label: string) => void
  clearMessages: () => void
}

const useAIChatStore = create<AIChatState>()(
  persist(
    (set, _get) => ({
      messages: [],
      isOpen: false,
      contextLabel: 'Home',

      sendMessage: (content) => {
        const userMsg: AIChatMessage = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        }

        set(state => ({
          messages: [...state.messages, userMsg],
        }))

        // Simulate AI response after a short delay
        const delay = 300 + Math.random() * 700
        setTimeout(() => {
          const aiContent = getAIResponse(content)
          const aiMsg: AIChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: aiContent,
            timestamp: new Date().toISOString(),
          }
          set(state => ({
            messages: [...state.messages, aiMsg],
          }))
        }, delay)
      },

      toggleOpen: () => {
        set(state => ({ isOpen: !state.isOpen }))
      },

      setOpen: (open) => {
        set({ isOpen: open })
      },

      setContextLabel: (label) => {
        set({ contextLabel: label })
      },

      clearMessages: () => {
        set({ messages: [] })
      },
    }),
    {
      name: 'signof-ai-chat',
      partialize: (state) => ({
        messages: state.messages,
        contextLabel: state.contextLabel,
      }),
    }
  )
)

export default useAIChatStore
