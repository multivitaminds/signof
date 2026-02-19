import { act } from '@testing-library/react'
import useAIChatStore from './useAIChatStore'

// ─── Mock llmClient (LLM unavailable in tests) ──────────────────────

vi.mock('../lib/llmClient', () => ({
  isLLMAvailable: () => false,
  syncChat: vi.fn(),
}))

describe('useAIChatStore', () => {
  beforeEach(() => {
    useAIChatStore.setState({
      messages: [],
      isOpen: false,
      contextLabel: 'Home',
    })
    vi.clearAllMocks()
  })

  it('starts with empty messages and closed', () => {
    const state = useAIChatStore.getState()
    expect(state.messages).toEqual([])
    expect(state.isOpen).toBe(false)
    expect(state.contextLabel).toBe('Home')
  })

  describe('sendMessage', () => {
    it('adds a user message immediately', () => {
      useAIChatStore.getState().sendMessage('Hello AI')

      const { messages } = useAIChatStore.getState()
      expect(messages).toHaveLength(1)
      expect(messages[0]!.role).toBe('user')
      expect(messages[0]!.content).toBe('Hello AI')
      expect(messages[0]!.timestamp).toBeTruthy()
    })

    it('adds an AI response after a delay', async () => {
      vi.useFakeTimers()

      useAIChatStore.getState().sendMessage('Help me summarize')

      // User message added immediately
      expect(useAIChatStore.getState().messages).toHaveLength(1)

      // Fast-forward past max delay
      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      const { messages } = useAIChatStore.getState()
      expect(messages).toHaveLength(2)
      expect(messages[1]!.role).toBe('assistant')
      expect(messages[1]!.content.length).toBeGreaterThan(0)

      vi.useRealTimers()
    })

    it('responds with keyword-matched content for summarize', async () => {
      vi.useFakeTimers()

      useAIChatStore.getState().sendMessage('Please summarize this page')

      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      const { messages } = useAIChatStore.getState()
      expect(messages[1]!.content).toContain('summary')

      vi.useRealTimers()
    })
  })

  describe('toggleOpen', () => {
    it('toggles the sidebar open state', () => {
      expect(useAIChatStore.getState().isOpen).toBe(false)

      useAIChatStore.getState().toggleOpen()
      expect(useAIChatStore.getState().isOpen).toBe(true)

      useAIChatStore.getState().toggleOpen()
      expect(useAIChatStore.getState().isOpen).toBe(false)
    })
  })

  describe('setOpen', () => {
    it('sets the sidebar open state explicitly', () => {
      useAIChatStore.getState().setOpen(true)
      expect(useAIChatStore.getState().isOpen).toBe(true)

      useAIChatStore.getState().setOpen(false)
      expect(useAIChatStore.getState().isOpen).toBe(false)
    })
  })

  describe('setContextLabel', () => {
    it('updates the context label', () => {
      useAIChatStore.getState().setContextLabel('Documents')
      expect(useAIChatStore.getState().contextLabel).toBe('Documents')
    })
  })

  describe('clearMessages', () => {
    it('removes all messages', () => {
      useAIChatStore.getState().sendMessage('message 1')
      useAIChatStore.getState().sendMessage('message 2')

      expect(useAIChatStore.getState().messages.length).toBeGreaterThan(0)

      useAIChatStore.getState().clearMessages()
      expect(useAIChatStore.getState().messages).toEqual([])
    })
  })
})
