import { generateICS } from './icsGenerator'
import type { Booking, EventType } from '../types'
import {
  EventTypeCategory,
  LocationType,
  BookingStatus,
  DEFAULT_SCHEDULE,
} from '../types'

function makeEventType(overrides: Partial<EventType> = {}): EventType {
  return {
    id: 'et-1',
    name: 'Test Meeting',
    description: 'A test meeting for discussions.',
    slug: 'test-meeting',
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
    waitlistEnabled: false,
    maxWaitlist: 5,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'bk-test-1',
    eventTypeId: 'et-1',
    date: '2026-02-15',
    startTime: '10:00',
    endTime: '10:30',
    timezone: 'America/New_York',
    status: BookingStatus.Confirmed,
    attendees: [
      { name: 'Jane Doe', email: 'jane@example.com', timezone: 'America/New_York' },
    ],
    notes: 'Discuss project timeline',
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-10T09:00:00Z',
    ...overrides,
  }
}

describe('generateICS', () => {
  it('generates valid ICS format with required headers', () => {
    const booking = makeBooking()
    const eventType = makeEventType()
    const ics = generateICS(booking, eventType)

    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('PRODID:-//OriginA//Scheduling//EN')
    expect(ics).toContain('CALSCALE:GREGORIAN')
    expect(ics).toContain('METHOD:PUBLISH')
  })

  it('generates a VEVENT with correct start and end times', () => {
    const booking = makeBooking({
      date: '2026-03-20',
      startTime: '14:30',
      endTime: '15:00',
      timezone: 'Europe/London',
    })
    const eventType = makeEventType()
    const ics = generateICS(booking, eventType)

    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VEVENT')
    expect(ics).toContain('DTSTART;TZID=Europe/London:20260320T143000')
    expect(ics).toContain('DTEND;TZID=Europe/London:20260320T150000')
  })

  it('includes SUMMARY from event type name', () => {
    const booking = makeBooking()
    const eventType = makeEventType({ name: 'Product Demo' })
    const ics = generateICS(booking, eventType)

    expect(ics).toContain('SUMMARY:Product Demo')
  })

  it('includes DESCRIPTION with event details', () => {
    const booking = makeBooking({ notes: 'Review Q1 budget' })
    const eventType = makeEventType({ description: 'A demo session' })
    const ics = generateICS(booking, eventType)

    expect(ics).toContain('DESCRIPTION:')
    expect(ics).toContain('A demo session')
    expect(ics).toContain('Review Q1 budget')
  })

  it('includes LOCATION from event type location', () => {
    const booking = makeBooking()
    const eventType = makeEventType({ location: LocationType.GoogleMeet })
    const ics = generateICS(booking, eventType)

    expect(ics).toContain('LOCATION:Google Meet')
  })

  it('includes STATUS:CONFIRMED', () => {
    const booking = makeBooking()
    const eventType = makeEventType()
    const ics = generateICS(booking, eventType)

    expect(ics).toContain('STATUS:CONFIRMED')
  })

  it('includes a UID based on booking id', () => {
    const booking = makeBooking({ id: 'bk-unique-123' })
    const eventType = makeEventType()
    const ics = generateICS(booking, eventType)

    expect(ics).toContain('UID:bk-unique-123@origina.app')
  })

  it('includes DTSTAMP', () => {
    const booking = makeBooking()
    const eventType = makeEventType()
    const ics = generateICS(booking, eventType)

    // DTSTAMP should be present and end with Z (UTC)
    expect(ics).toMatch(/DTSTAMP:\d{8}T\d{6}Z/)
  })

  it('handles timezone in DTSTART and DTEND', () => {
    const booking = makeBooking({
      timezone: 'Asia/Tokyo',
      date: '2026-05-01',
      startTime: '09:00',
      endTime: '09:45',
    })
    const eventType = makeEventType()
    const ics = generateICS(booking, eventType)

    expect(ics).toContain('DTSTART;TZID=Asia/Tokyo:20260501T090000')
    expect(ics).toContain('DTEND;TZID=Asia/Tokyo:20260501T094500')
  })

  it('escapes special characters in text fields', () => {
    const booking = makeBooking({ notes: 'Meeting, with; special\\chars' })
    const eventType = makeEventType({
      name: 'Event, with; special\\chars',
      description: 'Line1\nLine2',
    })
    const ics = generateICS(booking, eventType)

    expect(ics).toContain('SUMMARY:Event\\, with\\; special\\\\chars')
    expect(ics).toContain('Line1\\nLine2')
  })

  it('includes attendee information in description', () => {
    const booking = makeBooking({
      attendees: [
        { name: 'Alice Smith', email: 'alice@test.com', timezone: 'UTC' },
        { name: 'Bob Jones', email: 'bob@test.com', timezone: 'UTC' },
      ],
    })
    const eventType = makeEventType()
    const ics = generateICS(booking, eventType)

    // ICS lines may be folded (split across lines with leading space).
    // Remove line folds to check the logical content.
    const unfolded = ics.replace(/\r\n /g, '')
    expect(unfolded).toContain('Alice Smith')
    expect(unfolded).toContain('alice@test.com')
    expect(unfolded).toContain('Bob Jones')
    expect(unfolded).toContain('bob@test.com')
  })

  it('uses CRLF line endings per RFC 5545', () => {
    const booking = makeBooking()
    const eventType = makeEventType()
    const ics = generateICS(booking, eventType)

    // Every line should end with \r\n
    const lines = ics.split('\r\n')
    // Last element after split should be empty (trailing \r\n)
    expect(lines[lines.length - 1]).toBe('')
    // All non-empty lines should not contain standalone \n
    for (const line of lines.slice(0, -1)) {
      expect(line).not.toContain('\n')
    }
  })

  it('includes duration info in description', () => {
    const booking = makeBooking()
    const eventType = makeEventType({ durationMinutes: 45 })
    const ics = generateICS(booking, eventType)

    expect(ics).toContain('45 minutes')
  })

  it('handles in-person location type', () => {
    const booking = makeBooking()
    const eventType = makeEventType({ location: LocationType.InPerson })
    const ics = generateICS(booking, eventType)

    expect(ics).toContain('LOCATION:In-person')
  })
})
