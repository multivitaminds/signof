import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Send, Wand2 } from 'lucide-react'
import { FEATURE_CONTEXTS, type FeatureKey } from '../../lib/featureContexts'
import useAIFeatureChatStore from '../../stores/useAIFeatureChatStore'
import { parseIntent, executeIntent } from '../../lib/intentEngine'
import { isLLMAvailable, syncChat } from '../../lib/llmClient'
import { ORIGINA_TOOLS, executeTool } from '../../lib/toolDefinitions'
import type { AIChatToolResult } from '../../types'
import ToolResultCard from '../ToolResultCard/ToolResultCard'
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

      const intent = parseIntent(text, featureKey)

      // High/medium confidence — use regex-based intent as before
      if (intent.confidence !== 'low') {
        const delay = 500 + Math.random() * 700
        setTimeout(() => {
          executeIntent(intent)
          addMessage(featureKey, 'assistant', intent.response)
          setIsTyping(false)
        }, delay)
        return
      }

      // Low confidence — try LLM if available
      if (isLLMAvailable()) {
        const systemPrompt = [
          `You are the OriginA Copilot for the ${context.label} module.`,
          `Help the user with their request. Be concise and helpful.`,
          `You have access to tools to create pages, issues, bookings, templates, contacts, and databases.`,
          `You can also read workspace stats and upcoming deadlines.`,
        ].join('\n')

        // Build conversation history from session messages (last 10)
        const history = messages.slice(-10).map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

        syncChat({
          messages: [...history, { role: 'user', content: text }],
          systemPrompt,
          tools: ORIGINA_TOOLS,
        }).then(response => {
          const toolResults: AIChatToolResult[] = []

          // Check if the response includes a tool call result indicator
          if (response) {
            // Try to parse as JSON to see if it contains tool_use
            try {
              const parsed: { tool_calls?: Array<{ name: string; input: Record<string, unknown> }> } =
                JSON.parse(response)
              if (parsed.tool_calls) {
                for (const call of parsed.tool_calls) {
                  const result = executeTool(call.name, call.input)
                  toolResults.push({ toolName: call.name, input: call.input, result })
                }
              }
            } catch {
              // Not JSON — just a text response, which is fine
            }

            const displayText = toolResults.length > 0
              ? response.replace(/^\{[\s\S]*\}$/, '').trim() || 'Done! Here are the results:'
              : response

            addMessage(featureKey, 'assistant', displayText, toolResults.length > 0 ? toolResults : undefined)
          } else {
            // LLM failed — use regex fallback
            addMessage(featureKey, 'assistant', intent.response)
          }
          setIsTyping(false)
        }).catch(() => {
          // Error — use regex fallback
          addMessage(featureKey, 'assistant', intent.response)
          setIsTyping(false)
        })
        return
      }

      // No LLM available — use regex fallback
      const delay = 500 + Math.random() * 700
      setTimeout(() => {
        addMessage(featureKey, 'assistant', intent.response)
        setIsTyping(false)
      }, delay)
    },
    [featureKey, addMessage, context.label, messages]
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
      role="dialog"
      aria-modal="true"
      aria-label={context.label}
    >
      <div className="ai-feature-chat">
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
            aria-label="Close Copilot chat"
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
              {msg.toolResults && msg.toolResults.length > 0 && (
                <div className="ai-feature-chat__tool-results">
                  {msg.toolResults.map((tr, idx) => (
                    <ToolResultCard
                      key={`${msg.id}-tool-${idx}`}
                      toolName={tr.toolName}
                      input={tr.input}
                      result={tr.result}
                    />
                  ))}
                </div>
              )}
              <span className="ai-feature-chat__message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="ai-feature-chat__typing" aria-label="Copilot is typing">
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
