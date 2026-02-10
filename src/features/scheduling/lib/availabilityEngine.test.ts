import {
  getAvailableSlots,
  isDateAvailable,
  getNextAvailableDate,
  addMinutesToTime,
  isTimeInRange,
  doRangesOverlap,
} from './availabilityEngine'
import type { EventType, Booking, TimeRange } from '../types'
import { EventTypeCategory, LocationType, BookingStatus, DEFAULT_SCHEDULE } from '../types'

// ─── Test helpers ───────────────────────────────────────────────

function makeEventType(overrides: Partial<EventType> = {}): EventType {
  return {
    id: 'et-1',
    name: 'Test Event',
    description: 'A test event',
    slug: 'test-event',
    category: EventTypeCategory.OneOnOne,
    color: '#4F46E5',
    durationMinutes: 30,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 0,
    maxBookingsPerDay: 10,
    minimumNoticeMinutes: 0,
    schedulingWindowDays: 60,
    location: LocationType.Zoom,
    schedule: DEFAULT_SCHEDULE,
    dateOverrides: [],
    customQuestions: [],
    maxAttendees: 1,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'b-1',
    eventTypeId: 'et-1',
    date: '2026-02-11',
    startTime: '10:00',
    endTime: '10:30',
    timezone: 'America/New_York',
    status: BookingStatus.Confirmed,
    attendees: [{ name: 'Test', email: 'test@test.com', timezone: 'America/New_York' }],
    notes: '',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    ...overrides,
  }
}

// ─── addMinutesToTime ───────────────────────────────────────────

describe('addMinutesToTime', () => {
  it('adds minutes within the same hour', () => {
    expect(addMinutesToTime('09:00', 15)).toBe('09:15')
  })

  it('adds minutes crossing hour boundary', () => {
    expect(addMinutesToTime('09:45', 30)).toBe('10:15')
  })

  it('handles adding to midnight', () => {
    expect(addMinutesToTime('23:30', 30)).toBe('00:00')
  })

  it('handles zero minutes', () => {
    expect(addMinutesToTime('14:30', 0)).toBe('14:30')
  })

  it('handles large minute additions', () => {
    expect(addMinutesToTime('09:00', 120)).toBe('11:00')
  })
})

// ─── isTimeInRange ──────────────────────────────────────────────

describe('isTimeInRange', () => {
  const range: TimeRange = { start: '09:00', end: '17:00' }

  it('returns true for time within range', () => {
    expect(isTimeInRange('10:00', range)).toBe(true)
  })

  it('returns true for time at start of range', () => {
    expect(isTimeInRange('09:00', range)).toBe(true)
  })

  it('returns false for time at end of range', () => {
    expect(isTimeInRange('17:00', range)).toBe(false)
  })

  it('returns false for time before range', () => {
    expect(isTimeInRange('08:00', range)).toBe(false)
  })

  it('returns false for time after range', () => {
    expect(isTimeInRange('18:00', range)).toBe(false)
  })
})

// ─── doRangesOverlap ────────────────────────────────────────────

describe('doRangesOverlap', () => {
  it('detects overlapping ranges', () => {
    const a: TimeRange = { start: '09:00', end: '10:00' }
    const b: TimeRange = { start: '09:30', end: '10:30' }
    expect(doRangesOverlap(a, b)).toBe(true)
  })

  it('detects contained ranges', () => {
    const a: TimeRange = { start: '09:00', end: '12:00' }
    const b: TimeRange = { start: '10:00', end: '11:00' }
    expect(doRangesOverlap(a, b)).toBe(true)
  })

  it('returns false for adjacent ranges', () => {
    const a: TimeRange = { start: '09:00', end: '10:00' }
    const b: TimeRange = { start: '10:00', end: '11:00' }
    expect(doRangesOverlap(a, b)).toBe(false)
  })

  it('returns false for non-overlapping ranges', () => {
    const a: TimeRange = { start: '09:00', end: '10:00' }
    const b: TimeRange = { start: '14:00', end: '15:00' }
    expect(doRangesOverlap(a, b)).toBe(false)
  })
})

// ─── getAvailableSlots ──────────────────────────────────────────

describe('getAvailableSlots', () => {
  it('returns slots for a day with no bookings', () => {
    const eventType = makeEventType({ durationMinutes: 30, minimumNoticeMinutes: 0 })
    // Wednesday Feb 11, 2026 (within the scheduling window)
    const date = new Date(2026, 1, 11)

    // Mock the current date to be before the target date
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const slots = getAvailableSlots({ date, eventType, bookings: [], timezone: 'UTC' })
    // 9:00-17:00 with 30min slots = 16 slots
    expect(slots.length).toBe(16)
    expect(slots[0]).toEqual({ start: '09:00', end: '09:30' })
    expect(slots[15]).toEqual({ start: '16:30', end: '17:00' })

    vi.useRealTimers()
  })

  it('removes slots that conflict with existing bookings', () => {
    const eventType = makeEventType({ durationMinutes: 30, minimumNoticeMinutes: 0 })
    const date = new Date(2026, 1, 11) // Wednesday
    const booking = makeBooking({ startTime: '10:00', endTime: '10:30', date: '2026-02-11' })

    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const slots = getAvailableSlots({ date, eventType, bookings: [booking], timezone: 'UTC' })
    // Should have 15 slots (16 minus the 10:00-10:30 slot)
    expect(slots.length).toBe(15)
    expect(slots.find(s => s.start === '10:00')).toBeUndefined()

    vi.useRealTimers()
  })

  it('accounts for buffer time around bookings', () => {
    const eventType = makeEventType({
      durationMinutes: 30,
      bufferBeforeMinutes: 15,
      bufferAfterMinutes: 15,
      minimumNoticeMinutes: 0,
    })
    const date = new Date(2026, 1, 11)
    const booking = makeBooking({ startTime: '10:00', endTime: '10:30', date: '2026-02-11' })

    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const slots = getAvailableSlots({ date, eventType, bookings: [booking], timezone: 'UTC' })
    // The 09:30 slot (ends 10:00, buffer makes it 10:15 which overlaps with 10:00)
    // and the 10:00 slot should be removed
    expect(slots.find(s => s.start === '09:30')).toBeUndefined()
    expect(slots.find(s => s.start === '10:00')).toBeUndefined()

    vi.useRealTimers()
  })

  it('returns empty for a disabled day (Saturday)', () => {
    const eventType = makeEventType()
    const date = new Date(2026, 1, 14) // Saturday

    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const slots = getAvailableSlots({ date, eventType, bookings: [], timezone: 'UTC' })
    expect(slots.length).toBe(0)

    vi.useRealTimers()
  })

  it('returns empty when max bookings per day is reached', () => {
    const eventType = makeEventType({ maxBookingsPerDay: 1, minimumNoticeMinutes: 0 })
    const date = new Date(2026, 1, 11)
    const booking = makeBooking({ date: '2026-02-11' })

    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const slots = getAvailableSlots({ date, eventType, bookings: [booking], timezone: 'UTC' })
    expect(slots.length).toBe(0)

    vi.useRealTimers()
  })

  it('uses date overrides when present', () => {
    const eventType = makeEventType({
      durationMinutes: 60,
      minimumNoticeMinutes: 0,
      dateOverrides: [
        { date: '2026-02-11', ranges: [{ start: '10:00', end: '12:00' }] },
      ],
    })
    const date = new Date(2026, 1, 11)

    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const slots = getAvailableSlots({ date, eventType, bookings: [], timezone: 'UTC' })
    expect(slots.length).toBe(2) // 10:00-11:00, 11:00-12:00

    vi.useRealTimers()
  })

  it('returns empty for date override with null ranges (day off)', () => {
    const eventType = makeEventType({
      minimumNoticeMinutes: 0,
      dateOverrides: [{ date: '2026-02-11', ranges: null }],
    })
    const date = new Date(2026, 1, 11)

    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const slots = getAvailableSlots({ date, eventType, bookings: [], timezone: 'UTC' })
    expect(slots.length).toBe(0)

    vi.useRealTimers()
  })

  it('returns empty for dates outside the scheduling window', () => {
    const eventType = makeEventType({ schedulingWindowDays: 7, minimumNoticeMinutes: 0 })
    const date = new Date(2026, 2, 30) // Way in the future

    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const slots = getAvailableSlots({ date, eventType, bookings: [], timezone: 'UTC' })
    expect(slots.length).toBe(0)

    vi.useRealTimers()
  })

  it('respects minimum notice time', () => {
    const eventType = makeEventType({
      durationMinutes: 30,
      minimumNoticeMinutes: 120, // 2 hours
    })
    // Same day, current time is 10:00
    const date = new Date(2026, 1, 11)

    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 11, 10, 0, 0))

    const slots = getAvailableSlots({ date, eventType, bookings: [], timezone: 'UTC' })
    // Minimum notice is 2h, so earliest slot is 12:00
    // Slots from 12:00 to 16:30 = 10 slots
    expect(slots[0]!.start).toBe('12:00')
    expect(slots.every(s => s.start >= '12:00')).toBe(true)

    vi.useRealTimers()
  })

  it('ignores cancelled bookings', () => {
    const eventType = makeEventType({ durationMinutes: 30, minimumNoticeMinutes: 0 })
    const date = new Date(2026, 1, 11)
    const booking = makeBooking({
      startTime: '10:00',
      endTime: '10:30',
      date: '2026-02-11',
      status: BookingStatus.Cancelled,
    })

    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const slots = getAvailableSlots({ date, eventType, bookings: [booking], timezone: 'UTC' })
    // Cancelled booking should not block the 10:00 slot
    expect(slots.find(s => s.start === '10:00')).toBeDefined()

    vi.useRealTimers()
  })
})

// ─── isDateAvailable ────────────────────────────────────────────

describe('isDateAvailable', () => {
  it('returns true for an available weekday', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const eventType = makeEventType()
    const date = new Date(2026, 1, 11) // Wednesday
    expect(isDateAvailable({ date, eventType, bookings: [] })).toBe(true)

    vi.useRealTimers()
  })

  it('returns false for a disabled day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const eventType = makeEventType()
    const date = new Date(2026, 1, 14) // Saturday
    expect(isDateAvailable({ date, eventType, bookings: [] })).toBe(false)

    vi.useRealTimers()
  })

  it('returns false when max bookings reached', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const eventType = makeEventType({ maxBookingsPerDay: 1 })
    const booking = makeBooking({ date: '2026-02-11' })
    const date = new Date(2026, 1, 11)
    expect(isDateAvailable({ date, eventType, bookings: [booking] })).toBe(false)

    vi.useRealTimers()
  })

  it('returns false for dates outside scheduling window', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const eventType = makeEventType({ schedulingWindowDays: 7 })
    const date = new Date(2026, 3, 1) // Way beyond 7 days
    expect(isDateAvailable({ date, eventType, bookings: [] })).toBe(false)

    vi.useRealTimers()
  })

  it('returns false for past dates', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const eventType = makeEventType()
    const date = new Date(2026, 0, 1) // January 1
    expect(isDateAvailable({ date, eventType, bookings: [] })).toBe(false)

    vi.useRealTimers()
  })

  it('handles date override with null ranges', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const eventType = makeEventType({
      dateOverrides: [{ date: '2026-02-11', ranges: null }],
    })
    const date = new Date(2026, 1, 11)
    expect(isDateAvailable({ date, eventType, bookings: [] })).toBe(false)

    vi.useRealTimers()
  })
})

// ─── getNextAvailableDate ───────────────────────────────────────

describe('getNextAvailableDate', () => {
  it('returns the from date if it is available', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const eventType = makeEventType()
    const fromDate = new Date(2026, 1, 11) // Wednesday
    const result = getNextAvailableDate({ fromDate, eventType, bookings: [] })
    expect(result).not.toBeNull()
    expect(result!.getDate()).toBe(11)

    vi.useRealTimers()
  })

  it('skips weekends to find next available', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    const eventType = makeEventType()
    const fromDate = new Date(2026, 1, 14) // Saturday
    const result = getNextAvailableDate({ fromDate, eventType, bookings: [] })
    expect(result).not.toBeNull()
    expect(result!.getDay()).toBe(1) // Monday
    expect(result!.getDate()).toBe(16)

    vi.useRealTimers()
  })

  it('returns null if no date is available within 90 days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 10, 0, 0, 0))

    // All days disabled
    const eventType = makeEventType({
      schedulingWindowDays: 90,
      schedule: {
        monday: { enabled: false, ranges: [] },
        tuesday: { enabled: false, ranges: [] },
        wednesday: { enabled: false, ranges: [] },
        thursday: { enabled: false, ranges: [] },
        friday: { enabled: false, ranges: [] },
        saturday: { enabled: false, ranges: [] },
        sunday: { enabled: false, ranges: [] },
      },
    })
    const fromDate = new Date(2026, 1, 10)
    const result = getNextAvailableDate({ fromDate, eventType, bookings: [] })
    expect(result).toBeNull()

    vi.useRealTimers()
  })
})
