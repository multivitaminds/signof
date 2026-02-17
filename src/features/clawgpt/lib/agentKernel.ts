import { getAgent, getRegistrySize, getAll } from '../../ai/lib/agentRegistry'
import { registerAllAgents } from '../../ai/lib/agentCatalog'
import useAgentRuntimeStore from '../../ai/stores/useAgentRuntimeStore'
import { startAutonomousLoop, stopAutonomousLoop } from '../../ai/lib/autonomousLoop'
import { useFleetStore } from '../stores/useFleetStore'
import { eventBus, EVENT_TYPES } from '../../../lib/eventBus'
import { routeTask } from './taskRouter'
import {
  FleetAgentStatus,
  TaskPriority,
  TaskSource,
  AlertSeverity,
} from '../types'
import type { FleetAgentInstance, FleetMetrics, TaskQueueItem } from '../types'
import type { AgentCapabilityManifest, AgentDomain, AutonomyMode } from '../../ai/types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Reconciliation Loop ────────────────────────────────────────────

let reconcileTimer: ReturnType<typeof setInterval> | null = null
const RECONCILE_INTERVAL_MS = 10_000

export function startReconciliation(): void {
  if (reconcileTimer) return
  registerAllAgents()
  reconcileTimer = setInterval(reconcile, RECONCILE_INTERVAL_MS)
}

export function stopReconciliation(): void {
  if (reconcileTimer) {
    clearInterval(reconcileTimer)
    reconcileTimer = null
  }
}

export function reconcile(): void {
  const fleetStore = useFleetStore.getState()
  const runtimeStore = useAgentRuntimeStore.getState()
  const instances = Object.values(fleetStore.activeInstances)

  for (const instance of instances) {
    // Check heartbeat staleness (60s timeout)
    const lastBeat = new Date(instance.lastHeartbeat).getTime()
    const staleMs = Date.now() - lastBeat
    if (staleMs > 60_000 && instance.status !== FleetAgentStatus.Error && instance.status !== FleetAgentStatus.Retiring) {
      fleetStore.updateInstanceStatus(instance.instanceId, FleetAgentStatus.Error)
      fleetStore.addAlert(
        AlertSeverity.Warning,
        `Agent "${instance.registryId}" heartbeat stale (${Math.round(staleMs / 1000)}s)`,
        instance.instanceId,
      )
    }

    // Sync lifecycle from runtime store
    const runtimeAgent = runtimeStore.getAgent(instance.runtimeAgentId)
    if (runtimeAgent) {
      if (runtimeAgent.lifecycle === 'retired' && instance.status !== FleetAgentStatus.Retiring) {
        fleetStore.updateInstanceStatus(instance.instanceId, FleetAgentStatus.Retiring)
      }
    }
  }

  // Process task queue — try to route queued tasks
  const queuedTasks = fleetStore.getQueuedTasks()
  for (const task of queuedTasks.slice(0, 5)) {
    const result = routeTask(task)
    if (result.matched && result.agentTypeId) {
      if (result.instanceId) {
        // Route to existing instance
        fleetStore.routeTask(task.id, result.instanceId)
        fleetStore.updateInstanceTask(result.instanceId, task.description)
        fleetStore.startTask(task.id)
      } else {
        // Spawn new agent for this task
        const spawnResult = spawnAgent(result.agentTypeId, task.description)
        if (spawnResult.instanceId) {
          fleetStore.routeTask(task.id, spawnResult.instanceId)
          fleetStore.startTask(task.id)
        }
      }
    }
  }

  // Refresh metrics
  fleetStore.refreshMetrics(getRegistrySize())
}

// ─── Spawn Agent ────────────────────────────────────────────────────

export function spawnAgent(
  registryId: string,
  task: string,
  opts?: {
    autonomyMode?: AutonomyMode
    connectorIds?: string[]
    intervalMs?: number
  },
): { success: boolean; instanceId?: string; error?: string } {
  try {
    const manifest = getAgent(registryId)
    if (!manifest) {
      useFleetStore.getState().addAlert(
        AlertSeverity.Warning,
        `Cannot spawn agent: registry ID "${registryId}" not found`,
      )
      return { success: false, error: `Registry ID "${registryId}" not found` }
    }

    // Check concurrency limits
    const existingCount = Object.values(useFleetStore.getState().activeInstances)
      .filter((i) => i.registryId === registryId && i.status !== FleetAgentStatus.Retiring)
      .length
    if (existingCount >= manifest.constraints.maxConcurrency) {
      useFleetStore.getState().addAlert(
        AlertSeverity.Info,
        `Agent "${manifest.displayName}" at max concurrency (${manifest.constraints.maxConcurrency})`,
      )
      return { success: false, error: `Agent "${manifest.displayName}" at max concurrency (${manifest.constraints.maxConcurrency})` }
    }

    // Deploy via runtime store — create a MarketplaceAgent-compatible object
    const marketplaceAgent = {
      id: Date.now(),
      name: manifest.displayName,
      description: manifest.description,
      integrations: manifest.capabilities.connectors.join(', ') || 'none',
      autonomy: opts?.autonomyMode ?? 'full_auto',
      price: manifest.constraints.costTier,
    }

    const runtimeAgentId = useAgentRuntimeStore.getState().deployAgent(
      marketplaceAgent,
      (opts?.autonomyMode ?? 'full_auto') as AutonomyMode,
      opts?.connectorIds ?? [],
    )

    // Push the task as a goal
    useAgentRuntimeStore.getState().pushGoal(runtimeAgentId, task, 1)

    // Start the autonomous loop
    const intervalMs = opts?.intervalMs ?? getIntervalForProfile(manifest.constraints.latencyProfile)
    startAutonomousLoop(runtimeAgentId, intervalMs)

    // Create fleet instance
    const instanceId = rid()
    const now = new Date().toISOString()
    const instance: FleetAgentInstance = {
      instanceId,
      registryId,
      runtimeAgentId,
      domain: manifest.domain,
      status: FleetAgentStatus.Spawning,
      currentTask: task,
      spawnedAt: now,
      lastHeartbeat: now,
      tokensConsumed: 0,
      costUsd: 0,
      cycleCount: 0,
      errorCount: 0,
    }

    useFleetStore.getState().addInstance(instance)

    // Emit event
    eventBus.emit(EVENT_TYPES.FLEET_AGENT_SPAWNED, {
      instanceId,
      registryId,
      displayName: manifest.displayName,
      domain: manifest.domain,
      task,
    })

    // Transition to working after spawn
    setTimeout(() => {
      const current = useFleetStore.getState().activeInstances[instanceId]
      if (current && current.status === FleetAgentStatus.Spawning) {
        useFleetStore.getState().updateInstanceStatus(instanceId, FleetAgentStatus.Working)
      }
    }, 500)

    return { success: true, instanceId }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

// ─── Retire Agent ───────────────────────────────────────────────────

export function retireAgent(instanceId: string): { success: boolean; error?: string } {
  try {
    const instance = useFleetStore.getState().activeInstances[instanceId]
    if (!instance) return { success: false, error: 'Instance not found' }

    // Mark as retiring
    useFleetStore.getState().updateInstanceStatus(instanceId, FleetAgentStatus.Retiring)

    // Stop autonomous loop
    stopAutonomousLoop(instance.runtimeAgentId)

    // Retire in runtime store
    useAgentRuntimeStore.getState().retireAgent(instance.runtimeAgentId)

    // Remove from fleet after short delay
    setTimeout(() => {
      useFleetStore.getState().removeInstance(instanceId)
    }, 1000)

    // Emit event
    eventBus.emit(EVENT_TYPES.FLEET_AGENT_RETIRED, {
      instanceId,
      registryId: instance.registryId,
      domain: instance.domain,
    })

    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

// ─── Submit Task ────────────────────────────────────────────────────

export function submitTask(
  description: string,
  domain?: AgentDomain,
  priority?: TaskQueueItem['priority'],
  source?: TaskQueueItem['source'],
): { success: boolean; taskId?: string; error?: string } {
  try {
    const taskId = useFleetStore.getState().enqueueTask(
      description,
      domain ?? null,
      priority ?? TaskPriority.Normal,
      source ?? TaskSource.User,
    )

    // Try immediate routing
    const task = useFleetStore.getState().taskQueue.find((t) => t.id === taskId)
    if (task) {
      const result = routeTask(task)
      if (result.matched && result.agentTypeId) {
        if (result.instanceId) {
          useFleetStore.getState().routeTask(taskId, result.instanceId)
          useFleetStore.getState().updateInstanceTask(result.instanceId, description)
          useFleetStore.getState().startTask(taskId)
        } else {
          const spawnResult = spawnAgent(result.agentTypeId, description)
          if (spawnResult.instanceId) {
            useFleetStore.getState().routeTask(taskId, spawnResult.instanceId)
            useFleetStore.getState().startTask(taskId)
          }
        }
      }
    }

    return { success: true, taskId }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

// ─── Handle Channel Message ─────────────────────────────────────────

export function handleChannelMessage(
  _sessionId: string,
  message: string,
  _channelType: string,
): string | null {
  // Route to communication domain agents by default
  const result = submitTask(
    message,
    'communication' as AgentDomain,
    TaskPriority.High,
    TaskSource.Channel,
  )

  return result.taskId ?? null
}

// ─── Fleet Status ───────────────────────────────────────────────────

export function getFleetStatus(): FleetMetrics {
  const store = useFleetStore.getState()
  store.refreshMetrics(getRegistrySize())
  return store.fleetMetrics
}

// ─── Get Registry Summary ───────────────────────────────────────────

export function getRegistrySummary(): {
  total: number
  byDomain: Record<string, number>
  agents: AgentCapabilityManifest[]
} {
  const all = getAll()
  const byDomain: Record<string, number> = {}
  for (const agent of all) {
    byDomain[agent.domain] = (byDomain[agent.domain] ?? 0) + 1
  }
  return { total: all.length, byDomain, agents: all }
}

// ─── Helpers ────────────────────────────────────────────────────────

function getIntervalForProfile(profile: string): number {
  switch (profile) {
    case 'realtime': return 5_000
    case 'interactive': return 15_000
    case 'batch': return 60_000
    default: return 30_000
  }
}
