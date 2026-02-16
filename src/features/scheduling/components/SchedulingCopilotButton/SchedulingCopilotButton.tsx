import { useCallback } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useSchedulingCopilotStore } from '../../stores/useSchedulingCopilotStore'
import './SchedulingCopilotButton.css'

function SchedulingCopilotButton() {
  const isOpen = useSchedulingCopilotStore((s) => s.isOpen)
  const togglePanel = useSchedulingCopilotStore((s) => s.togglePanel)
  const suggestions = useSchedulingCopilotStore((s) => s.suggestions)

  const activeSuggestions = suggestions.filter((s) => !s.dismissed)
  const badgeCount = activeSuggestions.length

  const handleClick = useCallback(() => {
    togglePanel()
  }, [togglePanel])

  return (
    <button
      type="button"
      className={`scheduling-copilot-button${badgeCount > 0 && !isOpen ? ' scheduling-copilot-button--pulse' : ''}`}
      onClick={handleClick}
      aria-label={isOpen ? 'Close Calendar Copilot' : 'Open Calendar Copilot'}
    >
      {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      {badgeCount > 0 && !isOpen && (
        <span className="scheduling-copilot-button__badge" aria-label={`${badgeCount} suggestions`}>
          {badgeCount}
        </span>
      )}
    </button>
  )
}

export default SchedulingCopilotButton
