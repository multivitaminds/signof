import { useCallback } from 'react'
import {
  Lightbulb,
  AlertTriangle,
  DollarSign,
  FileQuestion,
  ClipboardCheck,
  X,
} from 'lucide-react'
import type { CopilotSuggestion } from '../../stores/useAccountingCopilotStore'
import './AccountingCopilotSuggestion.css'

interface AccountingCopilotSuggestionProps {
  suggestion: CopilotSuggestion
  onDismiss: (id: string) => void
}

const ICON_MAP = {
  tip: Lightbulb,
  warning: AlertTriangle,
  deduction: DollarSign,
  missing_info: FileQuestion,
  review: ClipboardCheck,
} as const

function AccountingCopilotSuggestion({ suggestion, onDismiss }: AccountingCopilotSuggestionProps) {
  const Icon = ICON_MAP[suggestion.type]

  const handleDismiss = useCallback(() => {
    onDismiss(suggestion.id)
  }, [onDismiss, suggestion.id])

  return (
    <div
      className={`accounting-copilot-suggestion accounting-copilot-suggestion--${suggestion.type}`}
      role="alert"
    >
      <span className="accounting-copilot-suggestion__icon">
        <Icon size={16} />
      </span>

      <div className="accounting-copilot-suggestion__content">
        <h4 className="accounting-copilot-suggestion__title">{suggestion.title}</h4>
        <p className="accounting-copilot-suggestion__description">{suggestion.description}</p>
        {suggestion.action && (
          <button
            type="button"
            className="accounting-copilot-suggestion__action"
          >
            {suggestion.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        className="accounting-copilot-suggestion__dismiss"
        onClick={handleDismiss}
        aria-label={`Dismiss ${suggestion.title}`}
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default AccountingCopilotSuggestion
