import { useState, useCallback } from 'react'
import { MessageSquare, Send, Trash2, Clock } from 'lucide-react'
import type { DocumentNote } from '../../../../types'
import './DocumentNotes.css'

// ─── Types ────────────────────────────────────────────────────────────

interface DocumentNotesProps {
  notes: DocumentNote[]
  onAddNote: (content: string) => void
  onDeleteNote: (noteId: string) => void
  readOnly?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

// ─── Component ────────────────────────────────────────────────────────

function DocumentNotes({ notes, onAddNote, onDeleteNote, readOnly = false }: DocumentNotesProps) {
  const [newNoteContent, setNewNoteContent] = useState('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = newNoteContent.trim()
      if (trimmed === '') return
      onAddNote(trimmed)
      setNewNoteContent('')
    },
    [newNoteContent, onAddNote]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        const trimmed = newNoteContent.trim()
        if (trimmed !== '') {
          onAddNote(trimmed)
          setNewNoteContent('')
        }
      }
    },
    [newNoteContent, onAddNote]
  )

  return (
    <div className="document-notes" role="region" aria-label="Document notes">
      {/* Header */}
      <div className="document-notes__header">
        <MessageSquare className="document-notes__header-icon" />
        <h3 className="document-notes__title">
          Notes
          {notes.length > 0 && (
            <span className="document-notes__count">{notes.length}</span>
          )}
        </h3>
      </div>

      {/* Notes List */}
      <div className="document-notes__list">
        {notes.length === 0 ? (
          <div className="document-notes__empty">
            <MessageSquare className="document-notes__empty-icon" />
            <span>No notes yet</span>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="document-notes__note">
              <div className="document-notes__note-header">
                <span className="document-notes__note-author">
                  {note.authorName}
                </span>
                <div className="document-notes__note-meta">
                  <span className="document-notes__note-time">
                    <Clock size={12} />
                    {formatTimestamp(note.createdAt)}
                  </span>
                  {!readOnly && (
                    <button
                      type="button"
                      className="document-notes__delete-btn"
                      onClick={() => onDeleteNote(note.id)}
                      aria-label={`Delete note by ${note.authorName}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              <p className="document-notes__note-content">{note.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Note Form */}
      {!readOnly && (
        <form className="document-notes__form" onSubmit={handleSubmit}>
          <textarea
            className="document-notes__textarea"
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a note..."
            rows={2}
            aria-label="New note"
          />
          <div className="document-notes__form-footer">
            <span className="document-notes__hint">
              Press Cmd+Enter to submit
            </span>
            <button
              type="submit"
              className="document-notes__submit-btn"
              disabled={newNoteContent.trim() === ''}
              aria-label="Submit note"
            >
              <Send size={14} /> Add Note
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default DocumentNotes
