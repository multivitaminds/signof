import { useState, useCallback } from 'react'
import { Copy, Plus, Trash2, Clock } from 'lucide-react'
import type { WeeklySchedule, DaySchedule, TimeRange } from '../../types'
import { DayOfWeek, DEFAULT_SCHEDULE } from '../../types'
import './AvailabilityEditor.css'

interface AvailabilityEditorProps {
  schedule?: WeeklySchedule
  onSave: (schedule: WeeklySchedule) => void
  onCancel?: () => void
}

const DAY_ORDER: Array<{ key: DayOfWeek; label: string; short: string }> = [
  { key: DayOfWeek.Monday, label: 'Monday', short: 'Mon' },
  { key: DayOfWeek.Tuesday, label: 'Tuesday', short: 'Tue' },
  { key: DayOfWeek.Wednesday, label: 'Wednesday', short: 'Wed' },
  { key: DayOfWeek.Thursday, label: 'Thursday', short: 'Thu' },
  { key: DayOfWeek.Friday, label: 'Friday', short: 'Fri' },
  { key: DayOfWeek.Saturday, label: 'Saturday', short: 'Sat' },
  { key: DayOfWeek.Sunday, label: 'Sunday', short: 'Sun' },
]

const WEEKDAY_KEYS: DayOfWeek[] = [
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
]

/** Generate hour marks for the visual timeline. */
const HOUR_MARKS = Array.from({ length: 13 }, (_, i) => i + 6)

function timeToPercent(time: string): number {
  const [h, m] = time.split(':').map(Number) as [number, number]
  const totalMinutes = h * 60 + m
  // Timeline from 6:00 to 22:00 = 960 minutes
  return ((totalMinutes - 360) / 960) * 100
}

export default function AvailabilityEditor({
  schedule: initialSchedule,
  onSave,
  onCancel,
}: AvailabilityEditorProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule>(
    () => initialSchedule ?? { ...DEFAULT_SCHEDULE }
  )

  const updateDay = useCallback((day: DayOfWeek, update: Partial<DaySchedule>) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...update },
    }))
  }, [])

  const toggleDay = useCallback(
    (day: DayOfWeek) => {
      const current = schedule[day]
      const newEnabled = !current.enabled
      updateDay(day, {
        enabled: newEnabled,
        ranges: newEnabled && current.ranges.length === 0
          ? [{ start: '09:00', end: '17:00' }]
          : current.ranges,
      })
    },
    [schedule, updateDay]
  )

  const updateRange = useCallback(
    (day: DayOfWeek, index: number, field: keyof TimeRange, value: string) => {
      const ranges = [...schedule[day].ranges]
      ranges[index] = { ...ranges[index]!, [field]: value }
      updateDay(day, { ranges })
    },
    [schedule, updateDay]
  )

  const addRange = useCallback(
    (day: DayOfWeek) => {
      const ranges = [...schedule[day].ranges]
      const lastEnd = ranges.length > 0 ? ranges[ranges.length - 1]!.end : '09:00'
      const [h] = lastEnd.split(':').map(Number) as [number, number]
      const newStart = lastEnd
      const newEnd = `${String(Math.min(h + 2, 23)).padStart(2, '0')}:00`
      ranges.push({ start: newStart, end: newEnd })
      updateDay(day, { ranges })
    },
    [schedule, updateDay]
  )

  const removeRange = useCallback(
    (day: DayOfWeek, index: number) => {
      const ranges = schedule[day].ranges.filter((_, i) => i !== index)
      updateDay(day, { ranges })
    },
    [schedule, updateDay]
  )

  const copyToWeekdays = useCallback(
    (sourceDay: DayOfWeek) => {
      const source = schedule[sourceDay]
      setSchedule((prev) => {
        const next = { ...prev }
        for (const key of WEEKDAY_KEYS) {
          next[key] = {
            enabled: source.enabled,
            ranges: source.ranges.map((r) => ({ ...r })),
          }
        }
        return next
      })
    },
    [schedule]
  )

  const handleSave = useCallback(() => {
    onSave(schedule)
  }, [schedule, onSave])

  return (
    <div className="availability-editor">
      <div className="availability-editor__header">
        <div className="availability-editor__header-text">
          <h3 className="availability-editor__title">
            <Clock size={18} />
            Availability
          </h3>
          <p className="availability-editor__subtitle">
            Set the hours you are available for bookings
          </p>
        </div>
      </div>

      <div className="availability-editor__days">
        {DAY_ORDER.map(({ key, label, short }) => {
          const daySchedule = schedule[key]
          const isWeekday = WEEKDAY_KEYS.includes(key)

          return (
            <div
              key={key}
              className={`availability-editor__day${
                !daySchedule.enabled ? ' availability-editor__day--disabled' : ''
              }`}
            >
              <div className="availability-editor__day-header">
                <label className="availability-editor__toggle">
                  <input
                    type="checkbox"
                    checked={daySchedule.enabled}
                    onChange={() => toggleDay(key)}
                    aria-label={`Enable ${label}`}
                  />
                  <span className="availability-editor__toggle-slider" />
                </label>
                <span className="availability-editor__day-label">{label}</span>
                <span className="availability-editor__day-short">{short}</span>

                <div className="availability-editor__day-actions">
                  {daySchedule.enabled && (
                    <>
                      <button
                        className="availability-editor__action-btn"
                        onClick={() => addRange(key)}
                        title="Add time range"
                        aria-label={`Add time range for ${label}`}
                      >
                        <Plus size={14} />
                      </button>
                      {isWeekday && (
                        <button
                          className="availability-editor__action-btn"
                          onClick={() => copyToWeekdays(key)}
                          title="Copy to all weekdays"
                          aria-label={`Copy ${label} schedule to all weekdays`}
                        >
                          <Copy size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {daySchedule.enabled && (
                <div className="availability-editor__ranges">
                  {daySchedule.ranges.length === 0 ? (
                    <p className="availability-editor__no-ranges">
                      No time ranges set.{' '}
                      <button
                        className="availability-editor__add-link"
                        onClick={() => addRange(key)}
                      >
                        Add one
                      </button>
                    </p>
                  ) : (
                    daySchedule.ranges.map((range, ri) => (
                      <div key={ri} className="availability-editor__range">
                        <input
                          type="time"
                          className="availability-editor__time-input"
                          value={range.start}
                          onChange={(e) => updateRange(key, ri, 'start', e.target.value)}
                          aria-label={`${label} start time ${ri + 1}`}
                        />
                        <span className="availability-editor__range-sep">to</span>
                        <input
                          type="time"
                          className="availability-editor__time-input"
                          value={range.end}
                          onChange={(e) => updateRange(key, ri, 'end', e.target.value)}
                          aria-label={`${label} end time ${ri + 1}`}
                        />
                        <button
                          className="availability-editor__remove-btn"
                          onClick={() => removeRange(key, ri)}
                          aria-label={`Remove time range ${ri + 1} for ${label}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Visual timeline */}
              {daySchedule.enabled && daySchedule.ranges.length > 0 && (
                <div className="availability-editor__timeline">
                  <div className="availability-editor__timeline-track">
                    {daySchedule.ranges.map((range, ri) => {
                      const left = Math.max(0, timeToPercent(range.start))
                      const right = Math.min(100, timeToPercent(range.end))
                      const width = Math.max(0, right - left)
                      return (
                        <div
                          key={ri}
                          className="availability-editor__timeline-block"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                          }}
                        />
                      )
                    })}
                  </div>
                  <div className="availability-editor__timeline-labels">
                    {HOUR_MARKS.filter((h) => h % 3 === 0).map((h) => (
                      <span
                        key={h}
                        className="availability-editor__timeline-label"
                        style={{ left: `${timeToPercent(`${String(h).padStart(2, '0')}:00`)}%` }}
                      >
                        {h > 12 ? h - 12 : h}{h >= 12 ? 'p' : 'a'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="availability-editor__footer">
        {onCancel && (
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="btn-primary" onClick={handleSave}>
          Save Availability
        </button>
      </div>
    </div>
  )
}
