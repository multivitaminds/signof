import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Send, Sparkles, Trash2 } from 'lucide-react'
import useAIChatStore from '../../stores/useAIChatStore'
import './AIChatSidebar.css'

const QUICK_ACTIONS = [
  'Summarize this page',
  'Create action items',
  'Translate',
  'Explain',
] as const

export default function AIChatSidebar() {
  const messages = useAIChatStore((s) => s.messages)
  const isOpen = useAIChatStore((s) => s.isOpen)
  const contextLabel = useAIChatStore((s) => s.contextLabel)
  const sendMessage = useAIChatStore((s) => s.sendMessage)
  const setOpen = useAIChatStore((s) => s.setOpen)
  const clearMessages = useAIChatStore((s) => s.clearMessages)

  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length])

  useEffect(() => {
    if (isOpen) {
      // Focus input after sidebar opens and transition completes
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    sendMessage(trimmed)
    setInputValue('')
  }, [inputValue, sendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleQuickAction = useCallback((action: string) => {
    sendMessage(action)
  }, [sendMessage])

  const handleClear = useCallback(() => {
    clearMessages()
  }, [clearMessages])

  if (!isOpen) return null

  return (
    <div className="ai-chat-sidebar" role="complementary" aria-label="AI Chat">
      <div className="ai-chat-sidebar__header">
        <div className="ai-chat-sidebar__header-left">
          <Sparkles size={18} className="ai-chat-sidebar__header-icon" />
          <span className="ai-chat-sidebar__header-title">AI Assistant</span>
        </div>
        <div className="ai-chat-sidebar__header-actions">
          <button
            className="ai-chat-sidebar__header-btn"
            onClick={handleClear}
            aria-label="Clear messages"
            title="Clear messages"
          >
            <Trash2 size={16} />
          </button>
          <button
            className="ai-chat-sidebar__header-btn"
            onClick={handleClose}
            aria-label="Close AI chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="ai-chat-sidebar__context">
        Reading: {contextLabel}
      </div>

      <div className="ai-chat-sidebar__messages">
        {messages.length === 0 && (
          <div className="ai-chat-sidebar__empty">
            <Sparkles size={32} className="ai-chat-sidebar__empty-icon" />
            <p className="ai-chat-sidebar__empty-text">
              Ask me anything about your workspace. I can summarize pages, create action items, and more.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`ai-chat-sidebar__message ai-chat-sidebar__message--${msg.role}`}
          >
            <span className="ai-chat-sidebar__message-content">{msg.content}</span>
            <span className="ai-chat-sidebar__message-time">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="ai-chat-sidebar__quick-actions">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            className="ai-chat-sidebar__chip"
            onClick={() => handleQuickAction(action)}
          >
            {action}
          </button>
        ))}
      </div>

      <div className="ai-chat-sidebar__input-row">
        <input
          ref={inputRef}
          className="ai-chat-sidebar__input"
          type="text"
          placeholder="Ask AI anything..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Message input"
        />
        <button
          className="ai-chat-sidebar__send-btn"
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
