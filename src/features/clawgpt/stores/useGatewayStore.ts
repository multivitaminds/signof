import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session } from '../types'
import { GatewayStatus, ChannelType } from '../types'
import type { ChannelType as ChannelTypeT } from '../types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

interface GatewayState {
  gatewayStatus: GatewayStatus
  activeSessions: Session[]
  totalMessagesToday: number
  uptimeSince: string | null

  startGateway: () => void
  stopGateway: () => void
  createSession: (channelId: string, channelType: ChannelTypeT, contactName: string) => string
  closeSession: (sessionId: string) => void
  updateSession: (sessionId: string, updates: Partial<Session>) => void
  getSessionsByChannel: (channelId: string) => Session[]
  getActiveSessionCount: () => number
  incrementMessageCount: () => void
}

const SAMPLE_SESSIONS: Session[] = [
  {
    id: 'session-1',
    channelId: 'ch-slack',
    channelType: ChannelType.Slack,
    contactId: 'contact-1',
    contactName: 'Sarah Connor',
    contactAvatar: null,
    lastMessage: 'Can you add the team members?',
    lastMessageAt: '2025-06-15T09:32:00Z',
    startedAt: '2025-06-15T09:00:00Z',
    agentId: null,
    isActive: true,
  },
  {
    id: 'session-2',
    channelId: 'ch-email',
    channelType: ChannelType.Email,
    contactId: 'contact-2',
    contactName: 'John Doe',
    contactAvatar: null,
    lastMessage: 'Yes, please forward it to john@acme.com. Thanks!',
    lastMessageAt: '2025-06-15T09:15:00Z',
    startedAt: '2025-06-15T08:45:00Z',
    agentId: null,
    isActive: true,
  },
  {
    id: 'session-3',
    channelId: 'ch-webchat',
    channelType: ChannelType.WebChat,
    contactId: 'contact-3',
    contactName: 'Anonymous Visitor',
    contactAvatar: null,
    lastMessage: 'Yes please, especially the Pro plan.',
    lastMessageAt: '2025-06-15T10:05:00Z',
    startedAt: '2025-06-15T10:00:00Z',
    agentId: null,
    isActive: true,
  },
]

export const useGatewayStore = create<GatewayState>()(
  persist(
    (_set, get) => ({
      gatewayStatus: GatewayStatus.Offline as GatewayStatus,
      activeSessions: SAMPLE_SESSIONS,
      totalMessagesToday: 47,
      uptimeSince: null,

      startGateway: () => {
        _set({
          gatewayStatus: GatewayStatus.Online,
          uptimeSince: new Date().toISOString(),
        })
      },

      stopGateway: () => {
        _set({
          gatewayStatus: GatewayStatus.Offline,
          uptimeSince: null,
        })
      },

      createSession: (channelId, channelType, contactName) => {
        const id = rid()
        const now = new Date().toISOString()
        const session: Session = {
          id,
          channelId,
          channelType,
          contactId: rid(),
          contactName,
          contactAvatar: null,
          lastMessage: '',
          lastMessageAt: now,
          startedAt: now,
          agentId: null,
          isActive: true,
        }
        _set((s) => ({
          activeSessions: [...s.activeSessions, session],
        }))
        return id
      },

      closeSession: (sessionId) => {
        _set((s) => ({
          activeSessions: s.activeSessions.map((sess) =>
            sess.id === sessionId ? { ...sess, isActive: false } : sess
          ),
        }))
      },

      updateSession: (sessionId, updates) => {
        _set((s) => ({
          activeSessions: s.activeSessions.map((sess) =>
            sess.id === sessionId ? { ...sess, ...updates } : sess
          ),
        }))
      },

      getSessionsByChannel: (channelId) => {
        return get().activeSessions.filter((s) => s.channelId === channelId)
      },

      getActiveSessionCount: () => {
        return get().activeSessions.filter((s) => s.isActive).length
      },

      incrementMessageCount: () => {
        _set((s) => ({
          totalMessagesToday: s.totalMessagesToday + 1,
        }))
      },
    }),
    { name: 'orchestree-gateway-storage' }
  )
)
