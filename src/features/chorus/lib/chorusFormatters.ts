// ─── Time & Date Formatting for Chorus ─────────────────────────────

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

/**
 * Format a timestamp as a relative or absolute time string.
 * - < 1 min: "Just now"
 * - < 60 min: "5 min ago"
 * - Today: "2:30 PM"
 * - Yesterday: "Yesterday at 4:15 PM"
 * - This year: "Feb 17 at 10:00 AM"
 * - Older: "Feb 17, 2025 at 10:00 AM"
 */
export function formatMessageTime(timestamp: string, now?: Date): string {
  const date = new Date(timestamp)
  const ref = now ?? new Date()
  const diff = ref.getTime() - date.getTime()

  if (diff < MINUTE) return 'Just now'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} min ago`

  const isToday = isSameDay(date, ref)
  if (isToday) return formatTime(date)

  const yesterday = new Date(ref)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(date, yesterday)) return `Yesterday at ${formatTime(date)}`

  if (date.getFullYear() === ref.getFullYear()) {
    return `${formatShortDate(date)} at ${formatTime(date)}`
  }

  return `${formatShortDate(date)}, ${date.getFullYear()} at ${formatTime(date)}`
}

/**
 * Format a timestamp for the message bubble hover tooltip.
 * Always shows full date + time: "Wednesday, February 19, 2026 at 9:30 AM"
 */
export function formatFullTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const day = date.getDate()
  const year = date.getFullYear()
  return `${weekday}, ${month} ${day}, ${year} at ${formatTime(date)}`
}

/**
 * Format a date for the date divider between message groups.
 * - Today: "Today"
 * - Yesterday: "Yesterday"
 * - This year: "Monday, February 17"
 * - Older: "Monday, February 17, 2025"
 */
export function formatDateDivider(timestamp: string, now?: Date): string {
  const date = new Date(timestamp)
  const ref = now ?? new Date()

  if (isSameDay(date, ref)) return 'Today'

  const yesterday = new Date(ref)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(date, yesterday)) return 'Yesterday'

  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const day = date.getDate()

  if (date.getFullYear() === ref.getFullYear()) {
    return `${weekday}, ${month} ${day}`
  }

  return `${weekday}, ${month} ${day}, ${date.getFullYear()}`
}

/**
 * Format a compact timestamp for inline use.
 * - Today: "9:30 AM"
 * - This year: "Feb 17"
 * - Older: "Feb 17, 2025"
 */
export function formatCompactTime(timestamp: string, now?: Date): string {
  const date = new Date(timestamp)
  const ref = now ?? new Date()

  if (isSameDay(date, ref)) return formatTime(date)

  if (date.getFullYear() === ref.getFullYear()) {
    return formatShortDate(date)
  }

  return `${formatShortDate(date)}, ${date.getFullYear()}`
}

// ─── Internal Helpers ──────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
