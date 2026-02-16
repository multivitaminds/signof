import { useCallback } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useDeveloperCopilotStore } from '../../stores/useDeveloperCopilotStore'
import './DeveloperCopilotButton.css'

function DeveloperCopilotButton() {
  const isOpen = useDeveloperCopilotStore((s) => s.isOpen)
  const togglePanel = useDeveloperCopilotStore((s) => s.togglePanel)

  const handleClick = useCallback(() => {
    togglePanel()
  }, [togglePanel])

  return (
    <button
      type="button"
      className="developer-copilot-btn"
      onClick={handleClick}
      aria-label={isOpen ? 'Close Developer Copilot' : 'Open Developer Copilot'}
    >
      {isOpen ? <X size={24} /> : <Sparkles size={24} />}
    </button>
  )
}

export default DeveloperCopilotButton
