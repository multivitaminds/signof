import { useMemo } from 'react'
import { Calendar, Clock, User, ChevronRight } from 'lucide-react'
import type { Booking, EventType } from '../../types'
import { BookingStatus } from '../../types'
import './UpcomingBookings.css'

interface UpcomingBookingsProps {
  bookings: Booking[]
  eventTypes: EventType[]
  onViewAll?: () => void
  maxItems?: number
}

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number) as [number, number]
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

function getDurationMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number) as [number, number]
  const [eh, em] = endTime.split(':').map(Number) as [number, number]
  return (eh * 60 + em) - (sh * 60 + sm)
}

function getStatusLabel(status: string): string {
  switch (status) {
    case BookingStatus.Confirmed:
      return 'Confirmed'
    case BookingStatus.Rescheduled:
      return 'Rescheduled'
    case BookingStatus.Completed:
      return 'Completed'
    case BookingStatus.Cancelled:
      return 'Cancelled'
    case BookingStatus.NoShow:
      return 'No Show'
    default:
      return status
  }
}

export default function UpcomingBookings({
  bookings,
  eventTypes,
  onViewAll,
  maxItems = 5,
}: UpcomingBookingsProps) {
  const eventTypeMap = useMemo(() => {
    const map = new Map<string, EventType>()
    for (const et of eventTypes) {
      map.set(et.id, et)
    }
    return map
  }, [eventTypes])

  const upcomingBookings = useMemo(() => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    return bookings
      .filter(
        (b) =>
          b.date >= todayStr &&
          b.status !== BookingStatus.Cancelled
      )
      .sort((a, b) => {
        const dateComp = a.date.localeCompare(b.date)
        if (dateComp !== 0) return dateComp
        return a.startTime.localeCompare(b.startTime)
      })
      .slice(0, maxItems)
  }, [bookings, maxItems])

  if (upcomingBookings.length === 0) {
    return (
      <div className="upcoming-bookings">
        <h3 className="upcoming-bookings__title">Upcoming Bookings</h3>
        <div className="upcoming-bookings__empty">
          <Calendar size={32} />
          <p>No upcoming bookings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="upcoming-bookings">
      <div className="upcoming-bookings__header">
        <h3 className="upcoming-bookings__title">Upcoming Bookings</h3>
        {onViewAll && (
          <button
            className="upcoming-bookings__view-all"
            onClick={onViewAll}
          >
            View all
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      <div className="upcoming-bookings__list">
        {upcomingBookings.map((booking) => {
          const et = eventTypeMap.get(booking.eventTypeId)
          const attendeeName = booking.attendees[0]?.name ?? 'Unknown'
          const duration = getDurationMinutes(
            booking.startTime,
            booking.endTime
          )

          return (
            <div key={booking.id} className="upcoming-bookings__card">
              <div
                className="upcoming-bookings__card-accent"
                style={{ backgroundColor: et?.color ?? 'var(--color-primary)' }}
              />
              <div className="upcoming-bookings__card-body">
                <div className="upcoming-bookings__card-header">
                  <span className="upcoming-bookings__card-type">
                    {et?.name ?? 'Event'}
                  </span>
                  <span
                    className={`upcoming-bookings__card-status upcoming-bookings__card-status--${booking.status}`}
                  >
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
                <div className="upcoming-bookings__card-attendee">
                  <User size={12} />
                  <span>{attendeeName}</span>
                </div>
                <div className="upcoming-bookings__card-details">
                  <span className="upcoming-bookings__card-date">
                    <Calendar size={12} />
                    {new Date(booking.date + 'T00:00:00').toLocaleDateString(
                      'en-US',
                      { weekday: 'short', month: 'short', day: 'numeric' }
                    )}
                  </span>
                  <span className="upcoming-bookings__card-time">
                    <Clock size={12} />
                    {formatTime12(booking.startTime)} -{' '}
                    {formatTime12(booking.endTime)}
                  </span>
                  <span className="upcoming-bookings__card-duration">
                    {duration} min
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
