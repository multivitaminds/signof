import { useState, useCallback } from 'react'
import {
  X,
  Clock,
  MapPin,
  Palette,
  MessageSquare,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Settings,
  Calendar,
  Globe,
  Paintbrush,
} from 'lucide-react'
import type { EventType, CustomQuestion, WeeklySchedule } from '../../types'
import {
  EventTypeCategory,
  LocationType,
  EVENT_TYPE_COLORS,
  DURATION_OPTIONS,
  BUFFER_OPTIONS,
  DEFAULT_SCHEDULE,
  LOCATION_LABELS,
} from '../../types'
import AvailabilityEditor from '../AvailabilityEditor/AvailabilityEditor'
import BookingBranding from '../BookingBranding/BookingBranding'
import './EventTypeEditor.css'

interface EventTypeEditorProps {
  eventType?: EventType
  onSave: (data: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'>) => void
  onClose: () => void
}

type EditorTab = 'details' | 'availability' | 'questions' | 'branding' | 'preview'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function EventTypeEditor({
  eventType,
  onSave,
  onClose,
}: EventTypeEditorProps) {
  const [tab, setTab] = useState<EditorTab>('details')
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
  const [location, setLocation] = useState<string>(
    eventType?.location ?? LocationType.Zoom
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
  const [maxAttendees, setMaxAttendees] = useState(
    eventType?.maxAttendees ?? 1
  )
  const [brandingLogo, setBrandingLogo] = useState(eventType?.brandingLogo)
  const [brandingCompanyName, setBrandingCompanyName] = useState(eventType?.brandingCompanyName)
  const [brandingAccentColor, setBrandingAccentColor] = useState(eventType?.brandingAccentColor)
  const [brandingHideOrchestree, setBrandingHideOrchestree] = useState(eventType?.brandingHideOrchestree)

  const [waitlistEnabled, setWaitlistEnabled] = useState(
    eventType?.waitlistEnabled ?? false
  )
  const [maxWaitlist, setMaxWaitlist] = useState(
    eventType?.maxWaitlist ?? 5
  )
  const [schedule, setSchedule] = useState<WeeklySchedule>(
    eventType?.schedule ?? { ...DEFAULT_SCHEDULE }
  )
  const [questions, setQuestions] = useState<CustomQuestion[]>(
    eventType?.customQuestions ?? []
  )

  const handleNameChange = useCallback((value: string) => {
    setName(value)
    if (!eventType) {
      setSlug(slugify(value))
    }
  }, [eventType])

  const handleAddQuestion = useCallback(() => {
    setQuestions((prev) => [
      ...prev,
      {
        id: generateId(),
        label: '',
        type: 'text',
        required: false,
      },
    ])
  }, [])

  const handleRemoveQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }, [])

  const handleUpdateQuestion = useCallback(
    (id: string, updates: Partial<CustomQuestion>) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
      )
    },
    []
  )

  const handleMoveQuestion = useCallback((index: number, direction: -1 | 1) => {
    setQuestions((prev) => {
      const next = [...prev]
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= next.length) return prev
      const temp = next[index]!
      next[index] = next[targetIndex]!
      next[targetIndex] = temp
      return next
    })
  }, [])

  const handleSubmit = useCallback(() => {
    if (!name.trim()) return

    onSave({
      name,
      description,
      slug: slug || slugify(name),
      category: category as EventType['category'],
      color,
      durationMinutes,
      location: location as EventType['location'],
      bufferBeforeMinutes: bufferBefore,
      bufferAfterMinutes: bufferAfter,
      maxBookingsPerDay: maxBookings,
      minimumNoticeMinutes: minimumNotice,
      schedulingWindowDays: schedulingWindow,
      schedule,
      dateOverrides: eventType?.dateOverrides ?? [],
      customQuestions: questions,
      maxAttendees,
      brandingLogo,
      brandingCompanyName,
      brandingAccentColor,
      brandingHideOrchestree,
      waitlistEnabled,
      maxWaitlist,
      isActive: eventType?.isActive ?? true,
    })
  }, [
    name, description, slug, category, color, durationMinutes, location,
    bufferBefore, bufferAfter, maxBookings, minimumNotice, schedulingWindow,
    schedule, questions, maxAttendees, brandingLogo, brandingCompanyName,
    brandingAccentColor, brandingHideOrchestree, waitlistEnabled, maxWaitlist, eventType, onSave,
  ])

  const TABS: Array<{ id: EditorTab; label: string; icon: typeof Settings }> = [
    { id: 'details', label: 'Details', icon: Settings },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'questions', label: 'Questions', icon: MessageSquare },
    { id: 'branding', label: 'Branding', icon: Paintbrush },
    { id: 'preview', label: 'Preview', icon: Eye },
  ]

  const locationLabel = LOCATION_LABELS[location as EventType['location']]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content event-type-editor"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={eventType ? `Edit ${eventType.name}` : 'Create Event Type'}
      >
        <div className="modal-header">
          <h2>{eventType ? 'Edit Event Type' : 'Create Event Type'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="event-type-editor__tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`event-type-editor__tab${
                tab === id ? ' event-type-editor__tab--active' : ''
              }`}
              onClick={() => setTab(id)}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="event-type-editor__body">
          {/* Details Tab */}
          {tab === 'details' && (
            <div className="event-type-editor__details">
              <div className="event-type-editor__field">
                <label className="event-type-editor__label" htmlFor="ete-name">
                  Event Name *
                </label>
                <input
                  id="ete-name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Product Demo"
                  className="event-type-editor__input"
                  required
                />
              </div>

              <div className="event-type-editor__field">
                <label className="event-type-editor__label" htmlFor="ete-desc">
                  Description
                </label>
                <textarea
                  id="ete-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe this event"
                  rows={3}
                  className="event-type-editor__textarea"
                />
              </div>

              <div className="event-type-editor__field">
                <label className="event-type-editor__label" htmlFor="ete-slug">
                  URL Slug
                </label>
                <div className="event-type-editor__slug-preview">
                  <span className="event-type-editor__slug-prefix">orchestree.com/</span>
                  <input
                    id="ete-slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="product-demo"
                    className="event-type-editor__input"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="event-type-editor__field">
                <span className="event-type-editor__label">
                  <Clock size={14} />
                  Duration
                </span>
                <div className="event-type-editor__chips">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`event-type-editor__chip${
                        durationMinutes === d ? ' event-type-editor__chip--active' : ''
                      }`}
                      onClick={() => setDurationMinutes(d)}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="event-type-editor__field">
                <span className="event-type-editor__label">
                  <Palette size={14} />
                  Color
                </span>
                <div
                  className="event-type-editor__colors"
                  role="radiogroup"
                  aria-label="Event color"
                >
                  {EVENT_TYPE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`event-type-editor__color-btn${
                        c === color ? ' event-type-editor__color-btn--selected' : ''
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                      aria-label={`Color ${c}`}
                      aria-pressed={c === color}
                    />
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="event-type-editor__field">
                <span className="event-type-editor__label">
                  <MapPin size={14} />
                  Location
                </span>
                <div className="event-type-editor__chips">
                  {(Object.keys(LocationType) as Array<keyof typeof LocationType>).map((key) => {
                    const val = LocationType[key]
                    return (
                      <button
                        key={val}
                        type="button"
                        className={`event-type-editor__chip${
                          location === val ? ' event-type-editor__chip--active' : ''
                        }`}
                        onClick={() => setLocation(val)}
                      >
                        {LOCATION_LABELS[val]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Category */}
              <div className="event-type-editor__field">
                <label className="event-type-editor__label" htmlFor="ete-category">
                  Category
                </label>
                <select
                  id="ete-category"
                  className="event-type-editor__input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value={EventTypeCategory.OneOnOne}>One-on-One</option>
                  <option value={EventTypeCategory.Group}>Group</option>
                  <option value={EventTypeCategory.SigningSession}>Signing Session</option>
                </select>
              </div>

              {/* Buffers */}
              <div className="event-type-editor__row">
                <div className="event-type-editor__field">
                  <label className="event-type-editor__label">Buffer Before</label>
                  <div className="event-type-editor__chips event-type-editor__chips--small">
                    {BUFFER_OPTIONS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        className={`event-type-editor__chip${
                          bufferBefore === b ? ' event-type-editor__chip--active' : ''
                        }`}
                        onClick={() => setBufferBefore(b)}
                      >
                        {b} min
                      </button>
                    ))}
                  </div>
                </div>
                <div className="event-type-editor__field">
                  <label className="event-type-editor__label">Buffer After</label>
                  <div className="event-type-editor__chips event-type-editor__chips--small">
                    {BUFFER_OPTIONS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        className={`event-type-editor__chip${
                          bufferAfter === b ? ' event-type-editor__chip--active' : ''
                        }`}
                        onClick={() => setBufferAfter(b)}
                      >
                        {b} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Max bookings & notice */}
              <div className="event-type-editor__row">
                <div className="event-type-editor__field">
                  <label className="event-type-editor__label" htmlFor="ete-max">
                    Max Bookings / Day
                  </label>
                  <input
                    id="ete-max"
                    type="number"
                    min={1}
                    value={maxBookings}
                    onChange={(e) => setMaxBookings(Number(e.target.value))}
                    className="event-type-editor__input"
                  />
                </div>
                <div className="event-type-editor__field">
                  <label className="event-type-editor__label" htmlFor="ete-notice">
                    Min Notice (min)
                  </label>
                  <input
                    id="ete-notice"
                    type="number"
                    min={0}
                    value={minimumNotice}
                    onChange={(e) => setMinimumNotice(Number(e.target.value))}
                    className="event-type-editor__input"
                  />
                </div>
              </div>

              <div className="event-type-editor__row">
                <div className="event-type-editor__field">
                  <label className="event-type-editor__label" htmlFor="ete-window">
                    Scheduling Window (days)
                  </label>
                  <input
                    id="ete-window"
                    type="number"
                    min={1}
                    value={schedulingWindow}
                    onChange={(e) => setSchedulingWindow(Number(e.target.value))}
                    className="event-type-editor__input"
                  />
                </div>
                <div className="event-type-editor__field">
                  <label className="event-type-editor__label" htmlFor="ete-attendees">
                    Max Attendees
                  </label>
                  <input
                    id="ete-attendees"
                    type="number"
                    min={1}
                    value={maxAttendees}
                    onChange={(e) => setMaxAttendees(Number(e.target.value))}
                    className="event-type-editor__input"
                  />
                </div>
              </div>

              {/* Waitlist */}
              <div className="event-type-editor__row">
                <div className="event-type-editor__field">
                  <label className="event-type-editor__label">
                    Enable Waitlist
                  </label>
                  <button
                    type="button"
                    className={`event-type-editor__toggle${
                      waitlistEnabled ? ' event-type-editor__toggle--on' : ''
                    }`}
                    role="switch"
                    aria-checked={waitlistEnabled}
                    aria-label="Enable waitlist"
                    onClick={() => setWaitlistEnabled(!waitlistEnabled)}
                  >
                    <span className="event-type-editor__toggle-thumb" />
                  </button>
                </div>
                {waitlistEnabled && (
                  <div className="event-type-editor__field">
                    <label className="event-type-editor__label" htmlFor="ete-max-waitlist">
                      Max Waitlist Size
                    </label>
                    <input
                      id="ete-max-waitlist"
                      type="number"
                      min={1}
                      max={100}
                      value={maxWaitlist}
                      onChange={(e) => setMaxWaitlist(Number(e.target.value))}
                      className="event-type-editor__input"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Availability Tab */}
          {tab === 'availability' && (
            <AvailabilityEditor
              schedule={schedule}
              onSave={setSchedule}
            />
          )}

          {/* Questions Tab */}
          {tab === 'questions' && (
            <div className="event-type-editor__questions">
              <div className="event-type-editor__questions-header">
                <div>
                  <h3 className="event-type-editor__section-title">Custom Questions</h3>
                  <p className="event-type-editor__section-desc">
                    Add questions that invitees must answer when booking
                  </p>
                </div>
                <button
                  className="btn-primary"
                  onClick={handleAddQuestion}
                >
                  <Plus size={14} /> Add Question
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="event-type-editor__questions-empty">
                  <MessageSquare size={32} />
                  <p>No custom questions yet</p>
                  <button className="btn-secondary" onClick={handleAddQuestion}>
                    Add your first question
                  </button>
                </div>
              ) : (
                <div className="event-type-editor__questions-list">
                  {questions.map((q, qi) => (
                    <div key={q.id} className="event-type-editor__question">
                      <div className="event-type-editor__question-grip">
                        <button
                          className="event-type-editor__grip-btn"
                          onClick={() => handleMoveQuestion(qi, -1)}
                          disabled={qi === 0}
                          aria-label="Move up"
                        >
                          <GripVertical size={14} />
                        </button>
                      </div>
                      <div className="event-type-editor__question-fields">
                        <input
                          type="text"
                          className="event-type-editor__input"
                          value={q.label}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, { label: e.target.value })
                          }
                          placeholder="Question text"
                          aria-label={`Question ${qi + 1} text`}
                        />
                        <div className="event-type-editor__question-options">
                          <select
                            className="event-type-editor__input event-type-editor__input--small"
                            value={q.type}
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, {
                                type: e.target.value as CustomQuestion['type'],
                              })
                            }
                            aria-label={`Question ${qi + 1} type`}
                          >
                            <option value="text">Short text</option>
                            <option value="textarea">Long text</option>
                            <option value="select">Dropdown</option>
                          </select>
                          <label className="event-type-editor__required-toggle">
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) =>
                                handleUpdateQuestion(q.id, {
                                  required: e.target.checked,
                                })
                              }
                            />
                            Required
                          </label>
                        </div>
                        {q.type === 'select' && (
                          <input
                            type="text"
                            className="event-type-editor__input"
                            value={q.options?.join(', ') ?? ''}
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, {
                                options: e.target.value
                                  .split(',')
                                  .map((o) => o.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="Options (comma-separated)"
                            aria-label={`Question ${qi + 1} options`}
                          />
                        )}
                      </div>
                      <button
                        className="event-type-editor__question-remove"
                        onClick={() => handleRemoveQuestion(q.id)}
                        aria-label={`Remove question ${qi + 1}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Branding Tab */}
          {tab === 'branding' && (
            <BookingBranding
              eventType={{
                ...(eventType ?? {
                  id: '',
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
                  location: location as EventType['location'],
                  schedule,
                  dateOverrides: [],
                  customQuestions: questions,
                  maxAttendees,
                  waitlistEnabled,
                  maxWaitlist,
                  isActive: true,
                  createdAt: '',
                  updatedAt: '',
                }),
                name,
                color,
                brandingLogo,
                brandingCompanyName,
                brandingAccentColor,
                brandingHideOrchestree,
              }}
              onUpdate={(updates) => {
                if ('brandingLogo' in updates) setBrandingLogo(updates.brandingLogo)
                if ('brandingCompanyName' in updates) setBrandingCompanyName(updates.brandingCompanyName)
                if ('brandingAccentColor' in updates) setBrandingAccentColor(updates.brandingAccentColor)
                if ('brandingHideOrchestree' in updates) setBrandingHideOrchestree(updates.brandingHideOrchestree)
              }}
            />
          )}

          {/* Preview Tab */}
          {tab === 'preview' && (
            <div className="event-type-editor__preview">
              <div className="event-type-editor__preview-card">
                <div
                  className="event-type-editor__preview-bar"
                  style={{ backgroundColor: color }}
                />
                <div className="event-type-editor__preview-body">
                  <div className="event-type-editor__preview-host">
                    <div
                      className="event-type-editor__preview-avatar"
                      style={{ backgroundColor: color }}
                    >
                      S
                    </div>
                    <span className="event-type-editor__preview-host-name">
                      Your Name
                    </span>
                  </div>
                  <h3 className="event-type-editor__preview-title">
                    {name || 'Event Name'}
                  </h3>
                  <p className="event-type-editor__preview-desc">
                    {description || 'Event description goes here'}
                  </p>
                  <div className="event-type-editor__preview-meta">
                    <span>
                      <Clock size={13} />
                      {durationMinutes} min
                    </span>
                    <span>
                      <MapPin size={13} />
                      {locationLabel}
                    </span>
                    <span>
                      <Globe size={13} />
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </span>
                  </div>
                  <div className="event-type-editor__preview-calendar-placeholder">
                    <Calendar size={24} />
                    <p>Calendar view will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="event-type-editor__footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            {eventType ? 'Save Changes' : 'Create Event Type'}
          </button>
        </div>
      </div>
    </div>
  )
}
