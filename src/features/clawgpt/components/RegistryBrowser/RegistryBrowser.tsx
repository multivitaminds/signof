import { useState, useCallback, useMemo } from 'react'
import { getAll, findByDomain } from '../../../ai/lib/agentRegistry'
import type { AgentCapabilityManifest, AgentDomain } from '../../../ai/types'
import './RegistryBrowser.css'

interface RegistryBrowserProps {
  onSpawn?: (registryId: string) => void
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

export default function RegistryBrowser({ onSpawn }: RegistryBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [domainFilter, setDomainFilter] = useState<AgentDomain | 'all'>('all')

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

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleDomainClick = useCallback((value: AgentDomain | 'all') => {
    setDomainFilter(value)
  }, [])

  const handleSpawn = useCallback(
    (registryId: string) => {
      onSpawn?.(registryId)
    },
    [onSpawn],
  )

  return (
    <div className="registry-browser" role="region" aria-label="Agent registry browser">
      <div className="registry-browser__header">
        <input
          className="registry-browser__search"
          type="text"
          placeholder="Search agents by name or description..."
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search agent registry"
        />

        <div className="registry-browser__domain-tabs">
          {DOMAIN_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`registry-browser__domain-tab${domainFilter === tab.value ? ' registry-browser__domain-tab--active' : ''}`}
              onClick={() => handleDomainClick(tab.value)}
              aria-pressed={domainFilter === tab.value}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="registry-browser__grid">
        {agents.length === 0 ? (
          <div className="registry-browser__empty">No agents found</div>
        ) : (
          agents.map((agent) => (
            <RegistryCard
              key={agent.agentTypeId}
              agent={agent}
              onSpawn={handleSpawn}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface RegistryCardProps {
  agent: AgentCapabilityManifest
  onSpawn: (registryId: string) => void
}

function RegistryCard({ agent, onSpawn }: RegistryCardProps) {
  const handleSpawnClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSpawn(agent.agentTypeId)
    },
    [agent.agentTypeId, onSpawn],
  )

  return (
    <div className="registry-browser__card">
      <div className="registry-browser__card-header">
        <div
          className="registry-browser__icon"
          style={{ background: agent.color }}
          aria-hidden="true"
        >
          {agent.icon}
        </div>
        <div className="registry-browser__card-title">
          <h3 className="registry-browser__display-name">{agent.displayName}</h3>
        </div>
        <span
          className={`registry-browser__cost-tier registry-browser__cost-tier--${agent.constraints.costTier}`}
        >
          {agent.constraints.costTier}
        </span>
      </div>

      <p className="registry-browser__description">{agent.description}</p>

      <div className="registry-browser__card-footer">
        <span className="registry-browser__cap-count">
          {agent.capabilities.tools.length} capabilities
        </span>
        <button
          className="registry-browser__spawn-btn btn--primary"
          onClick={handleSpawnClick}
        >
          Spawn
        </button>
      </div>
    </div>
  )
}
