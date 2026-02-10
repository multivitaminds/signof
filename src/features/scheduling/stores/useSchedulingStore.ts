import { create } from 'zustand'
import type { EventType, Booking, BookingFilter } from '../types'
import { BookingStatus } from '../types'
import { SAMPLE_EVENT_TYPES, SAMPLE_BOOKINGS } from '../lib/sampleData'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function now(): string {
  return new Date().toISOString()
}

export interface SchedulingState {
  eventTypes: EventType[]
  bookings: Booking[]

  // Event type actions
  addEventType: (eventType: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'>) => EventType
  updateEventType: (id: string, updates: Partial<EventType>) => void
  deleteEventType: (id: string) => void
  duplicateEventType: (id: string) => EventType | undefined
  getEventType: (id: string) => EventType | undefined

  // Booking actions
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => Booking
  updateBooking: (id: string, updates: Partial<Booking>) => void
  cancelBooking: (id: string, reason?: string) => void
  rescheduleBooking: (id: string, newDate: string, newStartTime: string, newEndTime: string, reason?: string) => void
  getBookingsForDate: (date: string) => Booking[]
  getBookingsForEventType: (eventTypeId: string) => Booking[]

  // Duplicate check
  hasDuplicateBooking: (email: string, eventTypeId: string, date: string) => boolean

  // Convenience
  getFilteredBookings: (filter: BookingFilter) => Booking[]
}

export const useSchedulingStore = create<SchedulingState>((set, get) => ({
  eventTypes: SAMPLE_EVENT_TYPES,
  bookings: SAMPLE_BOOKINGS,

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

  updateBooking: (id, updates) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...updates, updatedAt: now() } : b
      ),
    }))
  },

  cancelBooking: (id, reason) => {
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
}))

export default useSchedulingStore
