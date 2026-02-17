import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'
import { useSchedulingStore } from '../../../scheduling/stores/useSchedulingStore'
import Card from '../../../../components/ui/Card'
import './UpcomingEventsWidget.css'

export default function UpcomingEventsWidget() {
  const bookings = useSchedulingStore((s) => s.bookings)
  const eventTypes = useSchedulingStore((s) => s.eventTypes)

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0] ?? ''
    return bookings
      .filter((b) => b.status === 'confirmed' && b.date >= today)
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
      )
      .slice(0, 3)
  }, [bookings])

  return (
    <Card>
      <Card.Header>
        <Card.Title>Upcoming Events</Card.Title>
      </Card.Header>
      <Card.Body>
        {upcomingEvents.length === 0 ? (
          <p className="upcoming-events__empty">No upcoming events</p>
        ) : (
          <ul className="upcoming-events__list">
            {upcomingEvents.map((booking) => {
              const et = eventTypes.find((e) => e.id === booking.eventTypeId)
              const attendeeCount = booking.attendees?.length ?? 0
              return (
                <li key={booking.id} className="upcoming-events__item">
                  <Link to="/calendar" className="upcoming-events__link">
                    <div
                      className="upcoming-events__dot"
                      style={{ backgroundColor: et?.color ?? '#6B7280' }}
                    />
                    <div className="upcoming-events__info">
                      <span className="upcoming-events__title">
                        {et?.name ?? 'Event'}
                      </span>
                      <span className="upcoming-events__meta">
                        {new Date(booking.date + 'T00:00:00').toLocaleDateString(
                          'en-US',
                          { weekday: 'short', month: 'short', day: 'numeric' }
                        )}
                        {' '}&middot; {booking.startTime}
                      </span>
                    </div>
                    {attendeeCount > 0 && (
                      <span className="upcoming-events__attendees">
                        <Users size={12} />
                        {attendeeCount}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card.Body>
      <Card.Footer>
        <Link to="/calendar" className="upcoming-events__view-all">
          View all <ArrowRight size={14} />
        </Link>
      </Card.Footer>
    </Card>
  )
}
