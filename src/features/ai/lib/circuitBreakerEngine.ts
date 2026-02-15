import type { ParsedAction, CircuitBreakerCheckResult } from '../types'
import useCircuitBreakerStore from '../stores/useCircuitBreakerStore'

export function checkActionCircuit(action: ParsedAction): CircuitBreakerCheckResult | null {
  if (action.type !== 'connector' || !action.connectorId) {
    return null
  }
  return useCircuitBreakerStore.getState().checkBreaker(action.connectorId)
}

export function recordActionOutcome(action: ParsedAction, success: boolean): void {
  if (action.type !== 'connector' || !action.connectorId) {
    return
  }
  if (success) {
    useCircuitBreakerStore.getState().recordSuccess(action.connectorId)
  } else {
    useCircuitBreakerStore.getState().recordFailure(action.connectorId)
  }
}
