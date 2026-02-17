import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AIChatMessage } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Route-based context hints ─────────────────────────────────────────

const ROUTE_CONTEXT_HINTS: Record<string, string> = {
  '/pages': 'I can help with this page. Try: summarize, expand, simplify, translate',
  '/projects': 'I can help with this project. Try: suggest priorities, find blockers, estimate',
  '/data': 'I can help with this database. Try: analyze trends, suggest fields, generate report',
  '/calendar': 'I can help with scheduling. Try: find free time, suggest meeting times',
}

export function getContextHintForRoute(pathname: string): string | null {
  for (const [prefix, hint] of Object.entries(ROUTE_CONTEXT_HINTS)) {
    if (pathname.startsWith(prefix)) return hint
  }
  return null
}

// ─── Slash command responses ───────────────────────────────────────────

const SLASH_COMMAND_RESPONSES: Record<string, (args: string, context: string) => string> = {
  '/summarize': (_args, context) =>
    `Here is a summary of your ${context} content:\n\n` +
    '- Key objectives and goals are clearly defined\n' +
    '- 3 action items require attention\n' +
    '- 2 decisions are pending team review\n' +
    '- Timeline is on track for the current milestone',
  '/translate': (args, context) => {
    const lang = args.trim() || 'Spanish'
    return `Translation to ${lang} for your ${context} content:\n\n[Translated content would appear here. Copilot would process the selected text and provide a ${lang} translation.]`
  },
  '/simplify': (_args, context) =>
    `Here is a simplified version of your ${context} content:\n\n` +
    'The content has been rewritten in plain language. Complex terms have been replaced with simpler alternatives, and long sentences have been broken into shorter ones for easier reading.',
  '/expand': (_args, context) =>
    `Here is an expanded version of your ${context} content:\n\n` +
    'Additional context and examples have been added. Key points have been elaborated with supporting details, relevant statistics, and practical implications to provide a more comprehensive overview.',
  '/action-items': (_args, context) =>
    `Action items extracted from your ${context}:\n\n` +
    '1. Review and approve the pending changes (High priority)\n' +
    '2. Schedule follow-up meeting with stakeholders (Medium priority)\n' +
    '3. Update documentation with latest decisions (Medium priority)\n' +
    '4. Send status update to the team (Low priority)\n' +
    '5. Prepare materials for next review cycle (Low priority)',
}

export function isSlashCommand(content: string): boolean {
  return content.startsWith('/')
}

function getSlashCommandResponse(content: string, contextLabel: string): string | null {
  const parts = content.split(' ')
  const cmd = parts[0]!.toLowerCase()
  const args = parts.slice(1).join(' ')

  const handler = SLASH_COMMAND_RESPONSES[cmd]
  if (handler) return handler(args, contextLabel)
  return null
}

// ─── Standard AI responses ─────────────────────────────────────────────

const AI_RESPONSES: Record<string, string> = {
  summarize: 'Here is a summary of the current page content. The key points are the main objectives, action items, and any outstanding decisions that need to be made.',
  action: 'I identified the following action items:\n1. Review the pending documents\n2. Follow up with team members on their assignments\n3. Update the project timeline\n4. Schedule a review meeting',
  translate: 'I can help translate content. Please specify the target language and I will provide the translation.',
  explain: 'This page contains information about your current workspace. It includes project details, team member assignments, and relevant documentation. Let me know if you need clarification on any specific section.',
  help: 'I can assist you with:\n- Summarizing page content\n- Creating action items\n- Translating text\n- Explaining complex concepts\n- Answering questions about your workspace\n\nYou can also use slash commands:\n/summarize, /translate [lang], /simplify, /expand, /action-items',
  priorities: 'Based on the current project state, I suggest these priorities:\n1. Complete overdue tasks (3 items)\n2. Review blocked issues and unblock the team\n3. Address code review requests\n4. Plan for the upcoming sprint',
  blockers: 'I found the following potential blockers:\n- 2 tasks are waiting on external dependencies\n- 1 design review is pending approval\n- API integration testing needs environment setup',
  trends: 'Data analysis shows:\n- 15% increase in completed tasks this week\n- Response time improved by 20%\n- 3 fields have inconsistent data patterns that may need cleanup',
  freetime: 'Looking at your schedule, I found these available slots:\n- Tomorrow 2:00 PM - 3:30 PM\n- Wednesday 10:00 AM - 11:00 AM\n- Thursday 4:00 PM - 5:00 PM',
  default: 'I understand your request. Let me process that for you. Based on the context of your current workspace, here is my response. Please let me know if you need anything else.',
}

function getAIResponse(content: string, contextLabel: string): string {
  // Check slash commands first
  if (isSlashCommand(content)) {
    const response = getSlashCommandResponse(content, contextLabel)
    if (response) return response
    return `Unknown command: ${content.split(' ')[0]}. Available commands: /summarize, /translate [lang], /simplify, /expand, /action-items`
  }

  const lower = content.toLowerCase()
  if (lower.includes('summarize') || lower.includes('summary')) return AI_RESPONSES.summarize!
  if (lower.includes('action') || lower.includes('todo') || lower.includes('items')) return AI_RESPONSES.action!
  if (lower.includes('translate') || lower.includes('translation')) return AI_RESPONSES.translate!
  if (lower.includes('explain') || lower.includes('what')) return AI_RESPONSES.explain!
  if (lower.includes('help') || lower.includes('can you')) return AI_RESPONSES.help!
  if (lower.includes('priorit') || lower.includes('suggest')) return AI_RESPONSES.priorities!
  if (lower.includes('blocker') || lower.includes('blocked')) return AI_RESPONSES.blockers!
  if (lower.includes('trend') || lower.includes('analy')) return AI_RESPONSES.trends!
  if (lower.includes('free') || lower.includes('available') || lower.includes('meeting time')) return AI_RESPONSES.freetime!
  return AI_RESPONSES.default!
}

// ─── Available slash commands for display ───────────────────────────────

export const AVAILABLE_SLASH_COMMANDS = [
  { command: '/summarize', description: 'Summarize current content' },
  { command: '/translate', description: 'Translate to a language' },
  { command: '/simplify', description: 'Simplify content' },
  { command: '/expand', description: 'Expand content with details' },
  { command: '/action-items', description: 'Extract action items' },
] as const

// ─── Store ─────────────────────────────────────────────────────────────

export interface AIChatState {
  messages: AIChatMessage[]
  isOpen: boolean
  contextLabel: string
  currentRoute: string
  isTyping: boolean

  sendMessage: (content: string) => void
  toggleOpen: () => void
  setOpen: (open: boolean) => void
  setContextLabel: (label: string) => void
  setCurrentRoute: (route: string) => void
  clearMessages: () => void
}

const useAIChatStore = create<AIChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isOpen: false,
      contextLabel: 'Home',
      currentRoute: '/',
      isTyping: false,

      sendMessage: (content) => {
        const userMsg: AIChatMessage = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        }

        set(state => ({
          messages: [...state.messages, userMsg],
          isTyping: true,
        }))

        // Simulate typing delay (500-1500ms)
        const delay = 500 + Math.random() * 1000
        setTimeout(() => {
          const { contextLabel } = get()
          const aiContent = getAIResponse(content, contextLabel)
          const aiMsg: AIChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: aiContent,
            timestamp: new Date().toISOString(),
          }
          set(state => ({
            messages: [...state.messages, aiMsg],
            isTyping: false,
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

      setCurrentRoute: (route) => {
        set({ currentRoute: route })
      },

      clearMessages: () => {
        set({ messages: [], isTyping: false })
      },
    }),
    {
      name: 'orchestree-ai-chat',
      partialize: (state) => ({
        messages: state.messages,
        contextLabel: state.contextLabel,
      }),
      merge: (persisted, current) => {
        const safe = persisted as Record<string, unknown> | null
        return {
          ...current,
          ...(safe?.messages ? { messages: safe.messages as AIChatMessage[] } : {}),
          ...(safe?.contextLabel ? { contextLabel: safe.contextLabel as string } : {}),
        }
      },
    }
  )
)

export default useAIChatStore
