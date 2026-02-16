import { useCallback } from 'react'
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  FileQuestion,
  ClipboardCheck,
  X,
} from 'lucide-react'
import type { CopilotSuggestion } from '../../stores/useDatabaseCopilotStore'
import './DatabaseCopilotSuggestion.css'

interface DatabaseCopilotSuggestionProps {
  suggestion: CopilotSuggestion
  onDismiss: (id: string) => void
}

const ICON_MAP = {
  tip: Lightbulb,
  warning: AlertTriangle,
  optimization: TrendingUp,
  missing_info: FileQuestion,
  review: ClipboardCheck,
} as const

function DatabaseCopilotSuggestion({ suggestion, onDismiss }: DatabaseCopilotSuggestionProps) {
  const Icon = ICON_MAP[suggestion.type]

  const handleDismiss = useCallback(() => {
    onDismiss(suggestion.id)
  }, [onDismiss, suggestion.id])

  return (
    <div
      className={`database-copilot-suggestion database-copilot-suggestion--${suggestion.type}`}
      role="alert"
    >
      <span className="database-copilot-suggestion__icon">
        <Icon size={16} />
      </span>

      <div className="database-copilot-suggestion__content">
        <h4 className="database-copilot-suggestion__title">{suggestion.title}</h4>
        <p className="database-copilot-suggestion__description">{suggestion.description}</p>
        {suggestion.action && (
          <button
            type="button"
            className="database-copilot-suggestion__action"
          >
            {suggestion.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        className="database-copilot-suggestion__dismiss"
        onClick={handleDismiss}
        aria-label={`Dismiss ${suggestion.title}`}
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default DatabaseCopilotSuggestion
