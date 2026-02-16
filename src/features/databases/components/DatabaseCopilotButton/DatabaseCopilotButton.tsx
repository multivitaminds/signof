import { useCallback } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useDatabaseCopilotStore } from '../../stores/useDatabaseCopilotStore'
import './DatabaseCopilotButton.css'

function DatabaseCopilotButton() {
  const isOpen = useDatabaseCopilotStore((s) => s.isOpen)
  const togglePanel = useDatabaseCopilotStore((s) => s.togglePanel)
  const suggestions = useDatabaseCopilotStore((s) => s.suggestions)

  const activeSuggestions = suggestions.filter((s) => !s.dismissed)
  const badgeCount = activeSuggestions.length

  const handleClick = useCallback(() => {
    togglePanel()
  }, [togglePanel])

  return (
    <button
      type="button"
      className={`database-copilot-btn${badgeCount > 0 && !isOpen ? ' database-copilot-btn--pulse' : ''}`}
      onClick={handleClick}
      aria-label={isOpen ? 'Close Databases Copilot' : 'Open Databases Copilot'}
    >
      {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      {badgeCount > 0 && !isOpen && (
        <span className="database-copilot-btn__badge" aria-label={`${badgeCount} suggestions`}>
          {badgeCount}
        </span>
      )}
    </button>
  )
}

export default DatabaseCopilotButton
