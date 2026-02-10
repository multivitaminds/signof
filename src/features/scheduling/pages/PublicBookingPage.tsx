import { useState, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Calendar,
  CalendarPlus,
  User,
  Mail,
  FileText,
} from 'lucide-react'
import { useSchedulingStore } from '../stores/useSchedulingStore'
import type { TimeRange } from '../types'
import { BookingStatus, LOCATION_LABELS } from '../types'
import {
  getCalendarGrid,
  formatDate,
  isToday,
  isSameDay,
  getMonthName,
} from '../lib/calendarUtils'
import './PublicBookingPage.css'

const STEPS = ['Select Date', 'Select Time', 'Your Details', 'Confirmed']

function generateTimeSlots(durationMinutes: number): TimeRange[] {
  const slots: TimeRange[] = []
  for (let hour = 9; hour < 17; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const start = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
      const endTotal = hour * 60 + min + durationMinutes
      const endH = Math.floor(endTotal / 60)
      const endM = endTotal % 60
      if (endH <= 17) {
        const end = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
        slots.push({ start, end })
      }
    }
  }
  return slots
}

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number) as [number, number]
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>()
  const eventTypes = useSchedulingStore((s) => s.eventTypes)
  const addBooking = useSchedulingStore((s) => s.addBooking)

  const eventType = useMemo(
    () => eventTypes.find((et) => et.slug === slug && et.isActive),
    [eventTypes, slug]
  )

  const [step, setStep] = useState(0)
  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const grid = useMemo(() => getCalendarGrid(calYear, calMonth), [calYear, calMonth])

  const availableSlots = useMemo(
    () => generateTimeSlots(eventType?.durationMinutes ?? 30),
    [eventType?.durationMinutes]
  )

  const selectedEndTime = useMemo(() => {
    if (!selectedTime) return null
    const slot = availableSlots.find((s) => s.start === selectedTime)
    return slot?.end ?? null
  }, [selectedTime, availableSlots])

  const handlePrevMonth = useCallback(() => {
    if (calMonth === 1) {
      setCalYear((y) => y - 1)
      setCalMonth(12)
    } else {
      setCalMonth((m) => m - 1)
    }
  }, [calMonth])

  const handleNextMonth = useCallback(() => {
    if (calMonth === 12) {
      setCalYear((y) => y + 1)
      setCalMonth(1)
    } else {
      setCalMonth((m) => m + 1)
    }
  }, [calMonth])

  const handleSelectDate = useCallback((date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return
    setSelectedDate(date)
    setSelectedTime(null)
    setStep(1)
  }, [])

  const handleSelectTime = useCallback((time: string) => {
    setSelectedTime(time)
    setStep(2)
  }, [])

  const handleSubmit = useCallback(() => {
    if (!eventType || !selectedDate || !selectedTime || !selectedEndTime) return

    const dateStr = formatDate(selectedDate, 'iso')

    addBooking({
      eventTypeId: eventType.id,
      date: dateStr,
      startTime: selectedTime,
      endTime: selectedEndTime,
      timezone,
      status: BookingStatus.Confirmed,
      attendees: [{ name, email, timezone }],
      notes,
    })
    setStep(3)
  }, [
    eventType,
    selectedDate,
    selectedTime,
    selectedEndTime,
    timezone,
    name,
    email,
    notes,
    addBooking,
  ])

  const handleBookAnother = useCallback(() => {
    setStep(0)
    setSelectedDate(null)
    setSelectedTime(null)
    setName('')
    setEmail('')
    setNotes('')
  }, [])

  const canSubmit = name.trim() !== '' && email.trim() !== ''

  if (!eventType) {
    return (
      <div className="public-booking">
        <div className="public-booking__container">
          <div className="public-booking__not-found">
            <Calendar size={48} />
            <h2>Event Not Found</h2>
            <p>
              This booking link is invalid or the event type is no longer
              available.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="public-booking">
      <div className="public-booking__container">
        {/* Header */}
        <div className="public-booking__header">
          <div
            className="public-booking__color-bar"
            style={{ backgroundColor: eventType.color }}
          />
          <h1 className="public-booking__title">{eventType.name}</h1>
          <p className="public-booking__description">
            {eventType.description}
          </p>
          <div className="public-booking__meta">
            <span className="public-booking__meta-item">
              <Clock size={14} />
              {eventType.durationMinutes} min
            </span>
            <span className="public-booking__meta-item">
              <Globe size={14} />
              {LOCATION_LABELS[eventType.location]}
            </span>
          </div>
        </div>

        {/* Step progress */}
        <div className="public-booking__progress">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`public-booking__progress-step${
                i === step ? ' public-booking__progress-step--active' : ''
              }${i < step ? ' public-booking__progress-step--completed' : ''}`}
            >
              <span className="public-booking__progress-dot">
                {i < step ? <Check size={12} /> : i + 1}
              </span>
              <span className="public-booking__progress-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="public-booking__body">
          {/* Step 0: Select Date */}
          {step === 0 && (
            <div className="public-booking__date-step">
              <div className="public-booking__cal-nav">
                <button
                  className="public-booking__cal-nav-btn"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="public-booking__cal-month">
                  {getMonthName(calMonth - 1)} {calYear}
                </span>
                <button
                  className="public-booking__cal-nav-btn"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="public-booking__cal-grid" role="grid" aria-label="Calendar">
                <div className="public-booking__cal-header" role="row">
                  {WEEKDAY_HEADERS.map((d) => (
                    <div key={d} className="public-booking__cal-weekday" role="columnheader">
                      {d}
                    </div>
                  ))}
                </div>
                {grid.map((week, ri) => (
                  <div key={ri} className="public-booking__cal-row" role="row">
                    {week.map((date, ci) => {
                      const isCurrentMonth = date.getMonth() === calMonth - 1
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const isPast = date < today
                      const isTodayDate = isToday(date)
                      const isSelected = selectedDate
                        ? isSameDay(date, selectedDate)
                        : false

                      const cellClasses = [
                        'public-booking__cal-cell',
                        !isCurrentMonth && 'public-booking__cal-cell--outside',
                        isPast && 'public-booking__cal-cell--disabled',
                        isTodayDate && 'public-booking__cal-cell--today',
                        isSelected && 'public-booking__cal-cell--selected',
                      ]
                        .filter(Boolean)
                        .join(' ')

                      return (
                        <div
                          key={ci}
                          className={cellClasses}
                          role="gridcell"
                          aria-label={formatDate(date, 'long')}
                          aria-disabled={isPast || !isCurrentMonth}
                          tabIndex={isPast || !isCurrentMonth ? -1 : 0}
                          onClick={() => {
                            if (!isPast && isCurrentMonth) handleSelectDate(date)
                          }}
                          onKeyDown={(e) => {
                            if (
                              (e.key === 'Enter' || e.key === ' ') &&
                              !isPast &&
                              isCurrentMonth
                            ) {
                              e.preventDefault()
                              handleSelectDate(date)
                            }
                          }}
                        >
                          {date.getDate()}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Select Time */}
          {step === 1 && selectedDate && (
            <div className="public-booking__time-step">
              <button
                className="public-booking__back-btn"
                onClick={() => setStep(0)}
              >
                <ChevronLeft size={16} />
                Back to calendar
              </button>
              <h3 className="public-booking__time-date">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
              <p className="public-booking__time-tz">
                <Globe size={12} /> {timezone}
              </p>
              <div
                className="public-booking__time-grid"
                role="listbox"
                aria-label="Available time slots"
              >
                {availableSlots.map((slot) => (
                  <button
                    key={slot.start}
                    className={`public-booking__time-slot${
                      selectedTime === slot.start
                        ? ' public-booking__time-slot--selected'
                        : ''
                    }`}
                    onClick={() => handleSelectTime(slot.start)}
                    role="option"
                    aria-selected={selectedTime === slot.start}
                  >
                    {formatTime12(slot.start)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Enter Details */}
          {step === 2 && selectedDate && (
            <div className="public-booking__details-step">
              <button
                className="public-booking__back-btn"
                onClick={() => setStep(1)}
              >
                <ChevronLeft size={16} />
                Back to time selection
              </button>

              <div className="public-booking__selected-summary">
                <span>
                  <Calendar size={14} />
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span>
                  <Clock size={14} />
                  {selectedTime ? formatTime12(selectedTime) : ''} -{' '}
                  {selectedEndTime ? formatTime12(selectedEndTime) : ''}
                </span>
              </div>

              <div className="public-booking__form">
                <div className="public-booking__form-field">
                  <label htmlFor="pb-name" className="public-booking__form-label">
                    <User size={14} />
                    Your Name *
                  </label>
                  <input
                    id="pb-name"
                    type="text"
                    className="public-booking__form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="public-booking__form-field">
                  <label htmlFor="pb-email" className="public-booking__form-label">
                    <Mail size={14} />
                    Email *
                  </label>
                  <input
                    id="pb-email"
                    type="email"
                    className="public-booking__form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="public-booking__form-field">
                  <label htmlFor="pb-notes" className="public-booking__form-label">
                    <FileText size={14} />
                    Notes (optional)
                  </label>
                  <textarea
                    id="pb-notes"
                    className="public-booking__form-textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Any additional details..."
                  />
                </div>

                <div className="public-booking__form-tz">
                  <Globe size={12} />
                  <span>Timezone: {timezone}</span>
                </div>

                <button
                  className="btn-primary public-booking__submit-btn"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && selectedDate && (
            <div className="public-booking__confirm-step">
              <div className="public-booking__success-icon">
                <Check size={32} />
              </div>
              <h2 className="public-booking__success-title">
                Booking Confirmed!
              </h2>
              <p className="public-booking__success-msg">
                Your {eventType.name} has been scheduled. A confirmation will be
                sent to {email}.
              </p>

              <div className="public-booking__success-details">
                <div className="public-booking__success-row">
                  <span className="public-booking__success-label">Event</span>
                  <span>{eventType.name}</span>
                </div>
                <div className="public-booking__success-row">
                  <span className="public-booking__success-label">Date</span>
                  <span>
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="public-booking__success-row">
                  <span className="public-booking__success-label">Time</span>
                  <span>
                    {selectedTime ? formatTime12(selectedTime) : ''} -{' '}
                    {selectedEndTime ? formatTime12(selectedEndTime) : ''}
                  </span>
                </div>
                <div className="public-booking__success-row">
                  <span className="public-booking__success-label">Duration</span>
                  <span>{eventType.durationMinutes} min</span>
                </div>
              </div>

              <div className="public-booking__success-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    // Generate .ics data for "Add to Calendar"
                    // For demo, just show an alert
                    if (selectedDate && selectedTime) {
                      const msg = `Calendar event: ${eventType.name} on ${formatDate(selectedDate, 'iso')} at ${selectedTime}`
                      void msg // Placeholder for calendar download
                    }
                  }}
                >
                  <CalendarPlus size={16} />
                  Add to Calendar
                </button>
                <button className="btn-secondary" onClick={handleBookAnother}>
                  Book Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="public-booking__footer">
          <span>Powered by</span>
          <strong>SignOf</strong>
        </div>
      </div>
    </div>
  )
}
