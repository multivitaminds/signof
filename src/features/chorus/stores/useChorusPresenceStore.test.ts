import { useChorusPresenceStore } from './useChorusPresenceStore'

function resetStore() {
  useChorusPresenceStore.setState({ typingUsers: [] })
}

describe('useChorusPresenceStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('startTyping', () => {
    it('should add a typing user', () => {
      useChorusPresenceStore.getState().startTyping('user-1', 'Alice', 'ch-1')

      const typing = useChorusPresenceStore.getState().typingUsers
      expect(typing).toHaveLength(1)
      expect(typing[0]!.userId).toBe('user-1')
      expect(typing[0]!.userName).toBe('Alice')
      expect(typing[0]!.conversationId).toBe('ch-1')
    })

    it('should update timestamp if user already typing in same conversation', () => {
      useChorusPresenceStore.getState().startTyping('user-1', 'Alice', 'ch-1')
      const firstTimestamp = useChorusPresenceStore.getState().typingUsers[0]!.startedAt

      useChorusPresenceStore.getState().startTyping('user-1', 'Alice', 'ch-1')

      const typing = useChorusPresenceStore.getState().typingUsers
      expect(typing).toHaveLength(1)
      expect(typing[0]!.startedAt).toBeGreaterThanOrEqual(firstTimestamp)
    })

    it('should allow same user to type in different conversations', () => {
      useChorusPresenceStore.getState().startTyping('user-1', 'Alice', 'ch-1')
      useChorusPresenceStore.getState().startTyping('user-1', 'Alice', 'ch-2')

      expect(useChorusPresenceStore.getState().typingUsers).toHaveLength(2)
    })
  })

  describe('stopTyping', () => {
    it('should remove typing user from conversation', () => {
      useChorusPresenceStore.getState().startTyping('user-1', 'Alice', 'ch-1')
      useChorusPresenceStore.getState().startTyping('user-2', 'Bob', 'ch-1')

      useChorusPresenceStore.getState().stopTyping('user-1', 'ch-1')

      const typing = useChorusPresenceStore.getState().typingUsers
      expect(typing).toHaveLength(1)
      expect(typing[0]!.userId).toBe('user-2')
    })

    it('should not affect other conversations', () => {
      useChorusPresenceStore.getState().startTyping('user-1', 'Alice', 'ch-1')
      useChorusPresenceStore.getState().startTyping('user-1', 'Alice', 'ch-2')

      useChorusPresenceStore.getState().stopTyping('user-1', 'ch-1')

      const typing = useChorusPresenceStore.getState().typingUsers
      expect(typing).toHaveLength(1)
      expect(typing[0]!.conversationId).toBe('ch-2')
    })
  })

  describe('getTypingUsersForConversation', () => {
    it('should return only typing users for the given conversation', () => {
      useChorusPresenceStore.getState().startTyping('user-1', 'Alice', 'ch-1')
      useChorusPresenceStore.getState().startTyping('user-2', 'Bob', 'ch-1')
      useChorusPresenceStore.getState().startTyping('user-3', 'Charlie', 'ch-2')

      const ch1Typing = useChorusPresenceStore.getState().getTypingUsersForConversation('ch-1')
      expect(ch1Typing).toHaveLength(2)

      const ch2Typing = useChorusPresenceStore.getState().getTypingUsersForConversation('ch-2')
      expect(ch2Typing).toHaveLength(1)
    })

    it('should return empty array for conversation with no typing users', () => {
      const typing = useChorusPresenceStore.getState().getTypingUsersForConversation('ch-1')
      expect(typing).toEqual([])
    })
  })

  describe('clearStaleTyping', () => {
    it('should remove entries older than 10 seconds', () => {
      useChorusPresenceStore.setState({
        typingUsers: [
          { userId: 'user-1', userName: 'Alice', conversationId: 'ch-1', startedAt: Date.now() - 15_000 },
          { userId: 'user-2', userName: 'Bob', conversationId: 'ch-1', startedAt: Date.now() - 5_000 },
          { userId: 'user-3', userName: 'Charlie', conversationId: 'ch-1', startedAt: Date.now() },
        ],
      })

      useChorusPresenceStore.getState().clearStaleTyping()

      const typing = useChorusPresenceStore.getState().typingUsers
      expect(typing).toHaveLength(2)
      expect(typing.map((t) => t.userId)).toEqual(['user-2', 'user-3'])
    })

    it('should remove all entries when all are stale', () => {
      useChorusPresenceStore.setState({
        typingUsers: [
          { userId: 'user-1', userName: 'Alice', conversationId: 'ch-1', startedAt: Date.now() - 20_000 },
        ],
      })

      useChorusPresenceStore.getState().clearStaleTyping()

      expect(useChorusPresenceStore.getState().typingUsers).toHaveLength(0)
    })

    it('should not remove any entries when all are fresh', () => {
      useChorusPresenceStore.getState().startTyping('user-1', 'Alice', 'ch-1')
      useChorusPresenceStore.getState().startTyping('user-2', 'Bob', 'ch-1')

      useChorusPresenceStore.getState().clearStaleTyping()

      expect(useChorusPresenceStore.getState().typingUsers).toHaveLength(2)
    })
  })
})
