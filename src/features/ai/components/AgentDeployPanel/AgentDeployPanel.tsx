import { useState, useCallback } from 'react'
import type { ConnectorDefinition } from '../../types'
import './AgentDeployPanel.css'

interface DeployConfig {
  agentName: string
  autonomyMode: string
  connectorIds: string[]
  initialGoal: string
}

interface AgentDeployPanelProps {
  availableConnectors: ConnectorDefinition[]
  onDeploy?: (config: DeployConfig) => void
}

export default function AgentDeployPanel({ availableConnectors, onDeploy }: AgentDeployPanelProps) {
  const [agentName, setAgentName] = useState('')
  const [autonomyMode, setAutonomyMode] = useState('suggest')
  const [selectedConnectors, setSelectedConnectors] = useState<Set<string>>(new Set())
  const [initialGoal, setInitialGoal] = useState('')

  const toggleConnector = useCallback((id: string) => {
    setSelectedConnectors((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleDeploy = useCallback(() => {
    if (!agentName.trim()) return
    onDeploy?.({
      agentName: agentName.trim(),
      autonomyMode,
      connectorIds: Array.from(selectedConnectors),
      initialGoal: initialGoal.trim(),
    })
    setAgentName('')
    setInitialGoal('')
    setSelectedConnectors(new Set())
  }, [agentName, autonomyMode, selectedConnectors, initialGoal, onDeploy])

  return (
    <div className="agent-deploy">
      <h3 className="agent-deploy__title">Deploy Agent</h3>

      <div className="agent-deploy__field">
        <label className="agent-deploy__label" htmlFor="deploy-name">Agent Name</label>
        <input
          id="deploy-name"
          className="agent-deploy__input"
          type="text"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="Enter agent name..."
        />
      </div>

      <div className="agent-deploy__field">
        <span className="agent-deploy__label">Autonomy Mode</span>
        <div className="agent-deploy__radios">
          {(['full_auto', 'suggest', 'ask_first'] as const).map((mode) => (
            <label key={mode} className="agent-deploy__radio-label">
              <input
                type="radio"
                name="autonomy"
                value={mode}
                checked={autonomyMode === mode}
                onChange={() => setAutonomyMode(mode)}
              />
              <span>{mode === 'full_auto' ? 'Full Auto' : mode === 'suggest' ? 'Suggest' : 'Ask First'}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="agent-deploy__field">
        <span className="agent-deploy__label">Connectors</span>
        <div className="agent-deploy__connectors">
          {availableConnectors.map((c) => (
            <label key={c.id} className="agent-deploy__connector-check">
              <input
                type="checkbox"
                checked={selectedConnectors.has(c.id)}
                onChange={() => toggleConnector(c.id)}
              />
              <span>{c.name}</span>
            </label>
          ))}
          {availableConnectors.length === 0 && (
            <span className="agent-deploy__no-connectors">No connectors available</span>
          )}
        </div>
      </div>

      <div className="agent-deploy__field">
        <label className="agent-deploy__label" htmlFor="deploy-goal">Initial Goal</label>
        <textarea
          id="deploy-goal"
          className="agent-deploy__textarea"
          value={initialGoal}
          onChange={(e) => setInitialGoal(e.target.value)}
          placeholder="Describe the agent's initial objective..."
          rows={3}
        />
      </div>

      <button
        className="btn--primary agent-deploy__btn"
        onClick={handleDeploy}
        disabled={!agentName.trim()}
      >
        Deploy Agent
      </button>
    </div>
  )
}
