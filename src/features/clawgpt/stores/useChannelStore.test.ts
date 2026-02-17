import { describe, it, expect, beforeEach } from 'vitest'
import { useChannelStore } from './useChannelStore'
import type { Channel, ChannelConfig } from '../types'

const DISCONNECTED_CHANNELS: Channel[] = [
  { id: 'ch-1', name: 'Test Slack', type: 'slack', status: 'disconnected', config: { autoReply: true, replyDelay: 500, maxConcurrentSessions: 10, businessHoursOnly: false, language: 'en', authType: 'oauth2' } as ChannelConfig, unreadCount: 0, lastActivity: null, icon: 'slack', description: 'Test Slack', authType: 'oauth2', capabilities: ['text'], assignedAgentId: null },
  { id: 'ch-2', name: 'Test Email', type: 'email', status: 'connected', config: { autoReply: true, replyDelay: 500, maxConcurrentSessions: 10, businessHoursOnly: false, language: 'en', authType: 'smtp' } as ChannelConfig, unreadCount: 3, lastActivity: '2025-06-15T10:00:00Z', icon: 'mail', description: 'Test Email', authType: 'smtp', capabilities: ['text', 'media'], assignedAgentId: null },
  { id: 'ch-3', name: 'Test Chat', type: 'web_chat', status: 'paused', config: { autoReply: false, replyDelay: 200, maxConcurrentSessions: 5, businessHoursOnly: true, language: 'en', authType: 'none' } as ChannelConfig, unreadCount: 1, lastActivity: '2025-06-14T08:00:00Z', icon: 'message-circle', description: 'Test Chat', authType: 'none', capabilities: ['text'], assignedAgentId: null },
]

describe('useChannelStore', () => {
  beforeEach(() => {
    useChannelStore.setState({
      channels: DISCONNECTED_CHANNELS.map((ch) => ({ ...ch, config: { ...ch.config } })),
    })
  })

  it('initializes with channels', () => {
    const state = useChannelStore.getState()
    expect(state.channels).toHaveLength(3)
  })

  describe('connectChannel', () => {
    it('sets channel status to connected and updates lastActivity', () => {
      useChannelStore.getState().connectChannel('ch-1')
      const channel = useChannelStore.getState().channels.find((c) => c.id === 'ch-1')
      expect(channel!.status).toBe('connected')
      expect(channel!.lastActivity).toBeTruthy()
    })

    it('does not affect other channels', () => {
      useChannelStore.getState().connectChannel('ch-1')
      const ch3 = useChannelStore.getState().channels.find((c) => c.id === 'ch-3')
      expect(ch3!.status).toBe('paused')
    })
  })

  describe('disconnectChannel', () => {
    it('sets channel status to disconnected', () => {
      useChannelStore.getState().disconnectChannel('ch-2')
      const channel = useChannelStore.getState().channels.find((c) => c.id === 'ch-2')
      expect(channel!.status).toBe('disconnected')
    })
  })

  describe('pauseChannel', () => {
    it('sets channel status to paused', () => {
      useChannelStore.getState().pauseChannel('ch-2')
      const channel = useChannelStore.getState().channels.find((c) => c.id === 'ch-2')
      expect(channel!.status).toBe('paused')
    })
  })

  describe('updateChannelConfig', () => {
    it('merges config updates', () => {
      useChannelStore.getState().updateChannelConfig('ch-1', { autoReply: false, replyDelay: 1000 })
      const channel = useChannelStore.getState().channels.find((c) => c.id === 'ch-1')
      expect(channel!.config.autoReply).toBe(false)
      expect(channel!.config.replyDelay).toBe(1000)
      expect(channel!.config.language).toBe('en')
    })
  })

  describe('addCustomChannel', () => {
    it('adds a new custom channel with Custom type', () => {
      const config: ChannelConfig = {
        autoReply: true,
        replyDelay: 300,
        maxConcurrentSessions: 5,
        businessHoursOnly: false,
        language: 'en',
        authType: 'webhook',
      }
      const id = useChannelStore.getState().addCustomChannel('My Custom API', config)
      expect(id).toBeTruthy()
      const channels = useChannelStore.getState().channels
      expect(channels).toHaveLength(4)
      const custom = channels.find((c) => c.id === id)
      expect(custom!.name).toBe('My Custom API')
      expect(custom!.type).toBe('custom')
      expect(custom!.status).toBe('disconnected')
    })
  })

  describe('removeCustomChannel', () => {
    it('removes the channel by id', () => {
      useChannelStore.getState().removeCustomChannel('ch-3')
      expect(useChannelStore.getState().channels).toHaveLength(2)
      expect(useChannelStore.getState().channels.find((c) => c.id === 'ch-3')).toBeUndefined()
    })
  })

  describe('getConnectedChannels', () => {
    it('returns only connected channels', () => {
      const connected = useChannelStore.getState().getConnectedChannels()
      expect(connected).toHaveLength(1)
      expect(connected[0]!.id).toBe('ch-2')
    })

    it('updates when channels connect', () => {
      useChannelStore.getState().connectChannel('ch-1')
      const connected = useChannelStore.getState().getConnectedChannels()
      expect(connected).toHaveLength(2)
    })
  })

  describe('getChannelsByType', () => {
    it('returns channels matching the type', () => {
      const slackChannels = useChannelStore.getState().getChannelsByType('slack')
      expect(slackChannels).toHaveLength(1)
      expect(slackChannels[0]!.id).toBe('ch-1')
    })

    it('returns empty array for missing type', () => {
      const smsChannels = useChannelStore.getState().getChannelsByType('sms')
      expect(smsChannels).toHaveLength(0)
    })
  })

  describe('updateUnreadCount', () => {
    it('sets the unread count for a channel', () => {
      useChannelStore.getState().updateUnreadCount('ch-1', 42)
      const channel = useChannelStore.getState().channels.find((c) => c.id === 'ch-1')
      expect(channel!.unreadCount).toBe(42)
    })
  })
})
