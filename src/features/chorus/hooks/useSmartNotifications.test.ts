import { renderHook } from '@testing-library/react'
import { classifyChannel, useSmartNotifications, NotificationPriority } from './useSmartNotifications'
import type { ChorusChannel } from '../types'

function makeChannel(overrides: Partial<ChorusChannel> = {}): ChorusChannel {
  return {
    id: 'ch-1',
    name: 'general',
    displayName: 'General',
    type: 'public',
    topic: '',
    description: '',
    createdBy: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    memberIds: ['user-1'],
    pinnedMessageIds: [],
    isStarred: false,
    isMuted: false,
    lastMessageAt: '2026-01-01T00:00:00Z',
    unreadCount: 0,
    mentionCount: 0,
    ...overrides,
  }
}

describe('useSmartNotifications', () => {
  describe('classifyChannel', () => {
    it('returns Low for muted channel', () => {
      const result = classifyChannel(makeChannel({ isMuted: true, unreadCount: 10, mentionCount: 2 }))
      expect(result.priority).toBe(NotificationPriority.Low)
      expect(result.reason).toBe('Muted channel')
    })

    it('returns Low for no unread messages', () => {
      const result = classifyChannel(makeChannel({ unreadCount: 0, mentionCount: 0 }))
      expect(result.priority).toBe(NotificationPriority.Low)
      expect(result.reason).toBe('No unread messages')
    })

    it('returns Urgent for mentions with many unreads', () => {
      const result = classifyChannel(makeChannel({ mentionCount: 2, unreadCount: 10 }))
      expect(result.priority).toBe(NotificationPriority.Urgent)
    })

    it('returns Important for mentions with few unreads', () => {
      const result = classifyChannel(makeChannel({ mentionCount: 1, unreadCount: 3 }))
      expect(result.priority).toBe(NotificationPriority.Important)
    })

    it('returns Normal for unread without mentions', () => {
      const result = classifyChannel(makeChannel({ unreadCount: 5, mentionCount: 0 }))
      expect(result.priority).toBe(NotificationPriority.Normal)
    })
  })

  describe('useSmartNotifications hook', () => {
    it('returns empty array for no channels', () => {
      const { result } = renderHook(() => useSmartNotifications([]))
      expect(result.current).toEqual([])
    })

    it('sorts channels by priority', () => {
      const channels = [
        makeChannel({ id: 'ch-1', name: 'low', isMuted: true }),
        makeChannel({ id: 'ch-2', name: 'urgent', mentionCount: 3, unreadCount: 20 }),
        makeChannel({ id: 'ch-3', name: 'normal', unreadCount: 2 }),
      ]

      const { result } = renderHook(() => useSmartNotifications(channels))

      expect(result.current[0]!.channelName).toBe('urgent')
      expect(result.current[0]!.priority).toBe(NotificationPriority.Urgent)
      expect(result.current[1]!.channelName).toBe('normal')
      expect(result.current[1]!.priority).toBe(NotificationPriority.Normal)
      expect(result.current[2]!.channelName).toBe('low')
      expect(result.current[2]!.priority).toBe(NotificationPriority.Low)
    })

    it('includes reason in each priority', () => {
      const channels = [
        makeChannel({ id: 'ch-1', name: 'general', mentionCount: 1, unreadCount: 3 }),
      ]

      const { result } = renderHook(() => useSmartNotifications(channels))
      expect(result.current[0]!.reason).toContain('mention')
    })
  })
})
