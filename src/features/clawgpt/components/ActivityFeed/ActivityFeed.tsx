import { useCallback } from 'react'
import type { BrainMessage } from '../../types'
import './ActivityFeed.css'

interface ActivityFeedProps {
  messages: BrainMessage[]
  maxItems?: number
  onMessageClick?: (sessionId: string) => void
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max) + '...'
}

export default function ActivityFeed({
  messages,
  maxItems = 20,
  onMessageClick,
}: ActivityFeedProps) {
  const sorted = [...messages]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxItems)

  const handleClick = useCallback(
    (sessionId: string) => {
      onMessageClick?.(sessionId)
    },
    [onMessageClick]
  )

  if (sorted.length === 0) {
    return (
      <div className="activity-feed activity-feed--empty">
        <p className="activity-feed__empty">No messages yet.</p>
      </div>
    )
  }

  return (
    <div className="activity-feed" role="list">
      {sorted.map((msg) => (
        <div
          key={msg.id}
          className="activity-feed__item"
          role="listitem"
          onClick={() => handleClick(msg.sessionId)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClick(msg.sessionId)
            }
          }}
          tabIndex={onMessageClick ? 0 : undefined}
          style={onMessageClick ? { cursor: 'pointer' } : undefined}
        >
          <div className="activity-feed__icon" aria-hidden="true">
            {msg.channelType.charAt(0).toUpperCase()}
          </div>
          <div className="activity-feed__content">
            <span className="activity-feed__sender">{msg.senderName}</span>
            <span className="activity-feed__preview">
              {truncate(msg.content, 80)}
            </span>
          </div>
          <span className="activity-feed__time">{timeAgo(msg.timestamp)}</span>
        </div>
      ))}
    </div>
  )
}
