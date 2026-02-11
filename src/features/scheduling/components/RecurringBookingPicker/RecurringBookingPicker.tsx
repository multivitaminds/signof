import { useState, useCallback, useMemo } from 'react'
import { Repeat, Calendar, Check } from 'lucide-react'
import type { RecurringPattern } from '../../types'
import {
  RecurringPattern as RecurringPatternEnum,
  RECURRING_PATTERN_LABELS,
} from '../../types'
import './RecurringBookingPicker.css'

interface RecurringBookingPickerProps {
  selectedDate: Date
  selectedTime: string
  onConfirm: (dates: string[]) => void
  onSkip: () => void
}

const REPEAT_COUNTS = [2, 3, 4, 6, 8]

function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + weeks * 7)
  return result
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function computeRecurringDates(
  baseDate: Date,
  pattern: RecurringPattern,
  count: number
): Date[] {
  const dates: Date[] = []
  for (let i = 1; i < count; i++) {
    switch (pattern) {
      case RecurringPatternEnum.Weekly:
        dates.push(addWeeks(baseDate, i))
        break
      case RecurringPatternEnum.Biweekly:
        dates.push(addWeeks(baseDate, i * 2))
        break
      case RecurringPatternEnum.Monthly:
        dates.push(addMonths(baseDate, i))
        break
    }
  }
  return dates
}

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number) as [number, number]
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export default function RecurringBookingPicker({
  selectedDate,
  selectedTime,
  onConfirm,
  onSkip,
}: RecurringBookingPickerProps) {
  const [pattern, setPattern] = useState<RecurringPattern>(
    RecurringPatternEnum.Weekly
  )
  const [repeatCount, setRepeatCount] = useState(4)

  const additionalDates = useMemo(
    () => computeRecurringDates(selectedDate, pattern, repeatCount),
    [selectedDate, pattern, repeatCount]
  )

  const allDates = useMemo(
    () => [selectedDate, ...additionalDates],
    [selectedDate, additionalDates]
  )

  const handleConfirm = useCallback(() => {
    const dateStrings = allDates.map((d) => formatDateISO(d))
    onConfirm(dateStrings)
  }, [allDates, onConfirm])

  const handlePatternChange = useCallback((newPattern: string) => {
    setPattern(newPattern as RecurringPattern)
  }, [])

  const handleCountChange = useCallback((count: number) => {
    setRepeatCount(count)
  }, [])

  return (
    <div className="recurring-booking-picker">
      <div className="recurring-booking-picker__header">
        <Repeat size={16} />
        <h3 className="recurring-booking-picker__title">
          Make it recurring?
        </h3>
      </div>

      <p className="recurring-booking-picker__subtitle">
        Book this same time slot on multiple dates.
      </p>

      {/* Pattern selector */}
      <div className="recurring-booking-picker__field">
        <label
          className="recurring-booking-picker__label"
          htmlFor="recurring-pattern"
        >
          Frequency
        </label>
        <select
          id="recurring-pattern"
          className="recurring-booking-picker__select"
          value={pattern}
          onChange={(e) => handlePatternChange(e.target.value)}
        >
          {(
            Object.keys(RECURRING_PATTERN_LABELS) as RecurringPattern[]
          ).map((p) => (
            <option key={p} value={p}>
              {RECURRING_PATTERN_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      {/* Count selector */}
      <div className="recurring-booking-picker__field">
        <label className="recurring-booking-picker__label">
          Total bookings
        </label>
        <div
          className="recurring-booking-picker__count-group"
          role="radiogroup"
          aria-label="Number of recurring bookings"
        >
          {REPEAT_COUNTS.map((count) => (
            <button
              key={count}
              type="button"
              className={`recurring-booking-picker__count-btn${
                repeatCount === count
                  ? ' recurring-booking-picker__count-btn--active'
                  : ''
              }`}
              onClick={() => handleCountChange(count)}
              role="radio"
              aria-checked={repeatCount === count}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Date preview */}
      <div className="recurring-booking-picker__preview">
        <h4 className="recurring-booking-picker__preview-title">
          <Calendar size={14} />
          All dates ({allDates.length} bookings at{' '}
          {formatTime12(selectedTime)})
        </h4>
        <div className="recurring-booking-picker__date-list">
          {allDates.map((date, idx) => (
            <div
              key={idx}
              className={`recurring-booking-picker__date-item${
                idx === 0
                  ? ' recurring-booking-picker__date-item--first'
                  : ''
              }`}
            >
              <Check size={12} />
              <span>{formatDateShort(date)}</span>
              {idx === 0 && (
                <span className="recurring-booking-picker__date-badge">
                  Selected
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="recurring-booking-picker__actions">
        <button
          className="btn-primary recurring-booking-picker__confirm-btn"
          onClick={handleConfirm}
        >
          <Repeat size={14} />
          Book All {allDates.length} Dates
        </button>
        <button
          className="recurring-booking-picker__skip-btn"
          onClick={onSkip}
        >
          Book single date only
        </button>
      </div>
    </div>
  )
}
