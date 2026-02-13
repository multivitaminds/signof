import { useState, useCallback } from 'react'
import { Save, Play } from 'lucide-react'
import useCanvasStore from '../../stores/useCanvasStore'
import './CanvasTopBar.css'

interface CanvasTopBarProps {
  onExecute: () => void
  onSave: () => void
  isExecuting: boolean
}

export default function CanvasTopBar({ onExecute, onSave, isExecuting }: CanvasTopBarProps) {
  const workflowName = useCanvasStore(s => s.workflowName)
  const setWorkflowName = useCanvasStore(s => s.setWorkflowName)
  const nodeCount = useCanvasStore(s => s.nodes.length)

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(workflowName)

  const handleStartEdit = useCallback(() => {
    setEditValue(workflowName)
    setIsEditing(true)
  }, [workflowName])

  const handleFinishEdit = useCallback(() => {
    const trimmed = editValue.trim()
    if (trimmed) {
      setWorkflowName(trimmed)
    }
    setIsEditing(false)
  }, [editValue, setWorkflowName])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleFinishEdit()
    if (e.key === 'Escape') setIsEditing(false)
  }, [handleFinishEdit])

  return (
    <div className="canvas-topbar" aria-label="Workflow toolbar">
      <div className="canvas-topbar__left">
        {isEditing ? (
          <input
            className="canvas-topbar__name-input"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={handleFinishEdit}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label="Workflow name"
          />
        ) : (
          <button
            className="canvas-topbar__name"
            onClick={handleStartEdit}
            aria-label="Edit workflow name"
          >
            {workflowName}
          </button>
        )}
        <span className="canvas-topbar__node-count">
          {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
        </span>
      </div>

      <div className="canvas-topbar__right">
        <button
          className="canvas-topbar__save-btn"
          onClick={onSave}
          aria-label="Save workflow"
        >
          <Save size={14} />
          Save
        </button>
        <button
          className="canvas-topbar__execute-btn"
          onClick={onExecute}
          disabled={nodeCount === 0 || isExecuting}
          aria-label="Execute workflow"
        >
          <Play size={14} />
          {isExecuting ? 'Running...' : 'Execute Workflow'}
        </button>
      </div>
    </div>
  )
}
