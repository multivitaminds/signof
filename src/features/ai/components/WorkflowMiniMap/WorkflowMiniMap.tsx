import { useCallback, useMemo } from 'react'
import type { WorkflowNode } from '../../types'
import './WorkflowMiniMap.css'

interface WorkflowMiniMapProps {
  nodes: WorkflowNode[]
  viewport: { x: number; y: number; zoom: number }
  canvasWidth: number
  canvasHeight: number
  onNavigate?: (x: number, y: number) => void
}

const MAP_WIDTH = 200
const MAP_HEIGHT = 150

export default function WorkflowMiniMap({ nodes, viewport, canvasWidth, canvasHeight, onNavigate }: WorkflowMiniMapProps) {
  const bounds = useMemo(() => {
    if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 1000, maxY: 800 }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const n of nodes) {
      if (n.x < minX) minX = n.x
      if (n.y < minY) minY = n.y
      if (n.x + 200 > maxX) maxX = n.x + 200
      if (n.y + 60 > maxY) maxY = n.y + 60
    }
    const padding = 100
    return { minX: minX - padding, minY: minY - padding, maxX: maxX + padding, maxY: maxY + padding }
  }, [nodes])

  const scale = useMemo(() => {
    const w = bounds.maxX - bounds.minX
    const h = bounds.maxY - bounds.minY
    return Math.min(MAP_WIDTH / w, MAP_HEIGHT / h)
  }, [bounds])

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const worldX = mx / scale + bounds.minX
      const worldY = my / scale + bounds.minY
      onNavigate?.(worldX, worldY)
    },
    [scale, bounds, onNavigate],
  )

  const vpX = (-viewport.x / viewport.zoom - bounds.minX) * scale
  const vpY = (-viewport.y / viewport.zoom - bounds.minY) * scale
  const vpW = (canvasWidth / viewport.zoom) * scale
  const vpH = (canvasHeight / viewport.zoom) * scale

  return (
    <div className="wf-minimap" aria-label="Workflow minimap">
      <svg
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        onClick={handleClick}
        className="wf-minimap__svg"
      >
        {nodes.map((n) => (
          <rect
            key={n.id}
            x={(n.x - bounds.minX) * scale}
            y={(n.y - bounds.minY) * scale}
            width={200 * scale}
            height={50 * scale}
            rx={3}
            className="wf-minimap__node"
          />
        ))}
        <rect
          x={vpX}
          y={vpY}
          width={vpW}
          height={vpH}
          className="wf-minimap__viewport"
        />
      </svg>
    </div>
  )
}
