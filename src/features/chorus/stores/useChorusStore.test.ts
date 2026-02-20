import { useChorusStore } from './useChorusStore'
import type { ChorusChannel, ChorusDirectMessage, ChorusUser } from '@features/chorus/types'

function makeChannel(overrides: Partial<ChorusChannel> = {}): ChorusChannel {
  return {
    id: 'ch-1',
    name: 'general',
    displayName: 'General',
    type: 'public',
    topic: '',
    description: 'General channel',
    createdBy: 'user-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    memberIds: ['user-1'],
    pinnedMessageIds: [],
    isStarred: false,
    isMuted: false,
    lastMessageAt: '2024-01-01T00:00:00.000Z',
    unreadCount: 0,
    mentionCount: 0,
    ...overrides,
  }
}

function makeDM(overrides: Partial<ChorusDirectMessage> = {}): ChorusDirectMessage {
  return {
    id: 'dm-1',
    type: 'dm',
    participantIds: ['user-1', 'user-2'],
    name: 'Alice',
    lastMessageAt: '2024-01-01T00:00:00.000Z',
    unreadCount: 0,
    isStarred: false,
    isMuted: false,
    ...overrides,
  }
}

function makeUser(overrides: Partial<ChorusUser> = {}): ChorusUser {
  return {
    id: 'user-1',
    name: 'alice',
    displayName: 'Alice',
    email: 'alice@test.com',
    avatarUrl: '',
    presence: 'online',
    customStatus: null,
    customStatusEmoji: null,
    timezone: 'UTC',
    lastSeenAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function resetStore() {
  useChorusStore.setState({
    channels: [],
    directMessages: [],
    users: [],
    currentUserId: 'user-you',
    activeConversationId: null,
    activeConversationType: null,
    activeThreadId: null,
    threadPanelOpen: false,
    membersPanelOpen: false,
  })
}

describe('useChorusStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('initializeData', () => {
    it('should load channels, DMs, and users', () => {
      const channels = [makeChannel()]
      const dms = [makeDM()]
      const users = [makeUser()]

      useChorusStore.getState().initializeData(channels, dms, users)

      const state = useChorusStore.getState()
      expect(state.channels).toHaveLength(1)
      expect(state.directMessages).toHaveLength(1)
      expect(state.users).toHaveLength(1)
    })
  })

  describe('createChannel', () => {
    it('should create a new channel with correct defaults', () => {
      useChorusStore.getState().createChannel('random', 'Random talk', 'public', 'user-1')

      const state = useChorusStore.getState()
      expect(state.channels).toHaveLength(1)
      const channel = state.channels[0]!
      expect(channel.name).toBe('random')
      expect(channel.description).toBe('Random talk')
      expect(channel.type).toBe('public')
      expect(channel.createdBy).toBe('user-1')
      expect(channel.memberIds).toEqual(['user-1'])
      expect(channel.unreadCount).toBe(0)
      expect(channel.isStarred).toBe(false)
    })
  })

  describe('joinChannel', () => {
    it('should add user to channel memberIds', () => {
      const channel = makeChannel({ id: 'ch-1', memberIds: ['user-1'] })
      useChorusStore.getState().initializeData([channel], [], [])

      useChorusStore.getState().joinChannel('ch-1', 'user-2')

      const updated = useChorusStore.getState().channels[0]!
      expect(updated.memberIds).toEqual(['user-1', 'user-2'])
    })

    it('should not add duplicate member', () => {
      const channel = makeChannel({ id: 'ch-1', memberIds: ['user-1'] })
      useChorusStore.getState().initializeData([channel], [], [])

      useChorusStore.getState().joinChannel('ch-1', 'user-1')

      const updated = useChorusStore.getState().channels[0]!
      expect(updated.memberIds).toEqual(['user-1'])
    })
  })

  describe('starChannel / unstarChannel', () => {
    it('should toggle channel starred state', () => {
      const channel = makeChannel({ id: 'ch-1' })
      useChorusStore.getState().initializeData([channel], [], [])

      useChorusStore.getState().starChannel('ch-1')
      expect(useChorusStore.getState().channels[0]!.isStarred).toBe(true)

      useChorusStore.getState().unstarChannel('ch-1')
      expect(useChorusStore.getState().channels[0]!.isStarred).toBe(false)
    })
  })

  describe('archiveChannel', () => {
    it('should set channel type to archived', () => {
      const channel = makeChannel({ id: 'ch-1', type: 'public' })
      useChorusStore.getState().initializeData([channel], [], [])

      useChorusStore.getState().archiveChannel('ch-1')

      expect(useChorusStore.getState().channels[0]!.type).toBe('archived')
    })
  })

  describe('setActiveConversation', () => {
    it('should set active conversation id and type', () => {
      useChorusStore.getState().setActiveConversation('ch-1', 'channel')

      const state = useChorusStore.getState()
      expect(state.activeConversationId).toBe('ch-1')
      expect(state.activeConversationType).toBe('channel')
    })
  })

  describe('openThread / closeThread', () => {
    it('should open thread panel with thread id', () => {
      useChorusStore.getState().openThread('thread-1')

      const state = useChorusStore.getState()
      expect(state.activeThreadId).toBe('thread-1')
      expect(state.threadPanelOpen).toBe(true)
    })

    it('should close thread panel and clear thread id', () => {
      useChorusStore.getState().openThread('thread-1')
      useChorusStore.getState().closeThread()

      const state = useChorusStore.getState()
      expect(state.activeThreadId).toBeNull()
      expect(state.threadPanelOpen).toBe(false)
    })
  })

  describe('getTotalUnreadCount', () => {
    it('should sum unread counts across channels and DMs', () => {
      const channels = [
        makeChannel({ id: 'ch-1', unreadCount: 3 }),
        makeChannel({ id: 'ch-2', unreadCount: 5 }),
      ]
      const dms = [
        makeDM({ id: 'dm-1', unreadCount: 2 }),
      ]
      useChorusStore.getState().initializeData(channels, dms, [])

      expect(useChorusStore.getState().getTotalUnreadCount()).toBe(10)
    })

    it('should return 0 when no unread messages', () => {
      expect(useChorusStore.getState().getTotalUnreadCount()).toBe(0)
    })
  })

  describe('clearUnreadCount', () => {
    it('should clear unread count for a channel', () => {
      const channel = makeChannel({ id: 'ch-1', unreadCount: 5, mentionCount: 2 })
      useChorusStore.getState().initializeData([channel], [], [])

      useChorusStore.getState().clearUnreadCount('ch-1')

      const updated = useChorusStore.getState().channels[0]!
      expect(updated.unreadCount).toBe(0)
      expect(updated.mentionCount).toBe(0)
    })

    it('should clear unread count for a DM', () => {
      const dm = makeDM({ id: 'dm-1', unreadCount: 3 })
      useChorusStore.getState().initializeData([], [dm], [])

      useChorusStore.getState().clearUnreadCount('dm-1')

      expect(useChorusStore.getState().directMessages[0]!.unreadCount).toBe(0)
    })
  })

  describe('incrementUnreadCount', () => {
    it('should increment unread count for a channel', () => {
      const channel = makeChannel({ id: 'ch-1', unreadCount: 2 })
      useChorusStore.getState().initializeData([channel], [], [])

      useChorusStore.getState().incrementUnreadCount('ch-1')

      expect(useChorusStore.getState().channels[0]!.unreadCount).toBe(3)
    })
  })

  describe('getStarredItems', () => {
    it('should return starred channels and DMs', () => {
      const channels = [
        makeChannel({ id: 'ch-1', isStarred: true }),
        makeChannel({ id: 'ch-2', isStarred: false }),
      ]
      const dms = [
        makeDM({ id: 'dm-1', isStarred: true }),
        makeDM({ id: 'dm-2', isStarred: false }),
      ]
      useChorusStore.getState().initializeData(channels, dms, [])

      const starred = useChorusStore.getState().getStarredItems()
      expect(starred).toHaveLength(2)
    })
  })

  describe('getTotalMentionCount', () => {
    it('should sum mention counts across channels', () => {
      const channels = [
        makeChannel({ id: 'ch-1', mentionCount: 1 }),
        makeChannel({ id: 'ch-2', mentionCount: 4 }),
      ]
      useChorusStore.getState().initializeData(channels, [], [])

      expect(useChorusStore.getState().getTotalMentionCount()).toBe(5)
    })
  })

  describe('setUserPresence', () => {
    it('should update user presence', () => {
      const user = makeUser({ id: 'user-1', presence: 'online' })
      useChorusStore.getState().initializeData([], [], [user])

      useChorusStore.getState().setUserPresence('user-1', 'away')

      expect(useChorusStore.getState().users[0]!.presence).toBe('away')
    })
  })

  describe('setUserCustomStatus', () => {
    it('should update user custom status and emoji', () => {
      const user = makeUser({ id: 'user-1' })
      useChorusStore.getState().initializeData([], [], [user])

      useChorusStore.getState().setUserCustomStatus('user-1', 'In a meeting', '📅')

      const updated = useChorusStore.getState().users[0]!
      expect(updated.customStatus).toBe('In a meeting')
      expect(updated.customStatusEmoji).toBe('📅')
    })
  })

  describe('leaveChannel', () => {
    it('should remove user from channel memberIds', () => {
      const channel = makeChannel({ id: 'ch-1', memberIds: ['user-1', 'user-2'] })
      useChorusStore.getState().initializeData([channel], [], [])

      useChorusStore.getState().leaveChannel('ch-1', 'user-2')

      expect(useChorusStore.getState().channels[0]!.memberIds).toEqual(['user-1'])
    })
  })

  describe('toggleMembersPanel', () => {
    it('should toggle members panel', () => {
      expect(useChorusStore.getState().membersPanelOpen).toBe(false)

      useChorusStore.getState().toggleMembersPanel()
      expect(useChorusStore.getState().membersPanelOpen).toBe(true)

      useChorusStore.getState().toggleMembersPanel()
      expect(useChorusStore.getState().membersPanelOpen).toBe(false)
    })
  })

  describe('getChannel / getDM / getUser', () => {
    it('should find items by id', () => {
      const channel = makeChannel({ id: 'ch-1' })
      const dm = makeDM({ id: 'dm-1' })
      const user = makeUser({ id: 'user-1' })
      useChorusStore.getState().initializeData([channel], [dm], [user])

      expect(useChorusStore.getState().getChannel('ch-1')?.id).toBe('ch-1')
      expect(useChorusStore.getState().getDM('dm-1')?.id).toBe('dm-1')
      expect(useChorusStore.getState().getUser('user-1')?.id).toBe('user-1')
    })

    it('should return undefined for unknown ids', () => {
      expect(useChorusStore.getState().getChannel('unknown')).toBeUndefined()
      expect(useChorusStore.getState().getDM('unknown')).toBeUndefined()
      expect(useChorusStore.getState().getUser('unknown')).toBeUndefined()
    })
  })
})
