import { useCallback, useRef } from 'react'
import {
  Search, PenTool, Code2, Palette, BarChart3,
  ClipboardList, Users, CheckSquare,
  TrendingUp, Megaphone, DollarSign, Scale, ShieldCheck,
  UserPlus, HeartHandshake, Languages, Globe, Share2,
  Shield, Server, Circle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import useCanvasStore from '../../stores/useCanvasStore'
import { AGENT_DEFINITIONS } from '../../lib/agentDefinitions'
import CanvasNode from '../CanvasNode/CanvasNode'
import ConnectionLine from '../ConnectionLine/ConnectionLine'
import './WorkflowCanvas.css'

const ICON_MAP: Record<string, LucideIcon> = {
  Search, PenTool, Code2, Palette, BarChart3,
  ClipboardList, Users, CheckSquare,
  TrendingUp, Megaphone, DollarSign, Scale, ShieldCheck,
  UserPlus, HeartHandshake, Languages, Globe, Share2,
  Shield, Server,
}

function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Circle
}

// Node dimensions for port positioning
const NODE_WIDTH = 200
const NODE_HEIGHT = 50
const PORT_OFFSET_Y = NODE_HEIGHT / 2

export default function WorkflowCanvas() {
  const nodes = useCanvasStore(s => s.nodes)
  const connections = useCanvasStore(s => s.connections)
  const viewport = useCanvasStore(s => s.viewport)
  const selectedNodeId = useCanvasStore(s => s.selectedNodeId)
  const connectingFromId = useCanvasStore(s => s.connectingFromId)
  const selectNode = useCanvasStore(s => s.selectNode)
  const updateNodePosition = useCanvasStore(s => s.updateNodePosition)
  const startConnecting = useCanvasStore(s => s.startConnecting)
  const completeConnection = useCanvasStore(s => s.completeConnection)
  const cancelConnecting = useCanvasStore(s => s.cancelConnecting)
  const setViewport = useCanvasStore(s => s.setViewport)

  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 })

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start panning if clicking on the canvas background (middle click or direct click)
    if (e.button === 1 || (e.target as HTMLElement).classList.contains('workflow-canvas__content')) {
      isPanning.current = true
      panStart.current = { x: e.clientX, y: e.clientY, vx: viewport.x, vy: viewport.y }

      const handleMove = (moveEvent: MouseEvent) => {
        if (!isPanning.current) return
        const dx = moveEvent.clientX - panStart.current.x
        const dy = moveEvent.clientY - panStart.current.y
        setViewport({ x: panStart.current.vx + dx, y: panStart.current.vy + dy })
      }

      const handleUp = () => {
        isPanning.current = false
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleUp)
      }

      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleUp)
    }
  }, [viewport.x, viewport.y, setViewport])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('workflow-canvas__content')) {
      selectNode(null)
      if (connectingFromId) cancelConnecting()
    }
  }, [selectNode, connectingFromId, cancelConnecting])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.05 : 0.05
    const newZoom = Math.max(0.25, Math.min(2, viewport.zoom + delta))
    setViewport({ zoom: newZoom })
  }, [viewport.zoom, setViewport])

  const handleNodeSelect = useCallback((id: string) => {
    if (connectingFromId) {
      completeConnection(id)
    } else {
      selectNode(id)
    }
  }, [connectingFromId, completeConnection, selectNode])

  const handleNodeDragEnd = useCallback((id: string, x: number, y: number) => {
    updateNodePosition(id, x, y)
  }, [updateNodePosition])

  const handleOutputClick = useCallback((id: string) => {
    startConnecting(id)
  }, [startConnecting])

  const handleInputClick = useCallback((id: string) => {
    if (connectingFromId) {
      completeConnection(id)
    }
  }, [connectingFromId, completeConnection])

  // Map node IDs to positions for connection drawing
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  return (
    <div
      className={`workflow-canvas${connectingFromId ? ' workflow-canvas--connecting' : ''}`}
      onMouseDown={handleCanvasMouseDown}
      onClick={handleCanvasClick}
      onWheel={handleWheel}
      data-testid="workflow-canvas"
      role="application"
      aria-label="Workflow canvas"
    >
      <div
        className="workflow-canvas__content"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* SVG layer for connections */}
        <svg className="workflow-canvas__svg" aria-hidden="true">
          {connections.map(conn => {
            const src = nodeMap.get(conn.sourceNodeId)
            const tgt = nodeMap.get(conn.targetNodeId)
            if (!src || !tgt) return null
            return (
              <ConnectionLine
                key={conn.id}
                x1={src.x + NODE_WIDTH}
                y1={src.y + PORT_OFFSET_Y}
                x2={tgt.x}
                y2={tgt.y + PORT_OFFSET_Y}
                status={conn.status}
              />
            )
          })}
        </svg>

        {/* Node layer */}
        {nodes.map(node => {
          const def = AGENT_DEFINITIONS.find(a => a.type === node.agentType)
          if (!def) return null
          return (
            <CanvasNode
              key={node.id}
              node={node}
              definition={def}
              icon={getIcon(def.icon)}
              isSelected={selectedNodeId === node.id}
              onSelect={handleNodeSelect}
              onDragEnd={handleNodeDragEnd}
              onOutputClick={handleOutputClick}
              onInputClick={handleInputClick}
            />
          )
        })}

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="workflow-canvas__empty">
            <p className="workflow-canvas__empty-title">Build your workflow</p>
            <p className="workflow-canvas__empty-desc">
              Add agents from the panel, connect them, then execute
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
