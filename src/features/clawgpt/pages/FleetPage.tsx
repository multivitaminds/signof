import { useState, useCallback, useEffect } from 'react'
import { useFleetStore } from '../stores/useFleetStore'
import FleetOverview from '../components/FleetOverview/FleetOverview'
import FleetGrid from '../components/FleetGrid/FleetGrid'
import FleetAgentDetail from '../components/FleetAgentDetail/FleetAgentDetail'
import AlertPanel from '../components/AlertPanel/AlertPanel'
import AgentSpawner from '../components/AgentSpawner/AgentSpawner'
import { spawnAgent, retireAgent, startReconciliation } from '../lib/agentKernel'
import { getRegistrySize } from '../../ai/lib/agentRegistry'
import { FleetAgentStatus } from '../types'
import './FleetPage.css'

export default function FleetPage() {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null)
  const [spawnerOpen, setSpawnerOpen] = useState(false)
  const [filterDomain, setFilterDomain] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const activeInstances = useFleetStore((s) => s.activeInstances)

  useEffect(() => {
    useFleetStore.getState().refreshMetrics(getRegistrySize())
    startReconciliation()
  }, [])

  const handleSelectInstance = useCallback((instanceId: string) => {
    setSelectedInstanceId(instanceId)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedInstanceId(null)
  }, [])

  const handleRetire = useCallback((instanceId: string) => {
    retireAgent(instanceId)
    setSelectedInstanceId(null)
  }, [])

  const handleRetireAllErrored = useCallback(() => {
    const instances = Object.values(activeInstances)
    for (const inst of instances) {
      if (inst.status === FleetAgentStatus.Error) {
        retireAgent(inst.instanceId)
      }
    }
  }, [activeInstances])

  const handleSpawn = useCallback((registryId: string, task: string) => {
    spawnAgent(registryId, task)
    setSpawnerOpen(false)
  }, [])

  const handleFilterDomain = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterDomain(e.target.value)
  }, [])

  const handleFilterStatus = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value)
  }, [])

  const erroredCount = Object.values(activeInstances).filter(
    (i) => i.status === FleetAgentStatus.Error
  ).length

  return (
    <div className="fleet-page">
      <FleetOverview />

      <div className="fleet-page__controls">
        <div className="fleet-page__filters">
          <select
            className="fleet-page__filter-select"
            value={filterDomain}
            onChange={handleFilterDomain}
            aria-label="Filter by domain"
          >
            <option value="">All Domains</option>
            <option value="workspace">Workspace</option>
            <option value="projects">Projects</option>
            <option value="documents">Documents</option>
            <option value="scheduling">Scheduling</option>
            <option value="databases">Databases</option>
            <option value="accounting">Accounting</option>
            <option value="tax">Tax</option>
            <option value="inbox">Inbox</option>
            <option value="developer">Developer</option>
            <option value="communication">Communication</option>
            <option value="security">Security</option>
            <option value="analytics">Analytics</option>
            <option value="cross-module">Cross-Module</option>
          </select>
          <select
            className="fleet-page__filter-select"
            value={filterStatus}
            onChange={handleFilterStatus}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="spawning">Spawning</option>
            <option value="idle">Idle</option>
            <option value="working">Working</option>
            <option value="waiting_approval">Waiting Approval</option>
            <option value="error">Error</option>
            <option value="retiring">Retiring</option>
          </select>
        </div>
        <div className="fleet-page__actions">
          {erroredCount > 0 && (
            <button
              className="btn--danger fleet-page__action-btn"
              onClick={handleRetireAllErrored}
            >
              Retire All Errored ({erroredCount})
            </button>
          )}
          <button
            className="btn--primary fleet-page__action-btn"
            onClick={() => setSpawnerOpen(true)}
          >
            Spawn Agent
          </button>
        </div>
      </div>

      <FleetGrid
        onSelectInstance={handleSelectInstance}
        filterDomain={filterDomain || undefined}
        filterStatus={filterStatus || undefined}
      />

      <div className="fleet-page__alerts">
        <h3 className="fleet-page__section-title">Fleet Alerts</h3>
        <AlertPanel maxItems={20} />
      </div>

      <FleetAgentDetail
        instanceId={selectedInstanceId}
        onClose={handleCloseDetail}
        onRetire={handleRetire}
      />

      <AgentSpawner
        isOpen={spawnerOpen}
        onClose={() => setSpawnerOpen(false)}
        onSpawn={handleSpawn}
      />
    </div>
  )
}
