// ─── Scheduling Enums (const object pattern) ─────────────────────

export const EventTypeCategory = {
  OneOnOne: 'one_on_one',
  Group: 'group',
  SigningSession: 'signing_session',
} as const

export type EventTypeCategory = (typeof EventTypeCategory)[keyof typeof EventTypeCategory]

export const LocationType = {
  InPerson: 'in_person',
  Phone: 'phone',
  Zoom: 'zoom',
  GoogleMeet: 'google_meet',
  MicrosoftTeams: 'microsoft_teams',
} as const

export type LocationType = (typeof LocationType)[keyof typeof LocationType]

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

// ─── Recurrence Types ───────────────────────────────────────────

export const RecurrenceFrequency = {
  Daily: 'daily',
  Weekly: 'weekly',
  Biweekly: 'biweekly',
  Monthly: 'monthly',
} as const

export type RecurrenceFrequency = (typeof RecurrenceFrequency)[keyof typeof RecurrenceFrequency]

export interface RecurrenceRule {
  frequency: RecurrenceFrequency
  interval: number
  daysOfWeek?: DayOfWeek[]
  endDate?: string        // ISO date string YYYY-MM-DD
  maxOccurrences?: number
}

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
  location: LocationType
  schedule: WeeklySchedule
  dateOverrides: DateOverride[]
  customQuestions: CustomQuestion[]
  maxAttendees: number
  recurrence?: RecurrenceRule
  brandingLogo?: string            // URL or data URL of logo image
  brandingCompanyName?: string     // Company name shown on booking page
  brandingAccentColor?: string     // Override color (defaults to eventType.color)
  brandingHideOrchestree?: boolean     // Hide "Powered by Orchestree" footer
  waitlistEnabled: boolean
  maxWaitlist: number
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
  rescheduleReason?: string
  recurrenceGroupId?: string // Links bookings that were created as a recurring group
  createdAt: string
  updatedAt: string
}

// ─── Calendar Sync Types ────────────────────────────────────────

export const SyncDirection = {
  OneWay: 'one_way',
  TwoWay: 'two_way',
} as const

export type SyncDirection = (typeof SyncDirection)[keyof typeof SyncDirection]

export const CalendarProvider = {
  Google: 'google',
  Outlook: 'outlook',
  Apple: 'apple',
} as const

export type CalendarProvider = (typeof CalendarProvider)[keyof typeof CalendarProvider]

export interface CalendarConnection {
  id: string
  provider: CalendarProvider
  name: string
  email: string
  syncDirection: SyncDirection
  checkConflicts: boolean
  connected: boolean
  lastSyncedAt: string | null
}

// ─── Waitlist Types ─────────────────────────────────────────────

export const WaitlistStatus = {
  Waiting: 'waiting',
  Notified: 'notified',
  Approved: 'approved',
  Rejected: 'rejected',
  Expired: 'expired',
} as const

export type WaitlistStatus = (typeof WaitlistStatus)[keyof typeof WaitlistStatus]

export interface WaitlistEntry {
  id: string
  eventTypeId: string
  date: string       // ISO date string YYYY-MM-DD
  timeSlot: string   // HH:mm format
  name: string
  email: string
  status: WaitlistStatus
  createdAt: string
}

// ─── Recurring Booking Types ────────────────────────────────────

export const RecurringPattern = {
  Weekly: 'weekly',
  Biweekly: 'biweekly',
  Monthly: 'monthly',
} as const

export type RecurringPattern = (typeof RecurringPattern)[keyof typeof RecurringPattern]

export const RECURRING_PATTERN_LABELS: Record<RecurringPattern, string> = {
  [RecurringPattern.Weekly]: 'Weekly',
  [RecurringPattern.Biweekly]: 'Bi-weekly',
  [RecurringPattern.Monthly]: 'Monthly',
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

export const BUFFER_OPTIONS: number[] = [0, 5, 10, 15]

export const LOCATION_LABELS: Record<LocationType, string> = {
  [LocationType.InPerson]: 'In-person',
  [LocationType.Phone]: 'Phone',
  [LocationType.Zoom]: 'Zoom',
  [LocationType.GoogleMeet]: 'Google Meet',
  [LocationType.MicrosoftTeams]: 'Microsoft Teams',
}

export const RECURRENCE_LABELS: Record<RecurrenceFrequency, string> = {
  [RecurrenceFrequency.Daily]: 'Daily',
  [RecurrenceFrequency.Weekly]: 'Weekly',
  [RecurrenceFrequency.Biweekly]: 'Bi-weekly',
  [RecurrenceFrequency.Monthly]: 'Monthly',
}

export const DAY_OF_WEEK_SHORT_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.Monday]: 'M',
  [DayOfWeek.Tuesday]: 'T',
  [DayOfWeek.Wednesday]: 'W',
  [DayOfWeek.Thursday]: 'T',
  [DayOfWeek.Friday]: 'F',
  [DayOfWeek.Saturday]: 'S',
  [DayOfWeek.Sunday]: 'S',
}

export const DAY_OF_WEEK_FULL_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.Monday]: 'Monday',
  [DayOfWeek.Tuesday]: 'Tuesday',
  [DayOfWeek.Wednesday]: 'Wednesday',
  [DayOfWeek.Thursday]: 'Thursday',
  [DayOfWeek.Friday]: 'Friday',
  [DayOfWeek.Saturday]: 'Saturday',
  [DayOfWeek.Sunday]: 'Sunday',
}

export const ALL_DAYS_OF_WEEK: DayOfWeek[] = [
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
  DayOfWeek.Saturday,
  DayOfWeek.Sunday,
]

export const CALENDAR_PROVIDER_LABELS: Record<CalendarProvider, string> = {
  [CalendarProvider.Google]: 'Google Calendar',
  [CalendarProvider.Outlook]: 'Outlook Calendar',
  [CalendarProvider.Apple]: 'Apple Calendar',
}

export const SYNC_DIRECTION_LABELS: Record<SyncDirection, string> = {
  [SyncDirection.OneWay]: 'One-way (read only)',
  [SyncDirection.TwoWay]: 'Two-way (read + write)',
}
