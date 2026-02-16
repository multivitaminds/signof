import { useState, useCallback, useRef, useEffect } from 'react'
import {
  X,
  Send,
  Activity,
  ListTodo,
  Target,
  Sparkles,
} from 'lucide-react'
import { useProjectCopilotStore } from '../../stores/useProjectCopilotStore'
import type { CopilotMessage } from '../../stores/useProjectCopilotStore'
import './ProjectCopilotPanel.css'

function ProjectCopilotPanel() {
  const isOpen = useProjectCopilotStore((s) => s.isOpen)
  const closePanel = useProjectCopilotStore((s) => s.closePanel)
  const messages = useProjectCopilotStore((s) => s.messages)
  const isTyping = useProjectCopilotStore((s) => s.isTyping)
  const sendMessage = useProjectCopilotStore((s) => s.sendMessage)
  const isAnalyzing = useProjectCopilotStore((s) => s.isAnalyzing)
  const analyzeSprintHealth = useProjectCopilotStore((s) => s.analyzeSprintHealth)
  const reviewBacklog = useProjectCopilotStore((s) => s.reviewBacklog)
  const trackGoals = useProjectCopilotStore((s) => s.trackGoals)
  const lastAnalysis = useProjectCopilotStore((s) => s.lastAnalysis)

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
    analyzeSprintHealth()
  }, [analyzeSprintHealth])

  const handleReview = useCallback(() => {
    reviewBacklog()
  }, [reviewBacklog])

  const handleGoals = useCallback(() => {
    trackGoals()
  }, [trackGoals])

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
      className={`project-copilot-panel${isOpen ? ' project-copilot-panel--open' : ''}${collapsed ? ' project-copilot-panel--collapsed' : ''}`}
      aria-label="Projects Copilot"
      aria-hidden={!isOpen}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {collapsed && (
        <div
          className="project-copilot-panel__collapsed-strip"
          role="button"
          tabIndex={0}
          onClick={handleMouseEnter}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleMouseEnter()
            }
          }}
          aria-label="Expand Projects Copilot"
        >
          <Sparkles size={18} />
          <span>Projects Copilot</span>
        </div>
      )}
      {!collapsed && (
        <>
          {/* Header */}
      <div className="project-copilot-panel__header">
        <div className="project-copilot-panel__header-title">
          <Sparkles size={18} />
          <h2 className="project-copilot-panel__title">Projects Copilot</h2>
        </div>
        <button
          type="button"
          className="project-copilot-panel__close"
          onClick={handleClose}
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="project-copilot-panel__actions">
        <button
          type="button"
          className="project-copilot-panel__action-btn"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          <Activity size={14} />
          <span>Sprint Health</span>
        </button>
        <button
          type="button"
          className="project-copilot-panel__action-btn"
          onClick={handleReview}
          disabled={isAnalyzing}
        >
          <ListTodo size={14} />
          <span>Review Backlog</span>
        </button>
        <button
          type="button"
          className="project-copilot-panel__action-btn"
          onClick={handleGoals}
          disabled={isAnalyzing}
        >
          <Target size={14} />
          <span>Track Goals</span>
        </button>
      </div>

      {/* Analysis Card */}
      {lastAnalysis && (
        <div className="project-copilot-panel__analysis" data-testid="analysis-card">
          <p className="project-copilot-panel__analysis-summary">{lastAnalysis.summary}</p>
          <ul className="project-copilot-panel__analysis-list">
            {lastAnalysis.items.map((item, i) => (
              <li key={i} className="project-copilot-panel__analysis-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Messages Area */}
      <div className="project-copilot-panel__messages">
        {messages.length === 0 && !isTyping && (
          <div className="project-copilot-panel__empty">
            <Sparkles size={32} />
            <p>
              Hi! I&apos;m your Projects Copilot. Ask me anything about your projects, or
              use the buttons above to get started.
            </p>
          </div>
        )}

        {messages.map((msg: CopilotMessage) => (
          <div
            key={msg.id}
            className={`project-copilot-panel__message project-copilot-panel__message--${msg.role}`}
          >
            <p className="project-copilot-panel__message-text">{msg.content}</p>
          </div>
        ))}

        {isTyping && (
          <div className="project-copilot-panel__message project-copilot-panel__message--assistant">
            <div className="project-copilot-panel__typing" aria-label="Assistant is typing">
              <span className="project-copilot-panel__typing-dot" />
              <span className="project-copilot-panel__typing-dot" />
              <span className="project-copilot-panel__typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="project-copilot-panel__input-area">
        <textarea
          ref={textareaRef}
          className="project-copilot-panel__input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your projects..."
          rows={1}
          aria-label="Message input"
        />
        <button
          type="button"
          className="project-copilot-panel__send"
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

export default ProjectCopilotPanel
