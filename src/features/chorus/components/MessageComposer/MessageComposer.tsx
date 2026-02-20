import { useCallback, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import SmartComposeChip from '../SmartComposeChip/SmartComposeChip'
import './MessageComposer.css'

interface MessageComposerProps {
  onSend: (content: string) => void
  placeholder?: string
  compact?: boolean
  smartComposeSuggestion?: string | null
  onAcceptSuggestion?: () => string | null
  onDismissSuggestion?: () => void
  onDraftChange?: (draft: string) => void
}

const MAX_ROWS = 6
const CHAR_WARNING_THRESHOLD = 4000

export default function MessageComposer({
  onSend,
  placeholder = 'Type a message...',
  compact = false,
  smartComposeSuggestion,
  onAcceptSuggestion,
  onDismissSuggestion,
  onDraftChange,
}: MessageComposerProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend = content.trim().length > 0
  const showCharWarning = content.length >= CHAR_WARNING_THRESHOLD

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
    const maxHeight = lineHeight * MAX_ROWS
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = content.trim()
    if (!trimmed) return
    onSend(trimmed)
    setContent('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [content, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab' && smartComposeSuggestion && onAcceptSuggestion) {
        e.preventDefault()
        const accepted = onAcceptSuggestion()
        if (accepted) {
          setContent(accepted)
          adjustHeight()
        }
        return
      }
      if (e.key === 'Escape' && smartComposeSuggestion && onDismissSuggestion) {
        e.preventDefault()
        onDismissSuggestion()
        return
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend, smartComposeSuggestion, onAcceptSuggestion, onDismissSuggestion, adjustHeight]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setContent(value)
      adjustHeight()
      onDraftChange?.(value)
    },
    [adjustHeight, onDraftChange]
  )

  const rootClass = compact
    ? 'chorus-composer chorus-composer--compact'
    : 'chorus-composer'

  return (
    <div className={rootClass}>
      <div className="chorus-composer__input-wrapper">
        <textarea
          ref={textareaRef}
          className="chorus-composer__textarea"
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          aria-label="Message input"
        />
      </div>
      <div className="chorus-composer__actions">
        {showCharWarning && (
          <span className="chorus-composer__char-count" aria-live="polite">
            {content.length.toLocaleString()} characters
          </span>
        )}
        <button
          className="chorus-composer__send"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          type="button"
        >
          <Send size={18} />
        </button>
      </div>
      {smartComposeSuggestion && onAcceptSuggestion && onDismissSuggestion && (
        <SmartComposeChip
          suggestion={smartComposeSuggestion}
          onAccept={() => {
            const accepted = onAcceptSuggestion()
            if (accepted) {
              setContent(accepted)
              adjustHeight()
            }
          }}
          onDismiss={onDismissSuggestion}
        />
      )}
    </div>
  )
}
