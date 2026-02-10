import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getCalendarGrid,
  getWeekDates,
  formatDate,
  isSameDay,
  isSameMonth,
  isToday,
  addDays,
  addMonths,
  getMonthName,
  getDayName,
} from './calendarUtils'

describe('getDaysInMonth', () => {
  it('returns 31 for January', () => {
    expect(getDaysInMonth(2026, 1)).toBe(31)
  })

  it('returns 28 for February in a non-leap year', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28)
  })

  it('returns 29 for February in a leap year', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29)
  })

  it('returns 30 for April', () => {
    expect(getDaysInMonth(2026, 4)).toBe(30)
  })

  it('returns 31 for December', () => {
    expect(getDaysInMonth(2026, 12)).toBe(31)
  })
})

describe('getFirstDayOfMonth', () => {
  it('returns 0 for a month starting on Sunday', () => {
    // Feb 2026 starts on Sunday
    expect(getFirstDayOfMonth(2026, 2)).toBe(0)
  })

  it('returns 4 for a month starting on Thursday', () => {
    // Jan 2026 starts on Thursday
    expect(getFirstDayOfMonth(2026, 1)).toBe(4)
  })

  it('returns 1 for a month starting on Monday', () => {
    // June 2026 starts on Monday
    expect(getFirstDayOfMonth(2026, 6)).toBe(1)
  })
})

describe('getCalendarGrid', () => {
  it('returns a 6x7 grid', () => {
    const grid = getCalendarGrid(2026, 2)
    expect(grid.length).toBe(6)
    for (const week of grid) {
      expect(week.length).toBe(7)
    }
  })

  it('starts on Monday (first column is Monday)', () => {
    const grid = getCalendarGrid(2026, 2)
    // First cell of first row should be a Monday
    const firstCell = grid[0]![0]!
    expect(firstCell.getDay()).toBe(1) // Monday
  })

  it('contains all days of the month', () => {
    const grid = getCalendarGrid(2026, 2)
    const allDates = grid.flat()
    const febDays = allDates.filter(
      d => d.getMonth() === 1 && d.getFullYear() === 2026
    )
    expect(febDays.length).toBe(28)
  })

  it('includes padding days from adjacent months', () => {
    const grid = getCalendarGrid(2026, 2)
    const allDates = grid.flat()
    // Should have some January dates and some March dates
    const janDays = allDates.filter(d => d.getMonth() === 0)
    const marDays = allDates.filter(d => d.getMonth() === 2)
    expect(janDays.length).toBeGreaterThan(0)
    expect(marDays.length).toBeGreaterThan(0)
  })

  it('handles months with 31 days', () => {
    const grid = getCalendarGrid(2026, 1) // January 2026
    const allDates = grid.flat()
    const janDays = allDates.filter(
      d => d.getMonth() === 0 && d.getFullYear() === 2026
    )
    expect(janDays.length).toBe(31)
  })
})

describe('getWeekDates', () => {
  it('returns 7 dates', () => {
    const dates = getWeekDates(new Date(2026, 1, 10)) // Tuesday Feb 10
    expect(dates.length).toBe(7)
  })

  it('starts from Monday', () => {
    const dates = getWeekDates(new Date(2026, 1, 12)) // Thursday Feb 12
    expect(dates[0]!.getDay()).toBe(1) // Monday
  })

  it('ends on Sunday', () => {
    const dates = getWeekDates(new Date(2026, 1, 10))
    expect(dates[6]!.getDay()).toBe(0) // Sunday
  })

  it('returns correct week when given a Sunday', () => {
    const dates = getWeekDates(new Date(2026, 1, 15)) // Sunday Feb 15
    expect(dates[0]!.getDate()).toBe(9) // Monday Feb 9
    expect(dates[6]!.getDate()).toBe(15) // Sunday Feb 15
  })

  it('handles week spanning month boundary', () => {
    const dates = getWeekDates(new Date(2026, 1, 2)) // Monday Feb 2
    // Mon Feb 2 through Sun Feb 8
    expect(dates[0]!.getMonth()).toBe(1) // Feb
    expect(dates[6]!.getMonth()).toBe(1) // Feb
  })
})

describe('formatDate', () => {
  const date = new Date(2026, 1, 10) // Feb 10, 2026

  it('formats in short format', () => {
    expect(formatDate(date, 'short')).toBe('Feb 10')
  })

  it('formats in medium format', () => {
    expect(formatDate(date, 'medium')).toBe('Feb 10, 2026')
  })

  it('formats in long format', () => {
    expect(formatDate(date, 'long')).toBe('Tuesday, February 10, 2026')
  })

  it('formats in ISO format', () => {
    expect(formatDate(date, 'iso')).toBe('2026-02-10')
  })

  it('pads single-digit months and days in ISO format', () => {
    const jan1 = new Date(2026, 0, 5)
    expect(formatDate(jan1, 'iso')).toBe('2026-01-05')
  })
})

describe('isSameDay', () => {
  it('returns true for the same date', () => {
    const a = new Date(2026, 1, 10, 9, 0)
    const b = new Date(2026, 1, 10, 17, 30)
    expect(isSameDay(a, b)).toBe(true)
  })

  it('returns false for different dates', () => {
    const a = new Date(2026, 1, 10)
    const b = new Date(2026, 1, 11)
    expect(isSameDay(a, b)).toBe(false)
  })

  it('returns false for same day different month', () => {
    const a = new Date(2026, 0, 10)
    const b = new Date(2026, 1, 10)
    expect(isSameDay(a, b)).toBe(false)
  })
})

describe('isSameMonth', () => {
  it('returns true for dates in the same month', () => {
    const a = new Date(2026, 1, 1)
    const b = new Date(2026, 1, 28)
    expect(isSameMonth(a, b)).toBe(true)
  })

  it('returns false for different months', () => {
    const a = new Date(2026, 0, 31)
    const b = new Date(2026, 1, 1)
    expect(isSameMonth(a, b)).toBe(false)
  })

  it('returns false for same month different year', () => {
    const a = new Date(2025, 1, 10)
    const b = new Date(2026, 1, 10)
    expect(isSameMonth(a, b)).toBe(false)
  })
})

describe('isToday', () => {
  it('returns true for today', () => {
    expect(isToday(new Date())).toBe(true)
  })

  it('returns false for yesterday', () => {
    const yesterday = addDays(new Date(), -1)
    expect(isToday(yesterday)).toBe(false)
  })
})

describe('addDays', () => {
  it('adds days forward', () => {
    const date = new Date(2026, 1, 10)
    const result = addDays(date, 5)
    expect(result.getDate()).toBe(15)
  })

  it('subtracts days', () => {
    const date = new Date(2026, 1, 10)
    const result = addDays(date, -5)
    expect(result.getDate()).toBe(5)
  })

  it('crosses month boundaries', () => {
    const date = new Date(2026, 0, 30) // Jan 30
    const result = addDays(date, 3) // Feb 2
    expect(result.getMonth()).toBe(1)
    expect(result.getDate()).toBe(2)
  })

  it('does not mutate the original date', () => {
    const date = new Date(2026, 1, 10)
    const originalTime = date.getTime()
    addDays(date, 5)
    expect(date.getTime()).toBe(originalTime)
  })
})

describe('addMonths', () => {
  it('adds months forward', () => {
    const date = new Date(2026, 0, 15) // Jan 15
    const result = addMonths(date, 2)
    expect(result.getMonth()).toBe(2) // March
  })

  it('subtracts months', () => {
    const date = new Date(2026, 5, 15) // June 15
    const result = addMonths(date, -2)
    expect(result.getMonth()).toBe(3) // April
  })

  it('crosses year boundaries', () => {
    const date = new Date(2026, 10, 15) // Nov 15
    const result = addMonths(date, 3)
    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(1) // Feb
  })

  it('does not mutate the original date', () => {
    const date = new Date(2026, 1, 10)
    const originalTime = date.getTime()
    addMonths(date, 3)
    expect(date.getTime()).toBe(originalTime)
  })
})

describe('getMonthName', () => {
  it('returns January for month 0', () => {
    expect(getMonthName(0)).toBe('January')
  })

  it('returns December for month 11', () => {
    expect(getMonthName(11)).toBe('December')
  })

  it('returns February for month 1', () => {
    expect(getMonthName(1)).toBe('February')
  })
})

describe('getDayName', () => {
  it('returns Sunday for day 0', () => {
    expect(getDayName(0)).toBe('Sunday')
  })

  it('returns Monday for day 1', () => {
    expect(getDayName(1)).toBe('Monday')
  })

  it('returns Saturday for day 6', () => {
    expect(getDayName(6)).toBe('Saturday')
  })

  it('returns short day names when short=true', () => {
    expect(getDayName(0, true)).toBe('Sun')
    expect(getDayName(1, true)).toBe('Mon')
  })
})
