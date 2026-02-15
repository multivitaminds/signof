import { useRef, useEffect } from 'react'
import type { AgentMessage } from '../../types'
import './MessageBusInspector.css'

interface MessageBusInspectorProps {
  messages: AgentMessage[]
  topics: string[]
  selectedTopic?: string
  onTopicChange?: (topic: string) => void
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#f59e0b',
  normal: '#6b7280',
  low: '#9ca3af',
}

export default function MessageBusInspector({ messages, topics, selectedTopic, onTopicChange }: MessageBusInspectorProps) {
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = selectedTopic && selectedTopic !== 'all'
    ? messages.filter((m) => m.topic === selectedTopic)
    : messages

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [filtered.length])

  return (
    <div className="msg-inspector">
      <div className="msg-inspector__header">
        <select
          className="msg-inspector__topic-select"
          value={selectedTopic ?? 'all'}
          onChange={(e) => onTopicChange?.(e.target.value)}
          aria-label="Filter by topic"
        >
          <option value="all">All Topics</option>
          {topics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <span className="msg-inspector__count">{filtered.length} messages</span>
      </div>
      <div className="msg-inspector__list" ref={listRef}>
        {filtered.length === 0 ? (
          <p className="msg-inspector__empty">No messages</p>
        ) : (
          filtered.map((msg) => (
            <div key={msg.id} className="msg-inspector__msg">
              <div className="msg-inspector__msg-header">
                <span className="msg-inspector__msg-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                <span className="msg-inspector__msg-from">{msg.fromAgentId}</span>
                <span className="msg-inspector__msg-arrow">&rarr;</span>
                <span className="msg-inspector__msg-to">{msg.toAgentId ?? msg.topic}</span>
                <span
                  className="msg-inspector__msg-priority"
                  style={{ color: PRIORITY_COLORS[msg.priority] ?? '#6b7280' }}
                >
                  {msg.priority}
                </span>
              </div>
              <p className="msg-inspector__msg-content">{msg.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
