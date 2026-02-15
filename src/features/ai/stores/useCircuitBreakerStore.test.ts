import { describe, it, expect, beforeEach } from 'vitest'
import useCircuitBreakerStore from './useCircuitBreakerStore'

describe('useCircuitBreakerStore', () => {
  beforeEach(() => {
    useCircuitBreakerStore.setState({
      breakers: new Map(),
    })
  })

  describe('getBreaker', () => {
    it('auto-creates breaker in closed state', () => {
      const breaker = useCircuitBreakerStore.getState().getBreaker('connector-1')
      expect(breaker.connectorId).toBe('connector-1')
      expect(breaker.state).toBe('closed')
      expect(breaker.failureCount).toBe(0)
      expect(breaker.successCount).toBe(0)
      expect(breaker.failureThreshold).toBe(5)
      expect(breaker.resetTimeoutMs).toBe(60000)
      expect(breaker.halfOpenMaxTests).toBe(1)
    })
  })

  describe('checkBreaker', () => {
    it('allows when closed', () => {
      const result = useCircuitBreakerStore.getState().checkBreaker('connector-1')
      expect(result.allowed).toBe(true)
      expect(result.state).toBe('closed')
      expect(result.reason).toBe('Circuit closed')
    })

    it('denies when open and retry time not reached', () => {
      // Manually set an open breaker with future retry
      const breakers = new Map()
      breakers.set('connector-1', {
        connectorId: 'connector-1',
        state: 'open' as const,
        failureCount: 5,
        successCount: 0,
        lastFailureAt: new Date().toISOString(),
        lastSuccessAt: null,
        openedAt: new Date().toISOString(),
        nextRetryAt: new Date(Date.now() + 60000).toISOString(),
        failureThreshold: 5,
        resetTimeoutMs: 60000,
        halfOpenMaxTests: 1,
      })
      useCircuitBreakerStore.setState({ breakers })

      const result = useCircuitBreakerStore.getState().checkBreaker('connector-1')
      expect(result.allowed).toBe(false)
      expect(result.state).toBe('open')
    })

    it('transitions to half_open when retry time passed', () => {
      const breakers = new Map()
      breakers.set('connector-1', {
        connectorId: 'connector-1',
        state: 'open' as const,
        failureCount: 5,
        successCount: 0,
        lastFailureAt: new Date().toISOString(),
        lastSuccessAt: null,
        openedAt: new Date().toISOString(),
        nextRetryAt: new Date(Date.now() - 1000).toISOString(),
        failureThreshold: 5,
        resetTimeoutMs: 60000,
        halfOpenMaxTests: 1,
      })
      useCircuitBreakerStore.setState({ breakers })

      const result = useCircuitBreakerStore.getState().checkBreaker('connector-1')
      expect(result.allowed).toBe(true)
      expect(result.state).toBe('half_open')
      expect(result.reason).toBe('Testing circuit')
    })

    it('allows when half_open', () => {
      const breakers = new Map()
      breakers.set('connector-1', {
        connectorId: 'connector-1',
        state: 'half_open' as const,
        failureCount: 5,
        successCount: 0,
        lastFailureAt: new Date().toISOString(),
        lastSuccessAt: null,
        openedAt: new Date().toISOString(),
        nextRetryAt: null,
        failureThreshold: 5,
        resetTimeoutMs: 60000,
        halfOpenMaxTests: 1,
      })
      useCircuitBreakerStore.setState({ breakers })

      const result = useCircuitBreakerStore.getState().checkBreaker('connector-1')
      expect(result.allowed).toBe(true)
      expect(result.state).toBe('half_open')
      expect(result.reason).toBe('Half-open test request')
    })
  })

  describe('recordFailure', () => {
    it('trips circuit to open after threshold', () => {
      const store = useCircuitBreakerStore.getState()
      store.getBreaker('connector-1')
      for (let i = 0; i < 5; i++) {
        useCircuitBreakerStore.getState().recordFailure('connector-1')
      }
      const breaker = useCircuitBreakerStore.getState().breakers.get('connector-1')!
      expect(breaker.state).toBe('open')
      expect(breaker.failureCount).toBe(5)
      expect(breaker.openedAt).toBeTruthy()
      expect(breaker.nextRetryAt).toBeTruthy()
    })

    it('trips from half_open on single failure', () => {
      const breakers = new Map()
      breakers.set('connector-1', {
        connectorId: 'connector-1',
        state: 'half_open' as const,
        failureCount: 0,
        successCount: 0,
        lastFailureAt: null,
        lastSuccessAt: null,
        openedAt: new Date().toISOString(),
        nextRetryAt: null,
        failureThreshold: 5,
        resetTimeoutMs: 60000,
        halfOpenMaxTests: 1,
      })
      useCircuitBreakerStore.setState({ breakers })

      useCircuitBreakerStore.getState().recordFailure('connector-1')
      const breaker = useCircuitBreakerStore.getState().breakers.get('connector-1')!
      expect(breaker.state).toBe('open')
    })
  })

  describe('recordSuccess', () => {
    it('transitions half_open to closed after enough successes', () => {
      const breakers = new Map()
      breakers.set('connector-1', {
        connectorId: 'connector-1',
        state: 'half_open' as const,
        failureCount: 5,
        successCount: 0,
        lastFailureAt: null,
        lastSuccessAt: null,
        openedAt: new Date().toISOString(),
        nextRetryAt: null,
        failureThreshold: 5,
        resetTimeoutMs: 60000,
        halfOpenMaxTests: 1,
      })
      useCircuitBreakerStore.setState({ breakers })

      useCircuitBreakerStore.getState().recordSuccess('connector-1')
      const breaker = useCircuitBreakerStore.getState().breakers.get('connector-1')!
      expect(breaker.state).toBe('closed')
      expect(breaker.failureCount).toBe(0)
      expect(breaker.successCount).toBe(0)
    })
  })

  describe('resetBreaker', () => {
    it('resets to closed', () => {
      const breakers = new Map()
      breakers.set('connector-1', {
        connectorId: 'connector-1',
        state: 'open' as const,
        failureCount: 10,
        successCount: 0,
        lastFailureAt: new Date().toISOString(),
        lastSuccessAt: null,
        openedAt: new Date().toISOString(),
        nextRetryAt: new Date(Date.now() + 60000).toISOString(),
        failureThreshold: 5,
        resetTimeoutMs: 60000,
        halfOpenMaxTests: 1,
      })
      useCircuitBreakerStore.setState({ breakers })

      useCircuitBreakerStore.getState().resetBreaker('connector-1')
      const breaker = useCircuitBreakerStore.getState().breakers.get('connector-1')!
      expect(breaker.state).toBe('closed')
      expect(breaker.failureCount).toBe(0)
      expect(breaker.successCount).toBe(0)
      expect(breaker.openedAt).toBeNull()
      expect(breaker.nextRetryAt).toBeNull()
    })
  })
})
