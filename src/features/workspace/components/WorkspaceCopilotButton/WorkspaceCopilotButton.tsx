import { useCallback } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useWorkspaceCopilotStore } from '../../stores/useWorkspaceCopilotStore'
import './WorkspaceCopilotButton.css'

function WorkspaceCopilotButton() {
  const isOpen = useWorkspaceCopilotStore((s) => s.isOpen)
  const togglePanel = useWorkspaceCopilotStore((s) => s.togglePanel)

  const handleClick = useCallback(() => {
    togglePanel()
  }, [togglePanel])

  return (
    <button
      type="button"
      className="workspace-copilot-btn"
      onClick={handleClick}
      aria-label={isOpen ? 'Close Pages Copilot' : 'Open Pages Copilot'}
    >
      {isOpen ? <X size={24} /> : <Sparkles size={24} />}
    </button>
  )
}

export default WorkspaceCopilotButton
