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

// ─── Batch Buffer for Server Persistence ────────────────────────────

const FLUSH_INTERVAL_MS = 10_000
let buffer: FleetTelemetryEvent[] = []
let flushTimer: ReturnType<typeof setInterval> | null = null

function flushBuffer(): void {
  if (buffer.length === 0) return

  const batch = buffer
  buffer = []

  // Fire-and-forget POST to the server
  fetch('/api/telemetry/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: batch }),
  }).catch(() => {
    // On failure, put events back for next flush attempt
    buffer = batch.concat(buffer)
  })
}

function ensureFlushTimer(): void {
  if (flushTimer !== null) return
  flushTimer = setInterval(flushBuffer, FLUSH_INTERVAL_MS)

  // Flush on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && buffer.length > 0) {
        const payload = JSON.stringify({ events: buffer })
        buffer = []
        if (typeof navigator.sendBeacon === 'function') {
          navigator.sendBeacon('/api/telemetry/batch', new Blob([payload], { type: 'application/json' }))
        }
      }
    })
  }
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

  // Buffer for server persistence
  buffer.push(event)
  ensureFlushTimer()
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
