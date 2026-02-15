import { useState, useCallback } from 'react'
import './WorkflowToolbar.css'

interface WorkflowToolbarProps {
  workflowName: string
  status: string
  onNameChange?: (name: string) => void
  onRun?: () => void
  onPause?: () => void
  onStop?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onZoomReset?: () => void
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#6b7280',
  active: '#059669',
  paused: '#f59e0b',
  error: '#dc2626',
}

export default function WorkflowToolbar({
  workflowName,
  status,
  onNameChange,
  onRun,
  onPause,
  onStop,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: WorkflowToolbarProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(workflowName)

  const handleStartEdit = useCallback(() => {
    setEditValue(workflowName)
    setIsEditing(true)
  }, [workflowName])

  const handleFinishEdit = useCallback(() => {
    setIsEditing(false)
    if (editValue.trim() && editValue !== workflowName) {
      onNameChange?.(editValue.trim())
    }
  }, [editValue, workflowName, onNameChange])

  return (
    <div className="wf-toolbar">
      <div className="wf-toolbar__left">
        {isEditing ? (
          <input
            className="wf-toolbar__name-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleFinishEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFinishEdit()
              if (e.key === 'Escape') setIsEditing(false)
            }}
            autoFocus
            aria-label="Workflow name"
          />
        ) : (
          <button className="wf-toolbar__name" onClick={handleStartEdit} title="Click to rename">
            {workflowName}
          </button>
        )}
        <span className="wf-toolbar__status" style={{ color: STATUS_COLORS[status] ?? '#6b7280' }}>
          {status}
        </span>
      </div>

      <div className="wf-toolbar__center">
        <button className="wf-toolbar__btn wf-toolbar__btn--run" onClick={onRun} title="Run workflow" aria-label="Run workflow">
          &#9654;
        </button>
        <button className="wf-toolbar__btn wf-toolbar__btn--pause" onClick={onPause} title="Pause" aria-label="Pause workflow">
          &#10074;&#10074;
        </button>
        <button className="wf-toolbar__btn wf-toolbar__btn--stop" onClick={onStop} title="Stop" aria-label="Stop workflow">
          &#9632;
        </button>
      </div>

      <div className="wf-toolbar__right">
        <button className="wf-toolbar__zoom-btn" onClick={onZoomOut} title="Zoom out" aria-label="Zoom out">
          &minus;
        </button>
        <button className="wf-toolbar__zoom-btn" onClick={onZoomReset} title="Reset zoom" aria-label="Reset zoom">
          100%
        </button>
        <button className="wf-toolbar__zoom-btn" onClick={onZoomIn} title="Zoom in" aria-label="Zoom in">
          +
        </button>
      </div>
    </div>
  )
}
