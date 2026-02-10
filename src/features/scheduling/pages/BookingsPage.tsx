import { useState, useMemo, useCallback } from 'react'
import {
  Calendar,
  X,
  Search,
  RefreshCw,
  AlertTriangle,
  Clock,
  User,
  Mail,
} from 'lucide-react'
import { useSchedulingStore } from '../stores/useSchedulingStore'
import type { BookingFilter, Booking } from '../types'
import { BookingFilter as BookingFilterEnum, BookingStatus } from '../types'
import EmptyState from '../../../components/EmptyState/EmptyState'
import './BookingsPage.css'

const FILTER_TABS: Array<{ value: BookingFilter; label: string }> = [
  { value: BookingFilterEnum.Upcoming, label: 'Upcoming' },
  { value: BookingFilterEnum.Past, label: 'Past' },
  { value: BookingFilterEnum.Cancelled, label: 'Cancelled' },
  { value: BookingFilterEnum.All, label: 'All' },
]

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number) as [number, number]
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export default function BookingsPage() {
  const eventTypes = useSchedulingStore((s) => s.eventTypes)
  const getFilteredBookings = useSchedulingStore((s) => s.getFilteredBookings)
  const cancelBooking = useSchedulingStore((s) => s.cancelBooking)
  const rescheduleBooking = useSchedulingStore((s) => s.rescheduleBooking)
  // Subscribe to bookings so we re-render when they change
  useSchedulingStore((s) => s.bookings)

  const [filter, setFilter] = useState<BookingFilter>(BookingFilterEnum.Upcoming)
  const [searchQuery, setSearchQuery] = useState('')
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')

  const filteredBookings = useMemo(
    () => getFilteredBookings(filter),
    [filter, getFilteredBookings]
  )

  const searchedBookings = useMemo(() => {
    if (!searchQuery.trim()) return filteredBookings
    const q = searchQuery.toLowerCase()
    return filteredBookings.filter((b) =>
      b.attendees.some(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q)
      )
    )
  }, [filteredBookings, searchQuery])

  const handleCancel = useCallback(
    (id: string) => {
      cancelBooking(id, 'Cancelled by host')
      setCancelConfirmId(null)
    },
    [cancelBooking]
  )

  const handleRescheduleSubmit = useCallback(
    (booking: Booking) => {
      if (!rescheduleDate || !rescheduleTime) return
      const eventType = eventTypes.find((et) => et.id === booking.eventTypeId)
      const duration = eventType?.durationMinutes ?? 30
      const [h, m] = rescheduleTime.split(':').map(Number) as [number, number]
      const endMinutes = h * 60 + m + duration
      const endH = String(Math.floor(endMinutes / 60)).padStart(2, '0')
      const endM = String(endMinutes % 60).padStart(2, '0')
      rescheduleBooking(booking.id, rescheduleDate, rescheduleTime, `${endH}:${endM}`)
      setRescheduleId(null)
      setRescheduleDate('')
      setRescheduleTime('')
    },
    [rescheduleDate, rescheduleTime, eventTypes, rescheduleBooking]
  )

  const getEventTypeName = (etId: string) => {
    return eventTypes.find((e) => e.id === etId)?.name ?? 'Unknown'
  }

  const getEventTypeColor = (etId: string) => {
    return eventTypes.find((e) => e.id === etId)?.color ?? '#6B7280'
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case BookingStatus.Confirmed:
        return 'Confirmed'
      case BookingStatus.Cancelled:
        return 'Cancelled'
      case BookingStatus.Completed:
        return 'Completed'
      case BookingStatus.Rescheduled:
        return 'Rescheduled'
      case BookingStatus.NoShow:
        return 'No Show'
      default:
        return status
    }
  }

  return (
    <div className="bookings-page">
      {/* Filter Tabs + Search */}
      <div className="bookings-page__toolbar">
        <div className="bookings-page__tabs">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`bookings-page__tab ${filter === tab.value ? 'bookings-page__tab--active' : ''}`}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="bookings-page__search">
          <Search size={14} className="bookings-page__search-icon" />
          <input
            type="text"
            className="bookings-page__search-input"
            placeholder="Search by invitee name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search bookings"
          />
          {searchQuery && (
            <button
              className="bookings-page__search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="bookings-page__results-count">
          {searchedBookings.length} result{searchedBookings.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
        </p>
      )}

      {searchedBookings.length === 0 ? (
        <EmptyState
          icon={<Calendar size={36} />}
          title="No bookings yet"
          description={
            searchQuery
              ? `No bookings match "${searchQuery}".`
              : `No ${filter} bookings to show. When someone books time with you, it will appear here.`
          }
        />
      ) : (
        <div className="bookings-page__list">
          {searchedBookings.map((booking) => (
            <div key={booking.id} className="bookings-page__item">
              {/* Color dot */}
              <div
                className="bookings-page__item-dot"
                style={{ backgroundColor: getEventTypeColor(booking.eventTypeId) }}
              />

              <div className="bookings-page__item-content">
                <div className="bookings-page__item-header">
                  <span className="bookings-page__item-type">
                    {getEventTypeName(booking.eventTypeId)}
                  </span>
                  <span
                    className={`bookings-page__item-status bookings-page__item-status--${booking.status}`}
                  >
                    {getStatusLabel(booking.status)}
                  </span>
                </div>

                <div className="bookings-page__item-details">
                  <span className="bookings-page__item-date">
                    <Calendar size={12} />
                    {new Date(booking.date + 'T00:00:00').toLocaleDateString(
                      'en-US',
                      {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      }
                    )}
                  </span>
                  <span className="bookings-page__item-time">
                    <Clock size={12} />
                    {formatTime12(booking.startTime)} -{' '}
                    {formatTime12(booking.endTime)}
                  </span>
                </div>

                {booking.attendees.length > 0 && (
                  <div className="bookings-page__item-attendees">
                    {booking.attendees.map((a, i) => (
                      <div key={i} className="bookings-page__item-attendee">
                        <span className="bookings-page__item-attendee-name">
                          <User size={11} />
                          {a.name}
                        </span>
                        <span className="bookings-page__item-attendee-email">
                          <Mail size={11} />
                          {a.email}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {booking.notes && (
                  <p className="bookings-page__item-notes">{booking.notes}</p>
                )}
              </div>

              {/* Actions */}
              <div className="bookings-page__item-actions">
                {booking.status === BookingStatus.Confirmed && (
                  <>
                    {/* Reschedule */}
                    <button
                      className="bookings-page__action-btn bookings-page__action-btn--reschedule"
                      onClick={() => {
                        setRescheduleId(
                          rescheduleId === booking.id ? null : booking.id
                        )
                        setCancelConfirmId(null)
                        setRescheduleDate(booking.date)
                        setRescheduleTime(booking.startTime)
                      }}
                      title="Reschedule"
                      aria-label={`Reschedule booking with ${booking.attendees[0]?.name ?? 'attendee'}`}
                    >
                      <RefreshCw size={14} />
                    </button>

                    {/* Cancel */}
                    {cancelConfirmId === booking.id ? (
                      <button
                        className="bookings-page__action-btn bookings-page__action-btn--confirm-cancel"
                        onClick={() => handleCancel(booking.id)}
                        title="Confirm cancel"
                        aria-label="Confirm cancel booking"
                      >
                        <AlertTriangle size={14} />
                      </button>
                    ) : (
                      <button
                        className="bookings-page__action-btn bookings-page__action-btn--cancel"
                        onClick={() => {
                          setCancelConfirmId(booking.id)
                          setRescheduleId(null)
                        }}
                        title="Cancel booking"
                        aria-label={`Cancel booking with ${booking.attendees[0]?.name ?? 'attendee'}`}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Reschedule form */}
              {rescheduleId === booking.id && (
                <div
                  className="bookings-page__reschedule"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 className="bookings-page__reschedule-title">
                    <RefreshCw size={14} /> Reschedule
                  </h4>
                  <div className="bookings-page__reschedule-fields">
                    <input
                      type="date"
                      className="bookings-page__reschedule-input"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      aria-label="New date"
                    />
                    <input
                      type="time"
                      className="bookings-page__reschedule-input"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      aria-label="New time"
                    />
                    <button
                      className="btn-primary bookings-page__reschedule-btn"
                      onClick={() => handleRescheduleSubmit(booking)}
                      disabled={!rescheduleDate || !rescheduleTime}
                    >
                      Reschedule
                    </button>
                    <button
                      className="btn-secondary bookings-page__reschedule-btn"
                      onClick={() => setRescheduleId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
