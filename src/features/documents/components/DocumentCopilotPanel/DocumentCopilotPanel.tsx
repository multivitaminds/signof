import { useState, useCallback, useRef, useEffect } from 'react'
import {
  X,
  Send,
  FileCheck,
  Users,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useDocumentCopilotStore } from '../../stores/useDocumentCopilotStore'
import type { CopilotMessage } from '../../stores/useDocumentCopilotStore'
import './DocumentCopilotPanel.css'

function DocumentCopilotPanel() {
  const isOpen = useDocumentCopilotStore((s) => s.isOpen)
  const closePanel = useDocumentCopilotStore((s) => s.closePanel)
  const messages = useDocumentCopilotStore((s) => s.messages)
  const isTyping = useDocumentCopilotStore((s) => s.isTyping)
  const sendMessage = useDocumentCopilotStore((s) => s.sendMessage)
  const isAnalyzing = useDocumentCopilotStore((s) => s.isAnalyzing)
  const analyzeTemplates = useDocumentCopilotStore((s) => s.analyzeTemplates)
  const reviewContacts = useDocumentCopilotStore((s) => s.reviewContacts)
  const checkCompliance = useDocumentCopilotStore((s) => s.checkCompliance)
  const lastAnalysis = useDocumentCopilotStore((s) => s.lastAnalysis)

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
    analyzeTemplates()
  }, [analyzeTemplates])

  const handleReview = useCallback(() => {
    reviewContacts()
  }, [reviewContacts])

  const handleCompliance = useCallback(() => {
    checkCompliance()
  }, [checkCompliance])

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
      className={`document-copilot-panel${isOpen ? ' document-copilot-panel--open' : ''}${collapsed ? ' document-copilot-panel--collapsed' : ''}`}
      aria-label="Documents Copilot"
      aria-hidden={!isOpen}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {collapsed && (
        <div
          className="document-copilot-panel__collapsed-strip"
          role="button"
          tabIndex={0}
          onClick={handleMouseEnter}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleMouseEnter()
            }
          }}
          aria-label="Expand Documents Copilot"
        >
          <Sparkles size={18} />
          <span>Documents Copilot</span>
        </div>
      )}
      {!collapsed && (
        <>
          {/* Header */}
      <div className="document-copilot-panel__header">
        <div className="document-copilot-panel__header-title">
          <Sparkles size={18} />
          <h2 className="document-copilot-panel__title">Documents Copilot</h2>
        </div>
        <button
          type="button"
          className="document-copilot-panel__close"
          onClick={handleClose}
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="document-copilot-panel__actions">
        <button
          type="button"
          className="document-copilot-panel__action-btn"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          <FileCheck size={14} />
          <span>Analyze Templates</span>
        </button>
        <button
          type="button"
          className="document-copilot-panel__action-btn"
          onClick={handleReview}
          disabled={isAnalyzing}
        >
          <Users size={14} />
          <span>Review Recipients</span>
        </button>
        <button
          type="button"
          className="document-copilot-panel__action-btn"
          onClick={handleCompliance}
          disabled={isAnalyzing}
        >
          <Shield size={14} />
          <span>Check Compliance</span>
        </button>
      </div>

      {/* Analysis Card */}
      {lastAnalysis && (
        <div className="document-copilot-panel__analysis" data-testid="analysis-card">
          <p className="document-copilot-panel__analysis-summary">{lastAnalysis.summary}</p>
          <ul className="document-copilot-panel__analysis-list">
            {lastAnalysis.items.map((item, i) => (
              <li key={i} className="document-copilot-panel__analysis-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Messages Area */}
      <div className="document-copilot-panel__messages">
        {messages.length === 0 && !isTyping && (
          <div className="document-copilot-panel__empty">
            <Sparkles size={32} />
            <p>
              Hi! I&apos;m your Documents Copilot. Ask me anything about your documents, or
              use the buttons above to get started.
            </p>
          </div>
        )}

        {messages.map((msg: CopilotMessage) => (
          <div
            key={msg.id}
            className={`document-copilot-panel__message document-copilot-panel__message--${msg.role}`}
          >
            <p className="document-copilot-panel__message-text">{msg.content}</p>
          </div>
        ))}

        {isTyping && (
          <div className="document-copilot-panel__message document-copilot-panel__message--assistant">
            <div className="document-copilot-panel__typing" aria-label="Assistant is typing">
              <span className="document-copilot-panel__typing-dot" />
              <span className="document-copilot-panel__typing-dot" />
              <span className="document-copilot-panel__typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="document-copilot-panel__input-area">
        <textarea
          ref={textareaRef}
          className="document-copilot-panel__input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your documents..."
          rows={1}
          aria-label="Message input"
        />
        <button
          type="button"
          className="document-copilot-panel__send"
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

export default DocumentCopilotPanel
