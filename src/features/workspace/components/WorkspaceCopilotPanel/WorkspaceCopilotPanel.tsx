import { useState, useCallback, useRef, useEffect } from 'react'
import {
  X,
  Send,
  FolderTree,
  FileText,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { useWorkspaceCopilotStore } from '../../stores/useWorkspaceCopilotStore'
import type { CopilotMessage } from '../../stores/useWorkspaceCopilotStore'
import './WorkspaceCopilotPanel.css'

function WorkspaceCopilotPanel() {
  const isOpen = useWorkspaceCopilotStore((s) => s.isOpen)
  const closePanel = useWorkspaceCopilotStore((s) => s.closePanel)
  const messages = useWorkspaceCopilotStore((s) => s.messages)
  const isTyping = useWorkspaceCopilotStore((s) => s.isTyping)
  const sendMessage = useWorkspaceCopilotStore((s) => s.sendMessage)
  const isAnalyzing = useWorkspaceCopilotStore((s) => s.isAnalyzing)
  const analyzeStructure = useWorkspaceCopilotStore((s) => s.analyzeStructure)
  const reviewContent = useWorkspaceCopilotStore((s) => s.reviewContent)
  const suggestCleanup = useWorkspaceCopilotStore((s) => s.suggestCleanup)
  const lastAnalysis = useWorkspaceCopilotStore((s) => s.lastAnalysis)

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
    analyzeStructure()
  }, [analyzeStructure])

  const handleReview = useCallback(() => {
    reviewContent()
  }, [reviewContent])

  const handleCleanup = useCallback(() => {
    suggestCleanup()
  }, [suggestCleanup])

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
      className={`workspace-copilot-panel${isOpen ? ' workspace-copilot-panel--open' : ''}${collapsed ? ' workspace-copilot-panel--collapsed' : ''}`}
      aria-label="Pages Copilot"
      aria-hidden={!isOpen}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {collapsed && (
        <div
          className="workspace-copilot-panel__collapsed-strip"
          role="button"
          tabIndex={0}
          onClick={handleMouseEnter}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleMouseEnter()
            }
          }}
          aria-label="Expand Pages Copilot"
        >
          <Sparkles size={18} />
          <span>Pages Copilot</span>
        </div>
      )}
      {!collapsed && (
        <>
          {/* Header */}
      <div className="workspace-copilot-panel__header">
        <div className="workspace-copilot-panel__header-title">
          <Sparkles size={18} />
          <h2 className="workspace-copilot-panel__title">Pages Copilot</h2>
        </div>
        <button
          type="button"
          className="workspace-copilot-panel__close"
          onClick={handleClose}
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="workspace-copilot-panel__actions">
        <button
          type="button"
          className="workspace-copilot-panel__action-btn"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          <FolderTree size={14} />
          <span>Analyze Structure</span>
        </button>
        <button
          type="button"
          className="workspace-copilot-panel__action-btn"
          onClick={handleReview}
          disabled={isAnalyzing}
        >
          <FileText size={14} />
          <span>Review Content</span>
        </button>
        <button
          type="button"
          className="workspace-copilot-panel__action-btn"
          onClick={handleCleanup}
          disabled={isAnalyzing}
        >
          <Trash2 size={14} />
          <span>Suggest Cleanup</span>
        </button>
      </div>

      {/* Analysis Card */}
      {lastAnalysis && (
        <div className="workspace-copilot-panel__analysis" data-testid="analysis-card">
          <p className="workspace-copilot-panel__analysis-summary">{lastAnalysis.summary}</p>
          <ul className="workspace-copilot-panel__analysis-list">
            {lastAnalysis.items.map((item, i) => (
              <li key={i} className="workspace-copilot-panel__analysis-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Messages Area */}
      <div className="workspace-copilot-panel__messages">
        {messages.length === 0 && !isTyping && (
          <div className="workspace-copilot-panel__empty">
            <Sparkles size={32} />
            <p>
              Hi! I&apos;m your Pages Copilot. Ask me anything about your pages, or
              use the buttons above to get started.
            </p>
          </div>
        )}

        {messages.map((msg: CopilotMessage) => (
          <div
            key={msg.id}
            className={`workspace-copilot-panel__message workspace-copilot-panel__message--${msg.role}`}
          >
            <p className="workspace-copilot-panel__message-text">{msg.content}</p>
          </div>
        ))}

        {isTyping && (
          <div className="workspace-copilot-panel__message workspace-copilot-panel__message--assistant">
            <div className="workspace-copilot-panel__typing" aria-label="Assistant is typing">
              <span className="workspace-copilot-panel__typing-dot" />
              <span className="workspace-copilot-panel__typing-dot" />
              <span className="workspace-copilot-panel__typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="workspace-copilot-panel__input-area">
        <textarea
          ref={textareaRef}
          className="workspace-copilot-panel__input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your pages..."
          rows={1}
          aria-label="Message input"
        />
        <button
          type="button"
          className="workspace-copilot-panel__send"
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

export default WorkspaceCopilotPanel
