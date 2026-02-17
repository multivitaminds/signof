import { useState, useCallback } from 'react'
import type { BrainMessage } from '../../types'
import './MessageThread.css'

interface MessageThreadProps {
  messages: BrainMessage[]
  sessionId: string
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function ToolCallBlock({ calls }: { calls: string[] }) {
  const [expanded, setExpanded] = useState(false)

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  return (
    <div className="message-thread__tool-calls">
      <button
        className="message-thread__tool-toggle"
        onClick={toggle}
        aria-expanded={expanded}
      >
        {expanded ? 'Hide' : 'Show'} {calls.length} tool call{calls.length !== 1 ? 's' : ''}
      </button>
      {expanded && (
        <ul className="message-thread__tool-list">
          {calls.map((call, i) => (
            <li key={i} className="message-thread__tool-item">
              {call}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function MessageThread({ messages, sessionId }: MessageThreadProps) {
  const filtered = messages.filter((m) => m.sessionId === sessionId)

  if (filtered.length === 0) {
    return (
      <div className="message-thread message-thread--empty">
        <p className="message-thread__empty-text">No messages in this session.</p>
      </div>
    )
  }

  return (
    <div className="message-thread" role="log" aria-label="Message thread">
      {filtered.map((msg) => {
        const isOutbound = msg.direction === 'outbound'
        return (
          <div
            key={msg.id}
            className={`message-thread__bubble message-thread__bubble--${msg.direction}`}
          >
            <span className="message-thread__sender">{msg.senderName}</span>
            <div className="message-thread__content">{msg.content}</div>
            {msg.toolCalls && msg.toolCalls.length > 0 && (
              <ToolCallBlock calls={msg.toolCalls} />
            )}
            <div className="message-thread__footer">
              <span className="message-thread__time">{formatTime(msg.timestamp)}</span>
              {isOutbound && (
                <span className="message-thread__status">{msg.status}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
