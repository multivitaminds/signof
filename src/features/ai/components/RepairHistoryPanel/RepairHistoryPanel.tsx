import { useState, useCallback } from 'react'
import type { RepairRecord } from '../../types'
import './RepairHistoryPanel.css'

interface RepairHistoryPanelProps {
  repairs: RepairRecord[]
  successRate: number
}

const STATUS_COLORS: Record<string, string> = {
  detected: '#f59e0b',
  analyzing: '#3b82f6',
  repairing: '#8b5cf6',
  resolved: '#059669',
  failed: '#dc2626',
}

export default function RepairHistoryPanel({ repairs, successRate }: RepairHistoryPanelProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const activeCount = repairs.filter((r) => r.status !== 'resolved' && r.status !== 'failed').length

  return (
    <div className="repair-history">
      <div className="repair-history__stats">
        <div className="repair-history__stat">
          <span className="repair-history__stat-val">{repairs.length}</span>
          <span className="repair-history__stat-lbl">Total</span>
        </div>
        <div className="repair-history__stat">
          <span className="repair-history__stat-val" style={{ color: '#059669' }}>
            {(successRate * 100).toFixed(0)}%
          </span>
          <span className="repair-history__stat-lbl">Success Rate</span>
        </div>
        <div className="repair-history__stat">
          <span className="repair-history__stat-val" style={{ color: '#3b82f6' }}>{activeCount}</span>
          <span className="repair-history__stat-lbl">Active</span>
        </div>
      </div>

      <div className="repair-history__list">
        {repairs.length === 0 ? (
          <p className="repair-history__empty">No repair records</p>
        ) : (
          repairs.map((r) => (
            <div key={r.id} className="repair-history__item">
              <button className="repair-history__item-row" onClick={() => toggleExpand(r.id)}>
                <span className="repair-history__status-badge" style={{ background: STATUS_COLORS[r.status] ?? '#6b7280' }}>
                  {r.status}
                </span>
                <span className="repair-history__error-type">{r.errorType}</span>
                <span className="repair-history__agent-id">{r.agentId}</span>
                <span className="repair-history__time">{new Date(r.timestamp).toLocaleTimeString()}</span>
              </button>
              {expanded.has(r.id) && (
                <div className="repair-history__detail">
                  <p><strong>Error:</strong> {r.errorMessage}</p>
                  <p><strong>Analysis:</strong> {r.analysis}</p>
                  <p><strong>Repair Action:</strong> {r.repairAction}</p>
                  {r.resolvedAt && <p><strong>Resolved:</strong> {new Date(r.resolvedAt).toLocaleString()}</p>}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
