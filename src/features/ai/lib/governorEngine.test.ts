import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { ParsedAction } from '../types'

const { mockAcquireLock, mockReleaseLock, mockCheckResource } = vi.hoisted(() => ({
  mockAcquireLock: vi.fn().mockReturnValue({ allowed: true, reason: 'Lock acquired' }),
  mockReleaseLock: vi.fn(),
  mockCheckResource: vi.fn().mockReturnValue({ allowed: true, reason: 'Free' }),
}))

vi.mock('../stores/useGovernorStore', () => ({
  default: {
    getState: vi.fn().mockReturnValue({
      acquireLock: mockAcquireLock,
      releaseLock: mockReleaseLock,
      checkResource: mockCheckResource,
    }),
  },
}))

import { buildResourceId, checkActionAllowed, acquireActionLock, releaseActionLock } from './governorEngine'

function makeAction(overrides: Partial<ParsedAction>): ParsedAction {
  return {
    type: 'none',
    params: {},
    description: 'test action',
    ...overrides,
  }
}

describe('governorEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('buildResourceId', () => {
    it('returns connector:<id> for connector actions', () => {
      const result = buildResourceId(makeAction({ type: 'connector', connectorId: 'gmail' }))
      expect(result).toBe('connector:gmail')
    })

    it('returns tool:<name> for tool actions', () => {
      const result = buildResourceId(makeAction({ type: 'tool', toolName: 'create_page' }))
      expect(result).toBe('tool:create_page')
    })

    it('returns workflow:<id> for workflow actions', () => {
      const result = buildResourceId(makeAction({ type: 'workflow', workflowId: 'wf-123' }))
      expect(result).toBe('workflow:wf-123')
    })

    it('returns null for message actions', () => {
      expect(buildResourceId(makeAction({ type: 'message' }))).toBeNull()
    })

    it('returns null for none actions', () => {
      expect(buildResourceId(makeAction({ type: 'none' }))).toBeNull()
    })

    it('returns null for connector without connectorId', () => {
      expect(buildResourceId(makeAction({ type: 'connector' }))).toBeNull()
    })

    it('returns null for tool without toolName', () => {
      expect(buildResourceId(makeAction({ type: 'tool' }))).toBeNull()
    })
  })

  describe('checkActionAllowed', () => {
    it('calls checkResource for connector actions', () => {
      const action = makeAction({ type: 'connector', connectorId: 'gmail' })
      const result = checkActionAllowed(action, 'agent-1', 5)
      expect(mockCheckResource).toHaveBeenCalledWith('connector:gmail', 'agent-1', 5)
      expect(result.allowed).toBe(true)
    })

    it('returns allowed for message (no lock needed)', () => {
      const action = makeAction({ type: 'message' })
      const result = checkActionAllowed(action, 'agent-1', 5)
      expect(result.allowed).toBe(true)
      expect(result.reason).toBe('No lock required')
      expect(mockCheckResource).not.toHaveBeenCalled()
    })
  })

  describe('acquireActionLock', () => {
    it('calls acquireLock for tool actions', () => {
      const action = makeAction({ type: 'tool', toolName: 'create_page' })
      const result = acquireActionLock(action, 'agent-1', 5)
      expect(mockAcquireLock).toHaveBeenCalledWith('tool:create_page', 'tool', 'agent-1', 5)
      expect(result.allowed).toBe(true)
    })

    it('returns allowed without calling store for none actions', () => {
      const action = makeAction({ type: 'none' })
      const result = acquireActionLock(action, 'agent-1', 5)
      expect(result.allowed).toBe(true)
      expect(result.reason).toBe('No lock required')
      expect(mockAcquireLock).not.toHaveBeenCalled()
    })
  })

  describe('releaseActionLock', () => {
    it('calls releaseLock for connector actions', () => {
      const action = makeAction({ type: 'connector', connectorId: 'gmail' })
      releaseActionLock(action, 'agent-1')
      expect(mockReleaseLock).toHaveBeenCalledWith('connector:gmail', 'agent-1')
    })

    it('does nothing for message actions', () => {
      const action = makeAction({ type: 'message' })
      releaseActionLock(action, 'agent-1')
      expect(mockReleaseLock).not.toHaveBeenCalled()
    })

    it('does nothing for none actions', () => {
      const action = makeAction({ type: 'none' })
      releaseActionLock(action, 'agent-1')
      expect(mockReleaseLock).not.toHaveBeenCalled()
    })
  })
})
