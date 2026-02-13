import { useCallback } from 'react'
import { X, CheckCircle2, Loader2, XCircle, Circle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NodeStatus } from '../../types'
import type { CanvasNode } from '../../types'
import { AGENT_DEFINITIONS } from '../../lib/agentDefinitions'
import './ExecutionOverlay.css'

interface ExecutionOverlayProps {
  nodes: CanvasNode[]
  onClear: () => void
}

const STATUS_ICON: Record<NodeStatus, LucideIcon> = {
  [NodeStatus.Idle]: Circle,
  [NodeStatus.Running]: Loader2,
  [NodeStatus.Completed]: CheckCircle2,
  [NodeStatus.Error]: XCircle,
}

export default function ExecutionOverlay({ nodes, onClear }: ExecutionOverlayProps) {
  const handleClear = useCallback(() => onClear(), [onClear])

  const executedNodes = nodes.filter(n => n.status !== NodeStatus.Idle)
  if (executedNodes.length === 0) return null

  const completedCount = nodes.filter(n => n.status === NodeStatus.Completed).length
  const hasError = nodes.some(n => n.status === NodeStatus.Error)
  const isRunning = nodes.some(n => n.status === NodeStatus.Running)
  const allDone = !isRunning && executedNodes.length === nodes.length

  return (
    <div className="execution-overlay" role="log" aria-label="Execution log">
      <div className="execution-overlay__header">
        <div className="execution-overlay__title-row">
          <h4 className="execution-overlay__title">
            {isRunning ? 'Executing...' : hasError ? 'Execution Failed' : 'Execution Complete'}
          </h4>
          <span className="execution-overlay__progress">
            {completedCount}/{nodes.length} steps
          </span>
        </div>
        {allDone && (
          <button
            className="execution-overlay__clear"
            onClick={handleClear}
            aria-label="Clear execution"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      <div className="execution-overlay__steps">
        {nodes.map(node => {
          const def = AGENT_DEFINITIONS.find(a => a.type === node.agentType)
          const StatusIcon = STATUS_ICON[node.status]
          return (
            <div
              key={node.id}
              className={`execution-overlay__step execution-overlay__step--${node.status}`}
            >
              <StatusIcon
                size={14}
                className={`execution-overlay__step-icon execution-overlay__step-icon--${node.status}`}
              />
              <span className="execution-overlay__step-label">
                {def?.label ?? node.agentType}
              </span>
              {node.output && (
                <span className="execution-overlay__step-output">{node.output}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
