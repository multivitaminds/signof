import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFleetStore } from '../stores/useFleetStore'
import { useMessageStore } from '../stores/useMessageStore'
import GatewayStatus from '../components/GatewayStatus/GatewayStatus'
import ActivityFeed from '../components/ActivityFeed/ActivityFeed'
import FleetOverview from '../components/FleetOverview/FleetOverview'
import FleetGrid from '../components/FleetGrid/FleetGrid'
import TaskQueuePanel from '../components/TaskQueuePanel/TaskQueuePanel'
import BudgetDashboard from '../components/BudgetDashboard/BudgetDashboard'
import AlertPanel from '../components/AlertPanel/AlertPanel'
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary'
import AgentSpawner from '../components/AgentSpawner/AgentSpawner'
import FleetAgentDetail from '../components/FleetAgentDetail/FleetAgentDetail'
import { spawnAgent, retireAgent, submitTask, startReconciliation, reconcile } from '../lib/agentKernel'
import { getRegistrySize } from '../../ai/lib/agentRegistry'
import './BrainDashboardPage.css'

export default function BrainDashboardPage() {
  const navigate = useNavigate()
  const { messages } = useMessageStore()
  const fleetMetrics = useFleetStore((s) => s.fleetMetrics)
  const [spawnerOpen, setSpawnerOpen] = useState(false)
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null)
  const [spawning, setSpawning] = useState(false)
  const [operationError, setOperationError] = useState<string | null>(null)
  const recentMessages = messages.slice(-20)

  // Start reconciliation loop on mount
  useEffect(() => {
    // Initialize fleet metrics with registry size
    useFleetStore.getState().refreshMetrics(getRegistrySize())
    startReconciliation()
  }, [])

  const handleSpawnOpen = useCallback(() => {
    setSpawnerOpen(true)
  }, [])

  const handleSpawnClose = useCallback(() => {
    setSpawnerOpen(false)
  }, [])

  const handleSpawn = useCallback((registryId: string, task: string) => {
    setSpawning(true)
    setOperationError(null)
    const result = spawnAgent(registryId, task)
    setSpawning(false)
    if (!result.success) {
      setOperationError(result.error ?? 'Failed to spawn agent')
      return
    }
    setSpawnerOpen(false)
  }, [])

  const handleSelectInstance = useCallback((instanceId: string) => {
    setSelectedInstanceId(instanceId)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedInstanceId(null)
  }, [])

  const handleRetire = useCallback((instanceId: string) => {
    const result = retireAgent(instanceId)
    if (!result.success) {
      setOperationError(result.error ?? 'Failed to retire agent')
      return
    }
    setSelectedInstanceId(null)
  }, [])

  const handleSubmitTask = useCallback((description: string) => {
    const result = submitTask(description)
    if (!result.success) {
      setOperationError(result.error ?? 'Failed to submit task')
    }
  }, [])

  const handleRefresh = useCallback(() => {
    reconcile()
  }, [])

  const handleNavigateInbox = useCallback(() => {
    navigate('/brain/inbox')
  }, [navigate])

  return (
    <div className="brain-dashboard">
      <GatewayStatus />

      <ErrorBoundary>
        <FleetOverview />
      </ErrorBoundary>

      <div className="brain-dashboard__main">
        <div className="brain-dashboard__main-left">
          <div className="brain-dashboard__section">
            <div className="brain-dashboard__section-header">
              <h3 className="brain-dashboard__section-title">Active Fleet</h3>
              <div className="brain-dashboard__section-actions">
                <button
                  className="btn--ghost brain-dashboard__refresh-btn"
                  onClick={handleRefresh}
                  aria-label="Refresh fleet data"
                >
                  Refresh
                </button>
                <button
                  className="btn--primary brain-dashboard__spawn-btn"
                  onClick={handleSpawnOpen}
                >
                  Spawn Agent
                </button>
              </div>
            </div>
            <ErrorBoundary>
              <FleetGrid onSelectInstance={handleSelectInstance} />
            </ErrorBoundary>
          </div>

          <div className="brain-dashboard__section">
            <h3 className="brain-dashboard__section-title">Recent Activity</h3>
            <ErrorBoundary>
              <ActivityFeed
                messages={recentMessages}
                maxItems={10}
                onMessageClick={handleNavigateInbox}
              />
            </ErrorBoundary>
          </div>
        </div>

        <div className="brain-dashboard__main-right">
          <div className="brain-dashboard__section">
            <h3 className="brain-dashboard__section-title">Task Queue</h3>
            <ErrorBoundary>
              <TaskQueuePanel onSubmitTask={handleSubmitTask} />
            </ErrorBoundary>
          </div>

          <div className="brain-dashboard__section">
            <h3 className="brain-dashboard__section-title">Budget</h3>
            <ErrorBoundary>
              <BudgetDashboard />
            </ErrorBoundary>
          </div>
        </div>
      </div>

      <div className="brain-dashboard__alerts">
        <h3 className="brain-dashboard__section-title">Alerts</h3>
        <ErrorBoundary>
          <AlertPanel maxItems={10} />
        </ErrorBoundary>
      </div>

      {fleetMetrics.totalRegistered === 0 && (
        <div className="brain-dashboard__empty-state">
          <p className="brain-dashboard__empty-text">
            No agents registered yet. Import the agent catalog to get started with 540+ agent types.
          </p>
        </div>
      )}

      {operationError && (
        <div className="brain-dashboard__error" role="alert">
          <span>{operationError}</span>
          <button
            className="btn--ghost"
            onClick={() => setOperationError(null)}
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}

      <AgentSpawner
        isOpen={spawnerOpen}
        onClose={handleSpawnClose}
        onSpawn={handleSpawn}
        isSpawning={spawning}
      />

      <FleetAgentDetail
        instanceId={selectedInstanceId}
        onClose={handleCloseDetail}
        onRetire={handleRetire}
      />
    </div>
  )
}
