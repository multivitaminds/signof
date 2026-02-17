import { useCallback } from 'react'
import type { Session } from '../../types'
import './SessionPanel.css'

interface SessionPanelProps {
  sessions: Session[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return 'now'
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max) + '...'
}

export default function SessionPanel({
  sessions,
  activeSessionId,
  onSelectSession,
}: SessionPanelProps) {
  const handleSelect = useCallback(
    (id: string) => {
      onSelectSession(id)
    },
    [onSelectSession]
  )

  if (sessions.length === 0) {
    return (
      <div className="session-panel session-panel--empty">
        <p className="session-panel__empty-text">No active sessions.</p>
      </div>
    )
  }

  return (
    <div className="session-panel" role="list">
      {sessions.map((session) => {
        const isActive = session.id === activeSessionId
        return (
          <div
            key={session.id}
            className={`session-panel__item${isActive ? ' session-panel__item--active' : ''}`}
            role="listitem"
            onClick={() => handleSelect(session.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleSelect(session.id)
              }
            }}
            tabIndex={0}
            aria-selected={isActive}
          >
            <div className="session-panel__avatar" aria-hidden="true">
              {session.contactAvatar ? (
                <img
                  src={session.contactAvatar}
                  alt=""
                  className="session-panel__avatar-img"
                />
              ) : (
                getInitials(session.contactName)
              )}
            </div>
            <div className="session-panel__info">
              <span className="session-panel__name">{session.contactName}</span>
              <span className="session-panel__preview">
                {truncate(session.lastMessage, 40)}
              </span>
            </div>
            <div className="session-panel__meta">
              <span className="session-panel__time">
                {timeAgo(session.lastMessageAt)}
              </span>
              {session.isActive && (
                <span className="session-panel__unread" aria-label="Active session" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
