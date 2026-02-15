import { useState, useRef, useEffect, useCallback } from 'react'
import type { ExecutionEvent } from '../../types'
import './WorkflowExecutionLog.css'

interface WorkflowExecutionLogProps {
  events: ExecutionEvent[]
  onClear?: () => void
}

const EVENT_COLORS: Record<string, string> = {
  'node-start': '#3b82f6',
  'node-complete': '#059669',
  'node-error': '#dc2626',
  'workflow-start': '#8b5cf6',
  'workflow-complete': '#059669',
  'workflow-error': '#dc2626',
}

export default function WorkflowExecutionLog({ events, onClear }: WorkflowExecutionLogProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [events.length])

  const toggleExpand = useCallback((index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

  return (
    <div className="wf-exec-log">
      <div className="wf-exec-log__header">
        <h4 className="wf-exec-log__title">Execution Log</h4>
        <span className="wf-exec-log__count">{events.length} events</span>
        {onClear && (
          <button className="wf-exec-log__clear" onClick={onClear}>
            Clear
          </button>
        )}
      </div>
      <div className="wf-exec-log__list" ref={listRef}>
        {events.length === 0 ? (
          <p className="wf-exec-log__empty">No execution events yet. Run the workflow to see output.</p>
        ) : (
          events.map((event, idx) => {
            const isExpanded = expanded.has(idx)
            const color = EVENT_COLORS[event.type] ?? '#6b7280'
            const time = new Date(event.timestamp).toLocaleTimeString()
            const hasData = event.data !== undefined && event.data !== null
            return (
              <div key={idx} className="wf-exec-log__event">
                <button
                  className="wf-exec-log__event-row"
                  onClick={() => hasData && toggleExpand(idx)}
                  aria-expanded={isExpanded}
                >
                  <span className="wf-exec-log__event-dot" style={{ background: color }} />
                  <span className="wf-exec-log__event-time">{time}</span>
                  <span className="wf-exec-log__event-node">{event.nodeId ?? 'workflow'}</span>
                  <span className="wf-exec-log__event-type" style={{ color }}>
                    {event.type}
                  </span>
                  {hasData && (
                    <span className="wf-exec-log__event-expand">{isExpanded ? '\u25BC' : '\u25B6'}</span>
                  )}
                </button>
                {isExpanded && hasData && (
                  <pre className="wf-exec-log__event-data">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
