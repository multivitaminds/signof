import { parseSearchQuery, searchMessages } from './chorusSearch'
import { ChorusMessageType, ConversationType } from '../types'
import type { ChorusMessage } from '../types'

function makeMessage(overrides: Partial<ChorusMessage> = {}): ChorusMessage {
  return {
    id: 'msg-1',
    conversationId: 'ch-general',
    conversationType: ConversationType.Channel,
    senderId: 'user-alex',
    senderName: 'Alex Johnson',
    senderAvatarUrl: '',
    content: 'Hello world',
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

describe('parseSearchQuery', () => {
  it('parses a simple text query', () => {
    const result = parseSearchQuery('hello world')
    expect(result.query).toBe('hello world')
    expect(result.filter).toEqual({})
  })

  it('parses from: filter', () => {
    const result = parseSearchQuery('database from:jordan')
    expect(result.query).toBe('database')
    expect(result.filter.from).toBe('jordan')
  })

  it('parses in: filter', () => {
    const result = parseSearchQuery('bug in:engineering')
    expect(result.query).toBe('bug')
    expect(result.filter.in).toBe('engineering')
  })

  it('parses has: filter', () => {
    const result = parseSearchQuery('has:reaction')
    expect(result.query).toBe('')
    expect(result.filter.has).toBe('reaction')
  })

  it('parses multiple filters together', () => {
    const result = parseSearchQuery('optimization from:alex in:engineering has:reaction')
    expect(result.query).toBe('optimization')
    expect(result.filter.from).toBe('alex')
    expect(result.filter.in).toBe('engineering')
    expect(result.filter.has).toBe('reaction')
  })

  it('parses before: and after: date filters', () => {
    const result = parseSearchQuery('before:2026-02-20 after:2026-02-17')
    expect(result.filter.before).toBe('2026-02-20')
    expect(result.filter.after).toBe('2026-02-17')
  })
})

describe('searchMessages', () => {
  const channelNames: Record<string, string> = {
    'ch-general': 'general',
    'ch-engineering': 'engineering',
  }

  const messagesMap: Record<string, ChorusMessage[]> = {
    'ch-general': [
      makeMessage({ id: 'm1', content: 'Hello everyone', senderId: 'user-alex', senderName: 'Alex Johnson', timestamp: '2026-02-19T10:00:00Z' }),
      makeMessage({ id: 'm2', content: 'Meeting at 3pm', senderId: 'user-sarah', senderName: 'Sarah Chen', timestamp: '2026-02-19T09:00:00Z' }),
      makeMessage({ id: 'm3', content: 'Check out this link https://example.com', senderId: 'user-alex', senderName: 'Alex Johnson', timestamp: '2026-02-18T10:00:00Z' }),
    ],
    'ch-engineering': [
      makeMessage({
        id: 'm4',
        conversationId: 'ch-engineering',
        content: 'Database optimization done',
        senderId: 'user-jordan',
        senderName: 'Jordan Lee',
        timestamp: '2026-02-19T08:00:00Z',
        reactions: [{ emoji: '\uD83D\uDD25', userIds: ['user-alex'], count: 1 }],
      }),
      makeMessage({
        id: 'm5',
        conversationId: 'ch-engineering',
        content: 'Deleted message',
        senderId: 'user-mike',
        senderName: 'Mike Rivera',
        timestamp: '2026-02-19T07:00:00Z',
        isDeleted: true,
      }),
    ],
  }

  it('searches by free text', () => {
    const results = searchMessages(messagesMap, 'hello', {}, channelNames)
    expect(results).toHaveLength(1)
    expect(results[0]!.message.id).toBe('m1')
  })

  it('searches case-insensitively', () => {
    const results = searchMessages(messagesMap, 'DATABASE', {}, channelNames)
    expect(results).toHaveLength(1)
    expect(results[0]!.message.id).toBe('m4')
  })

  it('filters by from:', () => {
    const results = searchMessages(messagesMap, '', { from: 'jordan' }, channelNames)
    expect(results).toHaveLength(1)
    expect(results[0]!.message.senderName).toBe('Jordan Lee')
  })

  it('filters by in:', () => {
    const results = searchMessages(messagesMap, '', { in: 'engineering' }, channelNames)
    expect(results).toHaveLength(1) // excludes deleted
  })

  it('filters by has:reaction', () => {
    const results = searchMessages(messagesMap, '', { has: 'reaction' }, channelNames)
    expect(results).toHaveLength(1)
    expect(results[0]!.message.id).toBe('m4')
  })

  it('filters by has:link', () => {
    const results = searchMessages(messagesMap, '', { has: 'link' }, channelNames)
    expect(results).toHaveLength(1)
    expect(results[0]!.message.id).toBe('m3')
  })

  it('excludes deleted messages', () => {
    const results = searchMessages(messagesMap, 'Deleted', {}, channelNames)
    expect(results).toHaveLength(0)
  })

  it('sorts results by newest first', () => {
    const results = searchMessages(messagesMap, '', {}, channelNames)
    for (let i = 1; i < results.length; i++) {
      const prev = new Date(results[i - 1]!.message.timestamp).getTime()
      const curr = new Date(results[i]!.message.timestamp).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })

  it('returns highlights for matching text', () => {
    const results = searchMessages(messagesMap, 'optimization', {}, channelNames)
    expect(results).toHaveLength(1)
    expect(results[0]!.highlights.length).toBeGreaterThan(0)
    expect(results[0]!.highlights[0]).toContain('optimization')
  })

  it('returns empty array when no matches', () => {
    const results = searchMessages(messagesMap, 'nonexistent', {}, channelNames)
    expect(results).toEqual([])
  })
})
