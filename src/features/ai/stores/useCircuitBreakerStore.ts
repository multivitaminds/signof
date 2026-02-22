import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CircuitState } from '../types'
import type { CircuitBreaker, CircuitBreakerCheckResult } from '../types'

export interface CircuitBreakerState {
  breakers: Map<string, CircuitBreaker>

  getBreaker: (connectorId: string) => CircuitBreaker
  checkBreaker: (connectorId: string) => CircuitBreakerCheckResult
  recordFailure: (connectorId: string) => void
  recordSuccess: (connectorId: string) => void
  resetBreaker: (connectorId: string) => void
}

function createDefaultBreaker(connectorId: string): CircuitBreaker {
  return {
    connectorId,
    state: CircuitState.Closed,
    failureCount: 0,
    successCount: 0,
    lastFailureAt: null,
    lastSuccessAt: null,
    openedAt: null,
    nextRetryAt: null,
    failureThreshold: 5,
    resetTimeoutMs: 60000,
    halfOpenMaxTests: 1,
  }
}

const useCircuitBreakerStore = create<CircuitBreakerState>()(
  persist(
    (set, get) => ({
      breakers: new Map(),

      getBreaker: (connectorId) => {
        const existing = get().breakers.get(connectorId)
        if (existing) return existing
        const breaker = createDefaultBreaker(connectorId)
        set((state) => {
          const newBreakers = new Map(state.breakers)
          newBreakers.set(connectorId, breaker)
          return { breakers: newBreakers }
        })
        return breaker
      },

      checkBreaker: (connectorId) => {
        const breaker = get().getBreaker(connectorId)

        if (breaker.state === CircuitState.Closed) {
          return { allowed: true, state: CircuitState.Closed, reason: 'Circuit closed' }
        }

        if (breaker.state === CircuitState.Open) {
          const now = Date.now()
          if (breaker.nextRetryAt && now >= new Date(breaker.nextRetryAt).getTime()) {
            set((state) => {
              const newBreakers = new Map(state.breakers)
              newBreakers.set(connectorId, { ...breaker, state: CircuitState.HalfOpen })
              return { breakers: newBreakers }
            })
            return { allowed: true, state: CircuitState.HalfOpen, reason: 'Testing circuit' }
          }
          return {
            allowed: false,
            state: CircuitState.Open,
            reason: `Circuit open, retry after ${breaker.nextRetryAt}`,
          }
        }

        // half_open
        return { allowed: true, state: CircuitState.HalfOpen, reason: 'Half-open test request' }
      },

      recordFailure: (connectorId) => {
        const breaker = get().getBreaker(connectorId)
        const now = new Date().toISOString()
        const newFailureCount = breaker.failureCount + 1

        if (breaker.state === CircuitState.HalfOpen || newFailureCount >= breaker.failureThreshold) {
          set((state) => {
            const newBreakers = new Map(state.breakers)
            newBreakers.set(connectorId, {
              ...breaker,
              state: CircuitState.Open,
              failureCount: newFailureCount,
              lastFailureAt: now,
              openedAt: now,
              nextRetryAt: new Date(Date.now() + breaker.resetTimeoutMs).toISOString(),
              successCount: 0,
            })
            return { breakers: newBreakers }
          })
        } else {
          set((state) => {
            const newBreakers = new Map(state.breakers)
            newBreakers.set(connectorId, {
              ...breaker,
              failureCount: newFailureCount,
              lastFailureAt: now,
            })
            return { breakers: newBreakers }
          })
        }
      },

      recordSuccess: (connectorId) => {
        const breaker = get().getBreaker(connectorId)
        const now = new Date().toISOString()
        const newSuccessCount = breaker.successCount + 1

        if (breaker.state === CircuitState.HalfOpen && newSuccessCount >= breaker.halfOpenMaxTests) {
          set((state) => {
            const newBreakers = new Map(state.breakers)
            newBreakers.set(connectorId, {
              ...breaker,
              state: CircuitState.Closed,
              successCount: 0,
              failureCount: 0,
              lastSuccessAt: now,
            })
            return { breakers: newBreakers }
          })
        } else {
          set((state) => {
            const newBreakers = new Map(state.breakers)
            newBreakers.set(connectorId, {
              ...breaker,
              successCount: newSuccessCount,
              lastSuccessAt: now,
            })
            return { breakers: newBreakers }
          })
        }
      },

      resetBreaker: (connectorId) => {
        set((state) => {
          const newBreakers = new Map(state.breakers)
          newBreakers.set(connectorId, createDefaultBreaker(connectorId))
          return { breakers: newBreakers }
        })
      },
    }),
    {
      name: 'origina-circuit-breaker-storage',
      partialize: (state) => ({
        breakers: Object.fromEntries(state.breakers),
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (!state) return
          if (state.breakers && !(state.breakers instanceof Map)) {
            state.breakers = new Map(
              Object.entries(state.breakers as unknown as Record<string, CircuitBreaker>),
            )
          }
        }
      },
    },
  ),
)

export default useCircuitBreakerStore
