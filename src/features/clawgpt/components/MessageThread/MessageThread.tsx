import { useState, useCallback, useEffect, useRef } from 'react'
import type { BrainMessage } from '../../types'
import { MessageStatus } from '../../types'
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

function TypingIndicator() {
  return (
    <div className="message-thread__bubble message-thread__bubble--inbound message-thread__bubble--typing">
      <span className="message-thread__sender">Atlas</span>
      <div className="message-thread__typing-dots">
        <span className="message-thread__typing-dot" />
        <span className="message-thread__typing-dot" />
        <span className="message-thread__typing-dot" />
      </div>
    </div>
  )
}

export default function MessageThread({ messages, sessionId }: MessageThreadProps) {
  const filtered = messages.filter((m) => m.sessionId === sessionId)
  const bottomRef = useRef<HTMLDivElement>(null)

  const lastMessage = filtered.length > 0 ? filtered[filtered.length - 1] : null
  const isWaitingForResponse = lastMessage?.status === MessageStatus.Sending

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [filtered.length, isWaitingForResponse])

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
        const isSending = msg.status === MessageStatus.Sending
        return (
          <div
            key={msg.id}
            className={`message-thread__bubble message-thread__bubble--${msg.direction}${isSending ? ' message-thread__bubble--sending' : ''}`}
          >
            <span className="message-thread__sender">{msg.senderName}</span>
            <div className="message-thread__content">{msg.content}</div>
            {msg.toolCalls && msg.toolCalls.length > 0 && (
              <ToolCallBlock calls={msg.toolCalls} />
            )}
            <div className="message-thread__footer">
              <span className="message-thread__time">{formatTime(msg.timestamp)}</span>
              {isOutbound && (
                <span className={`message-thread__status message-thread__status--${msg.status}`}>
                  {msg.status}
                </span>
              )}
            </div>
          </div>
        )
      })}
      {isWaitingForResponse && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}
