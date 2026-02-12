import { useState, useMemo, useCallback } from 'react'
import type { Booking, EventType } from '../../types'
import { BookingStatus } from '../../types'
import './NoShowManager.css'

interface NoShowManagerProps {
  bookings: Booking[]
  eventTypes: EventType[]
  onMarkNoShow: (bookingId: string) => void
  onUndoNoShow: (bookingId: string) => void
}

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number) as [number, number]
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

function getTodayStr(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export default function NoShowManager({
  bookings,
  eventTypes,
  onMarkNoShow,
  onUndoNoShow,
}: NoShowManagerProps) {
  const [filterEventTypeId, setFilterEventTypeId] = useState<string>('all')

  const todayStr = getTodayStr()

  const pastBookings = useMemo(() => {
    return bookings
      .filter(
        (b) =>
          b.date < todayStr &&
          (b.status === BookingStatus.Confirmed ||
            b.status === BookingStatus.NoShow ||
            b.status === BookingStatus.Completed)
      )
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [bookings, todayStr])

  const filteredBookings = useMemo(() => {
    if (filterEventTypeId === 'all') return pastBookings
    return pastBookings.filter((b) => b.eventTypeId === filterEventTypeId)
  }, [pastBookings, filterEventTypeId])

  const noShowCount = useMemo(() => {
    return filteredBookings.filter((b) => b.status === BookingStatus.NoShow).length
  }, [filteredBookings])

  const noShowRate = useMemo(() => {
    if (filteredBookings.length === 0) return 0
    return Math.round((noShowCount / filteredBookings.length) * 100)
  }, [noShowCount, filteredBookings.length])

  const getEventTypeName = useCallback(
    (etId: string) => {
      return eventTypes.find((e) => e.id === etId)?.name ?? 'Unknown'
    },
    [eventTypes]
  )

  const getEventTypeColor = useCallback(
    (etId: string) => {
      return eventTypes.find((e) => e.id === etId)?.color ?? '#6B7280'
    },
    [eventTypes]
  )

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilterEventTypeId(e.target.value)
    },
    []
  )

  const eventTypeOptions = useMemo(() => {
    const ids = new Set(pastBookings.map((b) => b.eventTypeId))
    return eventTypes.filter((et) => ids.has(et.id))
  }, [pastBookings, eventTypes])

  return (
    <div className="no-show-manager">
      <div className="no-show-manager__stats">
        <div className="no-show-manager__stat">
          <span className="no-show-manager__stat-value">{filteredBookings.length}</span>
          <span className="no-show-manager__stat-label">Past Bookings</span>
        </div>
        <div className="no-show-manager__stat">
          <span className="no-show-manager__stat-value">{noShowCount}</span>
          <span className="no-show-manager__stat-label">No-Shows</span>
        </div>
        <div className="no-show-manager__stat">
          <span className="no-show-manager__stat-value no-show-manager__stat-value--rate">
            {noShowRate}%
          </span>
          <span className="no-show-manager__stat-label">No-Show Rate</span>
        </div>
      </div>

      <div className="no-show-manager__toolbar">
        <label className="no-show-manager__filter-label" htmlFor="no-show-event-filter">
          Filter by event type:
        </label>
        <select
          id="no-show-event-filter"
          className="no-show-manager__filter-select"
          value={filterEventTypeId}
          onChange={handleFilterChange}
        >
          <option value="all">All Event Types</option>
          {eventTypeOptions.map((et) => (
            <option key={et.id} value={et.id}>
              {et.name}
            </option>
          ))}
        </select>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="no-show-manager__empty">
          <p>No past bookings to display.</p>
        </div>
      ) : (
        <div className="no-show-manager__list">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="no-show-manager__row">
              <div
                className="no-show-manager__dot"
                style={{ backgroundColor: getEventTypeColor(booking.eventTypeId) }}
              />
              <div className="no-show-manager__info">
                <span className="no-show-manager__event-name">
                  {getEventTypeName(booking.eventTypeId)}
                </span>
                <span className="no-show-manager__date">
                  {new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="no-show-manager__time">
                  {formatTime12(booking.startTime)} - {formatTime12(booking.endTime)}
                </span>
              </div>
              <div className="no-show-manager__attendee">
                {booking.attendees[0] ? (
                  <>
                    <span className="no-show-manager__attendee-name">
                      {booking.attendees[0].name}
                    </span>
                    <span className="no-show-manager__attendee-email">
                      {booking.attendees[0].email}
                    </span>
                  </>
                ) : (
                  <span className="no-show-manager__attendee-name">No attendee</span>
                )}
              </div>
              <span
                className={`no-show-manager__status no-show-manager__status--${booking.status}`}
              >
                {booking.status === BookingStatus.NoShow
                  ? 'No-Show'
                  : booking.status === BookingStatus.Completed
                    ? 'Completed'
                    : 'Confirmed'}
              </span>
              <div className="no-show-manager__actions">
                {booking.status === BookingStatus.NoShow ? (
                  <button
                    className="btn-secondary no-show-manager__btn"
                    onClick={() => onUndoNoShow(booking.id)}
                    aria-label={`Undo no-show for ${booking.attendees[0]?.name ?? 'attendee'}`}
                  >
                    Undo
                  </button>
                ) : (
                  <button
                    className="btn-danger no-show-manager__btn"
                    onClick={() => onMarkNoShow(booking.id)}
                    aria-label={`Mark ${booking.attendees[0]?.name ?? 'attendee'} as no-show`}
                  >
                    Mark No-Show
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
