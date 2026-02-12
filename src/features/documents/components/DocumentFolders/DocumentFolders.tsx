import { useState, useCallback, useMemo } from 'react'
import type { Folder } from '../../../../types'
import './DocumentFolders.css'

const FOLDER_COLORS = ['#4F46E5', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#EC4A99', '#84CC16']

interface DocumentFoldersProps {
  folders: Folder[]
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
  onCreateFolder: (name: string, color?: string, parentId?: string | null) => void
  onDeleteFolder: (id: string) => void
  documentCounts?: Record<string, number>
}

interface FolderTreeItemProps {
  folder: Folder
  childFolders: Folder[]
  allFolders: Folder[]
  depth: number
  selectedFolderId: string | null
  expandedIds: Set<string>
  documentCounts?: Record<string, number>
  onSelectFolder: (id: string | null) => void
  onDeleteFolder: (id: string) => void
  onToggleExpand: (id: string) => void
}

function FolderTreeItem({
  folder,
  childFolders,
  allFolders,
  depth,
  selectedFolderId,
  expandedIds,
  documentCounts,
  onSelectFolder,
  onDeleteFolder,
  onToggleExpand,
}: FolderTreeItemProps) {
  const isExpanded = expandedIds.has(folder.id)
  const hasChildren = childFolders.length > 0
  const count = documentCounts?.[folder.id]

  const handleChevronClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onToggleExpand(folder.id)
    },
    [folder.id, onToggleExpand]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelectFolder(folder.id)
      }
    },
    [folder.id, onSelectFolder]
  )

  return (
    <>
      <div
        className={`document-folders__item${folder.id === selectedFolderId ? ' document-folders__item--selected' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => onSelectFolder(folder.id)}
        onKeyDown={handleKeyDown}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {hasChildren ? (
          <button
            className={`document-folders__chevron${isExpanded ? ' document-folders__chevron--expanded' : ''}`}
            onClick={handleChevronClick}
            aria-label={isExpanded ? `Collapse ${folder.name}` : `Expand ${folder.name}`}
          >
            &#9654;
          </button>
        ) : (
          <span className="document-folders__chevron-spacer" />
        )}
        <span
          className="document-folders__dot"
          style={{ backgroundColor: folder.color || '#6B7280' }}
        />
        <span className="document-folders__name">{folder.name}</span>
        {count !== undefined && count > 0 && (
          <span className="document-folders__count">{count}</span>
        )}
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
      {hasChildren && isExpanded && (
        <div className="document-folders__children">
          {childFolders.map((child) => {
            const grandchildren = allFolders.filter((f) => f.parentId === child.id)
            return (
              <FolderTreeItem
                key={child.id}
                folder={child}
                childFolders={grandchildren}
                allFolders={allFolders}
                depth={depth + 1}
                selectedFolderId={selectedFolderId}
                expandedIds={expandedIds}
                documentCounts={documentCounts}
                onSelectFolder={onSelectFolder}
                onDeleteFolder={onDeleteFolder}
                onToggleExpand={onToggleExpand}
              />
            )
          })}
        </div>
      )}
    </>
  )
}

export default function DocumentFolders({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  documentCounts,
}: DocumentFoldersProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const rootFolders = useMemo(() => {
    return folders.filter((f) => f.parentId === null || f.parentId === undefined)
  }, [folders])

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleCreate = useCallback(() => {
    const trimmed = newFolderName.trim()
    if (!trimmed) return
    onCreateFolder(trimmed, newFolderColor, selectedFolderId)
    setNewFolderName('')
    setNewFolderColor(FOLDER_COLORS[0])
    setIsCreating(false)
  }, [newFolderName, newFolderColor, onCreateFolder, selectedFolderId])

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

      {rootFolders.map((folder) => {
        const directChildren = folders.filter((f) => f.parentId === folder.id)
        return (
          <FolderTreeItem
            key={folder.id}
            folder={folder}
            childFolders={directChildren}
            allFolders={folders}
            depth={0}
            selectedFolderId={selectedFolderId}
            expandedIds={expandedIds}
            documentCounts={documentCounts}
            onSelectFolder={onSelectFolder}
            onDeleteFolder={onDeleteFolder}
            onToggleExpand={handleToggleExpand}
          />
        )
      })}

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
