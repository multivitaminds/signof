import { useState, useCallback, useRef, useEffect } from 'react'
import { Plus } from 'lucide-react'
import type { IssueStatus } from '../../types'
import './IssueQuickCreate.css'

interface IssueQuickCreateProps {
  projectId: string
  defaultStatus?: IssueStatus
  onCreateIssue: (data: { projectId: string; title: string; status?: IssueStatus }) => void
  variant?: 'board' | 'list'
}

export default function IssueQuickCreate({
  projectId,
  defaultStatus,
  onCreateIssue,
  variant = 'board',
}: IssueQuickCreateProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
    }
  }, [editing])

  const handleSubmit = useCallback(() => {
    if (title.trim()) {
      onCreateIssue({
        projectId,
        title: title.trim(),
        status: defaultStatus,
      })
      setTitle('')
      // Keep the input open for rapid creation
      inputRef.current?.focus()
    }
  }, [title, projectId, defaultStatus, onCreateIssue])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      } else if (e.key === 'Escape') {
        setTitle('')
        setEditing(false)
      }
    },
    [handleSubmit]
  )

  const handleBlur = useCallback(() => {
    if (!title.trim()) {
      setEditing(false)
    }
  }, [title])

  const handleOpen = useCallback(() => {
    setEditing(true)
  }, [])

  const blockClass = variant === 'board'
    ? 'quick-create quick-create--board'
    : 'quick-create quick-create--list'

  if (!editing) {
    return (
      <button
        className={`${blockClass} quick-create__trigger`}
        onClick={handleOpen}
        aria-label="Quick create issue"
      >
        <Plus size={14} />
        <span>New issue</span>
      </button>
    )
  }

  return (
    <div className={blockClass}>
      <input
        ref={inputRef}
        className="quick-create__input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Issue title... (Enter to create)"
        aria-label="New issue title"
      />
    </div>
  )
}
