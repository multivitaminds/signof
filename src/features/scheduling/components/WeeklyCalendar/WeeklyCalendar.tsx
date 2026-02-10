import { useMemo } from 'react'
import type { Booking, EventType } from '../../types'
import { formatDate } from '../../lib/calendarUtils'
import './WeeklyCalendar.css'

interface WeeklyCalendarProps {
  weekDates: Date[]
  bookings: Booking[]
  eventTypes: EventType[]
  onTimeSlotClick: (date: Date, time: string) => void
}

const START_HOUR = 8
const END_HOUR = 18
const SLOT_INTERVAL = 30

function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    for (let min = 0; min < 60; min += SLOT_INTERVAL) {
      slots.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
    }
  }
  return slots
}

function getBlockPosition(startTime: string): { top: number; height: number } {
  const [h, m] = startTime.split(':').map(Number) as [number, number]
  const minutesFromStart = (h - START_HOUR) * 60 + m
  const top = (minutesFromStart / SLOT_INTERVAL) * 40
  return { top, height: 40 }
}

function getBlockHeight(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number) as [number, number]
  const [eh, em] = endTime.split(':').map(Number) as [number, number]
  const durationMinutes = (eh * 60 + em) - (sh * 60 + sm)
  return (durationMinutes / SLOT_INTERVAL) * 40
}

const TIME_SLOTS = generateTimeSlots()

export default function WeeklyCalendar({
  weekDates,
  bookings,
  eventTypes,
  onTimeSlotClick,
}: WeeklyCalendarProps) {
  const eventTypeMap = useMemo(() => {
    const map = new Map<string, EventType>()
    for (const et of eventTypes) {
      map.set(et.id, et)
    }
    return map
  }, [eventTypes])

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>()
    for (const b of bookings) {
      const existing = map.get(b.date)
      if (existing) {
        existing.push(b)
      } else {
        map.set(b.date, [b])
      }
    }
    return map
  }, [bookings])

  return (
    <div className="weekly-calendar">
      <div className="weekly-calendar__header">
        <div className="weekly-calendar__time-header" />
        {weekDates.map((date, i) => (
          <div key={i} className="weekly-calendar__day-header">
            <span className="weekly-calendar__day-name">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
            <span className="weekly-calendar__day-number">{date.getDate()}</span>
          </div>
        ))}
      </div>

      <div className="weekly-calendar__body">
        <div className="weekly-calendar__time-axis">
          {TIME_SLOTS.map((slot) => (
            <div key={slot} className="weekly-calendar__time-label">
              {slot.endsWith(':00') ? slot : ''}
            </div>
          ))}
        </div>

        {weekDates.map((date, dayIndex) => {
          const dateStr = formatDate(date, 'iso')
          const dayBookings = bookingsByDate.get(dateStr) ?? []

          return (
            <div key={dayIndex} className="weekly-calendar__day-col">
              {TIME_SLOTS.map((slot) => (
                <div
                  key={slot}
                  className="weekly-calendar__time-slot"
                  onClick={() => onTimeSlotClick(date, slot)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${formatDate(date, 'short')} ${slot}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onTimeSlotClick(date, slot)
                    }
                  }}
                />
              ))}

              {dayBookings.map((booking) => {
                const et = eventTypeMap.get(booking.eventTypeId)
                const pos = getBlockPosition(booking.startTime)
                const height = getBlockHeight(booking.startTime, booking.endTime)
                const attendeeName = booking.attendees[0]?.name ?? 'Unknown'

                return (
                  <div
                    key={booking.id}
                    className="weekly-calendar__booking-block"
                    style={{
                      top: `${pos.top}px`,
                      height: `${height}px`,
                      backgroundColor: et?.color ?? 'var(--color-primary)',
                    }}
                    title={`${et?.name ?? 'Event'} - ${attendeeName}`}
                  >
                    <span className="weekly-calendar__booking-name">
                      {et?.name ?? 'Event'}
                    </span>
                    <span className="weekly-calendar__booking-attendee">
                      {attendeeName}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
