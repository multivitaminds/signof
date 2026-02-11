import { useEffect, useState, useSyncExternalStore } from 'react'

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

function generatePresence(): PresenceUser[] {
  const count = 2 + Math.floor(Math.random() * 2)
  const shuffled = [...SIMULATED_USERS].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, count)
  return selected.map((u) => ({
    ...u,
    cursorY: 80 + Math.floor(Math.random() * 400),
    isActive: true,
  }))
}

const EMPTY: PresenceUser[] = []

// ─── External store for presence simulation ─────────────────────────

function createPresenceStore() {
  let state: PresenceUser[] = EMPTY
  const listeners = new Set<() => void>()

  function emit() {
    for (const fn of listeners) fn()
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    getSnapshot() {
      return state
    },
    setState(next: PresenceUser[]) {
      state = next
      emit()
    },
    updateUsers() {
      state = state.map((u) => ({
        ...u,
        cursorY: Math.max(80, Math.min(600, u.cursorY + (Math.random() - 0.5) * 60)),
        isActive: Math.random() > 0.1,
      }))
      emit()
    },
  }
}

// ─── Hook ───────────────────────────────────────────────────────────

export default function usePresenceSimulator(pageId: string): PresenceUser[] {
  const [store] = useState(() => createPresenceStore())

  useEffect(() => {
    if (!pageId) {
      store.setState(EMPTY)
      return
    }

    store.setState(generatePresence())

    const intervalId = setInterval(() => {
      store.updateUsers()
    }, 3000)

    return () => {
      clearInterval(intervalId)
      store.setState(EMPTY)
    }
  }, [pageId, store])

  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}
