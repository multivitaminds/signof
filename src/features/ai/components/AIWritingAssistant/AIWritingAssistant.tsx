import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Sparkles,
  Check,
  X,
  ChevronDown,
  Wand2,
  SpellCheck,
  Minus,
  Plus,
  MessageSquare,
} from 'lucide-react'
import './AIWritingAssistant.css'

// ─── Types ─────────────────────────────────────────────────────────────

const ToneOption = {
  Professional: 'professional',
  Casual: 'casual',
  Friendly: 'friendly',
  Formal: 'formal',
} as const

type ToneOption = (typeof ToneOption)[keyof typeof ToneOption]

interface WritingSuggestion {
  original: string
  improved: string
  action: string
}

interface AIWritingAssistantProps {
  selectedText: string
  position: { top: number; left: number }
  onAccept: (newText: string) => void
  onDismiss: () => void
}

// ─── Simulated writing improvements ────────────────────────────────────

function simulateImproveWriting(text: string): WritingSuggestion {
  return {
    original: text,
    improved: text
      .replace(/very /gi, '')
      .replace(/really /gi, '')
      .replace(/just /gi, '')
      .replace(/\bi think\b/gi, 'Evidence suggests')
      .replace(/\bgood\b/gi, 'effective')
      .replace(/\bbad\b/gi, 'problematic')
      + (text.endsWith('.') ? '' : '.'),
    action: 'Improve writing',
  }
}

function simulateFixGrammar(text: string): WritingSuggestion {
  return {
    original: text,
    improved: text.charAt(0).toUpperCase() + text.slice(1)
      + (text.endsWith('.') || text.endsWith('!') || text.endsWith('?') ? '' : '.'),
    action: 'Fix grammar',
  }
}

function simulateMakeShorter(text: string): WritingSuggestion {
  const words = text.split(' ')
  const shortened = words.length > 8
    ? words.slice(0, Math.ceil(words.length * 0.6)).join(' ') + '.'
    : text
  return {
    original: text,
    improved: shortened,
    action: 'Make shorter',
  }
}

function simulateMakeLonger(text: string): WritingSuggestion {
  return {
    original: text,
    improved: text.replace(/\.$/, '') +
      '. This provides additional context and clarity for the reader, ensuring all key points are thoroughly addressed and well-understood.',
    action: 'Make longer',
  }
}

function simulateChangeTone(text: string, tone: ToneOption): WritingSuggestion {
  const toneMap: Record<ToneOption, string> = {
    [ToneOption.Professional]: text.replace(/!/g, '.').replace(/\bhey\b/gi, 'Hello'),
    [ToneOption.Casual]: text.replace(/\bHello\b/gi, 'Hey').replace(/\bRegards\b/gi, 'Cheers'),
    [ToneOption.Friendly]: text.replace(/\.$/, '! ') + 'Hope this helps!',
    [ToneOption.Formal]: 'Please be advised that ' + text.charAt(0).toLowerCase() + text.slice(1),
  }
  return {
    original: text,
    improved: toneMap[tone] ?? text,
    action: `Change tone to ${tone}`,
  }
}

// ─── Component ─────────────────────────────────────────────────────────

export default function AIWritingAssistant({
  selectedText,
  position,
  onAccept,
  onDismiss,
}: AIWritingAssistantProps) {
  const [suggestion, setSuggestion] = useState<WritingSuggestion | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showToneMenu, setShowToneMenu] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onDismiss()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onDismiss])

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onDismiss])

  const processAction = useCallback((fn: () => WritingSuggestion) => {
    setIsProcessing(true)
    setSuggestion(null)
    setShowToneMenu(false)

    // Simulate AI processing delay
    const delay = 500 + Math.random() * 1000
    setTimeout(() => {
      const result = fn()
      setSuggestion(result)
      setIsProcessing(false)
    }, delay)
  }, [])

  const handleImprove = useCallback(() => {
    processAction(() => simulateImproveWriting(selectedText))
  }, [selectedText, processAction])

  const handleFixGrammar = useCallback(() => {
    processAction(() => simulateFixGrammar(selectedText))
  }, [selectedText, processAction])

  const handleMakeShorter = useCallback(() => {
    processAction(() => simulateMakeShorter(selectedText))
  }, [selectedText, processAction])

  const handleMakeLonger = useCallback(() => {
    processAction(() => simulateMakeLonger(selectedText))
  }, [selectedText, processAction])

  const handleChangeTone = useCallback((tone: ToneOption) => {
    processAction(() => simulateChangeTone(selectedText, tone))
  }, [selectedText, processAction])

  const handleAccept = useCallback(() => {
    if (suggestion) {
      onAccept(suggestion.improved)
    }
  }, [suggestion, onAccept])

  const toggleToneMenu = useCallback(() => {
    setShowToneMenu((prev) => !prev)
  }, [])

  return (
    <div
      ref={containerRef}
      className="ai-writing-assistant"
      style={{ top: position.top, left: position.left }}
      role="toolbar"
      aria-label="AI Writing Assistant"
    >
      {/* Toolbar buttons */}
      {!suggestion && !isProcessing && (
        <div className="ai-writing-assistant__toolbar">
          <button
            className="ai-writing-assistant__btn"
            onClick={handleImprove}
            title="Improve writing"
            aria-label="Improve writing"
          >
            <Wand2 size={14} />
            <span>Improve</span>
          </button>
          <button
            className="ai-writing-assistant__btn"
            onClick={handleFixGrammar}
            title="Fix grammar"
            aria-label="Fix grammar"
          >
            <SpellCheck size={14} />
            <span>Grammar</span>
          </button>
          <button
            className="ai-writing-assistant__btn"
            onClick={handleMakeShorter}
            title="Make shorter"
            aria-label="Make shorter"
          >
            <Minus size={14} />
            <span>Shorter</span>
          </button>
          <button
            className="ai-writing-assistant__btn"
            onClick={handleMakeLonger}
            title="Make longer"
            aria-label="Make longer"
          >
            <Plus size={14} />
            <span>Longer</span>
          </button>
          <div className="ai-writing-assistant__tone-wrapper">
            <button
              className="ai-writing-assistant__btn"
              onClick={toggleToneMenu}
              title="Change tone"
              aria-label="Change tone"
              aria-expanded={showToneMenu}
            >
              <MessageSquare size={14} />
              <span>Tone</span>
              <ChevronDown size={12} />
            </button>
            {showToneMenu && (
              <div className="ai-writing-assistant__tone-menu" role="menu" aria-label="Tone options">
                {Object.entries(ToneOption).map(([label, value]) => (
                  <button
                    key={value}
                    className="ai-writing-assistant__tone-item"
                    role="menuitem"
                    onClick={() => handleChangeTone(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing state */}
      {isProcessing && (
        <div className="ai-writing-assistant__processing" aria-label="Processing">
          <Sparkles size={16} className="ai-writing-assistant__processing-icon" />
          <span>AI is thinking...</span>
        </div>
      )}

      {/* Suggestion diff view */}
      {suggestion && !isProcessing && (
        <div className="ai-writing-assistant__suggestion">
          <div className="ai-writing-assistant__suggestion-header">
            <Sparkles size={14} />
            <span>{suggestion.action}</span>
          </div>
          <div className="ai-writing-assistant__diff">
            <div className="ai-writing-assistant__diff-removed" aria-label="Original text">
              {suggestion.original}
            </div>
            <div className="ai-writing-assistant__diff-added" aria-label="Improved text">
              {suggestion.improved}
            </div>
          </div>
          <div className="ai-writing-assistant__suggestion-actions">
            <button
              className="ai-writing-assistant__accept-btn"
              onClick={handleAccept}
              aria-label="Accept suggestion"
            >
              <Check size={14} />
              Accept
            </button>
            <button
              className="ai-writing-assistant__dismiss-btn"
              onClick={onDismiss}
              aria-label="Dismiss suggestion"
            >
              <X size={14} />
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
