import { describe, it, expect, beforeEach } from 'vitest'
import { useGatewayStore } from './useGatewayStore'

describe('useGatewayStore', () => {
  beforeEach(() => {
    useGatewayStore.setState({
      gatewayStatus: 'offline',
      activeSessions: [],
      totalMessagesToday: 0,
      uptimeSince: null,
    })
  })

  it('starts in offline state', () => {
    const state = useGatewayStore.getState()
    expect(state.gatewayStatus).toBe('offline')
    expect(state.uptimeSince).toBeNull()
    expect(state.totalMessagesToday).toBe(0)
    expect(state.activeSessions).toHaveLength(0)
  })

  describe('startGateway', () => {
    it('sets status to online and records uptime', () => {
      useGatewayStore.getState().startGateway()
      const state = useGatewayStore.getState()
      expect(state.gatewayStatus).toBe('online')
      expect(state.uptimeSince).toBeTruthy()
    })
  })

  describe('stopGateway', () => {
    it('sets status to offline and clears uptime', () => {
      useGatewayStore.getState().startGateway()
      useGatewayStore.getState().stopGateway()
      const state = useGatewayStore.getState()
      expect(state.gatewayStatus).toBe('offline')
      expect(state.uptimeSince).toBeNull()
    })
  })

  describe('createSession', () => {
    it('creates a new session and returns the id', () => {
      const id = useGatewayStore.getState().createSession('ch-slack', 'slack', 'Test User')
      expect(id).toBeTruthy()
      const state = useGatewayStore.getState()
      expect(state.activeSessions).toHaveLength(1)
      expect(state.activeSessions[0]!.channelId).toBe('ch-slack')
      expect(state.activeSessions[0]!.channelType).toBe('slack')
      expect(state.activeSessions[0]!.contactName).toBe('Test User')
      expect(state.activeSessions[0]!.contactId).toBeTruthy()
      expect(state.activeSessions[0]!.contactAvatar).toBeNull()
      expect(state.activeSessions[0]!.lastMessage).toBe('')
      expect(state.activeSessions[0]!.agentId).toBeNull()
      expect(state.activeSessions[0]!.isActive).toBe(true)
    })

    it('adds multiple sessions', () => {
      useGatewayStore.getState().createSession('ch-slack', 'slack', 'User A')
      useGatewayStore.getState().createSession('ch-email', 'email', 'User B')
      expect(useGatewayStore.getState().activeSessions).toHaveLength(2)
    })
  })

  describe('closeSession', () => {
    it('sets isActive to false on the session', () => {
      const id = useGatewayStore.getState().createSession('ch-slack', 'slack', 'User')
      useGatewayStore.getState().closeSession(id)
      const session = useGatewayStore.getState().activeSessions.find((s) => s.id === id)
      expect(session!.isActive).toBe(false)
    })

    it('does not affect other sessions', () => {
      const id1 = useGatewayStore.getState().createSession('ch-slack', 'slack', 'User A')
      useGatewayStore.getState().createSession('ch-email', 'email', 'User B')
      useGatewayStore.getState().closeSession(id1)
      const sessions = useGatewayStore.getState().activeSessions
      expect(sessions.find((s) => s.id === id1)!.isActive).toBe(false)
      expect(sessions[1]!.isActive).toBe(true)
    })
  })

  describe('updateSession', () => {
    it('updates session fields', () => {
      const id = useGatewayStore.getState().createSession('ch-slack', 'slack', 'User')
      useGatewayStore.getState().updateSession(id, { lastMessage: 'Hello', contactName: 'Updated User' })
      const session = useGatewayStore.getState().activeSessions.find((s) => s.id === id)
      expect(session!.lastMessage).toBe('Hello')
      expect(session!.contactName).toBe('Updated User')
    })
  })

  describe('getSessionsByChannel', () => {
    it('returns sessions for a specific channel', () => {
      useGatewayStore.getState().createSession('ch-slack', 'slack', 'User A')
      useGatewayStore.getState().createSession('ch-slack', 'slack', 'User B')
      useGatewayStore.getState().createSession('ch-email', 'email', 'User C')
      const slackSessions = useGatewayStore.getState().getSessionsByChannel('ch-slack')
      expect(slackSessions).toHaveLength(2)
    })

    it('returns empty array for unknown channel', () => {
      const sessions = useGatewayStore.getState().getSessionsByChannel('ch-nonexistent')
      expect(sessions).toHaveLength(0)
    })
  })

  describe('getActiveSessionCount', () => {
    it('counts only active sessions', () => {
      const id1 = useGatewayStore.getState().createSession('ch-slack', 'slack', 'A')
      useGatewayStore.getState().createSession('ch-email', 'email', 'B')
      useGatewayStore.getState().createSession('ch-webchat', 'web_chat', 'C')
      useGatewayStore.getState().closeSession(id1)
      expect(useGatewayStore.getState().getActiveSessionCount()).toBe(2)
    })

    it('returns 0 when no sessions', () => {
      expect(useGatewayStore.getState().getActiveSessionCount()).toBe(0)
    })
  })

  describe('incrementMessageCount', () => {
    it('increments the total message count', () => {
      useGatewayStore.getState().incrementMessageCount()
      useGatewayStore.getState().incrementMessageCount()
      useGatewayStore.getState().incrementMessageCount()
      expect(useGatewayStore.getState().totalMessagesToday).toBe(3)
    })
  })
})
