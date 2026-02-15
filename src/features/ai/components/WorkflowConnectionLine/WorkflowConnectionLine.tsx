import { NodeStatus } from '../../types'
import './WorkflowConnectionLine.css'

interface WorkflowConnectionLineProps {
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  status?: string
}

const STATUS_COLORS: Record<string, string> = {
  [NodeStatus.Idle]: '#6b7280',
  [NodeStatus.Running]: '#3b82f6',
  [NodeStatus.Completed]: '#059669',
  [NodeStatus.Error]: '#dc2626',
}

export default function WorkflowConnectionLine({
  sourceX,
  sourceY,
  targetX,
  targetY,
  status = NodeStatus.Idle,
}: WorkflowConnectionLineProps) {
  const dx = Math.abs(targetX - sourceX) * 0.5
  const d = `M ${sourceX} ${sourceY} C ${sourceX + dx} ${sourceY}, ${targetX - dx} ${targetY}, ${targetX} ${targetY}`
  const color = STATUS_COLORS[status] ?? '#6b7280'
  const isRunning = status === NodeStatus.Running

  return (
    <path
      className={`wf-conn-line${isRunning ? ' wf-conn-line--running' : ''}`}
      d={d}
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeDasharray={isRunning ? '6 3' : undefined}
    />
  )
}
