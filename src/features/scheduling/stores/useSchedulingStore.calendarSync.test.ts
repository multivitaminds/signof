import { useSchedulingStore } from './useSchedulingStore'
import { SyncDirection, CalendarProvider, WaitlistStatus, BookingStatus } from '../types'
import { SAMPLE_EVENT_TYPES, SAMPLE_BOOKINGS } from '../lib/sampleData'

describe('useSchedulingStore — Calendar Sync', () => {
  beforeEach(() => {
    useSchedulingStore.setState({
      eventTypes: [...SAMPLE_EVENT_TYPES],
      bookings: [...SAMPLE_BOOKINGS],
      calendarConnections: [
        {
          id: 'cal-google',
          provider: CalendarProvider.Google,
          name: 'Google Calendar',
          email: 'user@gmail.com',
          syncDirection: SyncDirection.TwoWay,
          checkConflicts: true,
          connected: true,
          lastSyncedAt: '2026-02-10T08:30:00Z',
        },
        {
          id: 'cal-outlook',
          provider: CalendarProvider.Outlook,
          name: 'Outlook Calendar',
          email: 'user@outlook.com',
          syncDirection: SyncDirection.OneWay,
          checkConflicts: false,
          connected: false,
          lastSyncedAt: null,
        },
      ],
      waitlist: [],
    })
  })

  describe('connectCalendar', () => {
    it('sets connected to true and updates lastSyncedAt', () => {
      useSchedulingStore.getState().connectCalendar('cal-outlook')

      const conn = useSchedulingStore.getState().calendarConnections.find(c => c.id === 'cal-outlook')
      expect(conn!.connected).toBe(true)
      expect(conn!.lastSyncedAt).toBeDefined()
      expect(conn!.lastSyncedAt).not.toBeNull()
    })

    it('does not change other connections', () => {
      const googleBefore = useSchedulingStore.getState().calendarConnections.find(c => c.id === 'cal-google')!
      useSchedulingStore.getState().connectCalendar('cal-outlook')

      const googleAfter = useSchedulingStore.getState().calendarConnections.find(c => c.id === 'cal-google')!
      expect(googleAfter.connected).toBe(googleBefore.connected)
    })
  })

  describe('disconnectCalendar', () => {
    it('sets connected to false', () => {
      useSchedulingStore.getState().disconnectCalendar('cal-google')

      const conn = useSchedulingStore.getState().calendarConnections.find(c => c.id === 'cal-google')
      expect(conn!.connected).toBe(false)
    })
  })

  describe('updateCalendarSync', () => {
    it('updates sync direction', () => {
      useSchedulingStore.getState().updateCalendarSync('cal-google', {
        syncDirection: SyncDirection.OneWay,
      })

      const conn = useSchedulingStore.getState().calendarConnections.find(c => c.id === 'cal-google')
      expect(conn!.syncDirection).toBe(SyncDirection.OneWay)
    })

    it('toggles checkConflicts', () => {
      useSchedulingStore.getState().updateCalendarSync('cal-google', {
        checkConflicts: false,
      })

      const conn = useSchedulingStore.getState().calendarConnections.find(c => c.id === 'cal-google')
      expect(conn!.checkConflicts).toBe(false)
    })
  })

  describe('syncCalendar', () => {
    it('updates lastSyncedAt for connected calendar', () => {
      const before = useSchedulingStore.getState().calendarConnections.find(c => c.id === 'cal-google')!.lastSyncedAt
      useSchedulingStore.getState().syncCalendar('cal-google')

      const after = useSchedulingStore.getState().calendarConnections.find(c => c.id === 'cal-google')!.lastSyncedAt
      expect(after).not.toBe(before)
    })

    it('does not update lastSyncedAt for disconnected calendar', () => {
      const before = useSchedulingStore.getState().calendarConnections.find(c => c.id === 'cal-outlook')!.lastSyncedAt
      useSchedulingStore.getState().syncCalendar('cal-outlook')

      const after = useSchedulingStore.getState().calendarConnections.find(c => c.id === 'cal-outlook')!.lastSyncedAt
      expect(after).toBe(before)
    })
  })
})

describe('useSchedulingStore — Waitlist', () => {
  beforeEach(() => {
    useSchedulingStore.setState({
      eventTypes: [...SAMPLE_EVENT_TYPES],
      bookings: [...SAMPLE_BOOKINGS],
      waitlist: [],
    })
  })

  describe('addToWaitlist', () => {
    it('adds a waitlist entry with generated id and waiting status', () => {
      const entry = useSchedulingStore.getState().addToWaitlist({
        eventTypeId: 'et-quick-chat',
        date: '2026-02-20',
        timeSlot: '10:00',
        name: 'Jane Doe',
        email: 'jane@example.com',
      })

      expect(entry.id).toBeDefined()
      expect(entry.status).toBe(WaitlistStatus.Waiting)
      expect(entry.name).toBe('Jane Doe')

      const stored = useSchedulingStore.getState().waitlist
      expect(stored).toHaveLength(1)
      expect(stored[0]!.id).toBe(entry.id)
    })
  })

  describe('removeFromWaitlist', () => {
    it('removes the entry by id', () => {
      const entry = useSchedulingStore.getState().addToWaitlist({
        eventTypeId: 'et-quick-chat',
        date: '2026-02-20',
        timeSlot: '10:00',
        name: 'Jane Doe',
        email: 'jane@example.com',
      })

      useSchedulingStore.getState().removeFromWaitlist(entry.id)
      expect(useSchedulingStore.getState().waitlist).toHaveLength(0)
    })
  })

  describe('approveWaitlistEntry', () => {
    it('sets status to approved', () => {
      const entry = useSchedulingStore.getState().addToWaitlist({
        eventTypeId: 'et-quick-chat',
        date: '2026-02-20',
        timeSlot: '10:00',
        name: 'Jane Doe',
        email: 'jane@example.com',
      })

      useSchedulingStore.getState().approveWaitlistEntry(entry.id)

      const updated = useSchedulingStore.getState().waitlist.find(w => w.id === entry.id)
      expect(updated!.status).toBe(WaitlistStatus.Approved)
    })
  })

  describe('rejectWaitlistEntry', () => {
    it('sets status to rejected', () => {
      const entry = useSchedulingStore.getState().addToWaitlist({
        eventTypeId: 'et-quick-chat',
        date: '2026-02-20',
        timeSlot: '10:00',
        name: 'Jane Doe',
        email: 'jane@example.com',
      })

      useSchedulingStore.getState().rejectWaitlistEntry(entry.id)

      const updated = useSchedulingStore.getState().waitlist.find(w => w.id === entry.id)
      expect(updated!.status).toBe(WaitlistStatus.Rejected)
    })
  })

  describe('getWaitlistForEvent', () => {
    it('returns only waiting entries for the given event type', () => {
      useSchedulingStore.getState().addToWaitlist({
        eventTypeId: 'et-quick-chat',
        date: '2026-02-20',
        timeSlot: '10:00',
        name: 'Jane Doe',
        email: 'jane@example.com',
      })
      useSchedulingStore.getState().addToWaitlist({
        eventTypeId: 'et-product-demo',
        date: '2026-02-20',
        timeSlot: '14:00',
        name: 'Bob Smith',
        email: 'bob@example.com',
      })

      const results = useSchedulingStore.getState().getWaitlistForEvent('et-quick-chat')
      expect(results).toHaveLength(1)
      expect(results[0]!.name).toBe('Jane Doe')
    })
  })

  describe('notifyNextWaitlistEntry', () => {
    it('sets the first waiting entry to notified', () => {
      const entry1 = useSchedulingStore.getState().addToWaitlist({
        eventTypeId: 'et-quick-chat',
        date: '2026-02-11',
        timeSlot: '10:00',
        name: 'Jane Doe',
        email: 'jane@example.com',
      })
      useSchedulingStore.getState().addToWaitlist({
        eventTypeId: 'et-quick-chat',
        date: '2026-02-11',
        timeSlot: '10:00',
        name: 'Bob Smith',
        email: 'bob@example.com',
      })

      const notified = useSchedulingStore.getState().notifyNextWaitlistEntry('et-quick-chat', '2026-02-11')

      expect(notified).toBeDefined()
      expect(notified!.id).toBe(entry1.id)

      const updated = useSchedulingStore.getState().waitlist.find(w => w.id === entry1.id)
      expect(updated!.status).toBe(WaitlistStatus.Notified)
    })

    it('returns undefined when no waiting entries exist', () => {
      const result = useSchedulingStore.getState().notifyNextWaitlistEntry('et-quick-chat', '2026-02-11')
      expect(result).toBeUndefined()
    })
  })

  describe('cancelBooking auto-notify', () => {
    it('notifies the next waitlist entry when a booking is cancelled', () => {
      // Add a waitlist entry for the same event type and date as booking bk-1
      useSchedulingStore.getState().addToWaitlist({
        eventTypeId: 'et-quick-chat',
        date: '2026-02-11',
        timeSlot: '10:00',
        name: 'Waitlisted User',
        email: 'waitlisted@example.com',
      })

      // Cancel booking bk-1 (et-quick-chat, 2026-02-11)
      useSchedulingStore.getState().cancelBooking('bk-1', 'Test cancel')

      const booking = useSchedulingStore.getState().bookings.find(b => b.id === 'bk-1')
      expect(booking!.status).toBe(BookingStatus.Cancelled)

      const waitlistEntries = useSchedulingStore.getState().waitlist
      expect(waitlistEntries[0]!.status).toBe(WaitlistStatus.Notified)
    })
  })
})

describe('useSchedulingStore — Recurring Bookings', () => {
  beforeEach(() => {
    useSchedulingStore.setState({
      eventTypes: [...SAMPLE_EVENT_TYPES],
      bookings: [...SAMPLE_BOOKINGS],
      waitlist: [],
    })
  })

  describe('addRecurringBookings', () => {
    it('adds multiple bookings with a shared recurrenceGroupId', () => {
      const bookingsData = [
        {
          eventTypeId: 'et-quick-chat',
          date: '2026-03-01',
          startTime: '10:00',
          endTime: '10:15',
          timezone: 'America/New_York',
          status: BookingStatus.Confirmed,
          attendees: [{ name: 'Test', email: 'test@test.com', timezone: 'America/New_York' }],
          notes: '',
        },
        {
          eventTypeId: 'et-quick-chat',
          date: '2026-03-08',
          startTime: '10:00',
          endTime: '10:15',
          timezone: 'America/New_York',
          status: BookingStatus.Confirmed,
          attendees: [{ name: 'Test', email: 'test@test.com', timezone: 'America/New_York' }],
          notes: '',
        },
        {
          eventTypeId: 'et-quick-chat',
          date: '2026-03-15',
          startTime: '10:00',
          endTime: '10:15',
          timezone: 'America/New_York',
          status: BookingStatus.Confirmed,
          attendees: [{ name: 'Test', email: 'test@test.com', timezone: 'America/New_York' }],
          notes: '',
        },
      ]

      const countBefore = useSchedulingStore.getState().bookings.length
      const result = useSchedulingStore.getState().addRecurringBookings(bookingsData)

      expect(result).toHaveLength(3)
      expect(useSchedulingStore.getState().bookings.length).toBe(countBefore + 3)

      // All should share the same recurrenceGroupId
      const groupId = result[0]!.recurrenceGroupId
      expect(groupId).toBeDefined()
      expect(result[1]!.recurrenceGroupId).toBe(groupId)
      expect(result[2]!.recurrenceGroupId).toBe(groupId)

      // Each should have a unique id
      const ids = result.map(b => b.id)
      expect(new Set(ids).size).toBe(3)
    })
  })
})
