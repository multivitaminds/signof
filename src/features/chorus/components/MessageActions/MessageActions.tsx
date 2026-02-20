import { useState, useCallback } from 'react'
import { Smile, MessageSquare, Pin, Bookmark, MoreHorizontal } from 'lucide-react'
import ReactionPicker from '../ReactionPicker/ReactionPicker'
import './MessageActions.css'

interface MessageActionsProps {
  messageId: string
  isPinned: boolean
  isBookmarked: boolean
  onReact: (emoji: string) => void
  onReply: () => void
  onPin: () => void
  onBookmark: () => void
}

export default function MessageActions({
  messageId: _messageId,
  isPinned,
  isBookmarked,
  onReact,
  onReply,
  onPin,
  onBookmark,
}: MessageActionsProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const togglePicker = useCallback(() => {
    setPickerOpen((prev) => !prev)
  }, [])

  const closePicker = useCallback(() => {
    setPickerOpen(false)
  }, [])

  const handleReact = useCallback(
    (emoji: string) => {
      onReact(emoji)
    },
    [onReact]
  )

  return (
    <div className="message-actions" role="toolbar" aria-label="Message actions">
      <div className="message-actions__reaction-anchor">
        <button
          className="message-actions__btn"
          onClick={togglePicker}
          aria-label="Add reaction"
          title="Add reaction"
        >
          <Smile size={16} />
        </button>
        <ReactionPicker
          isOpen={pickerOpen}
          onClose={closePicker}
          onSelect={handleReact}
        />
      </div>
      <button
        className="message-actions__btn"
        onClick={onReply}
        aria-label="Reply in thread"
        title="Reply in thread"
      >
        <MessageSquare size={16} />
      </button>
      <button
        className={`message-actions__btn${isPinned ? ' message-actions__btn--active' : ''}`}
        onClick={onPin}
        aria-label={isPinned ? 'Unpin message' : 'Pin message'}
        title={isPinned ? 'Unpin message' : 'Pin message'}
      >
        <Pin size={16} />
      </button>
      <button
        className={`message-actions__btn${isBookmarked ? ' message-actions__btn--active' : ''}`}
        onClick={onBookmark}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark message'}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark message'}
      >
        <Bookmark size={16} />
      </button>
      <button
        className="message-actions__btn"
        aria-label="More actions"
        title="More actions"
      >
        <MoreHorizontal size={16} />
      </button>
    </div>
  )
}
