import { eventBus, EVENT_TYPES } from '../../../lib/eventBus'

// ─── Telemetry Event Types ──────────────────────────────────────────

export const TelemetryEventType = {
  AgentSpawned: 'agent.spawned',
  AgentCycleStart: 'agent.cycle.start',
  AgentCycleEnd: 'agent.cycle.end',
  AgentActionExecuted: 'agent.action.executed',
  AgentError: 'agent.error',
  AgentRetired: 'agent.retired',
  TaskRouted: 'task.routed',
  TaskCompleted: 'task.completed',
  TaskFailed: 'task.failed',
  BudgetWarning: 'budget.warning',
  BudgetExceeded: 'budget.exceeded',
  CircuitOpened: 'circuit.opened',
} as const

export type TelemetryEventType = (typeof TelemetryEventType)[keyof typeof TelemetryEventType]

export interface FleetTelemetryEvent {
  type: TelemetryEventType
  instanceId: string
  registryId?: string
  domain?: string
  data: Record<string, unknown>
  timestamp: string
}

// ─── Emit ───────────────────────────────────────────────────────────

export function emitAgentEvent(
  instanceId: string,
  type: TelemetryEventType,
  data?: Record<string, unknown>,
): void {
  const event: FleetTelemetryEvent = {
    type,
    instanceId,
    data: data ?? {},
    timestamp: new Date().toISOString(),
  }
  eventBus.emit(EVENT_TYPES.FLEET_TELEMETRY, event)
}

// ─── Convenience Emitters ───────────────────────────────────────────

export function emitCycleStart(instanceId: string, phase: string): void {
  emitAgentEvent(instanceId, TelemetryEventType.AgentCycleStart, { phase })
}

export function emitCycleEnd(instanceId: string, phase: string, durationMs: number): void {
  emitAgentEvent(instanceId, TelemetryEventType.AgentCycleEnd, { phase, durationMs })
}

export function emitActionExecuted(instanceId: string, actionType: string, actionName: string): void {
  emitAgentEvent(instanceId, TelemetryEventType.AgentActionExecuted, { actionType, actionName })
}

export function emitAgentError(instanceId: string, errorType: string, message: string): void {
  emitAgentEvent(instanceId, TelemetryEventType.AgentError, { errorType, message })
}
