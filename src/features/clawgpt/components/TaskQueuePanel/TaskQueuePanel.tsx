import { useState, useCallback } from 'react'
import { useFleetStore } from '../../stores/useFleetStore'
import './TaskQueuePanel.css'

interface TaskQueuePanelProps {
  onSubmitTask?: (description: string) => void
}

const STATUS_LABELS: Record<string, string> = {
  queued: 'Queued',
  routed: 'Routed',
  in_progress: 'In Progress',
  completed: 'Completed',
  failed: 'Failed',
}

export default function TaskQueuePanel({ onSubmitTask }: TaskQueuePanelProps) {
  const taskQueue = useFleetStore((s) => s.taskQueue)
  const [showInput, setShowInput] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleSubmitClick = useCallback(() => {
    setShowInput(true)
  }, [])

  const handleCancel = useCallback(() => {
    setShowInput(false)
    setInputValue('')
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim()
    if (trimmed) {
      onSubmitTask?.(trimmed)
      setInputValue('')
      setShowInput(false)
    }
  }, [inputValue, onSubmitTask])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSend()
      }
      if (e.key === 'Escape') {
        handleCancel()
      }
    },
    [handleSend, handleCancel],
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  return (
    <div className="task-queue-panel" role="region" aria-label="Task queue">
      <div className="task-queue-panel__header">
        <h2 className="task-queue-panel__title">Task Queue</h2>
        {!showInput && (
          <button
            className="task-queue-panel__submit-btn btn--primary"
            onClick={handleSubmitClick}
          >
            Submit Task
          </button>
        )}
      </div>

      {showInput && (
        <div className="task-queue-panel__input-row">
          <input
            className="task-queue-panel__input"
            type="text"
            placeholder="Describe a task in natural language..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label="Task description"
          />
          <button className="task-queue-panel__send-btn btn--primary" onClick={handleSend}>
            Send
          </button>
          <button className="task-queue-panel__cancel-btn btn--ghost" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}

      {taskQueue.length === 0 ? (
        <div className="task-queue-panel__empty">No tasks in queue</div>
      ) : (
        <ul className="task-queue-panel__list">
          {taskQueue.map((task) => (
            <li key={task.id} className="task-queue-panel__item">
              <div
                className={`task-queue-panel__priority-bar task-queue-panel__priority-bar--${task.priority}`}
                aria-label={`Priority: ${task.priority}`}
              />
              <div className="task-queue-panel__item-body">
                <p className="task-queue-panel__item-description">{task.description}</p>
                <div className="task-queue-panel__item-meta">
                  <span className="task-queue-panel__badge task-queue-panel__badge--source">
                    {task.source}
                  </span>
                  <span
                    className={`task-queue-panel__badge task-queue-panel__badge--${task.status}`}
                  >
                    {STATUS_LABELS[task.status] ?? task.status}
                  </span>
                  {task.domain && (
                    <span className="task-queue-panel__badge task-queue-panel__badge--source">
                      {task.domain}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
