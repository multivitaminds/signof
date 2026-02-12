import { useState, useMemo, useCallback } from 'react'
import type { Document } from '../../../../types'
import { ACTION_LABELS, STATUS_LABELS } from '../../../../types'
import './AuditTrailPanel.css'

interface AuditTrailPanelProps {
  document: Document
  onClose: () => void
}

const ACTION_ICONS: Record<string, string> = {
  created: '\u{1F4C4}',
  sent: '\u{1F4E8}',
  delivered: '\u{1F4EC}',
  viewed: '\u{1F441}',
  signed: '\u{270D}\uFE0F',
  completed: '\u2705',
  declined: '\u274C',
  voided: '\u{1F6AB}',
}

const ACTION_COLORS: Record<string, string> = {
  created: 'var(--color-gray-400)',
  sent: 'var(--color-info, #3B82F6)',
  delivered: '#06b6d4',
  viewed: '#8b5cf6',
  signed: 'var(--color-success)',
  completed: 'var(--color-success)',
  declined: 'var(--color-danger)',
  voided: 'var(--color-gray-500)',
}

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.charAt(0).toUpperCase() + action.slice(1)
}

function getActionIcon(action: string): string {
  return ACTION_ICONS[action] ?? '\u{1F4CB}'
}

function getActionColor(action: string): string {
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

function resolveUserId(userId: string, signers: Document['signers']): string {
  if (userId === 'system') return 'System'
  if (userId === 'you') return 'You'
  const signer = signers.find((s) => s.id === userId)
  return signer ? signer.name : userId
}

export default function AuditTrailPanel({ document: doc, onClose }: AuditTrailPanelProps) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())

  const availableActions = useMemo(() => {
    const actions = new Set<string>()
    for (const entry of doc.audit) {
      actions.add(entry.action)
    }
    return Array.from(actions)
  }, [doc.audit])

  const filteredEntries = useMemo(() => {
    if (activeFilters.size === 0) return doc.audit
    return doc.audit.filter((entry) => activeFilters.has(entry.action))
  }, [doc.audit, activeFilters])

  const toggleFilter = useCallback((action: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      if (next.has(action)) {
        next.delete(action)
      } else {
        next.add(action)
      }
      return next
    })
  }, [])

  const handleCopyAuditTrail = useCallback(() => {
    const lines = doc.audit.map((entry) => {
      const time = formatTimestamp(entry.timestamp)
      const actor = resolveUserId(entry.userId, doc.signers)
      const label = getActionLabel(entry.action)
      const detail = entry.detail ? ` - ${entry.detail}` : ''
      return `[${time}] ${label} by ${actor}${detail}`
    })
    const text = `Audit Trail: ${doc.name}\n${'='.repeat(40)}\n${lines.join('\n')}`
    navigator.clipboard.writeText(text).catch(() => {
      // Clipboard write may fail in some environments
    })
  }, [doc])

  return (
    <div className="audit-trail-panel">
      <div className="audit-trail-panel__header">
        <div className="audit-trail-panel__title-row">
          <h2 className="audit-trail-panel__title">{doc.name}</h2>
          <span className={`status-badge status-${doc.status}`}>
            {STATUS_LABELS[doc.status]}
          </span>
        </div>
        <p className="audit-trail-panel__subtitle">
          {doc.audit.length} event{doc.audit.length !== 1 ? 's' : ''} recorded
        </p>
      </div>

      {availableActions.length > 0 && (
        <div className="audit-trail-panel__filters" role="group" aria-label="Filter by action type">
          {availableActions.map((action) => (
            <button
              key={action}
              type="button"
              className={`audit-trail-panel__filter-chip${activeFilters.has(action) ? ' audit-trail-panel__filter-chip--active' : ''}`}
              onClick={() => toggleFilter(action)}
              aria-pressed={activeFilters.has(action)}
              style={activeFilters.has(action) ? { borderColor: getActionColor(action), color: getActionColor(action) } : undefined}
            >
              {getActionLabel(action)}
            </button>
          ))}
        </div>
      )}

      {filteredEntries.length === 0 ? (
        <div className="audit-trail-panel__empty">
          <p>No audit entries{activeFilters.size > 0 ? ' match the selected filters' : ' yet'}.</p>
        </div>
      ) : (
        <div className="audit-trail-panel__entries" role="list" aria-label="Audit entries">
          {filteredEntries.map((entry, index) => (
            <div
              className="audit-trail-panel__entry"
              key={`${entry.timestamp}-${index}`}
              role="listitem"
              style={index < 10 ? { animationDelay: `${index * 50}ms` } : undefined}
            >
              <div className="audit-trail-panel__entry-marker">
                <div
                  className="audit-trail-panel__entry-dot"
                  style={{ backgroundColor: getActionColor(entry.action) }}
                  aria-hidden="true"
                >
                  <span className="audit-trail-panel__entry-icon">{getActionIcon(entry.action)}</span>
                </div>
                {index < filteredEntries.length - 1 && (
                  <div className="audit-trail-panel__entry-line" aria-hidden="true" />
                )}
              </div>
              <div className="audit-trail-panel__entry-content">
                <span className="audit-trail-panel__entry-action">{getActionLabel(entry.action)}</span>
                <span className="audit-trail-panel__entry-actor">
                  {resolveUserId(entry.userId, doc.signers)}
                </span>
                <time className="audit-trail-panel__entry-time" dateTime={entry.timestamp}>
                  {formatTimestamp(entry.timestamp)}
                </time>
                {entry.detail && (
                  <p className="audit-trail-panel__entry-detail">{entry.detail}</p>
                )}
                {entry.ip && (
                  <span className="audit-trail-panel__entry-ip">IP: {entry.ip}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="audit-trail-panel__footer">
        <button
          type="button"
          className="btn-secondary"
          onClick={handleCopyAuditTrail}
        >
          Copy Audit Trail
        </button>
        <button type="button" className="btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
