import type { EventType, Booking, TimeRange } from '../types'
import { type DayOfWeek, DayOfWeek as DayOfWeekEnum } from '../types'

// ─── Time math helpers ──────────────────────────────────────────

/** Adds minutes to an HH:mm time string. Returns HH:mm format. */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const totalMinutes = h! * 60 + m! + minutes
  const newH = Math.floor(totalMinutes / 60) % 24
  const newM = totalMinutes % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

/** Converts HH:mm to total minutes from midnight. */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h! * 60 + m!
}

/** Returns true if a time is within a range (inclusive start, exclusive end). */
export function isTimeInRange(time: string, range: TimeRange): boolean {
  const t = timeToMinutes(time)
  const start = timeToMinutes(range.start)
  const end = timeToMinutes(range.end)
  return t >= start && t < end
}

/** Returns true if two time ranges overlap. */
export function doRangesOverlap(a: TimeRange, b: TimeRange): boolean {
  const aStart = timeToMinutes(a.start)
  const aEnd = timeToMinutes(a.end)
  const bStart = timeToMinutes(b.start)
  const bEnd = timeToMinutes(b.end)
  return aStart < bEnd && bStart < aEnd
}

// ─── Day of week mapping ────────────────────────────────────────

const JS_DAY_TO_DAY_OF_WEEK: Record<number, DayOfWeek> = {
  0: DayOfWeekEnum.Sunday,
  1: DayOfWeekEnum.Monday,
  2: DayOfWeekEnum.Tuesday,
  3: DayOfWeekEnum.Wednesday,
  4: DayOfWeekEnum.Thursday,
  5: DayOfWeekEnum.Friday,
  6: DayOfWeekEnum.Saturday,
}

function getDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─── Availability engine ────────────────────────────────────────

interface AvailabilitySlotsParams {
  date: Date
  eventType: EventType
  bookings: Booking[]
  timezone: string
}

/**
 * Computes available time slots for a given date and event type.
 * Returns an array of available TimeRange slots.
 */
export function getAvailableSlots(params: AvailabilitySlotsParams): TimeRange[] {
  const { date, eventType, bookings } = params
  const dateStr = getDateString(date)

  // Check scheduling window
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + eventType.schedulingWindowDays)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  if (targetDate > maxDate || targetDate < today) {
    return []
  }

  // Check for date override
  const override = eventType.dateOverrides.find(o => o.date === dateStr)
  if (override) {
    if (override.ranges === null) return [] // day off
    return generateSlotsFromRanges(override.ranges, eventType, bookings, dateStr, date)
  }

  // Get the day's schedule
  const dayOfWeek = JS_DAY_TO_DAY_OF_WEEK[date.getDay()]!
  const daySchedule = eventType.schedule[dayOfWeek]

  if (!daySchedule.enabled || daySchedule.ranges.length === 0) {
    return []
  }

  return generateSlotsFromRanges(daySchedule.ranges, eventType, bookings, dateStr, date)
}

function generateSlotsFromRanges(
  ranges: TimeRange[],
  eventType: EventType,
  bookings: Booking[],
  dateStr: string,
  date: Date
): TimeRange[] {
  const slots: TimeRange[] = []
  const duration = eventType.durationMinutes
  const dateBookings = bookings.filter(
    b => b.date === dateStr && b.status !== 'cancelled'
  )

  // Check max bookings per day
  if (dateBookings.length >= eventType.maxBookingsPerDay) {
    return []
  }

  const now = new Date()
  const minimumNoticeTime = new Date(now.getTime() + eventType.minimumNoticeMinutes * 60_000)

  for (const range of ranges) {
    const rangeStartMin = timeToMinutes(range.start)
    const rangeEndMin = timeToMinutes(range.end)

    let currentMin = rangeStartMin
    while (currentMin + duration <= rangeEndMin) {
      const slotStart = `${String(Math.floor(currentMin / 60)).padStart(2, '0')}:${String(currentMin % 60).padStart(2, '0')}`
      const slotEnd = addMinutesToTime(slotStart, duration)

      const slotRange: TimeRange = { start: slotStart, end: slotEnd }

      // Check slot with buffers against existing bookings
      const slotWithBuffer: TimeRange = {
        start: addMinutesToTime(slotStart, -eventType.bufferBeforeMinutes),
        end: addMinutesToTime(slotEnd, eventType.bufferAfterMinutes),
      }

      const hasConflict = dateBookings.some(booking => {
        const bookingRange: TimeRange = {
          start: booking.startTime,
          end: booking.endTime,
        }
        return doRangesOverlap(slotWithBuffer, bookingRange)
      })

      // Check minimum notice
      const slotDateTime = new Date(date)
      const [slotH, slotM] = slotStart.split(':').map(Number)
      slotDateTime.setHours(slotH!, slotM!, 0, 0)

      const isAfterNotice = slotDateTime > minimumNoticeTime

      if (!hasConflict && isAfterNotice) {
        slots.push(slotRange)
      }

      currentMin += duration
    }
  }

  return slots
}

interface DateAvailableParams {
  date: Date
  eventType: EventType
  bookings: Booking[]
}

/** Quick check if a date has any possible availability. */
export function isDateAvailable(params: DateAvailableParams): boolean {
  const { date, eventType, bookings } = params
  const dateStr = getDateString(date)

  // Check scheduling window
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + eventType.schedulingWindowDays)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  if (targetDate > maxDate || targetDate < today) {
    return false
  }

  // Check date override
  const override = eventType.dateOverrides.find(o => o.date === dateStr)
  if (override) {
    return override.ranges !== null && override.ranges.length > 0
  }

  // Check day schedule
  const dayOfWeek = JS_DAY_TO_DAY_OF_WEEK[date.getDay()]!
  const daySchedule = eventType.schedule[dayOfWeek]
  if (!daySchedule.enabled) return false

  // Check max bookings per day
  const dateBookings = bookings.filter(
    b => b.date === dateStr && b.status !== 'cancelled'
  )
  if (dateBookings.length >= eventType.maxBookingsPerDay) return false

  return true
}

interface NextAvailableParams {
  fromDate: Date
  eventType: EventType
  bookings: Booking[]
}

/** Scans up to 90 days ahead for the first available date. */
export function getNextAvailableDate(params: NextAvailableParams): Date | null {
  const { fromDate, eventType, bookings } = params
  const maxDays = Math.min(90, eventType.schedulingWindowDays)

  for (let i = 0; i <= maxDays; i++) {
    const checkDate = new Date(fromDate)
    checkDate.setDate(fromDate.getDate() + i)

    if (isDateAvailable({ date: checkDate, eventType, bookings })) {
      return checkDate
    }
  }

  return null
}
