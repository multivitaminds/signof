import { create } from 'zustand'
import type { EventType, Booking, BookingFilter, CalendarConnection, WaitlistEntry } from '../types'
import { BookingStatus, CalendarProvider, SyncDirection, WaitlistStatus } from '../types'
import { SAMPLE_EVENT_TYPES, SAMPLE_BOOKINGS } from '../lib/sampleData'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function now(): string {
  return new Date().toISOString()
}

const SAMPLE_CALENDAR_CONNECTIONS: CalendarConnection[] = [
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
  {
    id: 'cal-apple',
    provider: CalendarProvider.Apple,
    name: 'Apple Calendar',
    email: 'user@icloud.com',
    syncDirection: SyncDirection.OneWay,
    checkConflicts: false,
    connected: false,
    lastSyncedAt: null,
  },
]

export interface SchedulingState {
  eventTypes: EventType[]
  bookings: Booking[]
  calendarConnections: CalendarConnection[]
  waitlist: WaitlistEntry[]

  // Event type actions
  addEventType: (eventType: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'>) => EventType
  updateEventType: (id: string, updates: Partial<EventType>) => void
  deleteEventType: (id: string) => void
  duplicateEventType: (id: string) => EventType | undefined
  getEventType: (id: string) => EventType | undefined

  // Booking actions
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Booking
  addRecurringBookings: (bookings: Array<Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>>) => Booking[]
  updateBooking: (id: string, updates: Partial<Booking>) => void
  cancelBooking: (id: string, reason?: string) => void
  rescheduleBooking: (id: string, newDate: string, newStartTime: string, newEndTime: string, reason?: string) => void
  getBookingsForDate: (date: string) => Booking[]
  getBookingsForEventType: (eventTypeId: string) => Booking[]

  // Duplicate check
  hasDuplicateBooking: (email: string, eventTypeId: string, date: string) => boolean

  // Convenience
  getFilteredBookings: (filter: BookingFilter) => Booking[]

  // Calendar sync actions
  connectCalendar: (id: string) => void
  disconnectCalendar: (id: string) => void
  updateCalendarSync: (id: string, updates: Partial<CalendarConnection>) => void
  syncCalendar: (id: string) => void

  // No-show actions
  markNoShow: (bookingId: string) => void
  undoNoShow: (bookingId: string) => void
  getNoShowRate: (eventTypeId?: string) => number

  // Waitlist actions
  addToWaitlist: (entry: Omit<WaitlistEntry, 'id' | 'createdAt' | 'status'>) => WaitlistEntry
  removeFromWaitlist: (id: string) => void
  approveWaitlistEntry: (id: string) => void
  rejectWaitlistEntry: (id: string) => void
  getWaitlistForEvent: (eventTypeId: string) => WaitlistEntry[]
  notifyNextWaitlistEntry: (eventTypeId: string, date: string) => WaitlistEntry | undefined
}

export const useSchedulingStore = create<SchedulingState>((set, get) => ({
  eventTypes: SAMPLE_EVENT_TYPES,
  bookings: SAMPLE_BOOKINGS,
  calendarConnections: SAMPLE_CALENDAR_CONNECTIONS,
  waitlist: [],

  addEventType: (data) => {
    const timestamp = now()
    const newEventType: EventType = {
      ...data,
      id: generateId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    set((state) => ({
      eventTypes: [...state.eventTypes, newEventType],
    }))
    return newEventType
  },

  updateEventType: (id, updates) => {
    set((state) => ({
      eventTypes: state.eventTypes.map((et) =>
        et.id === id ? { ...et, ...updates, updatedAt: now() } : et
      ),
    }))
  },

  deleteEventType: (id) => {
    set((state) => ({
      eventTypes: state.eventTypes.filter((et) => et.id !== id),
    }))
  },

  duplicateEventType: (id) => {
    const source = get().eventTypes.find((et) => et.id === id)
    if (!source) return undefined
    const timestamp = now()
    const newEventType: EventType = {
      ...source,
      id: generateId(),
      name: `${source.name} (Copy)`,
      slug: `${source.slug}-copy`,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    set((state) => ({
      eventTypes: [...state.eventTypes, newEventType],
    }))
    return newEventType
  },

  getEventType: (id) => {
    return get().eventTypes.find((et) => et.id === id)
  },

  addBooking: (data) => {
    const timestamp = now()
    const newBooking: Booking = {
      ...data,
      id: generateId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    set((state) => ({
      bookings: [...state.bookings, newBooking],
    }))
    return newBooking
  },

  addRecurringBookings: (bookingsData) => {
    const timestamp = now()
    const groupId = generateId()
    const newBookings: Booking[] = bookingsData.map((data) => ({
      ...data,
      id: generateId(),
      recurrenceGroupId: groupId,
      createdAt: timestamp,
      updatedAt: timestamp,
    }))
    set((state) => ({
      bookings: [...state.bookings, ...newBookings],
    }))
    return newBookings
  },

  updateBooking: (id, updates) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...updates, updatedAt: now() } : b
      ),
    }))
  },

  cancelBooking: (id, reason) => {
    const booking = get().bookings.find((b) => b.id === id)
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id
          ? {
              ...b,
              status: BookingStatus.Cancelled,
              cancelReason: reason,
              updatedAt: now(),
            }
          : b
      ),
    }))
    // Auto-notify first waitlist entry when a booking is cancelled
    if (booking) {
      get().notifyNextWaitlistEntry(booking.eventTypeId, booking.date)
    }
  },

  rescheduleBooking: (id, newDate, newStartTime, newEndTime, reason) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id
          ? {
              ...b,
              date: newDate,
              startTime: newStartTime,
              endTime: newEndTime,
              status: BookingStatus.Rescheduled,
              rescheduleReason: reason,
              updatedAt: now(),
            }
          : b
      ),
    }))
  },

  getBookingsForDate: (date) => {
    return get().bookings.filter((b) => b.date === date)
  },

  getBookingsForEventType: (eventTypeId) => {
    return get().bookings.filter((b) => b.eventTypeId === eventTypeId)
  },

  hasDuplicateBooking: (email, eventTypeId, date) => {
    const { bookings } = get()
    return bookings.some(
      (b) =>
        b.eventTypeId === eventTypeId &&
        b.date === date &&
        b.status !== BookingStatus.Cancelled &&
        b.attendees.some((a) => a.email.toLowerCase() === email.toLowerCase())
    )
  },

  getFilteredBookings: (filter) => {
    const { bookings } = get()
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    switch (filter) {
      case 'upcoming':
        return bookings
          .filter((b) => b.date >= todayStr && b.status !== BookingStatus.Cancelled)
          .sort((a, b) => a.date.localeCompare(b.date))
      case 'past':
        return bookings
          .filter((b) => b.date < todayStr)
          .sort((a, b) => b.date.localeCompare(a.date))
      case 'cancelled':
        return bookings
          .filter((b) => b.status === BookingStatus.Cancelled)
          .sort((a, b) => b.date.localeCompare(a.date))
      case 'all':
      default:
        return [...bookings].sort((a, b) => b.date.localeCompare(a.date))
    }
  },

  // Calendar sync actions
  connectCalendar: (id) => {
    set((state) => ({
      calendarConnections: state.calendarConnections.map((c) =>
        c.id === id ? { ...c, connected: true, lastSyncedAt: now() } : c
      ),
    }))
  },

  disconnectCalendar: (id) => {
    set((state) => ({
      calendarConnections: state.calendarConnections.map((c) =>
        c.id === id ? { ...c, connected: false } : c
      ),
    }))
  },

  updateCalendarSync: (id, updates) => {
    set((state) => ({
      calendarConnections: state.calendarConnections.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }))
  },

  syncCalendar: (id) => {
    set((state) => ({
      calendarConnections: state.calendarConnections.map((c) =>
        c.id === id && c.connected ? { ...c, lastSyncedAt: now() } : c
      ),
    }))
  },

  // No-show actions
  markNoShow: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? { ...b, status: BookingStatus.NoShow, updatedAt: now() }
          : b
      ),
    }))
  },

  undoNoShow: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? { ...b, status: BookingStatus.Confirmed, updatedAt: now() }
          : b
      ),
    }))
  },

  getNoShowRate: (eventTypeId) => {
    const { bookings } = get()
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const pastBookings = bookings.filter(
      (b) =>
        b.date < todayStr &&
        (b.status === BookingStatus.Confirmed ||
          b.status === BookingStatus.Completed ||
          b.status === BookingStatus.NoShow) &&
        (eventTypeId ? b.eventTypeId === eventTypeId : true)
    )

    if (pastBookings.length === 0) return 0
    const noShows = pastBookings.filter((b) => b.status === BookingStatus.NoShow).length
    return Math.round((noShows / pastBookings.length) * 100)
  },

  // Waitlist actions
  addToWaitlist: (data) => {
    const entry: WaitlistEntry = {
      ...data,
      id: generateId(),
      status: WaitlistStatus.Waiting,
      createdAt: now(),
    }
    set((state) => ({
      waitlist: [...state.waitlist, entry],
    }))
    return entry
  },

  removeFromWaitlist: (id) => {
    set((state) => ({
      waitlist: state.waitlist.filter((w) => w.id !== id),
    }))
  },

  approveWaitlistEntry: (id) => {
    set((state) => ({
      waitlist: state.waitlist.map((w) =>
        w.id === id ? { ...w, status: WaitlistStatus.Approved } : w
      ),
    }))
  },

  rejectWaitlistEntry: (id) => {
    set((state) => ({
      waitlist: state.waitlist.map((w) =>
        w.id === id ? { ...w, status: WaitlistStatus.Rejected } : w
      ),
    }))
  },

  getWaitlistForEvent: (eventTypeId) => {
    return get().waitlist.filter(
      (w) => w.eventTypeId === eventTypeId && w.status === WaitlistStatus.Waiting
    )
  },

  notifyNextWaitlistEntry: (eventTypeId, date) => {
    const { waitlist } = get()
    const next = waitlist.find(
      (w) =>
        w.eventTypeId === eventTypeId &&
        w.date === date &&
        w.status === WaitlistStatus.Waiting
    )
    if (next) {
      set((state) => ({
        waitlist: state.waitlist.map((w) =>
          w.id === next.id ? { ...w, status: WaitlistStatus.Notified } : w
        ),
      }))
    }
    return next
  },
}))

export default useSchedulingStore
