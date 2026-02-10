import { useSchedulingStore } from './useSchedulingStore'
import { BookingStatus, EventTypeCategory, DEFAULT_SCHEDULE } from '../types'
import { SAMPLE_EVENT_TYPES, SAMPLE_BOOKINGS } from '../lib/sampleData'

function makeEventTypeInput() {
  return {
    name: 'New Event',
    description: 'A new event type',
    slug: 'new-event',
    category: EventTypeCategory.OneOnOne,
    color: '#4F46E5',
    durationMinutes: 30,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 0,
    maxBookingsPerDay: 10,
    minimumNoticeMinutes: 0,
    schedulingWindowDays: 60,
    schedule: DEFAULT_SCHEDULE,
    dateOverrides: [],
    customQuestions: [],
    maxAttendees: 1,
    isActive: true,
  }
}

function makeBookingInput() {
  return {
    eventTypeId: 'et-quick-chat',
    date: '2026-02-20',
    startTime: '10:00',
    endTime: '10:30',
    timezone: 'America/New_York',
    status: BookingStatus.Confirmed,
    attendees: [{ name: 'Test User', email: 'test@test.com', timezone: 'America/New_York' }],
    notes: 'Test booking',
  }
}

describe('useSchedulingStore', () => {
  beforeEach(() => {
    useSchedulingStore.setState({
      eventTypes: [...SAMPLE_EVENT_TYPES],
      bookings: [...SAMPLE_BOOKINGS],
    })
  })

  // ─── Event types ────────────────────────────────────────────

  describe('addEventType', () => {
    it('adds a new event type with generated id and timestamps', () => {
      const input = makeEventTypeInput()
      const result = useSchedulingStore.getState().addEventType(input)

      expect(result.id).toBeDefined()
      expect(result.id.length).toBeGreaterThan(0)
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
      expect(result.name).toBe('New Event')

      const stored = useSchedulingStore.getState().eventTypes
      expect(stored.find(et => et.id === result.id)).toBeDefined()
    })
  })

  describe('updateEventType', () => {
    it('updates an existing event type', () => {
      const id = SAMPLE_EVENT_TYPES[0]!.id
      useSchedulingStore.getState().updateEventType(id, { name: 'Updated Name' })

      const updated = useSchedulingStore.getState().eventTypes.find(et => et.id === id)
      expect(updated!.name).toBe('Updated Name')
    })

    it('updates the updatedAt timestamp', () => {
      const id = SAMPLE_EVENT_TYPES[0]!.id
      const beforeUpdate = useSchedulingStore.getState().eventTypes.find(et => et.id === id)!.updatedAt
      useSchedulingStore.getState().updateEventType(id, { name: 'Changed' })

      const afterUpdate = useSchedulingStore.getState().eventTypes.find(et => et.id === id)!.updatedAt
      expect(afterUpdate).not.toBe(beforeUpdate)
    })

    it('does not affect other event types', () => {
      const id = SAMPLE_EVENT_TYPES[0]!.id
      const otherId = SAMPLE_EVENT_TYPES[1]!.id
      const otherBefore = useSchedulingStore.getState().eventTypes.find(et => et.id === otherId)!

      useSchedulingStore.getState().updateEventType(id, { name: 'Changed' })

      const otherAfter = useSchedulingStore.getState().eventTypes.find(et => et.id === otherId)!
      expect(otherAfter.name).toBe(otherBefore.name)
    })
  })

  describe('deleteEventType', () => {
    it('removes an event type', () => {
      const id = SAMPLE_EVENT_TYPES[0]!.id
      const countBefore = useSchedulingStore.getState().eventTypes.length

      useSchedulingStore.getState().deleteEventType(id)

      const countAfter = useSchedulingStore.getState().eventTypes.length
      expect(countAfter).toBe(countBefore - 1)
      expect(useSchedulingStore.getState().eventTypes.find(et => et.id === id)).toBeUndefined()
    })
  })

  describe('getEventType', () => {
    it('returns the event type by id', () => {
      const id = SAMPLE_EVENT_TYPES[0]!.id
      const result = useSchedulingStore.getState().getEventType(id)
      expect(result).toBeDefined()
      expect(result!.id).toBe(id)
    })

    it('returns undefined for non-existent id', () => {
      const result = useSchedulingStore.getState().getEventType('non-existent')
      expect(result).toBeUndefined()
    })
  })

  // ─── Bookings ─────────────────────────────────────────────────

  describe('addBooking', () => {
    it('adds a new booking with generated id and timestamps', () => {
      const input = makeBookingInput()
      const result = useSchedulingStore.getState().addBooking(input)

      expect(result.id).toBeDefined()
      expect(result.id.length).toBeGreaterThan(0)
      expect(result.createdAt).toBeDefined()
      expect(result.updatedAt).toBeDefined()
      expect(result.eventTypeId).toBe('et-quick-chat')

      const stored = useSchedulingStore.getState().bookings
      expect(stored.find(b => b.id === result.id)).toBeDefined()
    })
  })

  describe('updateBooking', () => {
    it('updates an existing booking', () => {
      const id = SAMPLE_BOOKINGS[0]!.id
      useSchedulingStore.getState().updateBooking(id, { notes: 'Updated note' })

      const updated = useSchedulingStore.getState().bookings.find(b => b.id === id)
      expect(updated!.notes).toBe('Updated note')
    })
  })

  describe('cancelBooking', () => {
    it('sets booking status to cancelled', () => {
      const id = SAMPLE_BOOKINGS[0]!.id
      useSchedulingStore.getState().cancelBooking(id)

      const cancelled = useSchedulingStore.getState().bookings.find(b => b.id === id)
      expect(cancelled!.status).toBe(BookingStatus.Cancelled)
    })

    it('sets cancel reason when provided', () => {
      const id = SAMPLE_BOOKINGS[0]!.id
      useSchedulingStore.getState().cancelBooking(id, 'Schedule conflict')

      const cancelled = useSchedulingStore.getState().bookings.find(b => b.id === id)
      expect(cancelled!.cancelReason).toBe('Schedule conflict')
    })
  })

  describe('getBookingsForDate', () => {
    it('returns bookings for a specific date', () => {
      const results = useSchedulingStore.getState().getBookingsForDate('2026-02-11')
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(b => b.date === '2026-02-11')).toBe(true)
    })

    it('returns empty array for a date with no bookings', () => {
      const results = useSchedulingStore.getState().getBookingsForDate('2030-01-01')
      expect(results.length).toBe(0)
    })
  })

  describe('getBookingsForEventType', () => {
    it('returns bookings for a specific event type', () => {
      const results = useSchedulingStore.getState().getBookingsForEventType('et-quick-chat')
      expect(results.length).toBeGreaterThan(0)
      expect(results.every(b => b.eventTypeId === 'et-quick-chat')).toBe(true)
    })

    it('returns empty array for event type with no bookings', () => {
      const results = useSchedulingStore.getState().getBookingsForEventType('non-existent')
      expect(results.length).toBe(0)
    })
  })
})
