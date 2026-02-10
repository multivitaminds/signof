/**
 * Timezone utilities using the native Intl API.
 */

/** Returns the user's local timezone (e.g. "America/New_York"). */
export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/** Returns the UTC offset for a timezone as "+HH:MM" or "-HH:MM". */
export function getTimezoneOffset(timezone: string): string {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
  })
  const parts = formatter.formatToParts(now)
  const tzPart = parts.find(p => p.type === 'timeZoneName')
  if (!tzPart) return '+00:00'

  // The offset looks like "GMT-5" or "GMT+5:30" or "GMT"
  const offsetStr = tzPart.value.replace('GMT', '')
  if (!offsetStr) return '+00:00'

  const match = offsetStr.match(/^([+-])(\d{1,2})(?::(\d{2}))?$/)
  if (!match) return '+00:00'

  const sign = match[1]!
  const hours = match[2]!.padStart(2, '0')
  const minutes = match[3] ?? '00'
  return `${sign}${hours}:${minutes}`
}

/** Returns a human-readable timezone label like "America/New_York (UTC-05:00)". */
export function getTimezoneLabel(timezone: string): string {
  const offset = getTimezoneOffset(timezone)
  return `${timezone} (UTC${offset})`
}

/** Array of 20 common timezones. */
export const COMMON_TIMEZONES: string[] = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
]

/**
 * Converts a time string (HH:mm) from one timezone to another on a given date.
 * @param time - Time in HH:mm format
 * @param fromTz - Source timezone
 * @param toTz - Target timezone
 * @param date - Date in YYYY-MM-DD format
 * @returns Time in HH:mm format in the target timezone
 */
export function convertTime(
  time: string,
  fromTz: string,
  toTz: string,
  date: string
): string {
  // Parse the time and date
  const [hours, minutes] = time.split(':').map(Number)
  const [year, month, day] = date.split('-').map(Number)

  // Create a date in the source timezone by finding the UTC equivalent
  // We use a formatter to get the offset for the source timezone
  const tempDate = new Date(year!, month! - 1, day!, hours!, minutes!)

  // Get the source timezone offset in minutes
  const sourceFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: fromTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const targetFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: toTz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  // Find the UTC timestamp that corresponds to the given time in the source timezone.
  // We do this by computing the difference between local and source tz representations.
  const localParts = sourceFormatter.formatToParts(tempDate)
  const localHour = Number(localParts.find(p => p.type === 'hour')?.value ?? 0)
  const localMinute = Number(localParts.find(p => p.type === 'minute')?.value ?? 0)

  // Difference between what we wanted and what the source tz shows
  const diffMinutes = (hours! - localHour) * 60 + (minutes! - localMinute)

  // Adjust to get the correct UTC time
  const corrected = new Date(tempDate.getTime() + diffMinutes * 60_000)

  // Format in the target timezone
  const targetParts = targetFormatter.formatToParts(corrected)
  const targetHour = targetParts.find(p => p.type === 'hour')?.value ?? '00'
  const targetMinute = targetParts.find(p => p.type === 'minute')?.value ?? '00'

  // Handle "24" hour which Intl can produce for midnight
  const h = targetHour === '24' ? '00' : targetHour.padStart(2, '0')
  return `${h}:${targetMinute.padStart(2, '0')}`
}
