import { useCallback, useRef } from 'react'
import { CheckCircle2, Loader2, XCircle, Circle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NodeStatus } from '../../types'
import type { CanvasNode as CanvasNodeType } from '../../types'
import type { AgentTypeDefinition } from '../../types'
import './CanvasNode.css'

interface CanvasNodeProps {
  node: CanvasNodeType
  definition: AgentTypeDefinition
  icon: LucideIcon
  isSelected: boolean
  onSelect: (id: string) => void
  onDragEnd: (id: string, x: number, y: number) => void
  onOutputClick: (id: string) => void
  onInputClick: (id: string) => void
}

const STATUS_ICON: Record<NodeStatus, LucideIcon> = {
  [NodeStatus.Idle]: Circle,
  [NodeStatus.Running]: Loader2,
  [NodeStatus.Completed]: CheckCircle2,
  [NodeStatus.Error]: XCircle,
}

export default function CanvasNode({
  node,
  definition,
  icon: IconComp,
  isSelected,
  onSelect,
  onDragEnd,
  onOutputClick,
  onInputClick,
}: CanvasNodeProps) {
  const dragStart = useRef<{ startX: number; startY: number; nodeX: number; nodeY: number } | null>(null)
  const nodeRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-node__port')) return
    e.stopPropagation()
    dragStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStart.current || !nodeRef.current) return
      const dx = moveEvent.clientX - dragStart.current.startX
      const dy = moveEvent.clientY - dragStart.current.startY
      nodeRef.current.style.left = `${dragStart.current.nodeX + dx}px`
      nodeRef.current.style.top = `${dragStart.current.nodeY + dy}px`
    }

    const handleMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      if (dragStart.current) {
        const dx = upEvent.clientX - dragStart.current.startX
        const dy = upEvent.clientY - dragStart.current.startY
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          onDragEnd(node.id, dragStart.current.nodeX + dx, dragStart.current.nodeY + dy)
        }
      }
      dragStart.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [node.id, node.x, node.y, onDragEnd])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.canvas-node__port')) return
    onSelect(node.id)
  }, [node.id, onSelect])

  const StatusIcon = STATUS_ICON[node.status]

  return (
    <div
      ref={nodeRef}
      className={`canvas-node canvas-node--${node.status}${isSelected ? ' canvas-node--selected' : ''}`}
      style={{ left: node.x, top: node.y }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      data-testid={`canvas-node-${node.id}`}
      role="button"
      tabIndex={0}
      aria-label={`${definition.label} Agent node`}
    >
      {/* Input port */}
      <button
        className="canvas-node__port canvas-node__port--input"
        onClick={(e) => { e.stopPropagation(); onInputClick(node.id) }}
        aria-label={`${definition.label} input port`}
      />

      <div className="canvas-node__body">
        <div className="canvas-node__icon" style={{ color: definition.color }}>
          <IconComp size={20} />
        </div>
        <div className="canvas-node__info">
          <span className="canvas-node__label">{definition.label}</span>
          <span className="canvas-node__task">
            {node.task || 'No task set'}
          </span>
        </div>
        <div className={`canvas-node__status canvas-node__status--${node.status}`}>
          <StatusIcon size={14} />
        </div>
      </div>

      {/* Output port */}
      <button
        className="canvas-node__port canvas-node__port--output"
        onClick={(e) => { e.stopPropagation(); onOutputClick(node.id) }}
        aria-label={`${definition.label} output port`}
      />
    </div>
  )
}
