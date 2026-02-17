type EventHandler = (...args: unknown[]) => void

export const EVENT_TYPES = {
  DOCUMENT_SIGNED: 'document:signed',
  AGENT_COMPLETED: 'agent:completed',
  AGENT_FAILED: 'agent:failed',
  INVOICE_PAID: 'invoice:paid',
  TAX_FILED: 'tax:filed',
  DATABASE_CREATED: 'database:created',
  PAGE_CREATED: 'page:created',
  BRAIN_MESSAGE_RECEIVED: 'brain:message_received',
  BRAIN_SESSION_CREATED: 'brain:session_created',
  BRAIN_SKILL_EXECUTED: 'brain:skill_executed',
  BRAIN_GATEWAY_STATUS: 'brain:gateway_status',
  FLEET_AGENT_SPAWNED: 'fleet:agent_spawned',
  FLEET_AGENT_RETIRED: 'fleet:agent_retired',
  FLEET_TASK_COMPLETED: 'fleet:task_completed',
  FLEET_TASK_FAILED: 'fleet:task_failed',
  FLEET_ALERT: 'fleet:alert',
  FLEET_TELEMETRY: 'fleet:telemetry',
} as const

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES]

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>()

  on(event: EventType, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler)
    return () => { this.handlers.get(event)?.delete(handler) }
  }

  emit(event: EventType, ...args: unknown[]): void {
    this.handlers.get(event)?.forEach((h) => h(...args))
  }
}

export const eventBus = new EventBus()
