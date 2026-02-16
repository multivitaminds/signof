import { useState, useCallback, useRef, useEffect } from 'react'
import {
  X,
  Send,
  Filter,
  Newspaper,
  BarChart3,
  Sparkles,
} from 'lucide-react'
import { useInboxCopilotStore } from '../../stores/useInboxCopilotStore'
import type { CopilotMessage } from '../../stores/useInboxCopilotStore'
import './InboxCopilotPanel.css'

function InboxCopilotPanel() {
  const isOpen = useInboxCopilotStore((s) => s.isOpen)
  const closePanel = useInboxCopilotStore((s) => s.closePanel)
  const messages = useInboxCopilotStore((s) => s.messages)
  const isTyping = useInboxCopilotStore((s) => s.isTyping)
  const sendMessage = useInboxCopilotStore((s) => s.sendMessage)
  const isAnalyzing = useInboxCopilotStore((s) => s.isAnalyzing)
  const triageInbox = useInboxCopilotStore((s) => s.triageInbox)
  const smartDigest = useInboxCopilotStore((s) => s.smartDigest)
  const prioritySummary = useInboxCopilotStore((s) => s.prioritySummary)
  const lastAnalysis = useInboxCopilotStore((s) => s.lastAnalysis)

  const [inputValue, setInputValue] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll when new messages arrive or typing starts
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isTyping])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [inputValue])

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed || isTyping) return
    sendMessage(trimmed)
    setInputValue('')
  }, [inputValue, isTyping, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(e.target.value)
    },
    []
  )

  const handleClose = useCallback(() => {
    closePanel()
  }, [closePanel])

  const handleAnalyze = useCallback(() => {
    triageInbox()
  }, [triageInbox])

  const handleReview = useCallback(() => {
    smartDigest()
  }, [smartDigest])

  const handlePriority = useCallback(() => {
    prioritySummary()
  }, [prioritySummary])

  const handleMouseLeave = useCallback(() => {
    if (isOpen && messages.length === 0 && !isTyping && !inputValue.trim()) {
      setCollapsed(true)
    }
  }, [isOpen, messages.length, isTyping, inputValue])

  const handleMouseEnter = useCallback(() => {
    setCollapsed(false)
  }, [])

  return (
    <aside
      className={`inbox-copilot-panel${isOpen ? ' inbox-copilot-panel--open' : ''}${collapsed ? ' inbox-copilot-panel--collapsed' : ''}`}
      aria-label="Inbox Copilot"
      aria-hidden={!isOpen}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {collapsed && (
        <div
          className="inbox-copilot-panel__collapsed-strip"
          role="button"
          tabIndex={0}
          onClick={handleMouseEnter}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleMouseEnter()
            }
          }}
          aria-label="Expand Inbox Copilot"
        >
          <Sparkles size={18} />
          <span>Inbox Copilot</span>
        </div>
      )}
      {!collapsed && (
        <>
          {/* Header */}
      <div className="inbox-copilot-panel__header">
        <div className="inbox-copilot-panel__header-title">
          <Sparkles size={18} />
          <h2 className="inbox-copilot-panel__title">Inbox Copilot</h2>
        </div>
        <button
          type="button"
          className="inbox-copilot-panel__close"
          onClick={handleClose}
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="inbox-copilot-panel__actions">
        <button
          type="button"
          className="inbox-copilot-panel__action-btn"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          <Filter size={14} />
          <span>Triage Inbox</span>
        </button>
        <button
          type="button"
          className="inbox-copilot-panel__action-btn"
          onClick={handleReview}
          disabled={isAnalyzing}
        >
          <Newspaper size={14} />
          <span>Smart Digest</span>
        </button>
        <button
          type="button"
          className="inbox-copilot-panel__action-btn"
          onClick={handlePriority}
          disabled={isAnalyzing}
        >
          <BarChart3 size={14} />
          <span>Priority Summary</span>
        </button>
      </div>

      {/* Analysis Card */}
      {lastAnalysis && (
        <div className="inbox-copilot-panel__analysis" data-testid="analysis-card">
          <p className="inbox-copilot-panel__analysis-summary">{lastAnalysis.summary}</p>
          <ul className="inbox-copilot-panel__analysis-list">
            {lastAnalysis.items.map((item, i) => (
              <li key={i} className="inbox-copilot-panel__analysis-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Messages Area */}
      <div className="inbox-copilot-panel__messages">
        {messages.length === 0 && !isTyping && (
          <div className="inbox-copilot-panel__empty">
            <Sparkles size={32} />
            <p>
              Hi! I&apos;m your Inbox Copilot. Ask me anything about your notifications, or
              use the buttons above to get started.
            </p>
          </div>
        )}

        {messages.map((msg: CopilotMessage) => (
          <div
            key={msg.id}
            className={`inbox-copilot-panel__message inbox-copilot-panel__message--${msg.role}`}
          >
            <p className="inbox-copilot-panel__message-text">{msg.content}</p>
          </div>
        ))}

        {isTyping && (
          <div className="inbox-copilot-panel__message inbox-copilot-panel__message--assistant">
            <div className="inbox-copilot-panel__typing" aria-label="Assistant is typing">
              <span className="inbox-copilot-panel__typing-dot" />
              <span className="inbox-copilot-panel__typing-dot" />
              <span className="inbox-copilot-panel__typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="inbox-copilot-panel__input-area">
        <textarea
          ref={textareaRef}
          className="inbox-copilot-panel__input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your notifications..."
          rows={1}
          aria-label="Message input"
        />
        <button
          type="button"
          className="inbox-copilot-panel__send"
          onClick={handleSend}
          disabled={!inputValue.trim() || isTyping}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
        </>
      )}
    </aside>
  )
}

export default InboxCopilotPanel
