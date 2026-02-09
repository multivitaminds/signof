import { useCallback } from 'react'
import type { AgentType, AgentTypeDefinition } from '../../types'
import {
  ClipboardList, Search, PenTool, BarChart3,
  Palette, Code2, CheckSquare, Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import './AgentConfigPanel.css'

const ICON_MAP: Record<string, LucideIcon> = {
  ClipboardList, Search, PenTool, BarChart3,
  Palette, Code2, CheckSquare, Users,
}

interface AgentConfig {
  name: string
  type: AgentType
  instructions: string
  memoryAllocation: number
}

interface AgentConfigPanelProps {
  agent: AgentConfig
  typeDefinition: AgentTypeDefinition
  onChange: (updates: Partial<{ name: string; instructions: string; memoryAllocation: number }>) => void
}

export default function AgentConfigPanel({
  agent,
  typeDefinition,
  onChange,
}: AgentConfigPanelProps) {
  const IconComponent = ICON_MAP[typeDefinition.icon]

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ name: e.target.value })
  }, [onChange])

  const handleInstructionsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ instructions: e.target.value })
  }, [onChange])

  const handleMemoryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value)) {
      onChange({ memoryAllocation: Math.max(0, Math.min(100000, value)) })
    }
  }, [onChange])

  return (
    <div className="agent-config">
      <div className="agent-config__type-display" style={{ borderLeftColor: typeDefinition.color }}>
        <div className="agent-config__type-icon" style={{ color: typeDefinition.color }}>
          {IconComponent && <IconComponent size={20} />}
        </div>
        <div className="agent-config__type-info">
          <span className="agent-config__type-label">{typeDefinition.label}</span>
          <span className="agent-config__type-desc">{typeDefinition.description}</span>
        </div>
      </div>

      <div className="agent-config__field">
        <label className="agent-config__label" htmlFor={`agent-name-${agent.type}`}>
          Agent Name
        </label>
        <input
          id={`agent-name-${agent.type}`}
          type="text"
          className="agent-config__input"
          value={agent.name}
          onChange={handleNameChange}
          placeholder="Enter agent name"
        />
      </div>

      <div className="agent-config__field">
        <label className="agent-config__label" htmlFor={`agent-instructions-${agent.type}`}>
          Instructions
        </label>
        <textarea
          id={`agent-instructions-${agent.type}`}
          className="agent-config__textarea"
          value={agent.instructions}
          onChange={handleInstructionsChange}
          placeholder="Provide instructions for this agent..."
          rows={3}
        />
      </div>

      <div className="agent-config__field">
        <label className="agent-config__label" htmlFor={`agent-memory-${agent.type}`}>
          Memory Allocation (tokens)
        </label>
        <div className="agent-config__memory-row">
          <input
            id={`agent-memory-${agent.type}`}
            type="range"
            className="agent-config__range"
            min={0}
            max={100000}
            step={1000}
            value={agent.memoryAllocation}
            onChange={handleMemoryChange}
          />
          <input
            type="number"
            className="agent-config__memory-input"
            value={agent.memoryAllocation}
            onChange={handleMemoryChange}
            min={0}
            max={100000}
            aria-label="Memory allocation value"
          />
        </div>
      </div>
    </div>
  )
}
