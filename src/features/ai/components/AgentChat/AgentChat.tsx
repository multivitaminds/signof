import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMessage } from '../../types'
import { X, Send } from 'lucide-react'
import './AgentChat.css'

interface AgentChatProps {
  teamId: string
  agentId: string
  agentName: string
  messages: ChatMessage[]
  onSendMessage: (content: string) => void
  onClose: () => void
}

export default function AgentChat({
  agentId,
  agentName,
  messages,
  onSendMessage,
  onClose,
}: AgentChatProps) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const agentMessages = messages.filter(m => m.agentId === agentId)

  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [agentMessages.length])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    onSendMessage(trimmed)
    setInputValue('')
  }, [inputValue, onSendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div className="agent-chat" role="region" aria-label={`Chat with ${agentName}`}>
      <div className="agent-chat__header">
        <span className="agent-chat__title">{agentName}</span>
        <button
          className="agent-chat__close"
          onClick={onClose}
          aria-label="Close chat"
        >
          <X size={16} />
        </button>
      </div>

      <div className="agent-chat__messages">
        {agentMessages.length === 0 && (
          <div className="agent-chat__empty">
            No messages yet. Send a message to {agentName}.
          </div>
        )}
        {agentMessages.map(msg => (
          <div
            key={msg.id}
            className={`agent-chat__message agent-chat__message--${msg.role}`}
          >
            <span className="agent-chat__message-content">{msg.content}</span>
            <span className="agent-chat__message-time">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="agent-chat__input-row">
        <input
          ref={inputRef}
          className="agent-chat__input"
          type="text"
          placeholder={`Message ${agentName}...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Message input"
        />
        <button
          className="agent-chat__send-btn"
          onClick={handleSend}
          disabled={!inputValue.trim()}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
