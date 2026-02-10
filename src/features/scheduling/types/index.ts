// ─── Scheduling Enums (const object pattern) ─────────────────────

export const EventTypeCategory = {
  OneOnOne: 'one_on_one',
  Group: 'group',
  SigningSession: 'signing_session',
} as const

export type EventTypeCategory = (typeof EventTypeCategory)[keyof typeof EventTypeCategory]

export const BookingStatus = {
  Confirmed: 'confirmed',
  Cancelled: 'cancelled',
  Rescheduled: 'rescheduled',
  Completed: 'completed',
  NoShow: 'no_show',
} as const

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus]

export const CalendarView = {
  Month: 'month',
  Week: 'week',
} as const

export type CalendarView = (typeof CalendarView)[keyof typeof CalendarView]

export const BookingFilter = {
  Upcoming: 'upcoming',
  Past: 'past',
  Cancelled: 'cancelled',
  All: 'all',
} as const

export type BookingFilter = (typeof BookingFilter)[keyof typeof BookingFilter]

export const DayOfWeek = {
  Monday: 'monday',
  Tuesday: 'tuesday',
  Wednesday: 'wednesday',
  Thursday: 'thursday',
  Friday: 'friday',
  Saturday: 'saturday',
  Sunday: 'sunday',
} as const

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek]

// ─── Core Interfaces ────────────────────────────────────────────

export interface TimeRange {
  start: string // HH:mm format
  end: string   // HH:mm format
}

export interface DaySchedule {
  enabled: boolean
  ranges: TimeRange[]
}

export type WeeklySchedule = Record<DayOfWeek, DaySchedule>

export interface CustomQuestion {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select'
  required: boolean
  options?: string[]
}

export interface DateOverride {
  date: string               // ISO date string YYYY-MM-DD
  ranges: TimeRange[] | null // null = day off
}

export interface EventType {
  id: string
  name: string
  description: string
  slug: string
  category: EventTypeCategory
  color: string
  durationMinutes: number
  bufferBeforeMinutes: number
  bufferAfterMinutes: number
  maxBookingsPerDay: number
  minimumNoticeMinutes: number
  schedulingWindowDays: number
  schedule: WeeklySchedule
  dateOverrides: DateOverride[]
  customQuestions: CustomQuestion[]
  maxAttendees: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Attendee {
  name: string
  email: string
  timezone: string
  responses?: Record<string, string>
}

export interface Booking {
  id: string
  eventTypeId: string
  date: string       // ISO date string YYYY-MM-DD
  startTime: string  // HH:mm format
  endTime: string    // HH:mm format
  timezone: string
  status: BookingStatus
  attendees: Attendee[]
  notes: string
  cancelReason?: string
  createdAt: string
  updatedAt: string
}

// ─── Constants ──────────────────────────────────────────────────

export const DEFAULT_SCHEDULE: WeeklySchedule = {
  [DayOfWeek.Monday]: { enabled: true, ranges: [{ start: '09:00', end: '17:00' }] },
  [DayOfWeek.Tuesday]: { enabled: true, ranges: [{ start: '09:00', end: '17:00' }] },
  [DayOfWeek.Wednesday]: { enabled: true, ranges: [{ start: '09:00', end: '17:00' }] },
  [DayOfWeek.Thursday]: { enabled: true, ranges: [{ start: '09:00', end: '17:00' }] },
  [DayOfWeek.Friday]: { enabled: true, ranges: [{ start: '09:00', end: '17:00' }] },
  [DayOfWeek.Saturday]: { enabled: false, ranges: [] },
  [DayOfWeek.Sunday]: { enabled: false, ranges: [] },
}

export const EVENT_TYPE_COLORS: string[] = [
  '#4F46E5',
  '#059669',
  '#DC2626',
  '#F59E0B',
  '#8B5CF6',
  '#3B82F6',
  '#EC4899',
  '#14B8A6',
]

export const DURATION_OPTIONS: number[] = [15, 30, 45, 60, 90, 120]
