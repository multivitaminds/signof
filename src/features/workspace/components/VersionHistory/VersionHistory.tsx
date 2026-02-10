import { useCallback, useState } from 'react'
import { Clock, RotateCcw, Trash2, Save, X } from 'lucide-react'
import type { PageSnapshot } from '../../types'
import SnapshotPreview from './SnapshotPreview'
import './VersionHistory.css'

interface VersionHistoryProps {
  isOpen: boolean
  pageId: string
  snapshots: PageSnapshot[]
  onCreateSnapshot: () => void
  onRestore: (snapshotId: string) => void
  onDelete: (snapshotId: string) => void
  onClose: () => void
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`

  return new Date(timestamp).toLocaleDateString()
}

export default function VersionHistory({
  isOpen,
  pageId,
  snapshots,
  onCreateSnapshot,
  onRestore,
  onDelete,
  onClose,
}: VersionHistoryProps) {
  const [previewSnapshot, setPreviewSnapshot] = useState<PageSnapshot | null>(null)
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null)

  const handleRestore = useCallback(
    (snapshotId: string) => {
      if (confirmRestoreId === snapshotId) {
        onRestore(snapshotId)
        setConfirmRestoreId(null)
        setPreviewSnapshot(null)
      } else {
        setConfirmRestoreId(snapshotId)
      }
    },
    [confirmRestoreId, onRestore]
  )

  const handleDelete = useCallback(
    (snapshotId: string) => {
      onDelete(snapshotId)
      if (previewSnapshot?.id === snapshotId) {
        setPreviewSnapshot(null)
      }
    },
    [onDelete, previewSnapshot]
  )

  const handlePreview = useCallback((snapshot: PageSnapshot) => {
    setPreviewSnapshot(snapshot)
    setConfirmRestoreId(null)
  }, [])

  const handleClosePreview = useCallback(() => {
    setPreviewSnapshot(null)
    setConfirmRestoreId(null)
  }, [])

  const handleClose = useCallback(() => {
    setPreviewSnapshot(null)
    setConfirmRestoreId(null)
    onClose()
  }, [onClose])

  // Use pageId to associate snapshots — silence unused var lint
  void pageId

  if (!isOpen) return null

  return (
    <div className={`version-history ${isOpen ? 'version-history--open' : ''}`}>
      <div className="version-history__header">
        <Clock size={16} />
        <h3 className="version-history__title">Version History</h3>
        <button
          className="version-history__close"
          onClick={handleClose}
          aria-label="Close version history"
        >
          <X size={16} />
        </button>
      </div>

      <div className="version-history__actions">
        <button
          className="version-history__save-btn"
          onClick={onCreateSnapshot}
          aria-label="Save snapshot"
        >
          <Save size={14} />
          Save snapshot
        </button>
      </div>

      {previewSnapshot ? (
        <SnapshotPreview
          snapshot={previewSnapshot}
          onRestore={() => handleRestore(previewSnapshot.id)}
          onClose={handleClosePreview}
          isConfirming={confirmRestoreId === previewSnapshot.id}
        />
      ) : (
        <div className="version-history__content">
          {/* Current version */}
          <div className="version-history__item version-history__item--current">
            <div className="version-history__item-info">
              <div className="version-history__item-header">
                <span className="version-history__item-time">Current</span>
                <span className="version-history__badge version-history__badge--current">Live</span>
              </div>
              <span className="version-history__item-label">Active version</span>
            </div>
          </div>

          {snapshots.length === 0 ? (
            <div className="version-history__empty">
              <p>No snapshots yet.</p>
              <p className="version-history__hint">
                Snapshots are created automatically every 20 edits.
              </p>
            </div>
          ) : (
            <div className="version-history__list">
              {snapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  className="version-history__item"
                  onClick={() => handlePreview(snapshot)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handlePreview(snapshot)
                    }
                  }}
                >
                  <div className="version-history__item-info">
                    <div className="version-history__item-header">
                      <span className="version-history__item-time">
                        {formatRelativeTime(snapshot.timestamp)}
                      </span>
                      {snapshot.editCount > 0 && (
                        <span className="version-history__badge">
                          {snapshot.editCount} edit{snapshot.editCount === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                    <span className="version-history__item-label">{snapshot.title}</span>
                  </div>
                  <div className="version-history__item-actions">
                    <button
                      className="version-history__restore-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestore(snapshot.id)
                      }}
                      aria-label={`Restore version from ${formatRelativeTime(snapshot.timestamp)}`}
                      title={confirmRestoreId === snapshot.id ? 'Click again to confirm' : 'Restore'}
                    >
                      <RotateCcw size={14} />
                      {confirmRestoreId === snapshot.id ? 'Confirm' : 'Restore'}
                    </button>
                    <button
                      className="version-history__delete-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(snapshot.id)
                      }}
                      aria-label="Delete snapshot"
                      title="Delete snapshot"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
