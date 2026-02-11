import { useState, useCallback, useMemo, useRef } from 'react'
import { X, Check } from 'lucide-react'
import type { EventType, Booking, TimeRange } from '../../types'
import { BookingStatus } from '../../types'
import { useFocusTrap } from '../../../../hooks/useFocusTrap'
import TimeSlotPicker from '../TimeSlotPicker/TimeSlotPicker'
import './BookingModal.css'

interface BookingModalProps {
  eventType: EventType
  bookings: Booking[]
  onBook: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose: () => void
}

const STEPS = ['Date & Time', 'Details', 'Confirm', 'Booked']

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

export default function BookingModal({
  eventType,
  bookings: _bookings,
  onBook,
  onClose,
}: BookingModalProps) {
  void _bookings // reserved for availability filtering
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus trap: keeps Tab/Shift+Tab within the modal
  useFocusTrap(modalRef)

  const [step, setStep] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [responses, setResponses] = useState<Record<string, string>>({})

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const availableSlots = useMemo(
    () => generateTimeSlots(eventType.durationMinutes),
    [eventType.durationMinutes]
  )

  const selectedEndTime = useMemo(() => {
    if (!selectedTime) return null
    const slot = availableSlots.find((s) => s.start === selectedTime)
    return slot?.end ?? null
  }, [selectedTime, availableSlots])

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }, [])

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }, [])

  const handleConfirm = useCallback(() => {
    if (!selectedDate || !selectedTime || !selectedEndTime) return

    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    onBook({
      eventTypeId: eventType.id,
      date: dateStr,
      startTime: selectedTime,
      endTime: selectedEndTime,
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
    setStep(3)
  }, [
    selectedDate,
    selectedTime,
    selectedEndTime,
    name,
    email,
    notes,
    responses,
    timezone,
    eventType.id,
    onBook,
  ])

  const handleDateInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (val) {
        handleSelectDate(new Date(val + 'T00:00:00'))
      }
    },
    [handleSelectDate]
  )

  const canProceedStep0 = selectedDate !== null && selectedTime !== null
  const canProceedStep1 = name.trim() !== '' && email.trim() !== ''

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content booking-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Book ${eventType.name}`}
      >
        <div className="modal-header">
          <h2>Book {eventType.name}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="booking-modal__steps">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`booking-modal__step${i === step ? ' booking-modal__step--active' : ''}${i < step ? ' booking-modal__step--completed' : ''}`}
            >
              <span className="booking-modal__step-dot">
                {i < step ? <Check size={12} /> : i + 1}
              </span>
              <span className="booking-modal__step-label">{label}</span>
            </div>
          ))}
        </div>

        <div className="booking-modal__body">
          {step === 0 && (
            <div className="booking-modal__date-time">
              <div className="event-type-form__field">
                <label className="event-type-form__label" htmlFor="bm-date">
                  Select Date
                </label>
                <input
                  id="bm-date"
                  type="date"
                  onChange={handleDateInputChange}
                  value={
                    selectedDate
                      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
                      : ''
                  }
                />
              </div>
              {selectedDate && (
                <TimeSlotPicker
                  date={selectedDate}
                  slots={availableSlots}
                  selectedTime={selectedTime}
                  onSelectTime={setSelectedTime}
                  timezone={timezone}
                />
              )}
            </div>
          )}

          {step === 1 && (
            <div className="booking-modal__details">
              <div className="event-type-form__field">
                <label className="event-type-form__label" htmlFor="bm-name">
                  Your Name
                </label>
                <input
                  id="bm-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="event-type-form__field">
                <label className="event-type-form__label" htmlFor="bm-email">
                  Email
                </label>
                <input
                  id="bm-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="event-type-form__field">
                <label className="event-type-form__label" htmlFor="bm-notes">
                  Notes (optional)
                </label>
                <textarea
                  id="bm-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Anything you'd like us to know"
                />
              </div>
              {eventType.customQuestions.map((q) => (
                <div key={q.id} className="event-type-form__field">
                  <label className="event-type-form__label" htmlFor={`bm-q-${q.id}`}>
                    {q.label}
                    {q.required && ' *'}
                  </label>
                  {q.type === 'select' ? (
                    <select
                      id={`bm-q-${q.id}`}
                      value={responses[q.id] ?? ''}
                      onChange={(e) =>
                        setResponses((r) => ({ ...r, [q.id]: e.target.value }))
                      }
                    >
                      <option value="">Select...</option>
                      {q.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : q.type === 'textarea' ? (
                    <textarea
                      id={`bm-q-${q.id}`}
                      value={responses[q.id] ?? ''}
                      onChange={(e) =>
                        setResponses((r) => ({ ...r, [q.id]: e.target.value }))
                      }
                      rows={2}
                    />
                  ) : (
                    <input
                      id={`bm-q-${q.id}`}
                      type="text"
                      value={responses[q.id] ?? ''}
                      onChange={(e) =>
                        setResponses((r) => ({ ...r, [q.id]: e.target.value }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 2 && selectedDate && (
            <div className="booking-modal__confirm">
              <div className="booking-modal__summary">
                <div className="booking-modal__summary-row">
                  <span className="booking-modal__summary-label">Event</span>
                  <span>{eventType.name}</span>
                </div>
                <div className="booking-modal__summary-row">
                  <span className="booking-modal__summary-label">Duration</span>
                  <span>{eventType.durationMinutes} min</span>
                </div>
                <div className="booking-modal__summary-row">
                  <span className="booking-modal__summary-label">Date</span>
                  <span>
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="booking-modal__summary-row">
                  <span className="booking-modal__summary-label">Time</span>
                  <span>
                    {selectedTime} - {selectedEndTime}
                  </span>
                </div>
                <div className="booking-modal__summary-row">
                  <span className="booking-modal__summary-label">Name</span>
                  <span>{name}</span>
                </div>
                <div className="booking-modal__summary-row">
                  <span className="booking-modal__summary-label">Email</span>
                  <span>{email}</span>
                </div>
                {notes && (
                  <div className="booking-modal__summary-row">
                    <span className="booking-modal__summary-label">Notes</span>
                    <span>{notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="booking-modal__success">
              <div className="booking-modal__success-icon">
                <Check size={32} />
              </div>
              <h3>Booking Confirmed!</h3>
              <p>
                Your {eventType.name} has been scheduled. A confirmation email
                will be sent to {email}.
              </p>
            </div>
          )}
        </div>

        <div className="booking-modal__actions">
          {step > 0 && step < 3 && (
            <button className="btn-secondary" onClick={handleBack}>
              Back
            </button>
          )}
          <div className="booking-modal__actions-right">
            {step === 0 && (
              <button
                className="btn-primary"
                disabled={!canProceedStep0}
                onClick={handleNext}
              >
                Next
              </button>
            )}
            {step === 1 && (
              <button
                className="btn-primary"
                disabled={!canProceedStep1}
                onClick={handleNext}
              >
                Next
              </button>
            )}
            {step === 2 && (
              <button className="btn-primary" onClick={handleConfirm}>
                Confirm Booking
              </button>
            )}
            {step === 3 && (
              <button className="btn-primary" onClick={onClose}>
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
