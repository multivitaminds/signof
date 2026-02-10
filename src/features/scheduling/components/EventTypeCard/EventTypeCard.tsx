import type { EventType } from '../../types'
import './EventTypeCard.css'

interface EventTypeCardProps {
  eventType: EventType
  bookingCount: number
  onClick: () => void
  onToggleActive?: (active: boolean) => void
}

export default function EventTypeCard({
  eventType,
  bookingCount,
  onClick,
  onToggleActive,
}: EventTypeCardProps) {
  return (
    <div
      className="event-type-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div
        className="event-type-card__stripe"
        style={{ backgroundColor: eventType.color }}
      />

      <div className="event-type-card__body">
        <h3 className="event-type-card__name">{eventType.name}</h3>
        <span className="event-type-card__duration">
          {eventType.durationMinutes} min
        </span>
        <span className="event-type-card__category">{eventType.category}</span>
        <p className="event-type-card__description">{eventType.description}</p>
      </div>

      <div className="event-type-card__footer">
        <span className="event-type-card__count">
          {bookingCount} booking{bookingCount !== 1 ? 's' : ''}
        </span>

        {onToggleActive && (
          <label
            className="event-type-card__toggle"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={eventType.isActive}
              onChange={(e) => onToggleActive(e.target.checked)}
              aria-label={`${eventType.isActive ? 'Deactivate' : 'Activate'} ${eventType.name}`}
            />
            <span className="event-type-card__toggle-slider" />
          </label>
        )}
      </div>
    </div>
  )
}
