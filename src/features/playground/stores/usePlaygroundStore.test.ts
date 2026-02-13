import { describe, it, expect, beforeEach, vi } from 'vitest'
import usePlaygroundStore from './usePlaygroundStore'
import { ModelId } from '../types'

function resetStore() {
  usePlaygroundStore.setState({
    conversations: [],
    activeConversationId: null,
    isTyping: false,
    searchQuery: '',
    settingsPanelOpen: false,
  })
}

describe('usePlaygroundStore', () => {
  beforeEach(() => {
    resetStore()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('createConversation', () => {
    it('creates a new conversation and sets it as active', () => {
      usePlaygroundStore.getState().createConversation()
      const state = usePlaygroundStore.getState()

      expect(state.conversations).toHaveLength(1)
      expect(state.activeConversationId).toBe(state.conversations[0]!.id)
      expect(state.conversations[0]!.title).toBe('New Chat')
      expect(state.conversations[0]!.modelId).toBe(ModelId.ClaudeSonnet)
      expect(state.conversations[0]!.messages).toHaveLength(0)
    })

    it('prepends new conversations to the list', () => {
      usePlaygroundStore.getState().createConversation()
      const firstId = usePlaygroundStore.getState().conversations[0]!.id

      usePlaygroundStore.getState().createConversation()
      const state = usePlaygroundStore.getState()

      expect(state.conversations).toHaveLength(2)
      expect(state.conversations[0]!.id).not.toBe(firstId)
      expect(state.conversations[1]!.id).toBe(firstId)
    })

    it('enforces max 50 conversations', () => {
      for (let i = 0; i < 55; i++) {
        usePlaygroundStore.getState().createConversation()
      }
      expect(usePlaygroundStore.getState().conversations).toHaveLength(50)
    })
  })

  describe('deleteConversation', () => {
    it('removes a conversation by id', () => {
      usePlaygroundStore.getState().createConversation()
      const id = usePlaygroundStore.getState().conversations[0]!.id

      usePlaygroundStore.getState().deleteConversation(id)
      expect(usePlaygroundStore.getState().conversations).toHaveLength(0)
    })

    it('sets next conversation as active when deleting active', () => {
      usePlaygroundStore.getState().createConversation()
      usePlaygroundStore.getState().createConversation()
      const state = usePlaygroundStore.getState()
      const activeId = state.activeConversationId!
      const otherId = state.conversations.find((c) => c.id !== activeId)!.id

      usePlaygroundStore.getState().deleteConversation(activeId)
      expect(usePlaygroundStore.getState().activeConversationId).toBe(otherId)
    })

    it('sets activeConversationId to null when deleting last', () => {
      usePlaygroundStore.getState().createConversation()
      const id = usePlaygroundStore.getState().conversations[0]!.id

      usePlaygroundStore.getState().deleteConversation(id)
      expect(usePlaygroundStore.getState().activeConversationId).toBeNull()
    })
  })

  describe('renameConversation', () => {
    it('updates the conversation title', () => {
      usePlaygroundStore.getState().createConversation()
      const id = usePlaygroundStore.getState().conversations[0]!.id

      usePlaygroundStore.getState().renameConversation(id, 'My Custom Title')
      expect(usePlaygroundStore.getState().conversations[0]!.title).toBe('My Custom Title')
    })
  })

  describe('setActiveConversation', () => {
    it('changes the active conversation', () => {
      usePlaygroundStore.getState().createConversation()
      usePlaygroundStore.getState().createConversation()
      const secondId = usePlaygroundStore.getState().conversations[1]!.id

      usePlaygroundStore.getState().setActiveConversation(secondId)
      expect(usePlaygroundStore.getState().activeConversationId).toBe(secondId)
    })
  })

  describe('sendMessage', () => {
    it('adds a user message and sets typing', () => {
      usePlaygroundStore.getState().createConversation()
      usePlaygroundStore.getState().sendMessage('Hello!')

      const state = usePlaygroundStore.getState()
      const convo = state.conversations.find((c) => c.id === state.activeConversationId)!
      expect(convo.messages).toHaveLength(1)
      expect(convo.messages[0]!.role).toBe('user')
      expect(convo.messages[0]!.content).toBe('Hello!')
      expect(state.isTyping).toBe(true)
    })

    it('auto-titles from first message', () => {
      usePlaygroundStore.getState().createConversation()
      usePlaygroundStore.getState().sendMessage('What is the meaning of life?')

      const state = usePlaygroundStore.getState()
      const convo = state.conversations.find((c) => c.id === state.activeConversationId)!
      expect(convo.title).toBe('What is the meaning of life?')
    })

    it('does nothing if no active conversation', () => {
      usePlaygroundStore.getState().sendMessage('Hello!')
      expect(usePlaygroundStore.getState().isTyping).toBe(false)
    })
  })

  describe('clearMessages', () => {
    it('empties messages for active conversation', () => {
      usePlaygroundStore.getState().createConversation()
      usePlaygroundStore.getState().sendMessage('Hello!')
      usePlaygroundStore.getState().clearMessages()

      const state = usePlaygroundStore.getState()
      const convo = state.conversations.find((c) => c.id === state.activeConversationId)!
      expect(convo.messages).toHaveLength(0)
      expect(convo.totalTokens).toBe(0)
    })
  })

  describe('setModel', () => {
    it('changes the model for active conversation', () => {
      usePlaygroundStore.getState().createConversation()
      usePlaygroundStore.getState().setModel(ModelId.Gpt4o)

      const state = usePlaygroundStore.getState()
      const convo = state.conversations.find((c) => c.id === state.activeConversationId)!
      expect(convo.modelId).toBe(ModelId.Gpt4o)
    })
  })

  describe('updateSettings', () => {
    it('merges partial settings', () => {
      usePlaygroundStore.getState().createConversation()
      usePlaygroundStore.getState().updateSettings({ temperature: 1.5, agentMode: true })

      const state = usePlaygroundStore.getState()
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
      expect(usePlaygroundStore.getState().settingsPanelOpen).toBe(false)
      usePlaygroundStore.getState().toggleSettingsPanel()
      expect(usePlaygroundStore.getState().settingsPanelOpen).toBe(true)
      usePlaygroundStore.getState().toggleSettingsPanel()
      expect(usePlaygroundStore.getState().settingsPanelOpen).toBe(false)
    })
  })

  describe('setSearchQuery', () => {
    it('updates the search query', () => {
      usePlaygroundStore.getState().setSearchQuery('hello')
      expect(usePlaygroundStore.getState().searchQuery).toBe('hello')
    })
  })

  describe('exportConversation', () => {
    it('exports conversation as JSON string', () => {
      usePlaygroundStore.getState().createConversation()
      const id = usePlaygroundStore.getState().conversations[0]!.id
      usePlaygroundStore.getState().sendMessage('Test')

      const exported = usePlaygroundStore.getState().exportConversation(id)
      const parsed = JSON.parse(exported)
      expect(parsed.title).toBeTruthy()
      expect(parsed.model).toBe('Claude Sonnet')
      expect(parsed.messages).toHaveLength(1)
    })

    it('returns empty object for missing conversation', () => {
      expect(usePlaygroundStore.getState().exportConversation('nonexistent')).toBe('{}')
    })
  })
})
