import { describe, it, expect, beforeEach, vi } from 'vitest'
import useStudioStore from './useStudioStore'
import { ModelId } from '../types'

function resetStore() {
  useStudioStore.setState({
    conversations: [],
    activeConversationId: null,
    isTyping: false,
    searchQuery: '',
    settingsPanelOpen: false,
  })
}

describe('useStudioStore', () => {
  beforeEach(() => {
    resetStore()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('createConversation', () => {
    it('creates a new conversation and sets it as active', () => {
      useStudioStore.getState().createConversation()
      const state = useStudioStore.getState()

      expect(state.conversations).toHaveLength(1)
      expect(state.activeConversationId).toBe(state.conversations[0]!.id)
      expect(state.conversations[0]!.title).toBe('New Chat')
      expect(state.conversations[0]!.modelId).toBe(ModelId.ClaudeSonnet)
      expect(state.conversations[0]!.messages).toHaveLength(0)
    })

    it('prepends new conversations to the list', () => {
      useStudioStore.getState().createConversation()
      const firstId = useStudioStore.getState().conversations[0]!.id

      useStudioStore.getState().createConversation()
      const state = useStudioStore.getState()

      expect(state.conversations).toHaveLength(2)
      expect(state.conversations[0]!.id).not.toBe(firstId)
      expect(state.conversations[1]!.id).toBe(firstId)
    })

    it('enforces max 50 conversations', () => {
      for (let i = 0; i < 55; i++) {
        useStudioStore.getState().createConversation()
      }
      expect(useStudioStore.getState().conversations).toHaveLength(50)
    })
  })

  describe('deleteConversation', () => {
    it('removes a conversation by id', () => {
      useStudioStore.getState().createConversation()
      const id = useStudioStore.getState().conversations[0]!.id

      useStudioStore.getState().deleteConversation(id)
      expect(useStudioStore.getState().conversations).toHaveLength(0)
    })

    it('sets next conversation as active when deleting active', () => {
      useStudioStore.getState().createConversation()
      useStudioStore.getState().createConversation()
      const state = useStudioStore.getState()
      const activeId = state.activeConversationId!
      const otherId = state.conversations.find((c) => c.id !== activeId)!.id

      useStudioStore.getState().deleteConversation(activeId)
      expect(useStudioStore.getState().activeConversationId).toBe(otherId)
    })

    it('sets activeConversationId to null when deleting last', () => {
      useStudioStore.getState().createConversation()
      const id = useStudioStore.getState().conversations[0]!.id

      useStudioStore.getState().deleteConversation(id)
      expect(useStudioStore.getState().activeConversationId).toBeNull()
    })
  })

  describe('renameConversation', () => {
    it('updates the conversation title', () => {
      useStudioStore.getState().createConversation()
      const id = useStudioStore.getState().conversations[0]!.id

      useStudioStore.getState().renameConversation(id, 'My Custom Title')
      expect(useStudioStore.getState().conversations[0]!.title).toBe('My Custom Title')
    })
  })

  describe('setActiveConversation', () => {
    it('changes the active conversation', () => {
      useStudioStore.getState().createConversation()
      useStudioStore.getState().createConversation()
      const secondId = useStudioStore.getState().conversations[1]!.id

      useStudioStore.getState().setActiveConversation(secondId)
      expect(useStudioStore.getState().activeConversationId).toBe(secondId)
    })
  })

  describe('sendMessage', () => {
    it('adds a user message and sets typing', () => {
      useStudioStore.getState().createConversation()
      useStudioStore.getState().sendMessage('Hello!')

      const state = useStudioStore.getState()
      const convo = state.conversations.find((c) => c.id === state.activeConversationId)!
      expect(convo.messages).toHaveLength(1)
      expect(convo.messages[0]!.role).toBe('user')
      expect(convo.messages[0]!.content).toBe('Hello!')
      expect(state.isTyping).toBe(true)
    })

    it('auto-titles from first message', () => {
      useStudioStore.getState().createConversation()
      useStudioStore.getState().sendMessage('What is the meaning of life?')

      const state = useStudioStore.getState()
      const convo = state.conversations.find((c) => c.id === state.activeConversationId)!
      expect(convo.title).toBe('What is the meaning of life?')
    })

    it('does nothing if no active conversation', () => {
      useStudioStore.getState().sendMessage('Hello!')
      expect(useStudioStore.getState().isTyping).toBe(false)
    })
  })

  describe('clearMessages', () => {
    it('empties messages for active conversation', () => {
      useStudioStore.getState().createConversation()
      useStudioStore.getState().sendMessage('Hello!')
      useStudioStore.getState().clearMessages()

      const state = useStudioStore.getState()
      const convo = state.conversations.find((c) => c.id === state.activeConversationId)!
      expect(convo.messages).toHaveLength(0)
      expect(convo.totalTokens).toBe(0)
    })
  })

  describe('setModel', () => {
    it('changes the model for active conversation', () => {
      useStudioStore.getState().createConversation()
      useStudioStore.getState().setModel(ModelId.Gpt4o)

      const state = useStudioStore.getState()
      const convo = state.conversations.find((c) => c.id === state.activeConversationId)!
      expect(convo.modelId).toBe(ModelId.Gpt4o)
    })
  })

  describe('updateSettings', () => {
    it('merges partial settings', () => {
      useStudioStore.getState().createConversation()
      useStudioStore.getState().updateSettings({ temperature: 1.5, agentMode: true })

      const state = useStudioStore.getState()
      const convo = state.conversations.find((c) => c.id === state.activeConversationId)!
      expect(convo.settings.temperature).toBe(1.5)
      expect(convo.settings.agentMode).toBe(true)
      // Unchanged settings preserved
      expect(convo.settings.maxTokens).toBe(4096)
      expect(convo.settings.topP).toBe(1)
    })
  })

  describe('toggleSettingsPanel', () => {
    it('toggles the settings panel open/closed', () => {
      expect(useStudioStore.getState().settingsPanelOpen).toBe(false)
      useStudioStore.getState().toggleSettingsPanel()
      expect(useStudioStore.getState().settingsPanelOpen).toBe(true)
      useStudioStore.getState().toggleSettingsPanel()
      expect(useStudioStore.getState().settingsPanelOpen).toBe(false)
    })
  })

  describe('setSearchQuery', () => {
    it('updates the search query', () => {
      useStudioStore.getState().setSearchQuery('hello')
      expect(useStudioStore.getState().searchQuery).toBe('hello')
    })
  })

  describe('exportConversation', () => {
    it('exports conversation as JSON string', () => {
      useStudioStore.getState().createConversation()
      const id = useStudioStore.getState().conversations[0]!.id
      useStudioStore.getState().sendMessage('Test')

      const exported = useStudioStore.getState().exportConversation(id)
      const parsed = JSON.parse(exported)
      expect(parsed.title).toBeTruthy()
      expect(parsed.model).toBe('Claude Sonnet')
      expect(parsed.messages).toHaveLength(1)
    })

    it('returns empty object for missing conversation', () => {
      expect(useStudioStore.getState().exportConversation('nonexistent')).toBe('{}')
    })
  })
})
