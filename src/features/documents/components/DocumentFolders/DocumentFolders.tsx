import { useState, useCallback } from 'react'
import type { Folder } from '../../../../types'
import './DocumentFolders.css'

const FOLDER_COLORS = ['#4F46E5', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#EC4899', '#84CC16']

interface DocumentFoldersProps {
  folders: Folder[]
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
  onCreateFolder: (name: string, color?: string) => void
  onDeleteFolder: (id: string) => void
}

export default function DocumentFolders({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
}: DocumentFoldersProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0])

  const handleCreate = useCallback(() => {
    const trimmed = newFolderName.trim()
    if (!trimmed) return
    onCreateFolder(trimmed, newFolderColor)
    setNewFolderName('')
    setNewFolderColor(FOLDER_COLORS[0])
    setIsCreating(false)
  }, [newFolderName, newFolderColor, onCreateFolder])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleCreate()
      } else if (e.key === 'Escape') {
        setIsCreating(false)
        setNewFolderName('')
      }
    },
    [handleCreate]
  )

  return (
    <nav className="document-folders" aria-label="Document folders">
      <button
        className={`document-folders__item${selectedFolderId === null ? ' document-folders__item--selected' : ''}`}
        onClick={() => onSelectFolder(null)}
      >
        <span className="document-folders__name">All Documents</span>
      </button>

      {folders.map((folder) => (
        <div
          key={folder.id}
          className={`document-folders__item${folder.id === selectedFolderId ? ' document-folders__item--selected' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => onSelectFolder(folder.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelectFolder(folder.id)
            }
          }}
        >
          <span
            className="document-folders__dot"
            style={{ backgroundColor: folder.color || '#6B7280' }}
          />
          <span className="document-folders__name">{folder.name}</span>
          <button
            className="document-folders__delete"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteFolder(folder.id)
            }}
            aria-label={`Delete folder ${folder.name}`}
          >
            x
          </button>
        </div>
      ))}

      {isCreating ? (
        <div className="document-folders__new-form">
          <input
            type="text"
            className="document-folders__new-input"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Folder name"
            aria-label="New folder name"
            autoFocus
          />
          <div className="document-folders__color-picker">
            {FOLDER_COLORS.map((color) => (
              <button
                key={color}
                className={`document-folders__color-option${color === newFolderColor ? ' document-folders__color-option--selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setNewFolderColor(color)}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
          <div className="document-folders__new-actions">
            <button className="btn-primary" onClick={handleCreate} disabled={!newFolderName.trim()}>
              Create
            </button>
            <button className="btn-ghost" onClick={() => setIsCreating(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className="document-folders__new-btn"
          onClick={() => setIsCreating(true)}
        >
          + New Folder
        </button>
      )}
    </nav>
  )
}
