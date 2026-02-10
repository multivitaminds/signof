import { useState, useCallback, useMemo } from 'react'
import { X, Calendar, Clock, Globe, RefreshCw } from 'lucide-react'
import type { Booking, EventType, TimeRange } from '../../types'
import TimeSlotPicker from '../TimeSlotPicker/TimeSlotPicker'
import './RescheduleModal.css'

interface RescheduleModalProps {
  booking: Booking
  eventType?: EventType
  onReschedule: (newDate: string, newTime: string, reason: string) => void
  onClose: () => void
}

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number) as [number, number]
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

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

export default function RescheduleModal({
  booking,
  eventType,
  onReschedule,
  onClose,
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(booking.date)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const hostTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const attendeeTimezone = booking.attendees[0]?.timezone ?? hostTimezone
  const durationMinutes = eventType?.durationMinutes ?? 30

  const availableSlots = useMemo(
    () => generateTimeSlots(durationMinutes),
    [durationMinutes]
  )

  const selectedDateObj = useMemo(
    () => (selectedDate ? new Date(selectedDate + 'T00:00:00') : null),
    [selectedDate]
  )

  const attendeeName = booking.attendees[0]?.name ?? 'Attendee'

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(e.target.value)
      setSelectedTime(null)
    },
    []
  )

  const handleSubmit = useCallback(() => {
    if (!selectedDate || !selectedTime) return
    onReschedule(selectedDate, selectedTime, reason)
  }, [selectedDate, selectedTime, reason, onReschedule])

  const canSubmit = selectedDate !== '' && selectedTime !== null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content reschedule-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Reschedule booking"
      >
        <div className="modal-header">
          <h2>
            <RefreshCw size={18} />
            Reschedule Booking
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Current booking details */}
        <div className="reschedule-modal__current">
          <h3 className="reschedule-modal__current-title">Current Booking</h3>
          <div className="reschedule-modal__current-details">
            <div className="reschedule-modal__detail-row">
              <Calendar size={14} />
              <span>
                {new Date(booking.date + 'T00:00:00').toLocaleDateString(
                  'en-US',
                  { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
                )}
              </span>
            </div>
            <div className="reschedule-modal__detail-row">
              <Clock size={14} />
              <span>
                {formatTime12(booking.startTime)} - {formatTime12(booking.endTime)}
              </span>
            </div>
            <div className="reschedule-modal__detail-row">
              <Globe size={14} />
              <span>{attendeeName} ({attendeeTimezone})</span>
            </div>
            {hostTimezone !== attendeeTimezone && (
              <div className="reschedule-modal__detail-row">
                <Globe size={14} />
                <span>You ({hostTimezone})</span>
              </div>
            )}
          </div>
        </div>

        {/* New date & time */}
        <div className="reschedule-modal__body">
          <div className="reschedule-modal__field">
            <label
              className="reschedule-modal__label"
              htmlFor="reschedule-date"
            >
              New Date
            </label>
            <input
              id="reschedule-date"
              type="date"
              className="reschedule-modal__date-input"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>

          {selectedDateObj && (
            <TimeSlotPicker
              date={selectedDateObj}
              slots={availableSlots}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              timezone={hostTimezone}
            />
          )}

          <div className="reschedule-modal__field">
            <label
              className="reschedule-modal__label"
              htmlFor="reschedule-reason"
            >
              Reason (optional)
            </label>
            <textarea
              id="reschedule-reason"
              className="reschedule-modal__textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Let the attendee know why you are rescheduling..."
            />
          </div>
        </div>

        <div className="reschedule-modal__actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  )
}
