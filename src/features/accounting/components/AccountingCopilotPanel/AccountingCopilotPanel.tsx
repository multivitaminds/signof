import { useState, useCallback, useRef, useEffect } from 'react'
import {
  X,
  Send,
  PieChart,
  Receipt,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import { useAccountingCopilotStore } from '../../stores/useAccountingCopilotStore'
import type { CopilotMessage } from '../../stores/useAccountingCopilotStore'
import './AccountingCopilotPanel.css'

function AccountingCopilotPanel() {
  const isOpen = useAccountingCopilotStore((s) => s.isOpen)
  const closePanel = useAccountingCopilotStore((s) => s.closePanel)
  const messages = useAccountingCopilotStore((s) => s.messages)
  const isTyping = useAccountingCopilotStore((s) => s.isTyping)
  const sendMessage = useAccountingCopilotStore((s) => s.sendMessage)
  const isAnalyzing = useAccountingCopilotStore((s) => s.isAnalyzing)
  const analyzeExpenses = useAccountingCopilotStore((s) => s.analyzeExpenses)
  const reviewInvoices = useAccountingCopilotStore((s) => s.reviewInvoices)
  const forecastCashFlow = useAccountingCopilotStore((s) => s.forecastCashFlow)
  const lastAnalysis = useAccountingCopilotStore((s) => s.lastAnalysis)

  const [inputValue, setInputValue] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when new messages arrive or typing starts
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isTyping])

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

  const handleAnalyzeExpenses = useCallback(() => {
    analyzeExpenses()
  }, [analyzeExpenses])

  const handleReviewInvoices = useCallback(() => {
    reviewInvoices()
  }, [reviewInvoices])

  const handleForecastCashFlow = useCallback(() => {
    forecastCashFlow()
  }, [forecastCashFlow])

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
      className={`accounting-copilot-panel${isOpen ? ' accounting-copilot-panel--open' : ''}${collapsed ? ' accounting-copilot-panel--collapsed' : ''}`}
      aria-label="Accounting Copilot"
      aria-hidden={!isOpen}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {collapsed && (
        <div className="accounting-copilot-panel__collapsed-strip">
          <Sparkles size={18} />
          <span>Accounting Copilot</span>
        </div>
      )}
      {!collapsed && (
        <>
          {/* Header */}
      <div className="accounting-copilot-panel__header">
        <div className="accounting-copilot-panel__header-title">
          <Sparkles size={18} />
          <h2 className="accounting-copilot-panel__title">Accounting Copilot</h2>
        </div>
        <button
          type="button"
          className="accounting-copilot-panel__close"
          onClick={handleClose}
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="accounting-copilot-panel__actions">
        <button
          type="button"
          className="accounting-copilot-panel__action-btn"
          onClick={handleAnalyzeExpenses}
          disabled={isAnalyzing}
        >
          <PieChart size={14} />
          <span>Analyze Expenses</span>
        </button>
        <button
          type="button"
          className="accounting-copilot-panel__action-btn"
          onClick={handleReviewInvoices}
          disabled={isAnalyzing}
        >
          <Receipt size={14} />
          <span>Review Invoices</span>
        </button>
        <button
          type="button"
          className="accounting-copilot-panel__action-btn"
          onClick={handleForecastCashFlow}
          disabled={isAnalyzing}
        >
          <TrendingUp size={14} />
          <span>Forecast Cash Flow</span>
        </button>
      </div>

      {/* Analysis Card */}
      {lastAnalysis && (
        <div className="accounting-copilot-panel__analysis" data-testid="analysis-card">
          <p className="accounting-copilot-panel__analysis-summary">{lastAnalysis.summary}</p>
          <ul className="accounting-copilot-panel__analysis-list">
            {lastAnalysis.items.map((item, i) => (
              <li key={i} className="accounting-copilot-panel__analysis-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Messages Area */}
      <div className="accounting-copilot-panel__messages">
        {messages.length === 0 && !isTyping && (
          <div className="accounting-copilot-panel__empty">
            <Sparkles size={32} />
            <p>
              Hi! I&apos;m your Accounting Copilot. Ask me anything about your
              finances, or use the buttons above to get started.
            </p>
          </div>
        )}

        {messages.map((msg: CopilotMessage) => (
          <div
            key={msg.id}
            className={`accounting-copilot-panel__message accounting-copilot-panel__message--${msg.role}`}
          >
            <p className="accounting-copilot-panel__message-text">{msg.content}</p>
          </div>
        ))}

        {isTyping && (
          <div className="accounting-copilot-panel__message accounting-copilot-panel__message--assistant">
            <div className="accounting-copilot-panel__typing" aria-label="Assistant is typing">
              <span className="accounting-copilot-panel__typing-dot" />
              <span className="accounting-copilot-panel__typing-dot" />
              <span className="accounting-copilot-panel__typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="accounting-copilot-panel__input-area">
        <textarea
          className="accounting-copilot-panel__input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your finances..."
          rows={1}
          aria-label="Message input"
        />
        <button
          type="button"
          className="accounting-copilot-panel__send"
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

export default AccountingCopilotPanel
