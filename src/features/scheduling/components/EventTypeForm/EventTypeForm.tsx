import { useState, useCallback } from 'react'
import type { EventType } from '../../types'
import { EventTypeCategory, EVENT_TYPE_COLORS } from '../../types'
import DurationSelect from '../DurationSelect/DurationSelect'
import './EventTypeForm.css'

interface EventTypeFormProps {
  eventType?: EventType
  onSave: (data: Partial<EventType>) => void
  onCancel: () => void
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function EventTypeForm({
  eventType,
  onSave,
  onCancel,
}: EventTypeFormProps) {
  const [name, setName] = useState(eventType?.name ?? '')
  const [description, setDescription] = useState(eventType?.description ?? '')
  const [slug, setSlug] = useState(eventType?.slug ?? '')
  const [category, setCategory] = useState<string>(
    eventType?.category ?? EventTypeCategory.OneOnOne
  )
  const [color, setColor] = useState(eventType?.color ?? EVENT_TYPE_COLORS[0]!)
  const [durationMinutes, setDurationMinutes] = useState(
    eventType?.durationMinutes ?? 30
  )
  const [bufferBefore, setBufferBefore] = useState(
    eventType?.bufferBeforeMinutes ?? 0
  )
  const [bufferAfter, setBufferAfter] = useState(
    eventType?.bufferAfterMinutes ?? 0
  )
  const [maxBookings, setMaxBookings] = useState(
    eventType?.maxBookingsPerDay ?? 10
  )
  const [minimumNotice, setMinimumNotice] = useState(
    eventType?.minimumNoticeMinutes ?? 60
  )
  const [schedulingWindow, setSchedulingWindow] = useState(
    eventType?.schedulingWindowDays ?? 60
  )

  const handleNameChange = useCallback((value: string) => {
    setName(value)
    setSlug(slugify(value))
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSave({
        name,
        description,
        slug,
        category: category as EventType['category'],
        color,
        durationMinutes,
        bufferBeforeMinutes: bufferBefore,
        bufferAfterMinutes: bufferAfter,
        maxBookingsPerDay: maxBookings,
        minimumNoticeMinutes: minimumNotice,
        schedulingWindowDays: schedulingWindow,
      })
    },
    [
      name,
      description,
      slug,
      category,
      color,
      durationMinutes,
      bufferBefore,
      bufferAfter,
      maxBookings,
      minimumNotice,
      schedulingWindow,
      onSave,
    ]
  )

  return (
    <form className="event-type-form" onSubmit={handleSubmit}>
      <div className="event-type-form__field">
        <label className="event-type-form__label" htmlFor="et-name">
          Name
        </label>
        <input
          id="et-name"
          className="event-type-form__input"
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g., Quick Chat"
          required
        />
      </div>

      <div className="event-type-form__field">
        <label className="event-type-form__label" htmlFor="et-description">
          Description
        </label>
        <textarea
          id="et-description"
          className="event-type-form__input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Briefly describe this event type"
          rows={3}
        />
      </div>

      <div className="event-type-form__field">
        <label className="event-type-form__label" htmlFor="et-slug">
          URL Slug
        </label>
        <input
          id="et-slug"
          className="event-type-form__input"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="quick-chat"
        />
      </div>

      <div className="event-type-form__field">
        <label className="event-type-form__label" htmlFor="et-category">
          Category
        </label>
        <select
          id="et-category"
          className="event-type-form__input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value={EventTypeCategory.OneOnOne}>One-on-One</option>
          <option value={EventTypeCategory.Group}>Group</option>
          <option value={EventTypeCategory.SigningSession}>Signing Session</option>
        </select>
      </div>

      <div className="event-type-form__field">
        <span className="event-type-form__label">Color</span>
        <div className="event-type-form__colors" role="radiogroup" aria-label="Event color">
          {EVENT_TYPE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`event-type-form__color${c === color ? ' event-type-form__color--selected' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              aria-pressed={c === color}
            />
          ))}
        </div>
      </div>

      <div className="event-type-form__field">
        <span className="event-type-form__label">Duration</span>
        <DurationSelect value={durationMinutes} onChange={setDurationMinutes} />
      </div>

      <div className="event-type-form__row">
        <div className="event-type-form__field">
          <label className="event-type-form__label" htmlFor="et-buffer-before">
            Buffer Before (min)
          </label>
          <input
            id="et-buffer-before"
            className="event-type-form__input"
            type="number"
            min={0}
            value={bufferBefore}
            onChange={(e) => setBufferBefore(Number(e.target.value))}
          />
        </div>
        <div className="event-type-form__field">
          <label className="event-type-form__label" htmlFor="et-buffer-after">
            Buffer After (min)
          </label>
          <input
            id="et-buffer-after"
            className="event-type-form__input"
            type="number"
            min={0}
            value={bufferAfter}
            onChange={(e) => setBufferAfter(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="event-type-form__row">
        <div className="event-type-form__field">
          <label className="event-type-form__label" htmlFor="et-max-bookings">
            Max Bookings/Day
          </label>
          <input
            id="et-max-bookings"
            className="event-type-form__input"
            type="number"
            min={1}
            value={maxBookings}
            onChange={(e) => setMaxBookings(Number(e.target.value))}
          />
        </div>
        <div className="event-type-form__field">
          <label className="event-type-form__label" htmlFor="et-notice">
            Minimum Notice (min)
          </label>
          <input
            id="et-notice"
            className="event-type-form__input"
            type="number"
            min={0}
            value={minimumNotice}
            onChange={(e) => setMinimumNotice(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="event-type-form__field">
        <label className="event-type-form__label" htmlFor="et-window">
          Scheduling Window (days)
        </label>
        <input
          id="et-window"
          className="event-type-form__input"
          type="number"
          min={1}
          value={schedulingWindow}
          onChange={(e) => setSchedulingWindow(Number(e.target.value))}
        />
      </div>

      <div className="event-type-form__actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={!name.trim()}>
          {eventType ? 'Save Changes' : 'Create Event Type'}
        </button>
      </div>
    </form>
  )
}
