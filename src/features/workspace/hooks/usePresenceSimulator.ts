import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Types ──────────────────────────────────────────────────────────

export interface PresenceUser {
  id: string
  name: string
  initials: string
  color: string
  cursorY: number
  isActive: boolean
}

// ─── Fake user pool ─────────────────────────────────────────────────

const SIMULATED_USERS: Array<{ id: string; name: string; initials: string; color: string }> = [
  { id: 'user-alex', name: 'Alex Kim', initials: 'AK', color: '#E94560' },
  { id: 'user-maya', name: 'Maya Chen', initials: 'MC', color: '#059669' },
  { id: 'user-sam', name: 'Sam Rivera', initials: 'SR', color: '#D97706' },
  { id: 'user-jordan', name: 'Jordan Lee', initials: 'JL', color: '#7C3AED' },
  { id: 'user-taylor', name: 'Taylor Wu', initials: 'TW', color: '#0891B2' },
]

// ─── Hook ───────────────────────────────────────────────────────────

export default function usePresenceSimulator(pageId: string): PresenceUser[] {
  const [users, setUsers] = useState<PresenceUser[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const generatePresence = useCallback(() => {
    // Pick 2-3 random users for this page
    const count = 2 + Math.floor(Math.random() * 2) // 2 or 3
    const shuffled = [...SIMULATED_USERS].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, count)

    return selected.map((u) => ({
      ...u,
      cursorY: 80 + Math.floor(Math.random() * 400),
      isActive: true,
    }))
  }, [])

  useEffect(() => {
    if (!pageId) {
      setUsers([])
      return
    }

    // Initialize users on mount
    setUsers(generatePresence())

    // Periodically update cursor positions to simulate movement
    intervalRef.current = setInterval(() => {
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          cursorY: Math.max(80, Math.min(600, u.cursorY + (Math.random() - 0.5) * 60)),
          isActive: Math.random() > 0.1, // 90% chance active
        }))
      )
    }, 3000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [pageId, generatePresence])

  return users
}
