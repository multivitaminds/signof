import { NodeStatus } from '../../types'
import './ConnectionLine.css'

interface ConnectionLineProps {
  x1: number
  y1: number
  x2: number
  y2: number
  status: NodeStatus
}

export default function ConnectionLine({ x1, y1, x2, y2, status }: ConnectionLineProps) {
  const midX = (x1 + x2) / 2
  const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`

  const statusClass =
    status === NodeStatus.Running
      ? 'connection-line--running'
      : status === NodeStatus.Completed
        ? 'connection-line--completed'
        : status === NodeStatus.Error
          ? 'connection-line--error'
          : ''

  return (
    <path
      className={`connection-line ${statusClass}`}
      d={d}
      fill="none"
      strokeWidth={2}
      data-testid="connection-line"
    />
  )
}
