import { create } from 'zustand'
import type { ResourceLock, ResourceConflict, GovernorDecision, ConflictResolutionPolicy } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export interface GovernorState {
  locks: Map<string, ResourceLock>
  conflicts: ResourceConflict[]
  policy: ConflictResolutionPolicy

  acquireLock: (resourceId: string, resourceType: string, agentId: string, priority: number) => GovernorDecision
  releaseLock: (resourceId: string, agentId: string) => void
  releaseAllLocks: (agentId: string) => void
  checkResource: (resourceId: string, agentId: string, priority: number) => GovernorDecision
  pruneExpiredLocks: () => void
  setPolicy: (policy: ConflictResolutionPolicy) => void
  getConflicts: () => ResourceConflict[]
}

const useGovernorStore = create<GovernorState>()((set, get) => ({
  locks: new Map(),
  conflicts: [],
  policy: 'priority_based',

  acquireLock: (resourceId, resourceType, agentId, priority) => {
    get().pruneExpiredLocks()

    const existing = get().locks.get(resourceId)

    if (!existing) {
      const lock: ResourceLock = {
        resourceId,
        resourceType,
        heldBy: agentId,
        acquiredAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30000).toISOString(),
        priority,
      }
      set((state) => {
        const newLocks = new Map(state.locks)
        newLocks.set(resourceId, lock)
        return { locks: newLocks }
      })
      return { allowed: true, reason: 'Lock acquired' }
    }

    if (existing.heldBy === agentId) {
      return { allowed: true, reason: 'Already held' }
    }

    const { policy } = get()

    if (policy === 'priority_based') {
      if (priority > existing.priority) {
        const lock: ResourceLock = {
          resourceId,
          resourceType,
          heldBy: agentId,
          acquiredAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30000).toISOString(),
          priority,
        }
        set((state) => {
          const newLocks = new Map(state.locks)
          newLocks.set(resourceId, lock)
          return { locks: newLocks }
        })
        return { allowed: true, reason: 'Lock acquired' }
      }
      const remainingMs = new Date(existing.expiresAt).getTime() - Date.now()
      return { allowed: false, reason: 'Lower priority', waitMs: Math.max(0, remainingMs) }
    }

    if (policy === 'first_come_first_served') {
      return { allowed: false, reason: 'Resource locked by another agent' }
    }

    // escalate_to_user
    const conflictId = generateId()
    const conflict: ResourceConflict = {
      id: conflictId,
      resourceId,
      contenders: [existing.heldBy, agentId],
      resolution: 'escalate_to_user',
      resolvedAt: null,
      winnerId: null,
    }
    set((state) => ({
      conflicts: [...state.conflicts, conflict],
    }))
    return { allowed: false, reason: 'Escalated to user', conflictId }
  },

  releaseLock: (resourceId, agentId) => {
    const existing = get().locks.get(resourceId)
    if (existing && existing.heldBy === agentId) {
      set((state) => {
        const newLocks = new Map(state.locks)
        newLocks.delete(resourceId)
        return { locks: newLocks }
      })
    }
  },

  releaseAllLocks: (agentId) => {
    set((state) => {
      const newLocks = new Map(state.locks)
      for (const [key, lock] of newLocks) {
        if (lock.heldBy === agentId) {
          newLocks.delete(key)
        }
      }
      return { locks: newLocks }
    })
  },

  checkResource: (resourceId, agentId, priority) => {
    const existing = get().locks.get(resourceId)

    if (!existing) {
      return { allowed: true, reason: 'Resource is free' }
    }

    if (existing.heldBy === agentId) {
      return { allowed: true, reason: 'Already held' }
    }

    if (new Date(existing.expiresAt).getTime() < Date.now()) {
      return { allowed: true, reason: 'Resource is free' }
    }

    const { policy } = get()

    if (policy === 'priority_based') {
      if (priority > existing.priority) {
        return { allowed: true, reason: 'Higher priority would evict' }
      }
      const remainingMs = new Date(existing.expiresAt).getTime() - Date.now()
      return { allowed: false, reason: 'Lower priority', waitMs: Math.max(0, remainingMs) }
    }

    if (policy === 'first_come_first_served') {
      return { allowed: false, reason: 'Resource locked by another agent' }
    }

    return { allowed: false, reason: 'Escalation required' }
  },

  pruneExpiredLocks: () => {
    const now = Date.now()
    set((state) => {
      const newLocks = new Map(state.locks)
      let changed = false
      for (const [key, lock] of newLocks) {
        if (new Date(lock.expiresAt).getTime() < now) {
          newLocks.delete(key)
          changed = true
        }
      }
      return changed ? { locks: newLocks } : state
    })
  },

  setPolicy: (policy) => {
    set({ policy })
  },

  getConflicts: () => {
    return get().conflicts
  },
}))

export default useGovernorStore
