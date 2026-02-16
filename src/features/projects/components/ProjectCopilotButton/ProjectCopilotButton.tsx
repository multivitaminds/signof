import { useCallback } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useProjectCopilotStore } from '../../stores/useProjectCopilotStore'
import './ProjectCopilotButton.css'

function ProjectCopilotButton() {
  const isOpen = useProjectCopilotStore((s) => s.isOpen)
  const togglePanel = useProjectCopilotStore((s) => s.togglePanel)

  const handleClick = useCallback(() => {
    togglePanel()
  }, [togglePanel])

  return (
    <button
      type="button"
      className="project-copilot-btn"
      onClick={handleClick}
      aria-label={isOpen ? 'Close Projects Copilot' : 'Open Projects Copilot'}
    >
      {isOpen ? <X size={24} /> : <Sparkles size={24} />}
    </button>
  )
}

export default ProjectCopilotButton
