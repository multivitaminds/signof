import type { TimeRange } from '../../types'
import './TimeSlotPicker.css'

interface TimeSlotPickerProps {
  date: Date
  slots: TimeRange[]
  selectedTime: string | null
  onSelectTime: (time: string) => void
  timezone: string
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number) as [number, number]
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export default function TimeSlotPicker({
  date,
  slots,
  selectedTime,
  onSelectTime,
  timezone,
}: TimeSlotPickerProps) {
  if (slots.length === 0) {
    return (
      <div className="time-slot-picker">
        <p className="time-slot-picker__empty">
          No available times for this date
        </p>
      </div>
    )
  }

  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="time-slot-picker">
      <h3 className="time-slot-picker__date">{dateLabel}</h3>
      <p className="time-slot-picker__timezone">{timezone}</p>
      <div className="time-slot-picker__grid" role="listbox" aria-label="Available time slots">
        {slots.map((slot) => (
          <button
            key={slot.start}
            className={`time-slot-picker__slot${selectedTime === slot.start ? ' time-slot-picker__slot--selected' : ''}`}
            onClick={() => onSelectTime(slot.start)}
            role="option"
            aria-selected={selectedTime === slot.start}
          >
            {formatTime(slot.start)}
          </button>
        ))}
      </div>
    </div>
  )
}
