import { groupMessages, getDateBoundaries } from './messageGrouping'
import { ChorusMessageType, ConversationType } from '../types'
import type { ChorusMessage } from '../types'

function makeMessage(overrides: Partial<ChorusMessage> = {}): ChorusMessage {
  return {
    id: 'msg-1',
    conversationId: 'ch-1',
    conversationType: ConversationType.Channel,
    senderId: 'user-1',
    senderName: 'User One',
    senderAvatarUrl: '',
    content: 'Hello',
    messageType: ChorusMessageType.Text,
    timestamp: '2026-02-19T10:00:00Z',
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

describe('groupMessages', () => {
  it('groups consecutive messages from the same sender', () => {
    const messages = [
      makeMessage({ id: 'm1', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:00:00Z' }),
      makeMessage({ id: 'm2', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:01:00Z' }),
      makeMessage({ id: 'm3', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:02:00Z' }),
    ]

    const groups = groupMessages(messages)
    expect(groups).toHaveLength(1)
    expect(groups[0]!.messages).toHaveLength(3)
    expect(groups[0]!.senderId).toBe('u1')
  })

  it('starts a new group when sender changes', () => {
    const messages = [
      makeMessage({ id: 'm1', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:00:00Z' }),
      makeMessage({ id: 'm2', senderId: 'u2', senderName: 'User 2', timestamp: '2026-02-19T10:01:00Z' }),
      makeMessage({ id: 'm3', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:02:00Z' }),
    ]

    const groups = groupMessages(messages)
    expect(groups).toHaveLength(3)
  })

  it('starts a new group after 5-minute gap', () => {
    const messages = [
      makeMessage({ id: 'm1', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:00:00Z' }),
      makeMessage({ id: 'm2', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:06:00Z' }),
    ]

    const groups = groupMessages(messages)
    expect(groups).toHaveLength(2)
  })

  it('keeps messages within 5 minutes in the same group', () => {
    const messages = [
      makeMessage({ id: 'm1', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:00:00Z' }),
      makeMessage({ id: 'm2', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:04:59Z' }),
    ]

    const groups = groupMessages(messages)
    expect(groups).toHaveLength(1)
  })

  it('starts a new group for system messages', () => {
    const messages = [
      makeMessage({ id: 'm1', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:00:00Z' }),
      makeMessage({ id: 'm2', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:01:00Z', messageType: ChorusMessageType.System }),
      makeMessage({ id: 'm3', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:02:00Z' }),
    ]

    const groups = groupMessages(messages)
    expect(groups).toHaveLength(3)
  })

  it('skips deleted messages', () => {
    const messages = [
      makeMessage({ id: 'm1', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:00:00Z' }),
      makeMessage({ id: 'm2', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:01:00Z', isDeleted: true }),
      makeMessage({ id: 'm3', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T10:02:00Z' }),
    ]

    const groups = groupMessages(messages)
    expect(groups).toHaveLength(1)
    expect(groups[0]!.messages).toHaveLength(2)
  })

  it('starts a new group on date boundary', () => {
    const messages = [
      makeMessage({ id: 'm1', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-18T23:59:00Z' }),
      makeMessage({ id: 'm2', senderId: 'u1', senderName: 'User 1', timestamp: '2026-02-19T00:01:00Z' }),
    ]

    const groups = groupMessages(messages)
    expect(groups).toHaveLength(2)
  })

  it('returns empty array for empty input', () => {
    expect(groupMessages([])).toEqual([])
  })
})

describe('getDateBoundaries', () => {
  it('returns unique dates in order', () => {
    const messages = [
      makeMessage({ id: 'm1', timestamp: '2026-02-17T10:00:00Z' }),
      makeMessage({ id: 'm2', timestamp: '2026-02-17T14:00:00Z' }),
      makeMessage({ id: 'm3', timestamp: '2026-02-18T09:00:00Z' }),
      makeMessage({ id: 'm4', timestamp: '2026-02-19T10:00:00Z' }),
    ]

    const dates = getDateBoundaries(messages)
    expect(dates).toHaveLength(3)
    expect(dates[0]).toBe('2026-02-17T10:00:00Z')
    expect(dates[1]).toBe('2026-02-18T09:00:00Z')
    expect(dates[2]).toBe('2026-02-19T10:00:00Z')
  })

  it('returns empty array for no messages', () => {
    expect(getDateBoundaries([])).toEqual([])
  })
})
