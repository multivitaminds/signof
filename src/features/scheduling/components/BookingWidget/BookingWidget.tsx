import { useState, useCallback, useMemo } from 'react'
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  MessageSquare,
  CheckCircle2,
  MapPin,
  Globe,
} from 'lucide-react'
import type { EventType, Booking, TimeRange } from '../../types'
import { BookingStatus, LOCATION_LABELS } from '../../types'
import { getCalendarGrid, isSameDay, isToday, formatDate, addMonths, getMonthName } from '../../lib/calendarUtils'
import { getAvailableSlots, isDateAvailable } from '../../lib/availabilityEngine'
import { getLocalTimezone } from '../../lib/timezoneUtils'
import './BookingWidget.css'

interface BookingWidgetProps {
  eventType: EventType
  bookings: Booking[]
  hostName: string
  onBook: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => void
}

type WidgetStep = 'calendar' | 'time' | 'form' | 'confirmed'

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number) as [number, number]
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function BookingWidget({
  eventType,
  bookings,
  hostName,
  onBook,
}: BookingWidgetProps) {
  const [step, setStep] = useState<WidgetStep>('calendar')
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeRange | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [responses, setResponses] = useState<Record<string, string>>({})

  const timezone = useMemo(() => getLocalTimezone(), [])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const grid = useMemo(() => getCalendarGrid(year, month + 1), [year, month])

  const availableSlots = useMemo(() => {
    if (!selectedDate) return []
    return getAvailableSlots({
      date: selectedDate,
      eventType,
      bookings,
      timezone,
    })
  }, [selectedDate, eventType, bookings, timezone])

  const handlePrevMonth = useCallback(() => {
    setViewDate((d) => addMonths(d, -1))
  }, [])

  const handleNextMonth = useCallback(() => {
    setViewDate((d) => addMonths(d, 1))
  }, [])

  const handleDateClick = useCallback(
    (date: Date) => {
      const available = isDateAvailable({ date, eventType, bookings })
      if (!available) return
      setSelectedDate(date)
      setSelectedSlot(null)
      setStep('time')
    },
    [eventType, bookings]
  )

  const handleSlotClick = useCallback((slot: TimeRange) => {
    setSelectedSlot(slot)
    setStep('form')
  }, [])

  const handleBackToCalendar = useCallback(() => {
    setStep('calendar')
    setSelectedSlot(null)
  }, [])

  const handleBackToTime = useCallback(() => {
    setStep('time')
    setSelectedSlot(null)
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedDate || !selectedSlot) return

      const dateStr = formatDate(selectedDate, 'iso')

      onBook({
        eventTypeId: eventType.id,
        date: dateStr,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        timezone,
        status: BookingStatus.Confirmed,
        attendees: [
          {
            name,
            email,
            timezone,
            responses: Object.keys(responses).length > 0 ? responses : undefined,
          },
        ],
        notes,
      })
      setStep('confirmed')
    },
    [selectedDate, selectedSlot, name, email, notes, responses, timezone, eventType.id, onBook]
  )

  const monthLabel = `${getMonthName(month)} ${year}`
  const locationLabel = LOCATION_LABELS[eventType.location]

  return (
    <div className="booking-widget">
      {/* Header */}
      <div
        className="booking-widget__header"
        style={{ borderBottomColor: eventType.color }}
      >
        <div
          className="booking-widget__color-bar"
          style={{ backgroundColor: eventType.color }}
        />
        <div className="booking-widget__host">
          <div className="booking-widget__host-avatar" style={{ backgroundColor: eventType.color }}>
            {hostName.charAt(0).toUpperCase()}
          </div>
          <span className="booking-widget__host-name">{hostName}</span>
        </div>
        <h2 className="booking-widget__event-name">{eventType.name}</h2>
        <p className="booking-widget__event-desc">{eventType.description}</p>
        <div className="booking-widget__meta">
          <span className="booking-widget__meta-item">
            <Clock size={14} />
            {eventType.durationMinutes} min
          </span>
          <span className="booking-widget__meta-item">
            <MapPin size={14} />
            {locationLabel}
          </span>
          <span className="booking-widget__meta-item">
            <Globe size={14} />
            {timezone}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="booking-widget__body">
        {step === 'calendar' && (
          <div className="booking-widget__calendar">
            <h3 className="booking-widget__section-title">Select a Date</h3>
            <div className="booking-widget__month-nav">
              <button
                className="booking-widget__nav-btn"
                onClick={handlePrevMonth}
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="booking-widget__month-label">{monthLabel}</span>
              <button
                className="booking-widget__nav-btn"
                onClick={handleNextMonth}
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="booking-widget__weekdays">
              {WEEKDAY_LABELS.map((day) => (
                <div key={day} className="booking-widget__weekday">{day}</div>
              ))}
            </div>

            <div className="booking-widget__days">
              {grid.map((week, wi) => (
                <div key={wi} className="booking-widget__week">
                  {week.map((date, di) => {
                    const isCurrentMonth = date.getMonth() === month
                    const today = isToday(date)
                    const selected = selectedDate ? isSameDay(date, selectedDate) : false
                    const available = isCurrentMonth && isDateAvailable({ date, eventType, bookings })

                    const cls = [
                      'booking-widget__day',
                      !isCurrentMonth && 'booking-widget__day--outside',
                      today && 'booking-widget__day--today',
                      selected && 'booking-widget__day--selected',
                      available && 'booking-widget__day--available',
                      !available && isCurrentMonth && 'booking-widget__day--disabled',
                    ]
                      .filter(Boolean)
                      .join(' ')

                    return (
                      <button
                        key={di}
                        className={cls}
                        disabled={!available}
                        onClick={() => handleDateClick(date)}
                        aria-label={formatDate(date, 'long')}
                      >
                        {date.getDate()}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'time' && selectedDate && (
          <div className="booking-widget__times">
            <button
              className="booking-widget__back-btn"
              onClick={handleBackToCalendar}
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <h3 className="booking-widget__section-title">
              <Calendar size={16} />
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <p className="booking-widget__time-hint">
              Select a time ({timezone})
            </p>

            {availableSlots.length === 0 ? (
              <div className="booking-widget__no-slots">
                <Clock size={24} />
                <p>No available times for this date</p>
              </div>
            ) : (
              <div className="booking-widget__slot-grid">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.start}
                    className={`booking-widget__slot${
                      selectedSlot?.start === slot.start
                        ? ' booking-widget__slot--selected'
                        : ''
                    }`}
                    onClick={() => handleSlotClick(slot)}
                  >
                    {formatTime12(slot.start)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'form' && selectedDate && selectedSlot && (
          <div className="booking-widget__form">
            <button
              className="booking-widget__back-btn"
              onClick={handleBackToTime}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <div className="booking-widget__form-summary">
              <div className="booking-widget__form-summary-item">
                <Calendar size={14} />
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="booking-widget__form-summary-item">
                <Clock size={14} />
                {formatTime12(selectedSlot.start)} - {formatTime12(selectedSlot.end)}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="booking-widget__form-fields">
              <div className="booking-widget__field">
                <label className="booking-widget__label" htmlFor="bw-name">
                  <User size={14} />
                  Name *
                </label>
                <input
                  id="bw-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="booking-widget__input"
                />
              </div>

              <div className="booking-widget__field">
                <label className="booking-widget__label" htmlFor="bw-email">
                  <Mail size={14} />
                  Email *
                </label>
                <input
                  id="bw-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="booking-widget__input"
                />
              </div>

              <div className="booking-widget__field">
                <label className="booking-widget__label" htmlFor="bw-notes">
                  <MessageSquare size={14} />
                  Additional notes
                </label>
                <textarea
                  id="bw-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share anything that will help prepare for our meeting"
                  rows={3}
                  className="booking-widget__textarea"
                />
              </div>

              {eventType.customQuestions.map((q) => (
                <div key={q.id} className="booking-widget__field">
                  <label className="booking-widget__label" htmlFor={`bw-q-${q.id}`}>
                    {q.label}{q.required && ' *'}
                  </label>
                  {q.type === 'select' ? (
                    <select
                      id={`bw-q-${q.id}`}
                      className="booking-widget__input"
                      value={responses[q.id] ?? ''}
                      onChange={(e) =>
                        setResponses((r) => ({ ...r, [q.id]: e.target.value }))
                      }
                      required={q.required}
                    >
                      <option value="">Select...</option>
                      {q.options?.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : q.type === 'textarea' ? (
                    <textarea
                      id={`bw-q-${q.id}`}
                      className="booking-widget__textarea"
                      value={responses[q.id] ?? ''}
                      onChange={(e) =>
                        setResponses((r) => ({ ...r, [q.id]: e.target.value }))
                      }
                      rows={2}
                      required={q.required}
                    />
                  ) : (
                    <input
                      id={`bw-q-${q.id}`}
                      className="booking-widget__input"
                      type="text"
                      value={responses[q.id] ?? ''}
                      onChange={(e) =>
                        setResponses((r) => ({ ...r, [q.id]: e.target.value }))
                      }
                      required={q.required}
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="booking-widget__submit"
                disabled={!name.trim() || !email.trim()}
              >
                Confirm Booking
              </button>
            </form>
          </div>
        )}

        {step === 'confirmed' && selectedDate && selectedSlot && (
          <div className="booking-widget__confirmed">
            <div className="booking-widget__confirmed-icon">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="booking-widget__confirmed-title">You are scheduled!</h3>
            <p className="booking-widget__confirmed-detail">
              A calendar invitation has been sent to <strong>{email}</strong>
            </p>
            <div className="booking-widget__confirmed-summary">
              <div className="booking-widget__confirmed-row">
                <span className="booking-widget__confirmed-label">What</span>
                <span>{eventType.name}</span>
              </div>
              <div className="booking-widget__confirmed-row">
                <span className="booking-widget__confirmed-label">When</span>
                <span>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="booking-widget__confirmed-row">
                <span className="booking-widget__confirmed-label">Time</span>
                <span>{formatTime12(selectedSlot.start)} - {formatTime12(selectedSlot.end)}</span>
              </div>
              <div className="booking-widget__confirmed-row">
                <span className="booking-widget__confirmed-label">Where</span>
                <span>{locationLabel}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
