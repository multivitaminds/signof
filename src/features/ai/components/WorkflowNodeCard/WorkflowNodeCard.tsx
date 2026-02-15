import { useMemo } from 'react'
import { NodeStatus } from '../../types'
import type { WorkflowNode, WorkflowNodeDefinition } from '../../types'
import './WorkflowNodeCard.css'

interface WorkflowNodeCardProps {
  node: WorkflowNode
  definition?: WorkflowNodeDefinition
  isSelected?: boolean
  onSelect?: () => void
  onPortClick?: (portId: string, type: 'input' | 'output') => void
}

const STATUS_COLORS: Record<string, string> = {
  [NodeStatus.Idle]: '#6b7280',
  [NodeStatus.Running]: '#3b82f6',
  [NodeStatus.Completed]: '#059669',
  [NodeStatus.Error]: '#dc2626',
}

const STATUS_LABELS: Record<string, string> = {
  [NodeStatus.Idle]: 'Idle',
  [NodeStatus.Running]: 'Running',
  [NodeStatus.Completed]: 'Done',
  [NodeStatus.Error]: 'Error',
}

export default function WorkflowNodeCard({
  node,
  definition,
  isSelected,
  onSelect,
  onPortClick,
}: WorkflowNodeCardProps) {
  const inputs = definition?.inputs ?? []
  const outputs = definition?.outputs ?? []
  const statusColor = STATUS_COLORS[node.status] ?? '#6b7280'
  const statusLabel = STATUS_LABELS[node.status] ?? node.status

  const paramPreview = useMemo(() => {
    const entries = Object.entries(node.data)
    if (entries.length === 0) return null
    return entries
      .slice(0, 2)
      .map(([k, v]) => `${k}: ${String(v).slice(0, 20)}`)
      .join(', ')
  }, [node.data])

  return (
    <div
      className={`wf-node-card${isSelected ? ' wf-node-card--selected' : ''}`}
      style={{
        borderColor: isSelected ? (definition?.color ?? 'var(--color-primary)') : undefined,
      }}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.()
        }
      }}
      aria-label={`${node.label} node, status: ${statusLabel}`}
    >
      {/* Input ports */}
      <div className="wf-node-card__ports wf-node-card__ports--input">
        {inputs.map((port) => (
          <button
            key={port.id}
            className="wf-node-card__port"
            onClick={(e) => {
              e.stopPropagation()
              onPortClick?.(port.id, 'input')
            }}
            title={port.label}
            aria-label={`Input port: ${port.label}`}
          />
        ))}
      </div>

      {/* Node body */}
      <div className="wf-node-card__body">
        <div className="wf-node-card__header">
          <div
            className="wf-node-card__icon"
            style={{ color: definition?.color ?? '#6b7280' }}
          >
            {definition?.icon ?? '?'}
          </div>
          <span className="wf-node-card__label">{node.label}</span>
          <span
            className="wf-node-card__status"
            style={{ background: statusColor }}
            title={statusLabel}
          />
        </div>
        {paramPreview && (
          <div className="wf-node-card__params">{paramPreview}</div>
        )}
      </div>

      {/* Output ports */}
      <div className="wf-node-card__ports wf-node-card__ports--output">
        {outputs.map((port) => (
          <button
            key={port.id}
            className="wf-node-card__port"
            onClick={(e) => {
              e.stopPropagation()
              onPortClick?.(port.id, 'output')
            }}
            title={port.label}
            aria-label={`Output port: ${port.label}`}
          />
        ))}
      </div>
    </div>
  )
}
