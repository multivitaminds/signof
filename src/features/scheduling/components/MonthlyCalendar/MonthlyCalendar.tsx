import { useMemo } from 'react'
import type { Booking } from '../../types'
import { getCalendarGrid, isSameDay, isToday, formatDate } from '../../lib/calendarUtils'
import './MonthlyCalendar.css'

interface MonthlyCalendarProps {
  year: number
  month: number
  bookings: Booking[]
  onDateClick: (date: Date) => void
  selectedDate?: Date
}

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_DOTS = 3

export default function MonthlyCalendar({
  year,
  month,
  bookings,
  onDateClick,
  selectedDate,
}: MonthlyCalendarProps) {
  const grid = useMemo(() => getCalendarGrid(year, month), [year, month])

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>()
    for (const booking of bookings) {
      const existing = map.get(booking.date)
      if (existing) {
        existing.push(booking)
      } else {
        map.set(booking.date, [booking])
      }
    }
    return map
  }, [bookings])

  return (
    <div className="monthly-calendar" role="grid" aria-label="Monthly calendar">
      <div className="monthly-calendar__header" role="row">
        {WEEKDAY_HEADERS.map((day) => (
          <div key={day} className="monthly-calendar__weekday" role="columnheader">
            {day}
          </div>
        ))}
      </div>

      {grid.map((week, rowIndex) => (
        <div key={rowIndex} className="monthly-calendar__row" role="row">
          {week.map((date, colIndex) => {
            const isCurrentMonth = date.getMonth() === month - 1
            const today = isToday(date)
            const selected = selectedDate ? isSameDay(date, selectedDate) : false
            const dateStr = formatDate(date, 'iso')
            const dayBookings = bookingsByDate.get(dateStr) ?? []

            const classNames = [
              'monthly-calendar__cell',
              !isCurrentMonth && 'monthly-calendar__cell--outside',
              today && 'monthly-calendar__cell--today',
              selected && 'monthly-calendar__cell--selected',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <div
                key={colIndex}
                className={classNames}
                role="gridcell"
                aria-label={formatDate(date, 'long')}
                tabIndex={0}
                onClick={() => onDateClick(date)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onDateClick(date)
                  }
                }}
              >
                <span className="monthly-calendar__day">{date.getDate()}</span>
                {dayBookings.length > 0 && (
                  <div className="monthly-calendar__dots">
                    {dayBookings.slice(0, MAX_DOTS).map((_b, i) => (
                      <span key={i} className="monthly-calendar__dot" />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
