import { useCallback } from 'react'
import {
  X,
  Send,
  Download,
  Trash2,
  FolderInput,
  RefreshCw,
  CheckSquare,
} from 'lucide-react'
import './BulkActionsBar.css'

// ─── Types ──────────────────────────────────────────────────────────

export type BulkAction = 'send' | 'download' | 'delete' | 'move' | 'status'

interface BulkActionsBarProps {
  selectedIds: string[]
  onAction: (action: BulkAction, ids: string[]) => void
  onDismiss: () => void
}

// ─── Component ──────────────────────────────────────────────────────

function BulkActionsBar({ selectedIds, onAction, onDismiss }: BulkActionsBarProps) {
  const count = selectedIds.length

  const handleSend = useCallback(() => {
    onAction('send', selectedIds)
  }, [onAction, selectedIds])

  const handleDownload = useCallback(() => {
    onAction('download', selectedIds)
  }, [onAction, selectedIds])

  const handleDelete = useCallback(() => {
    onAction('delete', selectedIds)
  }, [onAction, selectedIds])

  const handleMove = useCallback(() => {
    onAction('move', selectedIds)
  }, [onAction, selectedIds])

  const handleStatus = useCallback(() => {
    onAction('status', selectedIds)
  }, [onAction, selectedIds])

  if (count === 0) return null

  return (
    <div
      className="bulk-actions-bar"
      role="toolbar"
      aria-label="Bulk document actions"
    >
      <div className="bulk-actions-bar__inner">
        {/* Selected count */}
        <div className="bulk-actions-bar__count">
          <CheckSquare size={16} />
          <span>
            {count} document{count !== 1 ? 's' : ''} selected
          </span>
        </div>

        {/* Divider */}
        <div className="bulk-actions-bar__divider" />

        {/* Actions */}
        <div className="bulk-actions-bar__actions">
          <button
            type="button"
            className="bulk-actions-bar__action-btn"
            onClick={handleSend}
            aria-label="Send All"
          >
            <Send size={16} />
            <span>Send All</span>
          </button>

          <button
            type="button"
            className="bulk-actions-bar__action-btn"
            onClick={handleDownload}
            aria-label="Download All"
          >
            <Download size={16} />
            <span>Download All</span>
          </button>

          <button
            type="button"
            className="bulk-actions-bar__action-btn bulk-actions-bar__action-btn--danger"
            onClick={handleDelete}
            aria-label="Delete All"
          >
            <Trash2 size={16} />
            <span>Delete All</span>
          </button>

          <button
            type="button"
            className="bulk-actions-bar__action-btn"
            onClick={handleMove}
            aria-label="Move to Folder"
          >
            <FolderInput size={16} />
            <span>Move to Folder</span>
          </button>

          <button
            type="button"
            className="bulk-actions-bar__action-btn"
            onClick={handleStatus}
            aria-label="Change Status"
          >
            <RefreshCw size={16} />
            <span>Change Status</span>
          </button>
        </div>

        {/* Dismiss */}
        <button
          type="button"
          className="bulk-actions-bar__dismiss-btn"
          onClick={onDismiss}
          aria-label="Dismiss selection"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export default BulkActionsBar
