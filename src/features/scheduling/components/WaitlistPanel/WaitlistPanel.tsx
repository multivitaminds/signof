import { useCallback, useMemo } from 'react'
import { Clock, Check, X, Users, Mail } from 'lucide-react'
import { useSchedulingStore } from '../../stores/useSchedulingStore'
import { WaitlistStatus } from '../../types'
import './WaitlistPanel.css'

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number) as [number, number]
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

function getStatusLabel(status: string): string {
  switch (status) {
    case WaitlistStatus.Waiting:
      return 'Waiting'
    case WaitlistStatus.Notified:
      return 'Notified'
    case WaitlistStatus.Approved:
      return 'Approved'
    case WaitlistStatus.Rejected:
      return 'Rejected'
    case WaitlistStatus.Expired:
      return 'Expired'
    default:
      return status
  }
}

export default function WaitlistPanel() {
  const waitlist = useSchedulingStore((s) => s.waitlist)
  const eventTypes = useSchedulingStore((s) => s.eventTypes)
  const approveWaitlistEntry = useSchedulingStore((s) => s.approveWaitlistEntry)
  const rejectWaitlistEntry = useSchedulingStore((s) => s.rejectWaitlistEntry)
  const removeFromWaitlist = useSchedulingStore((s) => s.removeFromWaitlist)

  const activeEntries = useMemo(
    () =>
      waitlist.filter(
        (w) =>
          w.status === WaitlistStatus.Waiting ||
          w.status === WaitlistStatus.Notified
      ),
    [waitlist]
  )

  const resolvedEntries = useMemo(
    () =>
      waitlist.filter(
        (w) =>
          w.status === WaitlistStatus.Approved ||
          w.status === WaitlistStatus.Rejected ||
          w.status === WaitlistStatus.Expired
      ),
    [waitlist]
  )

  const handleApprove = useCallback(
    (id: string) => {
      approveWaitlistEntry(id)
    },
    [approveWaitlistEntry]
  )

  const handleReject = useCallback(
    (id: string) => {
      rejectWaitlistEntry(id)
    },
    [rejectWaitlistEntry]
  )

  const handleRemove = useCallback(
    (id: string) => {
      removeFromWaitlist(id)
    },
    [removeFromWaitlist]
  )

  const getEventTypeName = (etId: string) => {
    return eventTypes.find((e) => e.id === etId)?.name ?? 'Unknown'
  }

  const getEventTypeColor = (etId: string) => {
    return eventTypes.find((e) => e.id === etId)?.color ?? '#6B7280'
  }

  if (waitlist.length === 0) {
    return (
      <div className="waitlist-panel">
        <div className="waitlist-panel__header">
          <Users size={16} />
          <h3 className="waitlist-panel__title">Waitlist</h3>
        </div>
        <div className="waitlist-panel__empty">
          <Users size={24} />
          <p>No waitlist entries yet.</p>
          <p className="waitlist-panel__empty-hint">
            When event slots are full, invitees can join the waitlist.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="waitlist-panel">
      <div className="waitlist-panel__header">
        <Users size={16} />
        <h3 className="waitlist-panel__title">
          Waitlist ({activeEntries.length} active)
        </h3>
      </div>

      {activeEntries.length > 0 && (
        <div className="waitlist-panel__section">
          <h4 className="waitlist-panel__section-title">Active</h4>
          <div className="waitlist-panel__list">
            {activeEntries.map((entry) => (
              <div key={entry.id} className="waitlist-panel__entry">
                <div
                  className="waitlist-panel__entry-dot"
                  style={{ backgroundColor: getEventTypeColor(entry.eventTypeId) }}
                />
                <div className="waitlist-panel__entry-content">
                  <div className="waitlist-panel__entry-header">
                    <span className="waitlist-panel__entry-event">
                      {getEventTypeName(entry.eventTypeId)}
                    </span>
                    <span
                      className={`waitlist-panel__entry-status waitlist-panel__entry-status--${entry.status}`}
                    >
                      {getStatusLabel(entry.status)}
                    </span>
                  </div>
                  <div className="waitlist-panel__entry-details">
                    <span className="waitlist-panel__entry-name">
                      {entry.name}
                    </span>
                    <span className="waitlist-panel__entry-email">
                      <Mail size={11} />
                      {entry.email}
                    </span>
                  </div>
                  <div className="waitlist-panel__entry-meta">
                    <span>
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric' }
                      )}
                    </span>
                    <span>
                      <Clock size={11} />
                      {formatTime12(entry.timeSlot)}
                    </span>
                  </div>
                </div>
                <div className="waitlist-panel__entry-actions">
                  <button
                    className="waitlist-panel__action-btn waitlist-panel__action-btn--approve"
                    onClick={() => handleApprove(entry.id)}
                    title="Approve"
                    aria-label={`Approve ${entry.name}`}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    className="waitlist-panel__action-btn waitlist-panel__action-btn--reject"
                    onClick={() => handleReject(entry.id)}
                    title="Reject"
                    aria-label={`Reject ${entry.name}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolvedEntries.length > 0 && (
        <div className="waitlist-panel__section">
          <h4 className="waitlist-panel__section-title">Resolved</h4>
          <div className="waitlist-panel__list">
            {resolvedEntries.map((entry) => (
              <div
                key={entry.id}
                className="waitlist-panel__entry waitlist-panel__entry--resolved"
              >
                <div
                  className="waitlist-panel__entry-dot"
                  style={{
                    backgroundColor: getEventTypeColor(entry.eventTypeId),
                    opacity: 0.4,
                  }}
                />
                <div className="waitlist-panel__entry-content">
                  <div className="waitlist-panel__entry-header">
                    <span className="waitlist-panel__entry-name">
                      {entry.name}
                    </span>
                    <span
                      className={`waitlist-panel__entry-status waitlist-panel__entry-status--${entry.status}`}
                    >
                      {getStatusLabel(entry.status)}
                    </span>
                  </div>
                </div>
                <button
                  className="waitlist-panel__action-btn waitlist-panel__action-btn--remove"
                  onClick={() => handleRemove(entry.id)}
                  title="Remove"
                  aria-label={`Remove ${entry.name}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
