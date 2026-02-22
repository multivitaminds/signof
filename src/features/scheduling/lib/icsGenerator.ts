import type { Booking, EventType } from '../types'
import { LOCATION_LABELS } from '../types'

/**
 * Escapes text for ICS format.
 * ICS requires commas, semicolons, and backslashes to be escaped.
 * Newlines are encoded as \n in the property value.
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Converts a date string (YYYY-MM-DD) and time string (HH:mm) to
 * ICS datetime format (YYYYMMDDTHHMMSS).
 */
function toICSDateTime(date: string, time: string): string {
  const [year, month, day] = date.split('-')
  const [hour, minute] = time.split(':')
  return `${year}${month}${day}T${hour}${minute}00`
}

/**
 * Generates a unique UID for the ICS event.
 */
function generateUID(bookingId: string): string {
  return `${bookingId}@origina.app`
}

/**
 * Folds long ICS lines to conform to RFC 5545 (max 75 octets per line).
 * Continuation lines start with a single space.
 */
function foldLine(line: string): string {
  if (line.length <= 75) return line
  const parts: string[] = []
  parts.push(line.slice(0, 75))
  let remaining = line.slice(75)
  while (remaining.length > 0) {
    parts.push(' ' + remaining.slice(0, 74))
    remaining = remaining.slice(74)
  }
  return parts.join('\r\n')
}

/**
 * Generates an ICS (iCalendar) file content string for a booking.
 *
 * @param booking - The booking to generate ICS for
 * @param eventType - The event type associated with the booking
 * @returns A string containing the ICS file content
 */
export function generateICS(booking: Booking, eventType: EventType): string {
  const dtStart = toICSDateTime(booking.date, booking.startTime)
  const dtEnd = toICSDateTime(booking.date, booking.endTime)
  const uid = generateUID(booking.id)
  const now = new Date()
  const dtstamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}Z`

  const summary = escapeICSText(eventType.name)
  const description = escapeICSText(
    [
      eventType.description,
      booking.notes ? `Notes: ${booking.notes}` : '',
      `Duration: ${eventType.durationMinutes} minutes`,
      booking.attendees.length > 0
        ? `Attendees: ${booking.attendees.map(a => `${a.name} (${a.email})`).join(', ')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n')
  )
  const location = escapeICSText(LOCATION_LABELS[eventType.location])

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OriginA//Scheduling//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=${booking.timezone}:${dtStart}`,
    `DTEND;TZID=${booking.timezone}:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.map(foldLine).join('\r\n') + '\r\n'
}
