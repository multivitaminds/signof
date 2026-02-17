import { useState, useCallback, useMemo } from 'react'
import { getAll, findByDomain } from '../../../ai/lib/agentRegistry'
import type { AgentCapabilityManifest, AgentDomain } from '../../../ai/types'
import './AgentSpawner.css'

interface AgentSpawnerProps {
  isOpen: boolean
  onClose: () => void
  onSpawn: (registryId: string, task: string) => void
  preselectedRegistryId?: string
  isSpawning?: boolean
}

const DOMAIN_TABS: Array<{ value: AgentDomain | 'all'; label: string }> = [
  { value: 'all' as AgentDomain | 'all', label: 'All' },
  { value: 'workspace', label: 'Workspace' },
  { value: 'projects', label: 'Projects' },
  { value: 'documents', label: 'Documents' },
  { value: 'scheduling', label: 'Scheduling' },
  { value: 'databases', label: 'Databases' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'tax', label: 'Tax' },
  { value: 'inbox', label: 'Inbox' },
  { value: 'developer', label: 'Developer' },
  { value: 'communication', label: 'Communication' },
  { value: 'security', label: 'Security' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'cross-module', label: 'Cross-Module' },
]

export default function AgentSpawner({ isOpen, onClose, onSpawn, preselectedRegistryId, isSpawning }: AgentSpawnerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [domainFilter, setDomainFilter] = useState<AgentDomain | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(preselectedRegistryId ?? null)
  const [taskDescription, setTaskDescription] = useState('')

  const effectiveSelectedId = preselectedRegistryId || selectedId

  const agents = useMemo(() => {
    const list: AgentCapabilityManifest[] =
      domainFilter === 'all' ? getAll() : findByDomain(domainFilter as AgentDomain)

    if (!searchQuery.trim()) return list

    const lower = searchQuery.toLowerCase()
    return list.filter(
      (a) =>
        a.displayName.toLowerCase().includes(lower) ||
        a.description.toLowerCase().includes(lower),
    )
  }, [domainFilter, searchQuery])

  const selectedAgent = useMemo(
    () => agents.find((a) => a.agentTypeId === effectiveSelectedId) ?? null,
    [agents, effectiveSelectedId],
  )

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleDomainClick = useCallback((value: AgentDomain | 'all') => {
    setDomainFilter(value)
    setSelectedId(null)
  }, [])

  const handleSelectAgent = useCallback((agentTypeId: string) => {
    setSelectedId(agentTypeId)
  }, [])

  const handleTaskChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTaskDescription(e.target.value)
  }, [])

  const handleSpawn = useCallback(() => {
    if (effectiveSelectedId && taskDescription.trim()) {
      onSpawn(effectiveSelectedId, taskDescription.trim())
      setSearchQuery('')
      setDomainFilter('all')
      setSelectedId(null)
      setTaskDescription('')
    }
  }, [effectiveSelectedId, taskDescription, onSpawn])

  const handleBackdropClick = useCallback(() => {
    onClose()
  }, [onClose])

  const handleDialogClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  if (!isOpen) return null

  return (
    <div className="agent-spawner" role="dialog" aria-modal="true" aria-label="Spawn agent">
      <div className="agent-spawner__backdrop" onClick={handleBackdropClick} />
      <div className="agent-spawner__dialog" onClick={handleDialogClick}>
        <div className="agent-spawner__header">
          <h2 className="agent-spawner__title">Spawn Agent</h2>
          <button
            className="agent-spawner__close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            X
          </button>
        </div>

        <div className="agent-spawner__body">
          <input
            className="agent-spawner__search"
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search agents"
          />

          <div className="agent-spawner__domain-tabs">
            {DOMAIN_TABS.map((tab) => (
              <button
                key={tab.value}
                className={`agent-spawner__domain-tab${domainFilter === tab.value ? ' agent-spawner__domain-tab--active' : ''}`}
                onClick={() => handleDomainClick(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {agents.length === 0 ? (
            <div className="agent-spawner__empty">No agents found</div>
          ) : (
            <div className="agent-spawner__agent-list">
              {agents.map((agent) => (
                <div
                  key={agent.agentTypeId}
                  className={`agent-spawner__agent-option${effectiveSelectedId === agent.agentTypeId ? ' agent-spawner__agent-option--selected' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectAgent(agent.agentTypeId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelectAgent(agent.agentTypeId)
                    }
                  }}
                  aria-label={agent.displayName}
                >
                  <div
                    className="agent-spawner__agent-icon"
                    style={{ background: agent.color }}
                    aria-hidden="true"
                  >
                    {agent.icon}
                  </div>
                  <div className="agent-spawner__agent-info">
                    <p className="agent-spawner__agent-name">{agent.displayName}</p>
                    <p className="agent-spawner__agent-desc">{agent.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedAgent && (
            <div className="agent-spawner__preview">
              <p className="agent-spawner__preview-title">
                Capabilities ({selectedAgent.capabilities.tools.length})
              </p>
              <div className="agent-spawner__preview-caps">
                {selectedAgent.capabilities.tools.slice(0, 8).map((tool) => (
                  <span key={tool} className="agent-spawner__cap-badge">
                    {tool}
                  </span>
                ))}
                {selectedAgent.capabilities.tools.length > 8 && (
                  <span className="agent-spawner__cap-badge">
                    +{selectedAgent.capabilities.tools.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div>
            <p className="agent-spawner__task-label">Task Description</p>
            <textarea
              className="agent-spawner__task-input"
              placeholder="Describe what the agent should do..."
              value={taskDescription}
              onChange={handleTaskChange}
              aria-label="Task description"
            />
          </div>
        </div>

        <div className="agent-spawner__footer">
          <button className="agent-spawner__cancel-btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="agent-spawner__spawn-btn btn--primary"
            onClick={handleSpawn}
            disabled={!effectiveSelectedId || !taskDescription.trim() || isSpawning}
          >
            {isSpawning ? 'Spawning...' : 'Spawn Agent'}
          </button>
        </div>
      </div>
    </div>
  )
}
