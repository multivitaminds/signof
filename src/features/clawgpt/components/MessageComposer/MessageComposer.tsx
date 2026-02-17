import { useState, useCallback, useRef } from 'react'
import './MessageComposer.css'

interface MessageComposerProps {
  onSend: (content: string) => void
  channelName?: string
  disabled?: boolean
}

export default function MessageComposer({
  onSend,
  channelName,
  disabled = false,
}: MessageComposerProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    textareaRef.current?.focus()
  }, [value, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div className="message-composer">
      {channelName && (
        <span className="message-composer__channel">
          Replying via {channelName}
        </span>
      )}
      <div className="message-composer__row">
        <textarea
          ref={textareaRef}
          className="message-composer__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Messaging disabled' : 'Type a message...'}
          disabled={disabled}
          rows={1}
          aria-label="Message input"
        />
        <button
          className="message-composer__send btn--primary"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  )
}
