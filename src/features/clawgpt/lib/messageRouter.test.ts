import { describe, it, expect } from 'vitest'
import { routeMessage, getChannelForSession } from './messageRouter'
import type { BrainMessage, Channel, Session } from '../types'
import {
  ChannelType,
  ChannelStatus,
  ChannelAuthType,
  MessageDirection,
  MessageStatus,
} from '../types'

// ─── Helpers ────────────────────────────────────────────────────

function makeChannel(overrides: Partial<Channel> = {}): Channel {
  return {
    id: 'ch-1',
    type: ChannelType.Slack,
    name: 'Slack',
    status: ChannelStatus.Connected,
    config: { authType: ChannelAuthType.OAuth2 },
    icon: 'hash',
    description: 'Slack channel',
    authType: ChannelAuthType.OAuth2,
    capabilities: [],
    unreadCount: 0,
    lastActivity: null,
    assignedAgentId: null,
    ...overrides,
  }
}

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'sess-1',
    channelId: 'ch-1',
    channelType: ChannelType.Slack,
    contactId: 'contact-1',
    contactName: 'Jane Doe',
    contactAvatar: null,
    lastMessage: 'Hello',
    lastMessageAt: '2025-01-01T00:00:00Z',
    startedAt: '2025-01-01T00:00:00Z',
    agentId: null,
    isActive: true,
    ...overrides,
  }
}

function makeMessage(overrides: Partial<BrainMessage> = {}): BrainMessage {
  return {
    id: 'msg-1',
    sessionId: 'sess-1',
    channelId: 'ch-1',
    channelType: ChannelType.Slack,
    direction: MessageDirection.Inbound,
    content: 'Hello there',
    timestamp: '2025-01-01T00:00:00Z',
    senderName: 'Jane Doe',
    senderAvatar: null,
    toolCalls: null,
    agentId: null,
    status: MessageStatus.Delivered,
    ...overrides,
  }
}

// ─── routeMessage ───────────────────────────────────────────────

describe('routeMessage', () => {
  it('returns the session agent when the session has an assigned agent', () => {
    const channels = [makeChannel()]
    const sessions = [makeSession({ agentId: 'agent-A' })]
    const message = makeMessage()

    const result = routeMessage(message, channels, sessions)
    expect(result).toBe('agent-A')
  })

  it('returns the channel agent when session has no agent but channel does', () => {
    const channels = [makeChannel({ assignedAgentId: 'agent-B' })]
    const sessions = [makeSession({ agentId: null })]
    const message = makeMessage()

    const result = routeMessage(message, channels, sessions)
    expect(result).toBe('agent-B')
  })

  it('returns null when neither session nor channel has an assigned agent', () => {
    const channels = [makeChannel()]
    const sessions = [makeSession()]
    const message = makeMessage()

    const result = routeMessage(message, channels, sessions)
    expect(result).toBeNull()
  })

  it('returns null when session is not found', () => {
    const channels = [makeChannel()]
    const sessions: Session[] = []
    const message = makeMessage()

    const result = routeMessage(message, channels, sessions)
    expect(result).toBeNull()
  })

  it('returns null when both session and channel are missing', () => {
    const channels: Channel[] = []
    const sessions: Session[] = []
    const message = makeMessage()

    const result = routeMessage(message, channels, sessions)
    expect(result).toBeNull()
  })

  it('prefers session agent over channel agent', () => {
    const channels = [makeChannel({ assignedAgentId: 'agent-channel' })]
    const sessions = [makeSession({ agentId: 'agent-session' })]
    const message = makeMessage()

    const result = routeMessage(message, channels, sessions)
    expect(result).toBe('agent-session')
  })

  it('falls back to channel agent when session exists but has no agent', () => {
    const channels = [makeChannel({ id: 'ch-2', assignedAgentId: 'agent-ch2' })]
    const sessions = [makeSession({ channelId: 'ch-2', agentId: null })]
    const message = makeMessage({ channelId: 'ch-2' })

    const result = routeMessage(message, channels, sessions)
    expect(result).toBe('agent-ch2')
  })
})

// ─── getChannelForSession ───────────────────────────────────────

describe('getChannelForSession', () => {
  it('returns the channel for a valid session', () => {
    const channel = makeChannel({ id: 'ch-1' })
    const session = makeSession({ id: 'sess-1', channelId: 'ch-1' })

    const result = getChannelForSession('sess-1', [channel], [session])
    expect(result).toEqual(channel)
  })

  it('returns null when session is not found', () => {
    const channel = makeChannel()
    const result = getChannelForSession('nonexistent', [channel], [])
    expect(result).toBeNull()
  })

  it('returns null when channel is not found for the session', () => {
    const session = makeSession({ channelId: 'ch-missing' })
    const result = getChannelForSession('sess-1', [], [session])
    expect(result).toBeNull()
  })

  it('matches the correct channel among multiple channels', () => {
    const ch1 = makeChannel({ id: 'ch-1', name: 'Slack' })
    const ch2 = makeChannel({ id: 'ch-2', name: 'Discord' })
    const session = makeSession({ id: 'sess-1', channelId: 'ch-2' })

    const result = getChannelForSession('sess-1', [ch1, ch2], [session])
    expect(result).toEqual(ch2)
  })

  it('matches the correct session among multiple sessions', () => {
    const channel = makeChannel({ id: 'ch-1' })
    const sess1 = makeSession({ id: 'sess-1', channelId: 'ch-1' })
    const sess2 = makeSession({ id: 'sess-2', channelId: 'ch-1' })

    const result = getChannelForSession('sess-2', [channel], [sess1, sess2])
    expect(result).toEqual(channel)
  })
})
