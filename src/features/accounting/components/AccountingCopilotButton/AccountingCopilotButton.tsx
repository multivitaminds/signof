import { useCallback } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useAccountingCopilotStore } from '../../stores/useAccountingCopilotStore'
import './AccountingCopilotButton.css'

function AccountingCopilotButton() {
  const isOpen = useAccountingCopilotStore((s) => s.isOpen)
  const togglePanel = useAccountingCopilotStore((s) => s.togglePanel)
  const suggestions = useAccountingCopilotStore((s) => s.suggestions)

  const activeSuggestions = suggestions.filter((s) => !s.dismissed)
  const badgeCount = activeSuggestions.length

  const handleClick = useCallback(() => {
    togglePanel()
  }, [togglePanel])

  return (
    <button
      type="button"
      className={`accounting-copilot-button${badgeCount > 0 && !isOpen ? ' accounting-copilot-button--pulse' : ''}`}
      onClick={handleClick}
      aria-label={isOpen ? 'Close Accounting Copilot' : 'Open Accounting Copilot'}
    >
      {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      {badgeCount > 0 && !isOpen && (
        <span className="accounting-copilot-button__badge" aria-label={`${badgeCount} suggestions`}>
          {badgeCount}
        </span>
      )}
    </button>
  )
}

export default AccountingCopilotButton
