import { useCallback } from 'react'
import { Sparkles, X } from 'lucide-react'
import { useInboxCopilotStore } from '../../stores/useInboxCopilotStore'
import './InboxCopilotButton.css'

function InboxCopilotButton() {
  const isOpen = useInboxCopilotStore((s) => s.isOpen)
  const togglePanel = useInboxCopilotStore((s) => s.togglePanel)

  const handleClick = useCallback(() => {
    togglePanel()
  }, [togglePanel])

  return (
    <button
      type="button"
      className="inbox-copilot-btn"
      onClick={handleClick}
      aria-label={isOpen ? 'Close Inbox Copilot' : 'Open Inbox Copilot'}
    >
      {isOpen ? <X size={24} /> : <Sparkles size={24} />}
    </button>
  )
}

export default InboxCopilotButton
