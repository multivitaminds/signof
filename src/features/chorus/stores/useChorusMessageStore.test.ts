import { useChorusMessageStore } from './useChorusMessageStore'
import type { ChorusMessage } from '@features/chorus/types'

function makeMessage(overrides: Partial<ChorusMessage> = {}): ChorusMessage {
  return {
    id: 'msg-1',
    conversationId: 'ch-1',
    conversationType: 'channel',
    senderId: 'user-1',
    senderName: 'Alice',
    senderAvatarUrl: '',
    content: 'Hello world',
    messageType: 'text',
    timestamp: '2024-01-01T00:00:00.000Z',
    editedAt: null,
    isEdited: false,
    threadId: null,
    threadReplyCount: 0,
    threadParticipantIds: [],
    threadLastReplyAt: null,
    reactions: [],
    isPinned: false,
    isBookmarked: false,
    isDeleted: false,
    attachments: [],
    mentions: [],
    pollData: null,
    crossModuleRef: null,
    ...overrides,
  }
}

function resetStore() {
  useChorusMessageStore.setState({ messages: {} })
}

describe('useChorusMessageStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('loadMessages', () => {
    it('should load messages for a conversation', () => {
      const msgs = [makeMessage({ id: 'msg-1' }), makeMessage({ id: 'msg-2' })]
      useChorusMessageStore.getState().loadMessages('ch-1', msgs)

      const loaded = useChorusMessageStore.getState().getMessagesForConversation('ch-1')
      expect(loaded).toHaveLength(2)
    })
  })

  describe('sendMessage', () => {
    it('should append a new message with generated id and timestamp', () => {
      useChorusMessageStore.getState().sendMessage({
        conversationId: 'ch-1',
        conversationType: 'channel',
        senderId: 'user-1',
        senderName: 'Alice',
        senderAvatarUrl: '',
        content: 'Hello!',
      })

      const msgs = useChorusMessageStore.getState().getMessagesForConversation('ch-1')
      expect(msgs).toHaveLength(1)
      expect(msgs[0]!.content).toBe('Hello!')
      expect(msgs[0]!.senderId).toBe('user-1')
      expect(msgs[0]!.id).toBeTruthy()
      expect(msgs[0]!.timestamp).toBeTruthy()
      expect(msgs[0]!.messageType).toBe('text')
    })

    it('should use custom messageType when provided', () => {
      useChorusMessageStore.getState().sendMessage({
        conversationId: 'ch-1',
        conversationType: 'channel',
        senderId: 'user-1',
        senderName: 'System',
        senderAvatarUrl: '',
        content: 'User joined',
        messageType: 'system',
      })

      const msgs = useChorusMessageStore.getState().getMessagesForConversation('ch-1')
      expect(msgs[0]!.messageType).toBe('system')
    })
  })

  describe('editMessage', () => {
    it('should update content and mark as edited', () => {
      const msg = makeMessage({ id: 'msg-1', conversationId: 'ch-1' })
      useChorusMessageStore.getState().loadMessages('ch-1', [msg])

      useChorusMessageStore.getState().editMessage('ch-1', 'msg-1', 'Updated content')

      const updated = useChorusMessageStore.getState().getMessagesForConversation('ch-1')
      expect(updated[0]!.content).toBe('Updated content')
      expect(updated[0]!.isEdited).toBe(true)
      expect(updated[0]!.editedAt).toBeTruthy()
    })
  })

  describe('deleteMessage', () => {
    it('should mark message as deleted', () => {
      const msg = makeMessage({ id: 'msg-1', conversationId: 'ch-1' })
      useChorusMessageStore.getState().loadMessages('ch-1', [msg])

      useChorusMessageStore.getState().deleteMessage('ch-1', 'msg-1')

      const updated = useChorusMessageStore.getState().getMessagesForConversation('ch-1')
      expect(updated[0]!.isDeleted).toBe(true)
    })
  })

  describe('addReaction / removeReaction', () => {
    it('should add a new reaction', () => {
      const msg = makeMessage({ id: 'msg-1', conversationId: 'ch-1' })
      useChorusMessageStore.getState().loadMessages('ch-1', [msg])

      useChorusMessageStore.getState().addReaction('ch-1', 'msg-1', '👍', 'user-1')

      const updated = useChorusMessageStore.getState().getMessagesForConversation('ch-1')
      expect(updated[0]!.reactions).toHaveLength(1)
      expect(updated[0]!.reactions[0]!.emoji).toBe('👍')
      expect(updated[0]!.reactions[0]!.userIds).toEqual(['user-1'])
      expect(updated[0]!.reactions[0]!.count).toBe(1)
    })

    it('should add user to existing reaction', () => {
      const msg = makeMessage({
        id: 'msg-1',
        conversationId: 'ch-1',
        reactions: [{ emoji: '👍', userIds: ['user-1'], count: 1 }],
      })
      useChorusMessageStore.getState().loadMessages('ch-1', [msg])

      useChorusMessageStore.getState().addReaction('ch-1', 'msg-1', '👍', 'user-2')

      const updated = useChorusMessageStore.getState().getMessagesForConversation('ch-1')
      expect(updated[0]!.reactions[0]!.userIds).toEqual(['user-1', 'user-2'])
      expect(updated[0]!.reactions[0]!.count).toBe(2)
    })

    it('should not duplicate user in reaction', () => {
      const msg = makeMessage({
        id: 'msg-1',
        conversationId: 'ch-1',
        reactions: [{ emoji: '👍', userIds: ['user-1'], count: 1 }],
      })
      useChorusMessageStore.getState().loadMessages('ch-1', [msg])

      useChorusMessageStore.getState().addReaction('ch-1', 'msg-1', '👍', 'user-1')

      const updated = useChorusMessageStore.getState().getMessagesForConversation('ch-1')
      expect(updated[0]!.reactions[0]!.userIds).toEqual(['user-1'])
      expect(updated[0]!.reactions[0]!.count).toBe(1)
    })

    it('should remove reaction and clean up empty reactions', () => {
      const msg = makeMessage({
        id: 'msg-1',
        conversationId: 'ch-1',
        reactions: [{ emoji: '👍', userIds: ['user-1'], count: 1 }],
      })
      useChorusMessageStore.getState().loadMessages('ch-1', [msg])

      useChorusMessageStore.getState().removeReaction('ch-1', 'msg-1', '👍', 'user-1')

      const updated = useChorusMessageStore.getState().getMessagesForConversation('ch-1')
      expect(updated[0]!.reactions).toHaveLength(0)
    })
  })

  describe('pinMessage', () => {
    it('should pin a message', () => {
      const msg = makeMessage({ id: 'msg-1', conversationId: 'ch-1' })
      useChorusMessageStore.getState().loadMessages('ch-1', [msg])

      useChorusMessageStore.getState().pinMessage('ch-1', 'msg-1')

      const updated = useChorusMessageStore.getState().getMessagesForConversation('ch-1')
      expect(updated[0]!.isPinned).toBe(true)
    })

    it('should unpin a message', () => {
      const msg = makeMessage({ id: 'msg-1', conversationId: 'ch-1', isPinned: true })
      useChorusMessageStore.getState().loadMessages('ch-1', [msg])

      useChorusMessageStore.getState().unpinMessage('ch-1', 'msg-1')

      const updated = useChorusMessageStore.getState().getMessagesForConversation('ch-1')
      expect(updated[0]!.isPinned).toBe(false)
    })
  })

  describe('getPinnedMessages', () => {
    it('should return only pinned messages', () => {
      const msgs = [
        makeMessage({ id: 'msg-1', conversationId: 'ch-1', isPinned: true }),
        makeMessage({ id: 'msg-2', conversationId: 'ch-1', isPinned: false }),
        makeMessage({ id: 'msg-3', conversationId: 'ch-1', isPinned: true }),
      ]
      useChorusMessageStore.getState().loadMessages('ch-1', msgs)

      const pinned = useChorusMessageStore.getState().getPinnedMessages('ch-1')
      expect(pinned).toHaveLength(2)
    })
  })

  describe('searchMessages', () => {
    it('should find messages matching query across conversations', () => {
      const msgs1 = [
        makeMessage({ id: 'msg-1', conversationId: 'ch-1', content: 'Hello world' }),
        makeMessage({ id: 'msg-2', conversationId: 'ch-1', content: 'Goodbye' }),
      ]
      const msgs2 = [
        makeMessage({ id: 'msg-3', conversationId: 'ch-2', content: 'Hello again' }),
      ]
      useChorusMessageStore.getState().loadMessages('ch-1', msgs1)
      useChorusMessageStore.getState().loadMessages('ch-2', msgs2)

      const results = useChorusMessageStore.getState().searchMessages('hello')
      expect(results).toHaveLength(2)
    })

    it('should exclude deleted messages', () => {
      const msgs = [
        makeMessage({ id: 'msg-1', conversationId: 'ch-1', content: 'Hello', isDeleted: true }),
      ]
      useChorusMessageStore.getState().loadMessages('ch-1', msgs)

      const results = useChorusMessageStore.getState().searchMessages('hello')
      expect(results).toHaveLength(0)
    })

    it('should filter by from user', () => {
      const msgs = [
        makeMessage({ id: 'msg-1', conversationId: 'ch-1', content: 'Hello', senderId: 'user-1' }),
        makeMessage({ id: 'msg-2', conversationId: 'ch-1', content: 'Hello', senderId: 'user-2' }),
      ]
      useChorusMessageStore.getState().loadMessages('ch-1', msgs)

      const results = useChorusMessageStore.getState().searchMessages('hello', { from: 'user-1' })
      expect(results).toHaveLength(1)
      expect(results[0]!.senderId).toBe('user-1')
    })

    it('should filter by conversation', () => {
      const msgs1 = [makeMessage({ id: 'msg-1', conversationId: 'ch-1', content: 'Test' })]
      const msgs2 = [makeMessage({ id: 'msg-2', conversationId: 'ch-2', content: 'Test' })]
      useChorusMessageStore.getState().loadMessages('ch-1', msgs1)
      useChorusMessageStore.getState().loadMessages('ch-2', msgs2)

      const results = useChorusMessageStore.getState().searchMessages('test', { in: 'ch-1' })
      expect(results).toHaveLength(1)
      expect(results[0]!.conversationId).toBe('ch-1')
    })
  })

  describe('replyInThread', () => {
    it('should add reply and update parent thread metadata', () => {
      const parent = makeMessage({ id: 'msg-parent', conversationId: 'ch-1' })
      useChorusMessageStore.getState().loadMessages('ch-1', [parent])

      useChorusMessageStore.getState().replyInThread({
        conversationId: 'ch-1',
        conversationType: 'channel',
        senderId: 'user-2',
        senderName: 'Bob',
        senderAvatarUrl: '',
        content: 'Thread reply!',
        parentMessageId: 'msg-parent',
      })

      const msgs = useChorusMessageStore.getState().getMessagesForConversation('ch-1')
      expect(msgs).toHaveLength(2)

      const updatedParent = msgs.find((m) => m.id === 'msg-parent')!
      expect(updatedParent.threadReplyCount).toBe(1)
      expect(updatedParent.threadParticipantIds).toContain('user-2')
      expect(updatedParent.threadLastReplyAt).toBeTruthy()

      const reply = msgs.find((m) => m.id !== 'msg-parent')!
      expect(reply.content).toBe('Thread reply!')
      expect(reply.threadId).toBe('msg-parent')
    })

    it('should not duplicate participant in thread', () => {
      const parent = makeMessage({
        id: 'msg-parent',
        conversationId: 'ch-1',
        threadParticipantIds: ['user-2'],
        threadReplyCount: 1,
      })
      useChorusMessageStore.getState().loadMessages('ch-1', [parent])

      useChorusMessageStore.getState().replyInThread({
        conversationId: 'ch-1',
        conversationType: 'channel',
        senderId: 'user-2',
        senderName: 'Bob',
        senderAvatarUrl: '',
        content: 'Another reply',
        parentMessageId: 'msg-parent',
      })

      const updatedParent = useChorusMessageStore
        .getState()
        .getMessagesForConversation('ch-1')
        .find((m) => m.id === 'msg-parent')!
      expect(updatedParent.threadParticipantIds).toEqual(['user-2'])
      expect(updatedParent.threadReplyCount).toBe(2)
    })
  })

  describe('bookmarkMessage', () => {
    it('should bookmark a message', () => {
      const msg = makeMessage({ id: 'msg-1', conversationId: 'ch-1' })
      useChorusMessageStore.getState().loadMessages('ch-1', [msg])

      useChorusMessageStore.getState().bookmarkMessage('ch-1', 'msg-1')

      const updated = useChorusMessageStore.getState().getMessagesForConversation('ch-1')
      expect(updated[0]!.isBookmarked).toBe(true)
    })
  })

  describe('votePoll', () => {
    it('should add voter to poll option', () => {
      const msg = makeMessage({
        id: 'msg-1',
        conversationId: 'ch-1',
        messageType: 'poll',
        pollData: {
          question: 'Favorite color?',
          options: [
            { id: 'opt-1', text: 'Red', voterIds: [] },
            { id: 'opt-2', text: 'Blue', voterIds: [] },
          ],
          isAnonymous: false,
          allowMultiple: false,
          closesAt: null,
        },
      })
      useChorusMessageStore.getState().loadMessages('ch-1', [msg])

      useChorusMessageStore.getState().votePoll('ch-1', 'msg-1', 'opt-1', 'user-1')

      const updated = useChorusMessageStore.getState().getMessagesForConversation('ch-1')
      const poll = updated[0]!.pollData!
      expect(poll.options[0]!.voterIds).toEqual(['user-1'])
    })
  })

  describe('getMessagesForConversation', () => {
    it('should return empty array for unknown conversation', () => {
      const msgs = useChorusMessageStore.getState().getMessagesForConversation('unknown')
      expect(msgs).toEqual([])
    })
  })

  describe('getThreadMessages', () => {
    it('should return messages with matching threadId', () => {
      const msgs = [
        makeMessage({ id: 'msg-parent', conversationId: 'ch-1', threadId: null }),
        makeMessage({ id: 'msg-reply-1', conversationId: 'ch-1', threadId: 'msg-parent' }),
        makeMessage({ id: 'msg-reply-2', conversationId: 'ch-1', threadId: 'msg-parent' }),
        makeMessage({ id: 'msg-other', conversationId: 'ch-1', threadId: 'other-thread' }),
      ]
      useChorusMessageStore.getState().loadMessages('ch-1', msgs)

      const threadMsgs = useChorusMessageStore.getState().getThreadMessages('ch-1', 'msg-parent')
      expect(threadMsgs).toHaveLength(2)
    })
  })
})
