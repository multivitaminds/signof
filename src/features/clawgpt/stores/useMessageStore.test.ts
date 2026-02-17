import { describe, it, expect, beforeEach } from 'vitest'
import { useMessageStore } from './useMessageStore'
import type { BrainMessage } from '../types'

const SAMPLE_MESSAGES: BrainMessage[] = [
  {
    id: 'msg-1',
    sessionId: 'session-1',
    channelId: 'ch-slack',
    channelType: 'slack',
    direction: 'inbound',
    content: 'Hello from Slack',
    timestamp: '2025-06-15T09:00:00Z',
    senderName: 'Alice',
    senderAvatar: null,
    toolCalls: null,
    agentId: null,
    status: 'read',
  },
  {
    id: 'msg-2',
    sessionId: 'session-1',
    channelId: 'ch-slack',
    channelType: 'slack',
    direction: 'outbound',
    content: 'Hi Alice, how can I help?',
    timestamp: '2025-06-15T09:00:30Z',
    senderName: 'Atlas',
    senderAvatar: null,
    toolCalls: null,
    agentId: null,
    status: 'delivered',
  },
  {
    id: 'msg-3',
    sessionId: 'session-2',
    channelId: 'ch-email',
    channelType: 'email',
    direction: 'inbound',
    content: 'Need the invoice please',
    timestamp: '2025-06-15T08:00:00Z',
    senderName: 'Bob',
    senderAvatar: null,
    toolCalls: null,
    agentId: null,
    status: 'delivered',
  },
]

describe('useMessageStore', () => {
  beforeEach(() => {
    useMessageStore.setState({
      messages: SAMPLE_MESSAGES.map((m) => ({ ...m })),
      activeSessionId: null,
      searchQuery: '',
    })
  })

  it('initializes with sample messages', () => {
    const state = useMessageStore.getState()
    expect(state.messages).toHaveLength(3)
    expect(state.activeSessionId).toBeNull()
    expect(state.searchQuery).toBe('')
  })

  describe('sendMessage', () => {
    it('creates an outbound message with sent status', () => {
      useMessageStore.getState().sendMessage('session-1', 'ch-slack', 'slack', 'Testing reply')
      const state = useMessageStore.getState()
      expect(state.messages).toHaveLength(4)
      const sent = state.messages[3]!
      expect(sent.direction).toBe('outbound')
      expect(sent.content).toBe('Testing reply')
      expect(sent.status).toBe('sent')
      expect(sent.sessionId).toBe('session-1')
      expect(sent.channelId).toBe('ch-slack')
      expect(sent.senderName).toBe('Atlas')
      expect(sent.senderAvatar).toBeNull()
      expect(sent.toolCalls).toBeNull()
      expect(sent.agentId).toBeNull()
    })
  })

  describe('receiveMessage', () => {
    it('creates an inbound message with generated id and timestamp', () => {
      useMessageStore.getState().receiveMessage({
        sessionId: 'session-1',
        channelId: 'ch-slack',
        channelType: 'slack',
        direction: 'inbound',
        content: 'Incoming message',
        senderName: 'Alice',
        senderAvatar: null,
        toolCalls: null,
        agentId: null,
        status: 'delivered',
      })
      const state = useMessageStore.getState()
      expect(state.messages).toHaveLength(4)
      const received = state.messages[3]!
      expect(received.id).toBeTruthy()
      expect(received.timestamp).toBeTruthy()
      expect(received.content).toBe('Incoming message')
      expect(received.direction).toBe('inbound')
    })
  })

  describe('markRead', () => {
    it('marks all messages in a session as read', () => {
      useMessageStore.getState().markRead('session-2')
      const state = useMessageStore.getState()
      const session2Msgs = state.messages.filter((m) => m.sessionId === 'session-2')
      expect(session2Msgs.every((m) => m.status === 'read')).toBe(true)
    })

    it('does not affect other sessions', () => {
      useMessageStore.getState().markRead('session-2')
      const state = useMessageStore.getState()
      const session1Msgs = state.messages.filter((m) => m.sessionId === 'session-1')
      expect(session1Msgs[1]!.status).toBe('delivered')
    })
  })

  describe('deleteMessage', () => {
    it('removes the message by id', () => {
      useMessageStore.getState().deleteMessage('msg-1')
      const state = useMessageStore.getState()
      expect(state.messages).toHaveLength(2)
      expect(state.messages.find((m) => m.id === 'msg-1')).toBeUndefined()
    })
  })

  describe('setActiveSession', () => {
    it('sets the active session id', () => {
      useMessageStore.getState().setActiveSession('session-1')
      expect(useMessageStore.getState().activeSessionId).toBe('session-1')
    })

    it('clears the active session when set to null', () => {
      useMessageStore.getState().setActiveSession('session-1')
      useMessageStore.getState().setActiveSession(null)
      expect(useMessageStore.getState().activeSessionId).toBeNull()
    })
  })

  describe('setSearchQuery', () => {
    it('updates the search query', () => {
      useMessageStore.getState().setSearchQuery('invoice')
      expect(useMessageStore.getState().searchQuery).toBe('invoice')
    })
  })

  describe('searchMessages', () => {
    it('finds messages by content', () => {
      const results = useMessageStore.getState().searchMessages('invoice')
      expect(results).toHaveLength(1)
      expect(results[0]!.id).toBe('msg-3')
    })

    it('finds messages by sender name', () => {
      const results = useMessageStore.getState().searchMessages('bob')
      expect(results).toHaveLength(1)
      expect(results[0]!.senderName).toBe('Bob')
    })

    it('is case insensitive', () => {
      const results = useMessageStore.getState().searchMessages('HELLO')
      expect(results).toHaveLength(1)
    })

    it('returns empty for no matches', () => {
      const results = useMessageStore.getState().searchMessages('zzzzz')
      expect(results).toHaveLength(0)
    })
  })

  describe('getMessagesBySession', () => {
    it('returns messages for a specific session', () => {
      const msgs = useMessageStore.getState().getMessagesBySession('session-1')
      expect(msgs).toHaveLength(2)
      expect(msgs.every((m) => m.sessionId === 'session-1')).toBe(true)
    })

    it('returns empty for unknown session', () => {
      const msgs = useMessageStore.getState().getMessagesBySession('nonexistent')
      expect(msgs).toHaveLength(0)
    })
  })

  describe('getUnreadCount', () => {
    it('counts unread messages (status not read)', () => {
      const count = useMessageStore.getState().getUnreadCount()
      expect(count).toBe(2) // msg-2 (delivered) and msg-3 (delivered) are not read
    })

    it('returns 0 when all messages are read', () => {
      useMessageStore.getState().markRead('session-1')
      useMessageStore.getState().markRead('session-2')
      expect(useMessageStore.getState().getUnreadCount()).toBe(0)
    })
  })
})
