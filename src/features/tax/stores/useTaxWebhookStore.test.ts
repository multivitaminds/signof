import { useTaxWebhookStore } from './useTaxWebhookStore'
import { WebhookEventType } from '../types'

function resetStore() {
  useTaxWebhookStore.setState({ events: [] })
}

describe('useTaxWebhookStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('addEvent', () => {
    it('adds an event with generated id and receivedAt timestamp', () => {
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormCreated)

      const { events } = useTaxWebhookStore.getState()
      expect(events).toHaveLength(1)
      expect(events[0]!.submissionId).toBe('sub-1')
      expect(events[0]!.eventType).toBe(WebhookEventType.FormCreated)
      expect(events[0]!.id).toBeTruthy()
      expect(events[0]!.receivedAt).toBeTruthy()
      expect(events[0]!.payload).toEqual({})
    })

    it('stores payload when provided', () => {
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormValidated, {
        valid: true,
        errorCount: 0,
      })

      const event = useTaxWebhookStore.getState().events[0]!
      expect(event.payload).toEqual({ valid: true, errorCount: 0 })
    })

    it('appends multiple events in order', () => {
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormCreated)
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormValidated)
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormTransmitted)

      const { events } = useTaxWebhookStore.getState()
      expect(events).toHaveLength(3)
      expect(events[0]!.eventType).toBe(WebhookEventType.FormCreated)
      expect(events[1]!.eventType).toBe(WebhookEventType.FormValidated)
      expect(events[2]!.eventType).toBe(WebhookEventType.FormTransmitted)
    })
  })

  describe('getEventsForSubmission', () => {
    it('returns only events for the given submission id', () => {
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormCreated)
      useTaxWebhookStore.getState().addEvent('sub-2', WebhookEventType.FormCreated)
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormValidated)

      const sub1Events = useTaxWebhookStore.getState().getEventsForSubmission('sub-1')
      expect(sub1Events).toHaveLength(2)
      expect(sub1Events.every((e) => e.submissionId === 'sub-1')).toBe(true)
    })

    it('returns empty array for unknown submission', () => {
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormCreated)

      const events = useTaxWebhookStore.getState().getEventsForSubmission('unknown')
      expect(events).toHaveLength(0)
    })
  })

  describe('getLatestEvent', () => {
    it('returns the last event for a given submission', () => {
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormCreated)
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormValidated)
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormAccepted)

      const latest = useTaxWebhookStore.getState().getLatestEvent('sub-1')
      expect(latest).toBeDefined()
      expect(latest!.eventType).toBe(WebhookEventType.FormAccepted)
    })

    it('returns undefined when no events exist for submission', () => {
      const latest = useTaxWebhookStore.getState().getLatestEvent('nonexistent')
      expect(latest).toBeUndefined()
    })
  })

  describe('clearEvents', () => {
    it('removes all events', () => {
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormCreated)
      useTaxWebhookStore.getState().addEvent('sub-2', WebhookEventType.FormCreated)

      useTaxWebhookStore.getState().clearEvents()
      expect(useTaxWebhookStore.getState().events).toHaveLength(0)
    })
  })

  describe('clearEventsForSubmission', () => {
    it('removes only events for the specified submission', () => {
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormCreated)
      useTaxWebhookStore.getState().addEvent('sub-2', WebhookEventType.FormCreated)
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormAccepted)

      useTaxWebhookStore.getState().clearEventsForSubmission('sub-1')

      const { events } = useTaxWebhookStore.getState()
      expect(events).toHaveLength(1)
      expect(events[0]!.submissionId).toBe('sub-2')
    })

    it('does nothing when submission id does not match', () => {
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormCreated)

      useTaxWebhookStore.getState().clearEventsForSubmission('sub-999')
      expect(useTaxWebhookStore.getState().events).toHaveLength(1)
    })
  })

  describe('Event isolation', () => {
    it('generates unique ids for each event', () => {
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormCreated)
      useTaxWebhookStore.getState().addEvent('sub-1', WebhookEventType.FormCreated)

      const { events } = useTaxWebhookStore.getState()
      expect(events[0]!.id).not.toBe(events[1]!.id)
    })
  })
})
