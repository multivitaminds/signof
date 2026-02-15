import useAgentMemoryStore from './useAgentMemoryStore'

describe('useAgentMemoryStore', () => {
  beforeEach(() => {
    useAgentMemoryStore.setState({
      agentMemories: new Map(),
      sharedInsights: [],
    })
  })

  describe('remember', () => {
    it('stores a memory for an agent and returns an ID', () => {
      const id = useAgentMemoryStore.getState().remember('agent-1', 'Important observation', 'workflows')
      expect(id).toBeTruthy()
      const memories = useAgentMemoryStore.getState().getAgentMemories('agent-1')
      expect(memories).toHaveLength(1)
      expect(memories[0]!.content).toBe('Important observation')
      expect(memories[0]!.category).toBe('workflows')
    })

    it('uses content prefix as title when no title provided', () => {
      useAgentMemoryStore.getState().remember('agent-1', 'Short', 'preferences')
      const mem = useAgentMemoryStore.getState().getAgentMemories('agent-1')[0]!
      expect(mem.title).toBe('Short')
    })

    it('uses custom title when provided', () => {
      useAgentMemoryStore.getState().remember('agent-1', 'Content here', 'preferences', 'Custom Title')
      const mem = useAgentMemoryStore.getState().getAgentMemories('agent-1')[0]!
      expect(mem.title).toBe('Custom Title')
    })

    it('stores multiple memories for the same agent', () => {
      useAgentMemoryStore.getState().remember('agent-1', 'Memory 1', 'preferences')
      useAgentMemoryStore.getState().remember('agent-1', 'Memory 2', 'workflows')
      expect(useAgentMemoryStore.getState().getAgentMemories('agent-1')).toHaveLength(2)
    })

    it('stores memories for different agents independently', () => {
      useAgentMemoryStore.getState().remember('agent-1', 'Agent 1 memory', 'preferences')
      useAgentMemoryStore.getState().remember('agent-2', 'Agent 2 memory', 'preferences')
      expect(useAgentMemoryStore.getState().getAgentMemories('agent-1')).toHaveLength(1)
      expect(useAgentMemoryStore.getState().getAgentMemories('agent-2')).toHaveLength(1)
    })

    it('estimates token count', () => {
      const content = 'Hello world this is a test'
      useAgentMemoryStore.getState().remember('agent-1', content, 'preferences')
      const mem = useAgentMemoryStore.getState().getAgentMemories('agent-1')[0]!
      expect(mem.tokenCount).toBe(Math.ceil(content.length / 4))
    })
  })

  describe('recall (TF-IDF search)', () => {
    it('returns memories matching a query', () => {
      useAgentMemoryStore.getState().remember('agent-1', 'The weather is sunny today', 'preferences')
      useAgentMemoryStore.getState().remember('agent-1', 'Database migration completed', 'workflows')
      useAgentMemoryStore.getState().remember('agent-1', 'The weather forecast shows rain', 'preferences')

      const results = useAgentMemoryStore.getState().recall('agent-1', 'weather')
      expect(results.length).toBeGreaterThanOrEqual(2)
      expect(results[0]!.content).toContain('weather')
    })

    it('returns empty for non-matching query', () => {
      useAgentMemoryStore.getState().remember('agent-1', 'Something unrelated', 'preferences')
      const results = useAgentMemoryStore.getState().recall('agent-1', 'zzzyyyxxx')
      expect(results).toHaveLength(0)
    })

    it('respects limit parameter', () => {
      for (let i = 0; i < 5; i++) {
        useAgentMemoryStore.getState().remember('agent-1', `Weather report ${i}`, 'preferences')
      }
      const results = useAgentMemoryStore.getState().recall('agent-1', 'weather', 2)
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('includes shared insights in recall', () => {
      useAgentMemoryStore.getState().remember('agent-1', 'Weather data from agent-1', 'preferences')
      const memId = useAgentMemoryStore.getState().getAgentMemories('agent-1')[0]!.id
      useAgentMemoryStore.getState().shareInsight('agent-1', memId)

      // Agent-2 should find the shared insight
      const results = useAgentMemoryStore.getState().recall('agent-2', 'weather')
      expect(results.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('shareInsight', () => {
    it('promotes a memory to shared insights', () => {
      useAgentMemoryStore.getState().remember('agent-1', 'Shared knowledge', 'preferences')
      const memId = useAgentMemoryStore.getState().getAgentMemories('agent-1')[0]!.id
      useAgentMemoryStore.getState().shareInsight('agent-1', memId)
      expect(useAgentMemoryStore.getState().sharedInsights).toHaveLength(1)
      expect(useAgentMemoryStore.getState().sharedInsights[0]!.scope).toBe('workspace')
    })

    it('does nothing for non-existent memory', () => {
      useAgentMemoryStore.getState().shareInsight('agent-1', 'fake-id')
      expect(useAgentMemoryStore.getState().sharedInsights).toHaveLength(0)
    })
  })

  describe('getContextWindow', () => {
    it('returns memories within token budget', () => {
      useAgentMemoryStore.getState().remember('agent-1', 'Short memo', 'preferences')
      useAgentMemoryStore.getState().remember('agent-1', 'Another short memo', 'workflows')
      const context = useAgentMemoryStore.getState().getContextWindow('agent-1', 1000)
      expect(context).toContain('Short memo')
      expect(context).toContain('Another short memo')
    })

    it('stops when token budget is exceeded', () => {
      // Create a large memory
      const longContent = 'word '.repeat(200) // ~1000 chars = ~250 tokens
      useAgentMemoryStore.getState().remember('agent-1', longContent, 'preferences')
      useAgentMemoryStore.getState().remember('agent-1', 'Should not appear', 'preferences')
      const context = useAgentMemoryStore.getState().getContextWindow('agent-1', 50)
      // Budget is tiny, so should not fit both
      expect(context.split('\n').length).toBeLessThanOrEqual(1)
    })

    it('returns empty string for agent with no memories', () => {
      const context = useAgentMemoryStore.getState().getContextWindow('nobody', 1000)
      expect(context).toBe('')
    })
  })

  describe('deleteMemory', () => {
    it('removes a specific memory', () => {
      useAgentMemoryStore.getState().remember('agent-1', 'Keep this', 'preferences')
      useAgentMemoryStore.getState().remember('agent-1', 'Delete this', 'preferences')
      const memories = useAgentMemoryStore.getState().getAgentMemories('agent-1')
      const deleteId = memories[1]!.id
      useAgentMemoryStore.getState().deleteMemory('agent-1', deleteId)
      expect(useAgentMemoryStore.getState().getAgentMemories('agent-1')).toHaveLength(1)
      expect(useAgentMemoryStore.getState().getAgentMemories('agent-1')[0]!.content).toBe('Keep this')
    })
  })

  describe('clearAgentMemories', () => {
    it('clears all memories for an agent', () => {
      useAgentMemoryStore.getState().remember('agent-1', 'Memory 1', 'preferences')
      useAgentMemoryStore.getState().remember('agent-1', 'Memory 2', 'preferences')
      useAgentMemoryStore.getState().clearAgentMemories('agent-1')
      expect(useAgentMemoryStore.getState().getAgentMemories('agent-1')).toHaveLength(0)
    })

    it('does not affect other agents', () => {
      useAgentMemoryStore.getState().remember('agent-1', 'Agent 1', 'preferences')
      useAgentMemoryStore.getState().remember('agent-2', 'Agent 2', 'preferences')
      useAgentMemoryStore.getState().clearAgentMemories('agent-1')
      expect(useAgentMemoryStore.getState().getAgentMemories('agent-2')).toHaveLength(1)
    })
  })

  describe('getAgentMemories', () => {
    it('returns empty array for unknown agent', () => {
      expect(useAgentMemoryStore.getState().getAgentMemories('unknown')).toEqual([])
    })
  })
})
