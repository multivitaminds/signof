import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { X, Send, Brain, MessageSquare, Trash2 } from 'lucide-react'
import useAIChatStore, {
  getContextHintForRoute,
  AVAILABLE_SLASH_COMMANDS,
  isSlashCommand,
} from '../../stores/useAIChatStore'
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
  const currentRoute = useAIChatStore((s) => s.currentRoute)
  const isTyping = useAIChatStore((s) => s.isTyping)
  const sendMessage = useAIChatStore((s) => s.sendMessage)
  const setOpen = useAIChatStore((s) => s.setOpen)
  const clearMessages = useAIChatStore((s) => s.clearMessages)

  const [inputValue, setInputValue] = useState('')
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const contextHint = useMemo(
    () => getContextHintForRoute(currentRoute),
    [currentRoute],
  )

  const filteredCommands = useMemo(() => {
    if (!showSlashMenu) return []
    const typed = inputValue.toLowerCase()
    return AVAILABLE_SLASH_COMMANDS.filter((c) =>
      c.command.startsWith(typed)
    )
  }, [showSlashMenu, inputValue])

  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isTyping])

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
    setShowSlashMenu(false)
  }, [inputValue, sendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape' && showSlashMenu) {
      setShowSlashMenu(false)
    }
  }, [handleSend, showSlashMenu])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    // Show slash command menu when input starts with /
    if (val.startsWith('/') && !val.includes(' ')) {
      setShowSlashMenu(true)
    } else {
      setShowSlashMenu(false)
    }
  }, [])

  const handleSlashCommandSelect = useCallback((command: string) => {
    setInputValue(command + ' ')
    setShowSlashMenu(false)
    inputRef.current?.focus()
  }, [])

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
          <Brain size={18} className="ai-chat-sidebar__header-icon" />
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

      {/* Route-based context hint */}
      {contextHint && (
        <div className="ai-chat-sidebar__context-hint" role="status">
          {contextHint}
        </div>
      )}

      <div className="ai-chat-sidebar__messages">
        {messages.length === 0 && !isTyping && (
          <div className="ai-chat-sidebar__empty">
            <MessageSquare size={32} className="ai-chat-sidebar__empty-icon" />
            <p className="ai-chat-sidebar__empty-text">
              Get insights across your workspace. Summarize content, generate action items, or translate documents.
            </p>
            <p className="ai-chat-sidebar__empty-hint">
              Use commands: /summarize, /translate, /simplify
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`ai-chat-sidebar__message ai-chat-sidebar__message--${msg.role}`}
          >
            {msg.role === 'user' && isSlashCommand(msg.content) && (
              <span className="ai-chat-sidebar__command-badge">command</span>
            )}
            <span className="ai-chat-sidebar__message-content">{msg.content}</span>
            <span className="ai-chat-sidebar__message-time">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {/* Typing Indicator */}
        {isTyping && (
          <div className="ai-chat-sidebar__typing" aria-label="AI is typing">
            <span className="ai-chat-sidebar__typing-dot" />
            <span className="ai-chat-sidebar__typing-dot" />
            <span className="ai-chat-sidebar__typing-dot" />
          </div>
        )}
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

      <div className="ai-chat-sidebar__input-area">
        {/* Slash command dropdown */}
        {showSlashMenu && filteredCommands.length > 0 && (
          <div className="ai-chat-sidebar__slash-menu" role="listbox" aria-label="Slash commands">
            {filteredCommands.map((cmd) => (
              <button
                key={cmd.command}
                className="ai-chat-sidebar__slash-item"
                role="option"
                aria-selected={false}
                onClick={() => handleSlashCommandSelect(cmd.command)}
              >
                <span className="ai-chat-sidebar__slash-cmd">{cmd.command}</span>
                <span className="ai-chat-sidebar__slash-desc">{cmd.description}</span>
              </button>
            ))}
          </div>
        )}
        <div className="ai-chat-sidebar__input-row">
          <input
            ref={inputRef}
            className="ai-chat-sidebar__input"
            type="text"
            placeholder="Ask AI anything... (/ for commands)"
            value={inputValue}
            onChange={handleInputChange}
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
    </div>
  )
}
