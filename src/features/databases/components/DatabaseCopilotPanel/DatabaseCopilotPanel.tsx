import { useState, useCallback, useRef, useEffect } from 'react'
import {
  X,
  Send,
  TableProperties,
  Workflow,
  HeartPulse,
  Sparkles,
} from 'lucide-react'
import { useDatabaseCopilotStore } from '../../stores/useDatabaseCopilotStore'
import type { CopilotMessage } from '../../stores/useDatabaseCopilotStore'
import './DatabaseCopilotPanel.css'

function DatabaseCopilotPanel() {
  const isOpen = useDatabaseCopilotStore((s) => s.isOpen)
  const closePanel = useDatabaseCopilotStore((s) => s.closePanel)
  const messages = useDatabaseCopilotStore((s) => s.messages)
  const isTyping = useDatabaseCopilotStore((s) => s.isTyping)
  const sendMessage = useDatabaseCopilotStore((s) => s.sendMessage)
  const isAnalyzing = useDatabaseCopilotStore((s) => s.isAnalyzing)
  const analyzeSchema = useDatabaseCopilotStore((s) => s.analyzeSchema)
  const reviewAutomations = useDatabaseCopilotStore((s) => s.reviewAutomations)
  const checkDataHealth = useDatabaseCopilotStore((s) => s.checkDataHealth)
  const lastAnalysis = useDatabaseCopilotStore((s) => s.lastAnalysis)

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

  const handleMouseLeave = useCallback(() => {
    if (isOpen && messages.length === 0 && !isTyping && !inputValue.trim()) {
      setCollapsed(true)
    }
  }, [isOpen, messages.length, isTyping, inputValue])

  const handleMouseEnter = useCallback(() => {
    setCollapsed(false)
  }, [])

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

  const handleAnalyzeSchema = useCallback(() => {
    analyzeSchema()
  }, [analyzeSchema])

  const handleReviewAutomations = useCallback(() => {
    reviewAutomations()
  }, [reviewAutomations])

  const handleCheckDataHealth = useCallback(() => {
    checkDataHealth()
  }, [checkDataHealth])

  return (
    <aside
      className={`database-copilot-panel${isOpen ? ' database-copilot-panel--open' : ''}${collapsed ? ' database-copilot-panel--collapsed' : ''}`}
      aria-label="Databases Copilot"
      aria-hidden={!isOpen}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {collapsed && (
        <div
          className="database-copilot-panel__collapsed-strip"
          role="button"
          tabIndex={0}
          onClick={handleMouseEnter}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleMouseEnter()
            }
          }}
          aria-label="Expand Databases Copilot"
        >
          <Sparkles size={18} />
          <span>Databases Copilot</span>
        </div>
      )}
      {!collapsed && (
        <>
      {/* Header */}
      <div className="database-copilot-panel__header">
        <div className="database-copilot-panel__header-title">
          <Sparkles size={18} />
          <h2 className="database-copilot-panel__title">Databases Copilot</h2>
        </div>
        <button
          type="button"
          className="database-copilot-panel__close"
          onClick={handleClose}
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="database-copilot-panel__actions">
        <button
          type="button"
          className="database-copilot-panel__action-btn"
          onClick={handleAnalyzeSchema}
          disabled={isAnalyzing}
        >
          <TableProperties size={14} />
          <span>Analyze Schema</span>
        </button>
        <button
          type="button"
          className="database-copilot-panel__action-btn"
          onClick={handleReviewAutomations}
          disabled={isAnalyzing}
        >
          <Workflow size={14} />
          <span>Review Automations</span>
        </button>
        <button
          type="button"
          className="database-copilot-panel__action-btn"
          onClick={handleCheckDataHealth}
          disabled={isAnalyzing}
        >
          <HeartPulse size={14} />
          <span>Data Health</span>
        </button>
      </div>

      {/* Analysis Card */}
      {lastAnalysis && (
        <div className="database-copilot-panel__analysis" data-testid="analysis-card">
          <p className="database-copilot-panel__analysis-summary">{lastAnalysis.summary}</p>
          <ul className="database-copilot-panel__analysis-list">
            {lastAnalysis.items.map((item, i) => (
              <li key={i} className="database-copilot-panel__analysis-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Messages Area */}
      <div className="database-copilot-panel__messages">
        {messages.length === 0 && !isTyping && (
          <div className="database-copilot-panel__empty">
            <Sparkles size={32} />
            <p>
              Hi! I&apos;m your Database Copilot. Ask me anything about your
              tables, fields, and views, or use the buttons above to get started.
            </p>
          </div>
        )}

        {messages.map((msg: CopilotMessage) => (
          <div
            key={msg.id}
            className={`database-copilot-panel__message database-copilot-panel__message--${msg.role}`}
          >
            <p className="database-copilot-panel__message-text">{msg.content}</p>
          </div>
        ))}

        {isTyping && (
          <div className="database-copilot-panel__message database-copilot-panel__message--assistant">
            <div className="database-copilot-panel__typing" aria-label="Assistant is typing">
              <span className="database-copilot-panel__typing-dot" />
              <span className="database-copilot-panel__typing-dot" />
              <span className="database-copilot-panel__typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="database-copilot-panel__input-area">
        <textarea
          ref={textareaRef}
          className="database-copilot-panel__input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your databases..."
          rows={1}
          aria-label="Message input"
        />
        <button
          type="button"
          className="database-copilot-panel__send"
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

export default DatabaseCopilotPanel
