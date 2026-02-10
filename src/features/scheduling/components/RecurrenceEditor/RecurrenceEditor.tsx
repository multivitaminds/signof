import { useState, useCallback, useMemo } from 'react'
import { Repeat } from 'lucide-react'
import type { RecurrenceRule, DayOfWeek } from '../../types'
import {
  RecurrenceFrequency,
  ALL_DAYS_OF_WEEK,
  DAY_OF_WEEK_SHORT_LABELS,
  DAY_OF_WEEK_FULL_LABELS,
  RECURRENCE_LABELS,
} from '../../types'
import './RecurrenceEditor.css'

interface RecurrenceEditorProps {
  value?: RecurrenceRule
  onChange: (rule: RecurrenceRule | undefined) => void
}

type EndCondition = 'never' | 'after' | 'on_date'

function getEndCondition(rule?: RecurrenceRule): EndCondition {
  if (!rule) return 'never'
  if (rule.maxOccurrences) return 'after'
  if (rule.endDate) return 'on_date'
  return 'never'
}

function buildPreviewText(rule?: RecurrenceRule): string {
  if (!rule) return 'Does not repeat'

  const { frequency, daysOfWeek } = rule

  if (frequency === RecurrenceFrequency.Daily) {
    return 'Every day'
  }

  if (frequency === RecurrenceFrequency.Monthly) {
    return 'Monthly'
  }

  if (
    frequency === RecurrenceFrequency.Weekly ||
    frequency === RecurrenceFrequency.Biweekly
  ) {
    const prefix =
      frequency === RecurrenceFrequency.Biweekly ? 'Every other' : 'Every'

    if (daysOfWeek && daysOfWeek.length > 0) {
      const dayNames = daysOfWeek.map((d) => DAY_OF_WEEK_FULL_LABELS[d])
      if (dayNames.length === 1) {
        return `${prefix} ${dayNames[0]}`
      }
      const last = dayNames[dayNames.length - 1]
      const rest = dayNames.slice(0, -1)
      return `${prefix} ${rest.join(', ')} and ${last}`
    }

    return `${prefix} week`
  }

  return 'Custom recurrence'
}

export default function RecurrenceEditor({
  value,
  onChange,
}: RecurrenceEditorProps) {
  const [frequency, setFrequency] = useState<RecurrenceFrequency | 'none'>(
    value?.frequency ?? 'none'
  )
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>(
    value?.daysOfWeek ?? []
  )
  const [endCondition, setEndCondition] = useState<EndCondition>(
    getEndCondition(value)
  )
  const [maxOccurrences, setMaxOccurrences] = useState(
    value?.maxOccurrences ?? 10
  )
  const [endDate, setEndDate] = useState(value?.endDate ?? '')

  const showDaySelector =
    frequency === RecurrenceFrequency.Weekly ||
    frequency === RecurrenceFrequency.Biweekly

  const currentRule: RecurrenceRule | undefined = useMemo(() => {
    if (frequency === 'none') return undefined
    const rule: RecurrenceRule = {
      frequency,
      interval: 1,
    }
    if (showDaySelector && daysOfWeek.length > 0) {
      rule.daysOfWeek = daysOfWeek
    }
    if (endCondition === 'after') {
      rule.maxOccurrences = maxOccurrences
    }
    if (endCondition === 'on_date' && endDate) {
      rule.endDate = endDate
    }
    return rule
  }, [frequency, daysOfWeek, endCondition, maxOccurrences, endDate, showDaySelector])

  const previewText = useMemo(
    () => buildPreviewText(currentRule),
    [currentRule]
  )

  const handleFrequencyChange = useCallback(
    (newFreq: string) => {
      if (newFreq === 'none') {
        setFrequency('none')
        setDaysOfWeek([])
        onChange(undefined)
        return
      }
      const freq = newFreq as RecurrenceFrequency
      setFrequency(freq)
      // Build new rule immediately
      const rule: RecurrenceRule = { frequency: freq, interval: 1 }
      if (
        (freq === RecurrenceFrequency.Weekly ||
          freq === RecurrenceFrequency.Biweekly) &&
        daysOfWeek.length > 0
      ) {
        rule.daysOfWeek = daysOfWeek
      }
      if (endCondition === 'after') rule.maxOccurrences = maxOccurrences
      if (endCondition === 'on_date' && endDate) rule.endDate = endDate
      onChange(rule)
    },
    [daysOfWeek, endCondition, maxOccurrences, endDate, onChange]
  )

  const handleToggleDay = useCallback(
    (day: DayOfWeek) => {
      const updated = daysOfWeek.includes(day)
        ? daysOfWeek.filter((d) => d !== day)
        : [...daysOfWeek, day]
      setDaysOfWeek(updated)
      if (frequency !== 'none') {
        const rule: RecurrenceRule = {
          frequency,
          interval: 1,
          ...(updated.length > 0 ? { daysOfWeek: updated } : {}),
        }
        if (endCondition === 'after') rule.maxOccurrences = maxOccurrences
        if (endCondition === 'on_date' && endDate) rule.endDate = endDate
        onChange(rule)
      }
    },
    [daysOfWeek, frequency, endCondition, maxOccurrences, endDate, onChange]
  )

  const handleEndConditionChange = useCallback(
    (cond: EndCondition) => {
      setEndCondition(cond)
      if (frequency === 'none') return
      const rule: RecurrenceRule = { frequency, interval: 1 }
      if (showDaySelector && daysOfWeek.length > 0) {
        rule.daysOfWeek = daysOfWeek
      }
      if (cond === 'after') rule.maxOccurrences = maxOccurrences
      if (cond === 'on_date' && endDate) rule.endDate = endDate
      onChange(rule)
    },
    [frequency, daysOfWeek, maxOccurrences, endDate, showDaySelector, onChange]
  )

  const handleMaxOccurrencesChange = useCallback(
    (val: number) => {
      setMaxOccurrences(val)
      if (frequency === 'none') return
      const rule: RecurrenceRule = {
        frequency,
        interval: 1,
        maxOccurrences: val,
      }
      if (showDaySelector && daysOfWeek.length > 0) {
        rule.daysOfWeek = daysOfWeek
      }
      onChange(rule)
    },
    [frequency, daysOfWeek, showDaySelector, onChange]
  )

  const handleEndDateChange = useCallback(
    (val: string) => {
      setEndDate(val)
      if (frequency === 'none') return
      const rule: RecurrenceRule = {
        frequency,
        interval: 1,
        ...(val ? { endDate: val } : {}),
      }
      if (showDaySelector && daysOfWeek.length > 0) {
        rule.daysOfWeek = daysOfWeek
      }
      onChange(rule)
    },
    [frequency, daysOfWeek, showDaySelector, onChange]
  )

  return (
    <div className="recurrence-editor">
      <div className="recurrence-editor__field">
        <label className="recurrence-editor__label" htmlFor="recurrence-freq">
          <Repeat size={14} />
          Repeat
        </label>
        <select
          id="recurrence-freq"
          className="recurrence-editor__select"
          value={frequency}
          onChange={(e) => handleFrequencyChange(e.target.value)}
        >
          <option value="none">None</option>
          {(Object.keys(RECURRENCE_LABELS) as RecurrenceFrequency[]).map(
            (freq) => (
              <option key={freq} value={freq}>
                {RECURRENCE_LABELS[freq]}
              </option>
            )
          )}
        </select>
      </div>

      {showDaySelector && (
        <div className="recurrence-editor__field">
          <span className="recurrence-editor__label">Days</span>
          <div
            className="recurrence-editor__days"
            role="group"
            aria-label="Select days of the week"
          >
            {ALL_DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                type="button"
                className={`recurrence-editor__day-btn${
                  daysOfWeek.includes(day)
                    ? ' recurrence-editor__day-btn--active'
                    : ''
                }`}
                onClick={() => handleToggleDay(day)}
                aria-pressed={daysOfWeek.includes(day)}
                aria-label={DAY_OF_WEEK_FULL_LABELS[day]}
              >
                {DAY_OF_WEEK_SHORT_LABELS[day]}
              </button>
            ))}
          </div>
        </div>
      )}

      {frequency !== 'none' && (
        <div className="recurrence-editor__field">
          <label
            className="recurrence-editor__label"
            htmlFor="recurrence-end"
          >
            Ends
          </label>
          <select
            id="recurrence-end"
            className="recurrence-editor__select"
            value={endCondition}
            onChange={(e) =>
              handleEndConditionChange(e.target.value as EndCondition)
            }
          >
            <option value="never">Never</option>
            <option value="after">After X occurrences</option>
            <option value="on_date">On date</option>
          </select>

          {endCondition === 'after' && (
            <div className="recurrence-editor__end-input">
              <label htmlFor="recurrence-max-occ" className="recurrence-editor__sublabel">
                Occurrences
              </label>
              <input
                id="recurrence-max-occ"
                type="number"
                className="recurrence-editor__number-input"
                min={1}
                max={365}
                value={maxOccurrences}
                onChange={(e) =>
                  handleMaxOccurrencesChange(Number(e.target.value))
                }
              />
            </div>
          )}

          {endCondition === 'on_date' && (
            <div className="recurrence-editor__end-input">
              <label htmlFor="recurrence-end-date" className="recurrence-editor__sublabel">
                End date
              </label>
              <input
                id="recurrence-end-date"
                type="date"
                className="recurrence-editor__date-input"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      <div className="recurrence-editor__preview" aria-live="polite">
        {previewText}
      </div>
    </div>
  )
}
