import { useEffect, useMemo, useCallback } from 'react'
import { X, Pin } from 'lucide-react'
import { useChorusMessageStore } from '../../stores/useChorusMessageStore'
import './PinnedMessages.css'

interface PinnedMessagesProps {
  conversationId: string
  isOpen: boolean
  onClose: () => void
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function PinnedMessages({ conversationId, isOpen, onClose }: PinnedMessagesProps) {
  const allMessages = useChorusMessageStore((s) => s.messages[conversationId])
  const pinnedMessages = useMemo(
    () => (allMessages ?? []).filter((m) => m.isPinned),
    [allMessages]
  )

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // Close on Escape and prevent body scroll when open
  useEffect(() => {
    if (!isOpen) return

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="chorus-pinned-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-label="Pinned messages"
      aria-modal="true"
    >
      <div className="chorus-pinned-panel">
        <div className="chorus-pinned-panel__header">
          <Pin size={16} />
          <h3 className="chorus-pinned-panel__title">Pinned Messages</h3>
          <button
            className="chorus-pinned-panel__close"
            onClick={onClose}
            aria-label="Close pinned messages"
          >
            <X size={18} />
          </button>
        </div>

        <div className="chorus-pinned-panel__content">
          {pinnedMessages.length === 0 ? (
            <div className="chorus-pinned-panel__empty">
              <Pin size={32} />
              <p>No pinned messages</p>
              <span>Pin important messages so they are easy to find later.</span>
            </div>
          ) : (
            <ul className="chorus-pinned-panel__list" role="list">
              {pinnedMessages.map((msg) => (
                <li key={msg.id} className="chorus-pinned-panel__item" role="listitem">
                  <div className="chorus-pinned-panel__item-header">
                    <span className="chorus-pinned-panel__sender">{msg.senderName}</span>
                    <time className="chorus-pinned-panel__time" dateTime={msg.timestamp}>
                      {formatTimestamp(msg.timestamp)}
                    </time>
                  </div>
                  <p className="chorus-pinned-panel__item-content">{msg.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
