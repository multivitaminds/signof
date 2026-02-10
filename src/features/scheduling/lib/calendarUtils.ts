/**
 * Pure calendar date-math utilities using native Date API.
 */

/** Returns the number of days in the given month (1-indexed). */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/** Returns the day of week for the first day of the month (0=Sunday). */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay()
}

/**
 * Returns a 6x7 grid of Date objects for a calendar month view.
 * Includes padding days from the previous and next months.
 */
export function getCalendarGrid(year: number, month: number): Date[][] {
  const firstDay = getFirstDayOfMonth(year, month)
  // Convert Sunday=0 to Monday=0 based week: Mon=0, Tue=1, ..., Sun=6
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = getDaysInMonth(year, month)

  const grid: Date[][] = []
  // Start from the first cell which may be in the previous month
  const startDate = new Date(year, month - 1, 1 - startOffset)

  for (let row = 0; row < 6; row++) {
    const week: Date[] = []
    for (let col = 0; col < 7; col++) {
      const dayIndex = row * 7 + col
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + dayIndex)
      week.push(date)
    }
    grid.push(week)
  }

  // Only include the 6th row if it contains days from the target month
  if (grid.length === 6) {
    const lastRow = grid[5]!
    const allNextMonth = lastRow.every(d => d.getMonth() !== month - 1)
    if (allNextMonth && daysInMonth <= 30 && startOffset <= 5) {
      // Keep 6 rows for consistency — calendars always show 6 rows
    }
  }

  return grid
}

/** Returns 7 dates for the week containing the given date, starting from Monday. */
export function getWeekDates(date: Date): Date[] {
  const dayOfWeek = date.getDay()
  // Convert to Monday-based: Mon=0, ..., Sun=6
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(date)
  monday.setDate(date.getDate() - mondayOffset)

  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }
  return dates
}

/** Format a date in one of several formats. */
export function formatDate(date: Date, format: 'short' | 'medium' | 'long' | 'iso'): string {
  if (format === 'iso') {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const options: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  }

  return new Intl.DateTimeFormat('en-US', options[format]).format(date)
}

/** Returns true if two dates represent the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Returns true if two dates are in the same month and year. */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

/** Returns true if the given date is today. */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

/** Returns a new Date with the specified number of days added. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/** Returns a new Date with the specified number of months added. */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/** Returns the full month name for a 0-indexed month number. */
export function getMonthName(month: number): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
    new Date(2000, month)
  )
}

/** Returns the day name for a 0-indexed day number (0=Sunday). */
export function getDayName(day: number, short?: boolean): string {
  // Create a date that falls on the target day of week
  // Jan 2, 2000 is a Sunday
  const date = new Date(2000, 0, 2 + day)
  return new Intl.DateTimeFormat('en-US', {
    weekday: short ? 'short' : 'long',
  }).format(date)
}
