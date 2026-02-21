import useAIFeatureChatStore from './useAIFeatureChatStore'

describe('useAIFeatureChatStore', () => {
  beforeEach(() => {
    // Reset all sessions to empty
    useAIFeatureChatStore.setState({
      sessions: {
        home: { messages: [], isOpen: false },
        workspace: { messages: [], isOpen: false },
        projects: { messages: [], isOpen: false },
        documents: { messages: [], isOpen: false },
        scheduling: { messages: [], isOpen: false },
        databases: { messages: [], isOpen: false },
        inbox: { messages: [], isOpen: false },
        chorus: { messages: [], isOpen: false },
      },
    })
  })

  describe('initial state', () => {
    it('has sessions for all feature keys', () => {
      const { sessions } = useAIFeatureChatStore.getState()
      expect(Object.keys(sessions)).toHaveLength(8)
      expect(sessions.home.messages).toEqual([])
      expect(sessions.home.isOpen).toBe(false)
    })
  })

  describe('openChat', () => {
    it('opens a session and adds greeting message', () => {
      useAIFeatureChatStore.getState().openChat('home')
      const session = useAIFeatureChatStore.getState().sessions.home
      expect(session.isOpen).toBe(true)
      expect(session.messages).toHaveLength(1)
      expect(session.messages[0]!.role).toBe('assistant')
      expect(session.messages[0]!.content.length).toBeGreaterThan(0)
    })

    it('does not add duplicate greeting on re-open', () => {
      useAIFeatureChatStore.getState().openChat('workspace')
      useAIFeatureChatStore.getState().closeChat('workspace')
      useAIFeatureChatStore.getState().openChat('workspace')
      const session = useAIFeatureChatStore.getState().sessions.workspace
      expect(session.messages).toHaveLength(1) // still just the greeting
    })

    it('opens independent sessions per feature', () => {
      useAIFeatureChatStore.getState().openChat('home')
      useAIFeatureChatStore.getState().openChat('projects')
      expect(useAIFeatureChatStore.getState().sessions.home.isOpen).toBe(true)
      expect(useAIFeatureChatStore.getState().sessions.projects.isOpen).toBe(true)
      expect(useAIFeatureChatStore.getState().sessions.documents.isOpen).toBe(false)
    })
  })

  describe('closeChat', () => {
    it('closes a session but preserves messages', () => {
      useAIFeatureChatStore.getState().openChat('home')
      useAIFeatureChatStore.getState().addMessage('home', 'user', 'Hello')
      useAIFeatureChatStore.getState().closeChat('home')

      const session = useAIFeatureChatStore.getState().sessions.home
      expect(session.isOpen).toBe(false)
      expect(session.messages.length).toBeGreaterThan(0)
    })
  })

  describe('addMessage', () => {
    it('adds a user message', () => {
      useAIFeatureChatStore.getState().addMessage('home', 'user', 'Help me out')
      const msgs = useAIFeatureChatStore.getState().sessions.home.messages
      expect(msgs).toHaveLength(1)
      expect(msgs[0]!.role).toBe('user')
      expect(msgs[0]!.content).toBe('Help me out')
      expect(msgs[0]!.id).toBeTruthy()
      expect(msgs[0]!.timestamp).toBeTruthy()
    })

    it('adds an assistant message with tool results', () => {
      useAIFeatureChatStore.getState().addMessage(
        'projects',
        'assistant',
        'Here are results',
        [{ toolName: 'search', input: { query: 'test' }, result: 'found 3 items' }]
      )
      const msg = useAIFeatureChatStore.getState().sessions.projects.messages[0]!
      expect(msg.role).toBe('assistant')
      expect(msg.toolResults).toHaveLength(1)
      expect(msg.toolResults![0]!.toolName).toBe('search')
    })

    it('appends to existing messages', () => {
      useAIFeatureChatStore.getState().addMessage('home', 'user', 'First')
      useAIFeatureChatStore.getState().addMessage('home', 'assistant', 'Response')
      useAIFeatureChatStore.getState().addMessage('home', 'user', 'Second')
      expect(useAIFeatureChatStore.getState().sessions.home.messages).toHaveLength(3)
    })

    it('does not affect other feature sessions', () => {
      useAIFeatureChatStore.getState().addMessage('home', 'user', 'Hello')
      expect(useAIFeatureChatStore.getState().sessions.workspace.messages).toHaveLength(0)
    })
  })

  describe('clearMessages', () => {
    it('clears messages for a specific feature', () => {
      useAIFeatureChatStore.getState().addMessage('home', 'user', 'Test')
      useAIFeatureChatStore.getState().addMessage('home', 'assistant', 'Reply')
      useAIFeatureChatStore.getState().clearMessages('home')
      expect(useAIFeatureChatStore.getState().sessions.home.messages).toHaveLength(0)
    })

    it('does not affect other sessions', () => {
      useAIFeatureChatStore.getState().addMessage('home', 'user', 'Hello')
      useAIFeatureChatStore.getState().addMessage('workspace', 'user', 'World')
      useAIFeatureChatStore.getState().clearMessages('home')
      expect(useAIFeatureChatStore.getState().sessions.workspace.messages).toHaveLength(1)
    })
  })
})
