import { RotateCcw, ArrowLeft } from 'lucide-react'
import type { PageSnapshot } from '../../types'
import './SnapshotPreview.css'

interface SnapshotPreviewProps {
  snapshot: PageSnapshot
  onRestore: () => void
  onClose: () => void
  isConfirming: boolean
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

function renderBlockContent(block: { type: string; content: string }): string {
  return block.content || '\u00A0'
}

function getBlockClassName(type: string): string {
  switch (type) {
    case 'heading1':
      return 'snapshot-preview__block--h1'
    case 'heading2':
      return 'snapshot-preview__block--h2'
    case 'heading3':
      return 'snapshot-preview__block--h3'
    case 'bullet_list':
      return 'snapshot-preview__block--bullet'
    case 'numbered_list':
      return 'snapshot-preview__block--numbered'
    case 'todo_list':
      return 'snapshot-preview__block--todo'
    case 'quote':
      return 'snapshot-preview__block--quote'
    case 'callout':
      return 'snapshot-preview__block--callout'
    case 'code':
      return 'snapshot-preview__block--code'
    case 'divider':
      return 'snapshot-preview__block--divider'
    default:
      return ''
  }
}

export default function SnapshotPreview({
  snapshot,
  onRestore,
  onClose,
  isConfirming,
}: SnapshotPreviewProps) {
  return (
    <div className="snapshot-preview">
      <div className="snapshot-preview__header">
        <button
          className="snapshot-preview__back"
          onClick={onClose}
          aria-label="Back to history"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="snapshot-preview__header-info">
          <span className="snapshot-preview__timestamp">
            Preview: {formatTimestamp(snapshot.timestamp)}
          </span>
        </div>
        <button
          className="snapshot-preview__restore-btn"
          onClick={onRestore}
          aria-label="Restore this version"
        >
          <RotateCcw size={14} />
          {isConfirming ? 'Confirm restore' : 'Restore this version'}
        </button>
      </div>

      <div className="snapshot-preview__content">
        <h2 className="snapshot-preview__title">{snapshot.title}</h2>
        <div className="snapshot-preview__blocks">
          {snapshot.blockData.map((block) => {
            if (block.type === 'divider') {
              return (
                <hr
                  key={block.id}
                  className="snapshot-preview__block snapshot-preview__block--divider"
                />
              )
            }

            return (
              <div
                key={block.id}
                className={`snapshot-preview__block ${getBlockClassName(block.type)}`}
              >
                {renderBlockContent(block)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
