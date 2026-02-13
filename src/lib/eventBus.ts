type EventHandler = (...args: unknown[]) => void

export const EVENT_TYPES = {
  DOCUMENT_SIGNED: 'document:signed',
  AGENT_COMPLETED: 'agent:completed',
  AGENT_FAILED: 'agent:failed',
  INVOICE_PAID: 'invoice:paid',
  TAX_FILED: 'tax:filed',
  DATABASE_CREATED: 'database:created',
  PAGE_CREATED: 'page:created',
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
