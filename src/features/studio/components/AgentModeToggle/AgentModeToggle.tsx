import { Bot } from 'lucide-react'
import './AgentModeToggle.css'

interface AgentModeToggleProps {
  enabled: boolean
  onToggle: () => void
}

function AgentModeToggle({ enabled, onToggle }: AgentModeToggleProps) {
  return (
    <button
      className={`agent-mode-toggle ${enabled ? 'agent-mode-toggle--enabled' : 'agent-mode-toggle--disabled'}`}
      onClick={onToggle}
      type="button"
      title="Enable agent mode for tool use"
      aria-pressed={enabled}
    >
      <Bot size={14} />
      <span>Agent</span>
    </button>
  )
}

export default AgentModeToggle
