import { useCallback } from 'react'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import useCanvasStore from '../../stores/useCanvasStore'
import './CanvasControls.css'

export default function CanvasControls() {
  const zoom = useCanvasStore(s => s.viewport.zoom)
  const zoomIn = useCanvasStore(s => s.zoomIn)
  const zoomOut = useCanvasStore(s => s.zoomOut)
  const fitToScreen = useCanvasStore(s => s.fitToScreen)

  const handleZoomIn = useCallback(() => zoomIn(), [zoomIn])
  const handleZoomOut = useCallback(() => zoomOut(), [zoomOut])
  const handleFit = useCallback(() => fitToScreen(), [fitToScreen])

  return (
    <div className="canvas-controls" aria-label="Canvas zoom controls">
      <button
        className="canvas-controls__btn"
        onClick={handleZoomOut}
        aria-label="Zoom out"
        disabled={zoom <= 0.25}
      >
        <ZoomOut size={16} />
      </button>
      <span className="canvas-controls__zoom" aria-label="Zoom level">
        {Math.round(zoom * 100)}%
      </span>
      <button
        className="canvas-controls__btn"
        onClick={handleZoomIn}
        aria-label="Zoom in"
        disabled={zoom >= 2}
      >
        <ZoomIn size={16} />
      </button>
      <div className="canvas-controls__divider" />
      <button
        className="canvas-controls__btn"
        onClick={handleFit}
        aria-label="Fit to screen"
      >
        <Maximize2 size={16} />
      </button>
    </div>
  )
}
