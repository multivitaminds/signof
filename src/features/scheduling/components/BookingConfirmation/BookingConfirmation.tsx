import { useCallback, useMemo } from 'react'
import {
  Check,
  CalendarPlus,
  RefreshCw,
  X,
  Share2,
  Mail,
  Clock,
  Calendar,
  MapPin,
  User,
} from 'lucide-react'
import type { EventType } from '../../types'
import { LOCATION_LABELS } from '../../types'
import { generateICS } from '../../lib/icsGenerator'
import type { Booking } from '../../types'
import './BookingConfirmation.css'

interface BookingConfirmationProps {
  booking: Booking
  eventType: EventType
  onReschedule?: () => void
  onCancel?: () => void
  onBookAnother?: () => void
}

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number) as [number, number]
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Generates a QR code placeholder SVG pattern based on booking ID */
function generateQRPattern(bookingId: string): string[] {
  const cells: string[] = []
  // Use booking ID chars to create a deterministic pattern
  const seed = bookingId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      const val = (seed * (row + 1) * (col + 1) + row * 13 + col * 7) % 3
      if (val !== 0) {
        cells.push(`${col * 14 + 7},${row * 14 + 7}`)
      }
    }
  }
  return cells
}

export default function BookingConfirmation({
  booking,
  eventType,
  onReschedule,
  onCancel,
  onBookAnother,
}: BookingConfirmationProps) {
  const attendee = booking.attendees[0]
  const qrCells = useMemo(() => generateQRPattern(booking.id), [booking.id])

  const handleDownloadICS = useCallback(() => {
    const icsContent = generateICS(booking, eventType)
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${eventType.slug}-${booking.date}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [booking, eventType])

  const handleShare = useCallback(() => {
    const shareUrl = `${window.location.origin}/book/${eventType.slug}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {
        // Fallback: do nothing
      })
    }
  }, [eventType.slug])

  return (
    <div className="booking-confirmation">
      {/* Success header */}
      <div className="booking-confirmation__success">
        <div className="booking-confirmation__success-icon">
          <Check size={32} />
        </div>
        <h2 className="booking-confirmation__success-title">
          Booking Confirmed!
        </h2>
        <p className="booking-confirmation__success-subtitle">
          Your {eventType.name} has been scheduled successfully.
        </p>
      </div>

      {/* Event details card */}
      <div className="booking-confirmation__details-card">
        <div
          className="booking-confirmation__details-bar"
          style={{ backgroundColor: eventType.color }}
        />
        <h3 className="booking-confirmation__details-name">
          {eventType.name}
        </h3>

        <div className="booking-confirmation__details-rows">
          <div className="booking-confirmation__detail-row">
            <Calendar size={14} />
            <span>{formatDateLong(booking.date)}</span>
          </div>
          <div className="booking-confirmation__detail-row">
            <Clock size={14} />
            <span>
              {formatTime12(booking.startTime)} - {formatTime12(booking.endTime)}{' '}
              ({eventType.durationMinutes} min)
            </span>
          </div>
          <div className="booking-confirmation__detail-row">
            <MapPin size={14} />
            <span>{LOCATION_LABELS[eventType.location]}</span>
          </div>
        </div>

        {/* Attendee info */}
        {attendee && (
          <div className="booking-confirmation__attendee">
            <div className="booking-confirmation__detail-row">
              <User size={14} />
              <span>{attendee.name}</span>
            </div>
            <div className="booking-confirmation__detail-row">
              <Mail size={14} />
              <span>{attendee.email}</span>
            </div>
          </div>
        )}
      </div>

      {/* QR Code placeholder */}
      <div className="booking-confirmation__qr">
        <svg
          className="booking-confirmation__qr-svg"
          viewBox="0 0 112 112"
          role="img"
          aria-label={`Booking reference: ${booking.id}`}
        >
          {/* Border */}
          <rect
            x="0"
            y="0"
            width="112"
            height="112"
            rx="8"
            fill="var(--bg-secondary, #F9FAFB)"
            stroke="var(--border-color, #E5E7EB)"
            strokeWidth="1"
          />
          {/* Corner markers */}
          <rect x="7" y="7" width="28" height="28" rx="4" fill="var(--color-primary, #4F46E5)" />
          <rect x="11" y="11" width="20" height="20" rx="2" fill="var(--bg-primary, #fff)" />
          <rect x="15" y="15" width="12" height="12" rx="1" fill="var(--color-primary, #4F46E5)" />

          <rect x="77" y="7" width="28" height="28" rx="4" fill="var(--color-primary, #4F46E5)" />
          <rect x="81" y="11" width="20" height="20" rx="2" fill="var(--bg-primary, #fff)" />
          <rect x="85" y="15" width="12" height="12" rx="1" fill="var(--color-primary, #4F46E5)" />

          <rect x="7" y="77" width="28" height="28" rx="4" fill="var(--color-primary, #4F46E5)" />
          <rect x="11" y="81" width="20" height="20" rx="2" fill="var(--bg-primary, #fff)" />
          <rect x="15" y="85" width="12" height="12" rx="1" fill="var(--color-primary, #4F46E5)" />

          {/* Pattern cells */}
          {qrCells.map((pos, i) => {
            const [cx, cy] = pos.split(',').map(Number) as [number, number]
            return (
              <rect
                key={i}
                x={cx + 35}
                y={cy + 35}
                width="6"
                height="6"
                rx="1"
                fill="var(--text-primary, #111827)"
                opacity="0.7"
              />
            )
          })}
        </svg>
        <span className="booking-confirmation__qr-label">
          Ref: {booking.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Email confirmation message */}
      {attendee && (
        <div className="booking-confirmation__email-notice">
          <Mail size={14} />
          <span>
            You will receive a confirmation email at{' '}
            <strong>{attendee.email}</strong>
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="booking-confirmation__actions">
        <button
          className="btn-primary booking-confirmation__action-btn"
          onClick={handleDownloadICS}
        >
          <CalendarPlus size={16} />
          Add to Calendar
        </button>

        {onReschedule && (
          <button
            className="btn-secondary booking-confirmation__action-btn"
            onClick={onReschedule}
          >
            <RefreshCw size={16} />
            Reschedule
          </button>
        )}

        {onCancel && (
          <button
            className="btn-secondary booking-confirmation__action-btn booking-confirmation__action-btn--cancel"
            onClick={onCancel}
          >
            <X size={16} />
            Cancel
          </button>
        )}

        <button
          className="btn-secondary booking-confirmation__action-btn"
          onClick={handleShare}
        >
          <Share2 size={16} />
          Share Booking Link
        </button>
      </div>

      {onBookAnother && (
        <button
          className="booking-confirmation__book-another"
          onClick={onBookAnother}
        >
          Book another time
        </button>
      )}
    </div>
  )
}
