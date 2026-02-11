import { useMemo } from 'react'
import {
  Check,
  Clock,
  Eye,
  Send,
  FileText,
  XCircle,
  AlertCircle,
  PenTool,
} from 'lucide-react'
import type { AuditEntry, DocumentStatus } from '../../../../types'
import { SIGNING_FLOW_STATUSES, STATUS_LABELS, ACTION_LABELS } from '../../../../types'
import './StatusTimeline.css'

// ─── Types ──────────────────────────────────────────────────────────

interface StatusTimelineProps {
  audit: AuditEntry[]
  currentStatus: DocumentStatus
}

// ─── Helpers ────────────────────────────────────────────────────────

function getStatusIcon(action: string): React.ReactNode {
  switch (action) {
    case 'created':
      return <FileText size={16} />
    case 'sent':
      return <Send size={16} />
    case 'delivered':
      return <Check size={16} />
    case 'viewed':
      return <Eye size={16} />
    case 'signed':
      return <PenTool size={16} />
    case 'completed':
      return <Check size={16} />
    case 'declined':
      return <XCircle size={16} />
    case 'voided':
      return <AlertCircle size={16} />
    default:
      return <Clock size={16} />
  }
}

function getStatusColorClass(action: string): string {
  switch (action) {
    case 'completed':
    case 'signed':
    case 'delivered':
      return 'status-timeline__icon--success'
    case 'declined':
    case 'voided':
      return 'status-timeline__icon--danger'
    case 'sent':
    case 'viewed':
      return 'status-timeline__icon--info'
    case 'created':
      return 'status-timeline__icon--neutral'
    default:
      return 'status-timeline__icon--neutral'
  }
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelativeTime(ts: string): string {
  const now = Date.now()
  const then = new Date(ts).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return formatTimestamp(ts)
}

// ─── Component ──────────────────────────────────────────────────────

function StatusTimeline({ audit, currentStatus }: StatusTimelineProps) {
  // Build timeline: show all audit entries plus upcoming statuses
  const timelineEntries = useMemo(() => {
    const entries: {
      action: string
      label: string
      timestamp: string | null
      detail: string | null
      userId: string | null
      isCompleted: boolean
      isCurrent: boolean
    }[] = []

    // Add completed audit entries
    for (const entry of audit) {
      entries.push({
        action: entry.action,
        label: ACTION_LABELS[entry.action] ?? entry.action,
        timestamp: entry.timestamp,
        detail: entry.detail ?? null,
        userId: entry.userId,
        isCompleted: true,
        isCurrent: false,
      })
    }

    // Add upcoming statuses from the signing flow
    const completedActions = new Set(audit.map((e) => e.action))
    const currentStatusIndex = SIGNING_FLOW_STATUSES.indexOf(currentStatus)

    for (const status of SIGNING_FLOW_STATUSES) {
      const statusIndex = SIGNING_FLOW_STATUSES.indexOf(status)
      // Map status to action name
      const actionName = status === 'draft' ? 'created' : status
      if (!completedActions.has(actionName) && statusIndex > currentStatusIndex) {
        entries.push({
          action: actionName,
          label: STATUS_LABELS[status] ?? status,
          timestamp: null,
          detail: null,
          userId: null,
          isCompleted: false,
          isCurrent: false,
        })
      }
    }

    // Mark current
    if (entries.length > 0) {
      const lastCompleted = [...entries].reverse().find((e) => e.isCompleted)
      if (lastCompleted) {
        lastCompleted.isCurrent = true
      }
    }

    return entries
  }, [audit, currentStatus])

  return (
    <div className="status-timeline" role="list" aria-label="Document status timeline">
      {timelineEntries.map((entry, i) => (
        <div
          key={`${entry.action}-${i}`}
          className={`status-timeline__entry${
            entry.isCompleted ? ' status-timeline__entry--completed' : ''
          }${entry.isCurrent ? ' status-timeline__entry--current' : ''}`}
          role="listitem"
        >
          {/* Connector line */}
          {i < timelineEntries.length - 1 && (
            <div
              className={`status-timeline__connector${
                entry.isCompleted ? ' status-timeline__connector--completed' : ''
              }`}
            />
          )}

          {/* Icon */}
          <div className={`status-timeline__icon ${getStatusColorClass(entry.action)}`}>
            {getStatusIcon(entry.action)}
            {entry.isCurrent && (
              <div className="status-timeline__pulse" />
            )}
          </div>

          {/* Content */}
          <div className="status-timeline__content">
            <div className="status-timeline__label">{entry.label}</div>
            {entry.detail && (
              <div className="status-timeline__detail">{entry.detail}</div>
            )}
            {entry.timestamp && (
              <div className="status-timeline__time">
                <span className="status-timeline__time-relative">
                  {formatRelativeTime(entry.timestamp)}
                </span>
                <span className="status-timeline__time-absolute">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
            )}
            {!entry.timestamp && !entry.isCompleted && (
              <div className="status-timeline__pending">Pending</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatusTimeline
