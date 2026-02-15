import { useCallback } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useTaxCopilotStore } from '../../stores/useTaxCopilotStore'
import './TaxCopilotButton.css'

function TaxCopilotButton() {
  const isOpen = useTaxCopilotStore((s) => s.isOpen)
  const togglePanel = useTaxCopilotStore((s) => s.togglePanel)
  const suggestions = useTaxCopilotStore((s) => s.suggestions)

  const activeSuggestions = suggestions.filter((s) => !s.dismissed)
  const badgeCount = activeSuggestions.length

  const handleClick = useCallback(() => {
    togglePanel()
  }, [togglePanel])

  return (
    <button
      type="button"
      className={`tax-copilot-button${badgeCount > 0 && !isOpen ? ' tax-copilot-button--pulse' : ''}`}
      onClick={handleClick}
      aria-label={isOpen ? 'Close Tax Copilot' : 'Open Tax Copilot'}
    >
      {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      {badgeCount > 0 && !isOpen && (
        <span className="tax-copilot-button__badge" aria-label={`${badgeCount} suggestions`}>
          {badgeCount}
        </span>
      )}
    </button>
  )
}

export default TaxCopilotButton
