import { describe, it, expect, beforeEach } from 'vitest'
import useGovernorStore from './useGovernorStore'

describe('useGovernorStore', () => {
  beforeEach(() => {
    useGovernorStore.setState({
      locks: new Map(),
      conflicts: [],
      policy: 'priority_based',
    })
  })

  describe('acquireLock', () => {
    it('acquires lock on free resource', () => {
      const result = useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-1', 5)
      expect(result.allowed).toBe(true)
      expect(result.reason).toBe('Lock acquired')
      expect(useGovernorStore.getState().locks.has('res-1')).toBe(true)
      expect(useGovernorStore.getState().locks.get('res-1')!.heldBy).toBe('agent-1')
    })

    it('returns already-held for same agent', () => {
      useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-1', 5)
      const result = useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-1', 5)
      expect(result.allowed).toBe(true)
      expect(result.reason).toBe('Already held')
    })

    it('priority-based: higher priority evicts lower', () => {
      useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-1', 3)
      const result = useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-2', 8)
      expect(result.allowed).toBe(true)
      expect(result.reason).toBe('Lock acquired')
      expect(useGovernorStore.getState().locks.get('res-1')!.heldBy).toBe('agent-2')
    })

    it('priority-based: lower priority denied', () => {
      useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-1', 8)
      const result = useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-2', 3)
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Lower priority')
      expect(result.waitMs).toBeGreaterThan(0)
    })

    it('first_come_first_served: denies contender', () => {
      useGovernorStore.getState().setPolicy('first_come_first_served')
      useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-1', 3)
      const result = useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-2', 8)
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Resource locked by another agent')
    })

    it('escalate_to_user: creates conflict, denies', () => {
      useGovernorStore.getState().setPolicy('escalate_to_user')
      useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-1', 5)
      const result = useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-2', 8)
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Escalated to user')
      expect(result.conflictId).toBeTruthy()
      const conflicts = useGovernorStore.getState().getConflicts()
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0]!.contenders).toContain('agent-1')
      expect(conflicts[0]!.contenders).toContain('agent-2')
    })
  })

  describe('releaseLock', () => {
    it('releases lock held by agent', () => {
      useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-1', 5)
      useGovernorStore.getState().releaseLock('res-1', 'agent-1')
      expect(useGovernorStore.getState().locks.has('res-1')).toBe(false)
    })

    it('does not release lock held by different agent', () => {
      useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-1', 5)
      useGovernorStore.getState().releaseLock('res-1', 'agent-2')
      expect(useGovernorStore.getState().locks.has('res-1')).toBe(true)
      expect(useGovernorStore.getState().locks.get('res-1')!.heldBy).toBe('agent-1')
    })
  })

  describe('releaseAllLocks', () => {
    it('releases all locks for agent, keeps others', () => {
      useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-1', 5)
      useGovernorStore.getState().acquireLock('res-2', 'tool', 'agent-1', 5)
      useGovernorStore.getState().acquireLock('res-3', 'workflow', 'agent-2', 5)

      useGovernorStore.getState().releaseAllLocks('agent-1')

      expect(useGovernorStore.getState().locks.has('res-1')).toBe(false)
      expect(useGovernorStore.getState().locks.has('res-2')).toBe(false)
      expect(useGovernorStore.getState().locks.has('res-3')).toBe(true)
      expect(useGovernorStore.getState().locks.get('res-3')!.heldBy).toBe('agent-2')
    })
  })

  describe('pruneExpiredLocks', () => {
    it('removes expired locks', () => {
      useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-1', 5)
      // Manually set expiresAt to the past
      const locks = new Map(useGovernorStore.getState().locks)
      const lock = locks.get('res-1')!
      locks.set('res-1', { ...lock, expiresAt: new Date(Date.now() - 1000).toISOString() })
      useGovernorStore.setState({ locks })

      useGovernorStore.getState().pruneExpiredLocks()
      expect(useGovernorStore.getState().locks.has('res-1')).toBe(false)
    })

    it('keeps non-expired locks', () => {
      useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-1', 5)
      useGovernorStore.getState().pruneExpiredLocks()
      expect(useGovernorStore.getState().locks.has('res-1')).toBe(true)
    })
  })

  describe('checkResource', () => {
    it('returns allowed for free resource', () => {
      const result = useGovernorStore.getState().checkResource('res-1', 'agent-1', 5)
      expect(result.allowed).toBe(true)
    })

    it('returns denied for locked resource without mutating', () => {
      useGovernorStore.getState().acquireLock('res-1', 'connector', 'agent-1', 8)
      const locksBefore = useGovernorStore.getState().locks.size

      const result = useGovernorStore.getState().checkResource('res-1', 'agent-2', 3)
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Lower priority')

      // Verify no mutation
      expect(useGovernorStore.getState().locks.size).toBe(locksBefore)
      expect(useGovernorStore.getState().locks.get('res-1')!.heldBy).toBe('agent-1')
    })
  })
})
