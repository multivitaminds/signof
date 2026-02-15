import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ParsedAction } from '../types'

const { mockCheckBreaker, mockRecordSuccess, mockRecordFailure } = vi.hoisted(() => ({
  mockCheckBreaker: vi.fn().mockReturnValue({ allowed: true, state: 'closed', reason: 'Circuit closed' }),
  mockRecordSuccess: vi.fn(),
  mockRecordFailure: vi.fn(),
}))

vi.mock('../stores/useCircuitBreakerStore', () => ({
  default: {
    getState: vi.fn().mockReturnValue({
      checkBreaker: mockCheckBreaker,
      recordSuccess: mockRecordSuccess,
      recordFailure: mockRecordFailure,
    }),
  },
}))

import { checkActionCircuit, recordActionOutcome } from './circuitBreakerEngine'

describe('circuitBreakerEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkActionCircuit', () => {
    it('returns null for non-connector actions', () => {
      const action: ParsedAction = {
        type: 'tool',
        toolName: 'search',
        params: {},
        description: 'Search something',
      }
      expect(checkActionCircuit(action)).toBeNull()
    })

    it('returns null for connector actions without connectorId', () => {
      const action: ParsedAction = {
        type: 'connector',
        params: {},
        description: 'Some connector action',
      }
      expect(checkActionCircuit(action)).toBeNull()
    })

    it('returns check result for connector actions', () => {
      const action: ParsedAction = {
        type: 'connector',
        connectorId: 'slack',
        actionId: 'send_message',
        params: {},
        description: 'Send Slack message',
      }
      const result = checkActionCircuit(action)
      expect(result).toEqual({ allowed: true, state: 'closed', reason: 'Circuit closed' })
      expect(mockCheckBreaker).toHaveBeenCalledWith('slack')
    })
  })

  describe('recordActionOutcome', () => {
    it('calls recordSuccess on success', () => {
      const action: ParsedAction = {
        type: 'connector',
        connectorId: 'slack',
        params: {},
        description: 'Send message',
      }
      recordActionOutcome(action, true)
      expect(mockRecordSuccess).toHaveBeenCalledWith('slack')
      expect(mockRecordFailure).not.toHaveBeenCalled()
    })

    it('calls recordFailure on failure', () => {
      const action: ParsedAction = {
        type: 'connector',
        connectorId: 'slack',
        params: {},
        description: 'Send message',
      }
      recordActionOutcome(action, false)
      expect(mockRecordFailure).toHaveBeenCalledWith('slack')
      expect(mockRecordSuccess).not.toHaveBeenCalled()
    })

    it('does nothing for non-connector actions', () => {
      const action: ParsedAction = {
        type: 'tool',
        toolName: 'search',
        params: {},
        description: 'Search',
      }
      recordActionOutcome(action, true)
      expect(mockRecordSuccess).not.toHaveBeenCalled()
      expect(mockRecordFailure).not.toHaveBeenCalled()
    })

    it('does nothing for message actions', () => {
      const action: ParsedAction = {
        type: 'message',
        params: {},
        description: 'Send message',
      }
      recordActionOutcome(action, false)
      expect(mockRecordSuccess).not.toHaveBeenCalled()
      expect(mockRecordFailure).not.toHaveBeenCalled()
    })
  })
})
