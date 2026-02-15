import { MessagePriority } from '../types'
import useMessageBusStore from './useMessageBusStore'

function resetStore() {
  const initialTopics = new Map<string, string[]>()
  for (const topic of ['system.alerts', 'domain.finance', 'domain.health', 'domain.work', 'coordination.handoff', 'healing.report']) {
    initialTopics.set(topic, [])
  }
  useMessageBusStore.setState({
    topics: initialTopics,
    messages: [],
    unacknowledged: new Map(),
  })
}

describe('useMessageBusStore', () => {
  beforeEach(resetStore)

  describe('default topics', () => {
    it('initializes with 6 default topics', () => {
      const topics = useMessageBusStore.getState().getTopics()
      expect(topics).toContain('system.alerts')
      expect(topics).toContain('domain.finance')
      expect(topics).toContain('coordination.handoff')
      expect(topics).toContain('healing.report')
      expect(topics.length).toBeGreaterThanOrEqual(6)
    })
  })

  describe('subscribe / unsubscribe', () => {
    it('subscribes an agent to a topic', () => {
      useMessageBusStore.getState().subscribe('agent-1', 'system.alerts')
      const subs = useMessageBusStore.getState().getSubscribers('system.alerts')
      expect(subs).toContain('agent-1')
    })

    it('does not duplicate subscriptions', () => {
      useMessageBusStore.getState().subscribe('agent-1', 'system.alerts')
      useMessageBusStore.getState().subscribe('agent-1', 'system.alerts')
      const subs = useMessageBusStore.getState().getSubscribers('system.alerts')
      expect(subs.filter((s) => s === 'agent-1')).toHaveLength(1)
    })

    it('creates topic if not exists on subscribe', () => {
      useMessageBusStore.getState().subscribe('agent-1', 'custom.topic')
      expect(useMessageBusStore.getState().getTopics()).toContain('custom.topic')
    })

    it('unsubscribes an agent from a topic', () => {
      useMessageBusStore.getState().subscribe('agent-1', 'system.alerts')
      useMessageBusStore.getState().unsubscribe('agent-1', 'system.alerts')
      expect(useMessageBusStore.getState().getSubscribers('system.alerts')).not.toContain('agent-1')
    })
  })

  describe('publish', () => {
    it('publishes a message to a topic', () => {
      useMessageBusStore.getState().publish('agent-1', 'system.alerts', 'Test message')
      const messages = useMessageBusStore.getState().getMessagesByTopic('system.alerts')
      expect(messages).toHaveLength(1)
      expect(messages[0]!.content).toBe('Test message')
      expect(messages[0]!.fromAgentId).toBe('agent-1')
      expect(messages[0]!.priority).toBe(MessagePriority.Normal)
    })

    it('publishes with custom priority', () => {
      useMessageBusStore.getState().publish('agent-1', 'system.alerts', 'Urgent!', MessagePriority.Critical)
      const messages = useMessageBusStore.getState().getMessagesByTopic('system.alerts')
      expect(messages[0]!.priority).toBe(MessagePriority.Critical)
    })

    it('delivers to subscribers unacknowledged queue', () => {
      useMessageBusStore.getState().subscribe('agent-2', 'system.alerts')
      useMessageBusStore.getState().publish('agent-1', 'system.alerts', 'Hello agent-2')
      const unread = useMessageBusStore.getState().getUnread('agent-2')
      expect(unread).toHaveLength(1)
      expect(unread[0]!.content).toBe('Hello agent-2')
    })

    it('does not deliver to the sender', () => {
      useMessageBusStore.getState().subscribe('agent-1', 'system.alerts')
      useMessageBusStore.getState().publish('agent-1', 'system.alerts', 'My own message')
      const unread = useMessageBusStore.getState().getUnread('agent-1')
      expect(unread).toHaveLength(0)
    })

    it('delivers to multiple subscribers', () => {
      useMessageBusStore.getState().subscribe('agent-2', 'domain.finance')
      useMessageBusStore.getState().subscribe('agent-3', 'domain.finance')
      useMessageBusStore.getState().publish('agent-1', 'domain.finance', 'Financial update')
      expect(useMessageBusStore.getState().getUnread('agent-2')).toHaveLength(1)
      expect(useMessageBusStore.getState().getUnread('agent-3')).toHaveLength(1)
    })
  })

  describe('directMessage', () => {
    it('sends a direct message to a specific agent', () => {
      useMessageBusStore.getState().directMessage('agent-1', 'agent-2', 'Private msg')
      const unread = useMessageBusStore.getState().getUnread('agent-2')
      expect(unread).toHaveLength(1)
      expect(unread[0]!.content).toBe('Private msg')
      expect(unread[0]!.toAgentId).toBe('agent-2')
      expect(unread[0]!.topic).toBe('direct')
    })

    it('does not deliver to other agents', () => {
      useMessageBusStore.getState().directMessage('agent-1', 'agent-2', 'Just for you')
      expect(useMessageBusStore.getState().getUnread('agent-3')).toHaveLength(0)
    })
  })

  describe('acknowledge', () => {
    it('acknowledges a message and removes from unread', () => {
      useMessageBusStore.getState().subscribe('agent-2', 'system.alerts')
      useMessageBusStore.getState().publish('agent-1', 'system.alerts', 'Ack me')
      const unread = useMessageBusStore.getState().getUnread('agent-2')
      expect(unread).toHaveLength(1)
      const msgId = unread[0]!.id

      useMessageBusStore.getState().acknowledge('agent-2', msgId)
      expect(useMessageBusStore.getState().getUnread('agent-2')).toHaveLength(0)

      // Message in global list should be marked acknowledged
      const msg = useMessageBusStore.getState().messages.find((m) => m.id === msgId)
      expect(msg!.acknowledged).toBe(true)
    })
  })

  describe('getUnread', () => {
    it('returns empty array for agent with no messages', () => {
      expect(useMessageBusStore.getState().getUnread('nobody')).toEqual([])
    })
  })
})
