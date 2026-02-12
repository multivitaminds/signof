import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Send, Wand2 } from 'lucide-react'
import { FEATURE_CONTEXTS, type FeatureKey } from '../../lib/featureContexts'
import useAIFeatureChatStore from '../../stores/useAIFeatureChatStore'
import { parseIntent, executeIntent } from '../../lib/intentEngine'
import VoiceInputButton from '../VoiceInputButton/VoiceInputButton'
import './AIFeatureChatModal.css'

interface AIFeatureChatModalProps {
  featureKey: FeatureKey
  isOpen: boolean
  onClose: () => void
}

export default function AIFeatureChatModal({ featureKey, isOpen, onClose }: AIFeatureChatModalProps) {
  const context = FEATURE_CONTEXTS[featureKey]
  const messages = useAIFeatureChatStore((s) => s.sessions[featureKey].messages)
  const addMessage = useAIFeatureChatStore((s) => s.addMessage)

  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isTyping])

  // Auto-focus on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const processMessage = useCallback(
    (text: string) => {
      addMessage(featureKey, 'user', text)
      setIsTyping(true)

      const delay = 500 + Math.random() * 700
      setTimeout(() => {
        const intent = parseIntent(text, featureKey)
        if (intent.confidence !== 'low') {
          executeIntent(intent)
        }
        addMessage(featureKey, 'assistant', intent.response)
        setIsTyping(false)
      }, delay)
    },
    [featureKey, addMessage]
  )

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed || isTyping) return
    processMessage(trimmed)
    setInputValue('')
  }, [inputValue, isTyping, processMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleQuickAction = useCallback(
    (prompt: string) => {
      if (isTyping) return
      processMessage(prompt)
    },
    [isTyping, processMessage]
  )

  const handleVoiceTranscript = useCallback((text: string) => {
    setInputValue(text)
    inputRef.current?.focus()
  }, [])

  if (!isOpen) return null

  return (
    <div
      className="ai-feature-chat__overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={context.label}
    >
      <div className="ai-feature-chat" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-feature-chat__header">
          <div className="ai-feature-chat__header-left">
            <Wand2 size={14} className="ai-feature-chat__sparkle" />
            <span className="ai-feature-chat__header-title">
              {context.label}
            </span>
          </div>
          <button
            className="ai-feature-chat__close"
            onClick={onClose}
            aria-label="Close AI chat"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="ai-feature-chat__quick-actions">
          {context.quickActions.map((qa) => (
            <button
              key={qa.label}
              className="ai-feature-chat__chip"
              onClick={() => handleQuickAction(qa.prompt)}
            >
              {qa.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="ai-feature-chat__messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`ai-feature-chat__message ai-feature-chat__message--${msg.role}`}
            >
              <span className="ai-feature-chat__message-content">{msg.content}</span>
              <span className="ai-feature-chat__message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="ai-feature-chat__typing" aria-label="AI is typing">
              <span className="ai-feature-chat__typing-dot" />
              <span className="ai-feature-chat__typing-dot" />
              <span className="ai-feature-chat__typing-dot" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="ai-feature-chat__input-area">
          <input
            ref={inputRef}
            className="ai-feature-chat__input"
            type="text"
            placeholder={context.placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Message input"
          />
          <VoiceInputButton onTranscript={handleVoiceTranscript} disabled={isTyping} />
          <button
            className="ai-feature-chat__send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
