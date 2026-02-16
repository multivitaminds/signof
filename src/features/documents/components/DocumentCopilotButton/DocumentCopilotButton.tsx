import { useCallback } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useDocumentCopilotStore } from '../../stores/useDocumentCopilotStore'
import './DocumentCopilotButton.css'

function DocumentCopilotButton() {
  const isOpen = useDocumentCopilotStore((s) => s.isOpen)
  const togglePanel = useDocumentCopilotStore((s) => s.togglePanel)

  const handleClick = useCallback(() => {
    togglePanel()
  }, [togglePanel])

  return (
    <button
      type="button"
      className="document-copilot-btn"
      onClick={handleClick}
      aria-label={isOpen ? 'Close Documents Copilot' : 'Open Documents Copilot'}
    >
      {isOpen ? <X size={24} /> : <Sparkles size={24} />}
    </button>
  )
}

export default DocumentCopilotButton
