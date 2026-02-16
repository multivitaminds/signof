import { useState, useCallback, useRef, useEffect } from 'react'
import {
  X,
  Send,
  HeartPulse,
  Webhook,
  Key,
  Sparkles,
} from 'lucide-react'
import { useDeveloperCopilotStore } from '../../stores/useDeveloperCopilotStore'
import type { CopilotMessage } from '../../stores/useDeveloperCopilotStore'
import './DeveloperCopilotPanel.css'

function DeveloperCopilotPanel() {
  const isOpen = useDeveloperCopilotStore((s) => s.isOpen)
  const closePanel = useDeveloperCopilotStore((s) => s.closePanel)
  const messages = useDeveloperCopilotStore((s) => s.messages)
  const isTyping = useDeveloperCopilotStore((s) => s.isTyping)
  const sendMessage = useDeveloperCopilotStore((s) => s.sendMessage)
  const isAnalyzing = useDeveloperCopilotStore((s) => s.isAnalyzing)
  const checkApiHealth = useDeveloperCopilotStore((s) => s.checkApiHealth)
  const debugWebhooks = useDeveloperCopilotStore((s) => s.debugWebhooks)
  const reviewKeys = useDeveloperCopilotStore((s) => s.reviewKeys)
  const lastAnalysis = useDeveloperCopilotStore((s) => s.lastAnalysis)

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
    checkApiHealth()
  }, [checkApiHealth])

  const handleReview = useCallback(() => {
    debugWebhooks()
  }, [debugWebhooks])

  const handleKeys = useCallback(() => {
    reviewKeys()
  }, [reviewKeys])

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
      className={`developer-copilot-panel${isOpen ? ' developer-copilot-panel--open' : ''}${collapsed ? ' developer-copilot-panel--collapsed' : ''}`}
      aria-label="Developer Copilot"
      aria-hidden={!isOpen}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {collapsed && (
        <div
          className="developer-copilot-panel__collapsed-strip"
          role="button"
          tabIndex={0}
          onClick={handleMouseEnter}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleMouseEnter()
            }
          }}
          aria-label="Expand Developer Copilot"
        >
          <Sparkles size={18} />
          <span>Developer Copilot</span>
        </div>
      )}
      {!collapsed && (
        <>
          {/* Header */}
      <div className="developer-copilot-panel__header">
        <div className="developer-copilot-panel__header-title">
          <Sparkles size={18} />
          <h2 className="developer-copilot-panel__title">Developer Copilot</h2>
        </div>
        <button
          type="button"
          className="developer-copilot-panel__close"
          onClick={handleClose}
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="developer-copilot-panel__actions">
        <button
          type="button"
          className="developer-copilot-panel__action-btn"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          <HeartPulse size={14} />
          <span>API Health</span>
        </button>
        <button
          type="button"
          className="developer-copilot-panel__action-btn"
          onClick={handleReview}
          disabled={isAnalyzing}
        >
          <Webhook size={14} />
          <span>Debug Webhooks</span>
        </button>
        <button
          type="button"
          className="developer-copilot-panel__action-btn"
          onClick={handleKeys}
          disabled={isAnalyzing}
        >
          <Key size={14} />
          <span>Review Keys</span>
        </button>
      </div>

      {/* Analysis Card */}
      {lastAnalysis && (
        <div className="developer-copilot-panel__analysis" data-testid="analysis-card">
          <p className="developer-copilot-panel__analysis-summary">{lastAnalysis.summary}</p>
          <ul className="developer-copilot-panel__analysis-list">
            {lastAnalysis.items.map((item, i) => (
              <li key={i} className="developer-copilot-panel__analysis-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Messages Area */}
      <div className="developer-copilot-panel__messages">
        {messages.length === 0 && !isTyping && (
          <div className="developer-copilot-panel__empty">
            <Sparkles size={32} />
            <p>
              Hi! I&apos;m your Developer Copilot. Ask me anything about the API, or
              use the buttons above to get started.
            </p>
          </div>
        )}

        {messages.map((msg: CopilotMessage) => (
          <div
            key={msg.id}
            className={`developer-copilot-panel__message developer-copilot-panel__message--${msg.role}`}
          >
            <p className="developer-copilot-panel__message-text">{msg.content}</p>
          </div>
        ))}

        {isTyping && (
          <div className="developer-copilot-panel__message developer-copilot-panel__message--assistant">
            <div className="developer-copilot-panel__typing" aria-label="Assistant is typing">
              <span className="developer-copilot-panel__typing-dot" />
              <span className="developer-copilot-panel__typing-dot" />
              <span className="developer-copilot-panel__typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="developer-copilot-panel__input-area">
        <textarea
          ref={textareaRef}
          className="developer-copilot-panel__input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the API..."
          rows={1}
          aria-label="Message input"
        />
        <button
          type="button"
          className="developer-copilot-panel__send"
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

export default DeveloperCopilotPanel
