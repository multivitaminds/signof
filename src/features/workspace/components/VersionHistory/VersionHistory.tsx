import { useCallback } from 'react'
import { Clock, RotateCcw } from 'lucide-react'
import type { PageSnapshot } from '../../types'
import './VersionHistory.css'

interface VersionHistoryProps {
  snapshots: PageSnapshot[]
  onRestore: (snapshotId: string) => void
  onClose: () => void
}

export default function VersionHistory({ snapshots, onRestore, onClose }: VersionHistoryProps) {
  const handleRestore = useCallback(
    (snapshotId: string) => {
      onRestore(snapshotId)
    },
    [onRestore]
  )

  return (
    <div className="version-history">
      <div className="version-history__header">
        <Clock size={16} />
        <h3 className="version-history__title">Version History</h3>
        <button
          className="version-history__close"
          onClick={onClose}
          aria-label="Close version history"
        >
          &times;
        </button>
      </div>

      {snapshots.length === 0 ? (
        <div className="version-history__empty">
          <p>No versions yet</p>
          <p className="version-history__hint">Versions are saved automatically as you edit</p>
        </div>
      ) : (
        <div className="version-history__list">
          {snapshots.map((snapshot) => (
            <div key={snapshot.id} className="version-history__item">
              <div className="version-history__item-info">
                <span className="version-history__item-date">
                  {new Date(snapshot.timestamp).toLocaleString()}
                </span>
                <span className="version-history__item-title">{snapshot.title}</span>
              </div>
              <button
                className="version-history__restore-btn"
                onClick={() => handleRestore(snapshot.id)}
                aria-label={`Restore version from ${new Date(snapshot.timestamp).toLocaleString()}`}
              >
                <RotateCcw size={14} />
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
