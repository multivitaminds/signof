import { useState, useEffect, useCallback, useRef } from 'react'
import { getWebSocket } from '../lib/websocket'

export interface PresenceUser {
  id: string
  name: string
  color: string
  cursorY: number | null
  status: 'active' | 'idle' | 'away'
  lastSeen: number
}

interface UsePresenceOptions {
  pageId: string
  userName: string
  userId: string
}

interface UsePresenceResult {
  users: PresenceUser[]
  isConnected: boolean
  connectionMode: 'websocket' | 'simulated'
  updateCursor: (y: number) => void
}

const COLORS = ['#7C5CFC', '#F97316', '#06B6D4', '#10B981', '#EF4444']
const FAKE_USERS = [
  { id: 'sim-1', name: 'Alex Kim' },
  { id: 'sim-2', name: 'Maya Chen' },
  { id: 'sim-3', name: 'Sam Rivera' },
  { id: 'sim-4', name: 'Jordan Lee' },
  { id: 'sim-5', name: 'Taylor Wu' },
]

/** Real-time presence with WebSocket, falls back to simulation */
export function usePresence(options: UsePresenceOptions): UsePresenceResult {
  const { pageId, userName, userId } = options
  const [users, setUsers] = useState<PresenceUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const wsUrl = typeof import.meta !== 'undefined' ? import.meta.env.VITE_WS_URL : undefined
  const useWebSocket = Boolean(wsUrl)
  const intervalRef = useRef<number | null>(null)

  const updateCursor = useCallback(
    (y: number) => {
      if (useWebSocket) {
        const ws = getWebSocket()
        ws?.send('presence:cursor', { pageId, userId, userName, cursorY: y })
      }
    },
    [useWebSocket, pageId, userId, userName]
  )

  // WebSocket mode
  useEffect(() => {
    if (!useWebSocket || !wsUrl) return

    const ws = getWebSocket({ url: wsUrl, onOpen: () => setIsConnected(true), onClose: () => setIsConnected(false) })
    if (!ws) return

    ws.connect()
    ws.send('presence:join', { pageId, userId, userName })

    const unsub = ws.on('presence:update', (data) => {
      const presenceData = data as PresenceUser[]
      setUsers(presenceData.filter((u) => u.id !== userId))
    })

    return () => {
      unsub()
      ws.send('presence:leave', { pageId, userId })
    }
  }, [useWebSocket, wsUrl, pageId, userId, userName])

  // Simulation mode — generate initial users once, animate via interval
  useEffect(() => {
    if (useWebSocket) return

    const simUsers = FAKE_USERS.slice(0, 2 + Math.floor(Math.random() * 3)).map((u, i) => ({
      ...u,
      color: COLORS[i % COLORS.length] ?? '#7C5CFC',
      cursorY: Math.random() * 600,
      status: 'active' as const,
      lastSeen: Date.now(),
    }))

    // Use functional update in first tick to seed initial users
    const seedTimer = window.setTimeout(() => {
      setUsers(simUsers)
    }, 0)

    intervalRef.current = window.setInterval(() => {
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          cursorY: Math.random() > 0.3 ? Math.random() * 600 : u.cursorY,
          status: Math.random() > 0.1 ? 'active' as const : 'idle' as const,
          lastSeen: Date.now(),
        }))
      )
    }, 3000)

    return () => {
      clearTimeout(seedTimer)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [useWebSocket])

  return {
    users,
    isConnected,
    connectionMode: useWebSocket ? 'websocket' : 'simulated',
    updateCursor,
  }
}
