import { useState, useCallback, useRef, useEffect } from 'react'
import {
  X,
  Send,
  FileSearch,
  ClipboardCheck,
  DollarSign,
  Sparkles,
} from 'lucide-react'
import { useTaxCopilotStore } from '../../stores/useTaxCopilotStore'
import type { CopilotMessage } from '../../stores/useTaxCopilotStore'
import './TaxCopilotPanel.css'

function TaxCopilotPanel() {
  const isOpen = useTaxCopilotStore((s) => s.isOpen)
  const closePanel = useTaxCopilotStore((s) => s.closePanel)
  const messages = useTaxCopilotStore((s) => s.messages)
  const isTyping = useTaxCopilotStore((s) => s.isTyping)
  const sendMessage = useTaxCopilotStore((s) => s.sendMessage)
  const isAnalyzing = useTaxCopilotStore((s) => s.isAnalyzing)
  const analyzeDocuments = useTaxCopilotStore((s) => s.analyzeDocuments)
  const reviewFiling = useTaxCopilotStore((s) => s.reviewFiling)
  const suggestDeductions = useTaxCopilotStore((s) => s.suggestDeductions)
  const lastAnalysis = useTaxCopilotStore((s) => s.lastAnalysis)

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
    analyzeDocuments()
  }, [analyzeDocuments])

  const handleReview = useCallback(() => {
    reviewFiling()
  }, [reviewFiling])

  const handleDeductions = useCallback(() => {
    suggestDeductions()
  }, [suggestDeductions])

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
      className={`tax-copilot-panel${isOpen ? ' tax-copilot-panel--open' : ''}${collapsed ? ' tax-copilot-panel--collapsed' : ''}`}
      aria-label="Tax Copilot"
      aria-hidden={!isOpen}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {collapsed && (
        <div
          className="tax-copilot-panel__collapsed-strip"
          role="button"
          tabIndex={0}
          onClick={handleMouseEnter}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleMouseEnter()
            }
          }}
          aria-label="Expand Tax Copilot"
        >
          <Sparkles size={18} />
          <span>Tax Copilot</span>
        </div>
      )}
      {!collapsed && (
        <>
          {/* Header */}
      <div className="tax-copilot-panel__header">
        <div className="tax-copilot-panel__header-title">
          <Sparkles size={18} />
          <h2 className="tax-copilot-panel__title">Tax Copilot</h2>
        </div>
        <button
          type="button"
          className="tax-copilot-panel__close"
          onClick={handleClose}
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="tax-copilot-panel__actions">
        <button
          type="button"
          className="tax-copilot-panel__action-btn"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          <FileSearch size={14} />
          <span>Analyze Docs</span>
        </button>
        <button
          type="button"
          className="tax-copilot-panel__action-btn"
          onClick={handleReview}
          disabled={isAnalyzing}
        >
          <ClipboardCheck size={14} />
          <span>Review Filing</span>
        </button>
        <button
          type="button"
          className="tax-copilot-panel__action-btn"
          onClick={handleDeductions}
          disabled={isAnalyzing}
        >
          <DollarSign size={14} />
          <span>Suggest Deductions</span>
        </button>
      </div>

      {/* Analysis Card */}
      {lastAnalysis && (
        <div className="tax-copilot-panel__analysis" data-testid="analysis-card">
          <p className="tax-copilot-panel__analysis-summary">{lastAnalysis.summary}</p>
          <ul className="tax-copilot-panel__analysis-list">
            {lastAnalysis.items.map((item, i) => (
              <li key={i} className="tax-copilot-panel__analysis-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Messages Area */}
      <div className="tax-copilot-panel__messages">
        {messages.length === 0 && !isTyping && (
          <div className="tax-copilot-panel__empty">
            <Sparkles size={32} />
            <p>
              Hi! I&apos;m your Tax Copilot. Ask me anything about your taxes, or
              use the buttons above to get started.
            </p>
          </div>
        )}

        {messages.map((msg: CopilotMessage) => (
          <div
            key={msg.id}
            className={`tax-copilot-panel__message tax-copilot-panel__message--${msg.role}`}
          >
            <p className="tax-copilot-panel__message-text">{msg.content}</p>
          </div>
        ))}

        {isTyping && (
          <div className="tax-copilot-panel__message tax-copilot-panel__message--assistant">
            <div className="tax-copilot-panel__typing" aria-label="Assistant is typing">
              <span className="tax-copilot-panel__typing-dot" />
              <span className="tax-copilot-panel__typing-dot" />
              <span className="tax-copilot-panel__typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="tax-copilot-panel__input-area">
        <textarea
          ref={textareaRef}
          className="tax-copilot-panel__input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your taxes..."
          rows={1}
          aria-label="Message input"
        />
        <button
          type="button"
          className="tax-copilot-panel__send"
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

export default TaxCopilotPanel
