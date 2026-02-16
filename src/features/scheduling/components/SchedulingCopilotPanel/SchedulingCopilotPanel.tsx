import { useState, useCallback, useRef, useEffect } from 'react'
import {
  X,
  Send,
  CalendarDays,
  Clock,
  Activity,
  Sparkles,
} from 'lucide-react'
import { useSchedulingCopilotStore } from '../../stores/useSchedulingCopilotStore'
import type { CopilotMessage } from '../../stores/useSchedulingCopilotStore'
import './SchedulingCopilotPanel.css'

function SchedulingCopilotPanel() {
  const isOpen = useSchedulingCopilotStore((s) => s.isOpen)
  const closePanel = useSchedulingCopilotStore((s) => s.closePanel)
  const messages = useSchedulingCopilotStore((s) => s.messages)
  const isTyping = useSchedulingCopilotStore((s) => s.isTyping)
  const sendMessage = useSchedulingCopilotStore((s) => s.sendMessage)
  const isAnalyzing = useSchedulingCopilotStore((s) => s.isAnalyzing)
  const analyzeBookings = useSchedulingCopilotStore((s) => s.analyzeBookings)
  const reviewAvailability = useSchedulingCopilotStore((s) => s.reviewAvailability)
  const checkCalendarHealth = useSchedulingCopilotStore((s) => s.checkCalendarHealth)
  const lastAnalysis = useSchedulingCopilotStore((s) => s.lastAnalysis)

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

  const handleAnalyzeBookings = useCallback(() => {
    analyzeBookings()
  }, [analyzeBookings])

  const handleReviewAvailability = useCallback(() => {
    reviewAvailability()
  }, [reviewAvailability])

  const handleCheckCalendarHealth = useCallback(() => {
    checkCalendarHealth()
  }, [checkCalendarHealth])

  return (
    <aside
      className={`scheduling-copilot-panel${isOpen ? ' scheduling-copilot-panel--open' : ''}${collapsed ? ' scheduling-copilot-panel--collapsed' : ''}`}
      aria-label="Calendar Copilot"
      aria-hidden={!isOpen}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {collapsed && (
        <div
          className="scheduling-copilot-panel__collapsed-strip"
          role="button"
          tabIndex={0}
          onClick={handleMouseEnter}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleMouseEnter()
            }
          }}
          aria-label="Expand Calendar Copilot"
        >
          <Sparkles size={18} />
          <span>Calendar Copilot</span>
        </div>
      )}
      {!collapsed && (
        <>
      {/* Header */}
      <div className="scheduling-copilot-panel__header">
        <div className="scheduling-copilot-panel__header-title">
          <Sparkles size={18} />
          <h2 className="scheduling-copilot-panel__title">Calendar Copilot</h2>
        </div>
        <button
          type="button"
          className="scheduling-copilot-panel__close"
          onClick={handleClose}
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="scheduling-copilot-panel__actions">
        <button
          type="button"
          className="scheduling-copilot-panel__action-btn"
          onClick={handleAnalyzeBookings}
          disabled={isAnalyzing}
        >
          <CalendarDays size={14} />
          <span>Analyze Bookings</span>
        </button>
        <button
          type="button"
          className="scheduling-copilot-panel__action-btn"
          onClick={handleReviewAvailability}
          disabled={isAnalyzing}
        >
          <Clock size={14} />
          <span>Review Availability</span>
        </button>
        <button
          type="button"
          className="scheduling-copilot-panel__action-btn"
          onClick={handleCheckCalendarHealth}
          disabled={isAnalyzing}
        >
          <Activity size={14} />
          <span>Calendar Health</span>
        </button>
      </div>

      {/* Analysis Card */}
      {lastAnalysis && (
        <div className="scheduling-copilot-panel__analysis" data-testid="analysis-card">
          <p className="scheduling-copilot-panel__analysis-summary">{lastAnalysis.summary}</p>
          <ul className="scheduling-copilot-panel__analysis-list">
            {lastAnalysis.items.map((item, i) => (
              <li key={i} className="scheduling-copilot-panel__analysis-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Messages Area */}
      <div className="scheduling-copilot-panel__messages">
        {messages.length === 0 && !isTyping && (
          <div className="scheduling-copilot-panel__empty">
            <Sparkles size={32} />
            <p>
              Hi! I&apos;m your Calendar Copilot. Ask me anything about your
              schedule, bookings, or availability.
            </p>
          </div>
        )}

        {messages.map((msg: CopilotMessage) => (
          <div
            key={msg.id}
            className={`scheduling-copilot-panel__message scheduling-copilot-panel__message--${msg.role}`}
          >
            <p className="scheduling-copilot-panel__message-text">{msg.content}</p>
          </div>
        ))}

        {isTyping && (
          <div className="scheduling-copilot-panel__message scheduling-copilot-panel__message--assistant">
            <div className="scheduling-copilot-panel__typing" aria-label="Assistant is typing">
              <span className="scheduling-copilot-panel__typing-dot" />
              <span className="scheduling-copilot-panel__typing-dot" />
              <span className="scheduling-copilot-panel__typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="scheduling-copilot-panel__input-area">
        <textarea
          ref={textareaRef}
          className="scheduling-copilot-panel__input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your schedule..."
          rows={1}
          aria-label="Message input"
        />
        <button
          type="button"
          className="scheduling-copilot-panel__send"
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

export default SchedulingCopilotPanel
