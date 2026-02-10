import type { AuditEntry } from '../../types'
import { ACTION_LABELS } from '../../types'
import './AuditTimeline.css'

interface AuditTimelineProps {
  entries: AuditEntry[]
}

const ACTION_COLORS: Record<string, string> = {
  created: 'var(--color-gray-400)',
  sent: 'var(--color-info)',
  delivered: '#06b6d4',
  viewed: '#8b5cf6',
  signed: 'var(--color-success)',
  completed: 'var(--color-success-dark)',
  declined: 'var(--color-danger)',
  voided: 'var(--color-gray-500)',
}

function getDotColor(action: string): string {
  return ACTION_COLORS[action] ?? 'var(--color-gray-400)'
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.charAt(0).toUpperCase() + action.slice(1)
}

function AuditTimeline({ entries }: AuditTimelineProps) {
  if (entries.length === 0) {
    return <div className="audit-timeline audit-timeline--empty" role="list" aria-label="Audit timeline" />
  }

  return (
    <div className="audit-timeline" role="list" aria-label="Audit timeline">
      {entries.map((entry, index) => (
        <div className="audit-timeline__entry" key={`${entry.timestamp}-${index}`} role="listitem">
          <div className="audit-timeline__marker">
            <div
              className="audit-timeline__dot"
              style={{ backgroundColor: getDotColor(entry.action) }}
              aria-hidden="true"
            />
            {index < entries.length - 1 && (
              <div className="audit-timeline__line" aria-hidden="true" />
            )}
          </div>
          <div className="audit-timeline__content">
            <span className="audit-timeline__action">{getActionLabel(entry.action)}</span>
            <time className="audit-timeline__time" dateTime={entry.timestamp}>
              {formatTimestamp(entry.timestamp)}
            </time>
            {entry.detail && (
              <p className="audit-timeline__detail">{entry.detail}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AuditTimeline
