import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, FleetMetrics } from '../types'
import { GatewayStatus } from '../types'
import type { ChannelType as ChannelTypeT } from '../types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

interface GatewayState {
  gatewayStatus: GatewayStatus
  activeSessions: Session[]
  totalMessagesToday: number
  uptimeSince: string | null
  fleetMetrics: FleetMetrics | null
  reconnectAttempts: number
  maxReconnectAttempts: number

  startGateway: () => void
  stopGateway: () => void
  setGatewayStatus: (status: GatewayStatus) => void
  createSession: (channelId: string, channelType: ChannelTypeT, contactName: string) => string
  closeSession: (sessionId: string) => void
  updateSession: (sessionId: string, updates: Partial<Session>) => void
  loadSessions: (sessions: Session[]) => void
  getSessionsByChannel: (channelId: string) => Session[]
  getActiveSessionCount: () => number
  incrementMessageCount: () => void
  setFleetMetrics: (metrics: FleetMetrics) => void
}

export const useGatewayStore = create<GatewayState>()(
  persist(
    (_set, get) => ({
      gatewayStatus: GatewayStatus.Offline as GatewayStatus,
      activeSessions: [],
      totalMessagesToday: 0,
      uptimeSince: null,
      fleetMetrics: null,
      reconnectAttempts: 0,
      maxReconnectAttempts: 10,

      startGateway: () => {
        // Import dynamically to avoid circular dependency
        import('../lib/gatewayClient').then(({ connectGateway }) => {
          connectGateway()
        })
        _set({
          gatewayStatus: GatewayStatus.Degraded,
          uptimeSince: new Date().toISOString(),
        })
      },

      stopGateway: () => {
        import('../lib/gatewayClient').then(({ disconnectGateway }) => {
          disconnectGateway()
        })
        _set({
          gatewayStatus: GatewayStatus.Offline,
          uptimeSince: null,
        })
      },

      setGatewayStatus: (status) => {
        _set((s) => ({
          gatewayStatus: status,
          uptimeSince: status === GatewayStatus.Online
            ? s.uptimeSince ?? new Date().toISOString()
            : status === GatewayStatus.Offline
              ? null
              : s.uptimeSince,
        }))
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

      loadSessions: (sessions) => {
        _set({ activeSessions: sessions })
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

      setFleetMetrics: (metrics) => {
        _set({ fleetMetrics: metrics })
      },
    }),
    { name: 'orchestree-gateway-storage' }
  )
)
