import { useState, useCallback, useMemo } from 'react'
import { useFleetStore } from '../../stores/useFleetStore'
import type { FleetAgentInstance } from '../../types'
import './FleetGrid.css'

type SortKey = 'status' | 'cost' | 'errors'

interface FleetGridProps {
  onSelectInstance?: (instanceId: string) => void
  filterDomain?: string
  filterStatus?: string
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '...' : text
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const STATUS_ORDER: Record<string, number> = {
  working: 0,
  spawning: 1,
  waiting_approval: 2,
  idle: 3,
  error: 4,
  retiring: 5,
}

export default function FleetGrid({
  onSelectInstance,
  filterDomain,
  filterStatus,
}: FleetGridProps) {
  const activeInstances = useFleetStore((s) => s.activeInstances)
  const [sortKey, setSortKey] = useState<SortKey>('status')

  const instances = useMemo(() => {
    let list = Object.values(activeInstances)
    if (filterDomain) {
      list = list.filter((i) => i.domain === filterDomain)
    }
    if (filterStatus) {
      list = list.filter((i) => i.status === filterStatus)
    }

    list.sort((a, b) => {
      if (sortKey === 'status') {
        return (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
      }
      if (sortKey === 'cost') {
        return b.costUsd - a.costUsd
      }
      return b.errorCount - a.errorCount
    })

    return list
  }, [activeInstances, filterDomain, filterStatus, sortKey])

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortKey(e.target.value as SortKey)
  }, [])

  const handleCardClick = useCallback(
    (instance: FleetAgentInstance) => {
      onSelectInstance?.(instance.instanceId)
    },
    [onSelectInstance],
  )

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent, instance: FleetAgentInstance) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelectInstance?.(instance.instanceId)
      }
    },
    [onSelectInstance],
  )

  return (
    <div className="fleet-grid">
      <div className="fleet-grid__controls">
        <span className="fleet-grid__sort-label">Sort by:</span>
        <select
          className="fleet-grid__sort-select"
          value={sortKey}
          onChange={handleSortChange}
          aria-label="Sort agents"
        >
          <option value="status">Status</option>
          <option value="cost">Cost</option>
          <option value="errors">Errors</option>
        </select>
      </div>

      {instances.length === 0 ? (
        <div className="fleet-grid__empty">No active agent instances</div>
      ) : (
        <div className="fleet-grid__cards">
          {instances.map((inst) => (
            <div
              key={inst.instanceId}
              className="fleet-grid__card"
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(inst)}
              onKeyDown={(e) => handleCardKeyDown(e, inst)}
              aria-label={`Agent ${inst.registryId} — ${inst.status}`}
            >
              <div className="fleet-grid__card-header">
                <span
                  className={`fleet-grid__status-dot fleet-grid__status-dot--${inst.status}`}
                  aria-hidden="true"
                />
                <h3 className="fleet-grid__agent-name">{inst.registryId}</h3>
                <span className="fleet-grid__domain-badge">{inst.domain}</span>
              </div>

              <p className={`fleet-grid__task${inst.currentTask ? '' : ' fleet-grid__task--none'}`}>
                {inst.currentTask ? truncate(inst.currentTask, 60) : 'No active task'}
              </p>

              <div className="fleet-grid__meta">
                <span>Tokens: {formatTokens(inst.tokensConsumed)}</span>
                <span>Cycles: {inst.cycleCount}</span>
                {inst.errorCount > 0 && <span>Errors: {inst.errorCount}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
