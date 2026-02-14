import { useState, useCallback, useRef } from 'react'
import { Send } from 'lucide-react'
import VoiceInputButton from '../../../ai/components/VoiceInputButton/VoiceInputButton'
import './ChatInput.css'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
}

function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, disabled, onSend])

  const handleVoiceTranscript = useCallback((text: string) => {
    setValue((prev) => (prev ? prev + ' ' + text : text))
    textareaRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div className="chat-input">
      <textarea
        ref={textareaRef}
        className="chat-input__textarea"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Send a message..."
        disabled={disabled}
        rows={1}
      />
      <VoiceInputButton onTranscript={handleVoiceTranscript} disabled={disabled} />
      <button
        className="chat-input__send-btn"
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        type="button"
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </div>
  )
}

export default ChatInput
