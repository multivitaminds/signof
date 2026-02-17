import { create } from 'zustand'
import type {
  FleetAgentInstance,
  TaskQueueItem,
  FleetMetrics,
  FleetAlert,
} from '../types'
import {
  FleetAgentStatus,
  TaskStatus,
  TaskPriority,
} from '../types'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

interface FleetState {
  activeInstances: Record<string, FleetAgentInstance>
  taskQueue: TaskQueueItem[]
  fleetMetrics: FleetMetrics
  alerts: FleetAlert[]
  lastRefreshedAt: string | null

  // Instance management
  addInstance: (instance: FleetAgentInstance) => void
  removeInstance: (instanceId: string) => void
  updateInstanceStatus: (instanceId: string, status: FleetAgentInstance['status']) => void
  updateInstanceTask: (instanceId: string, task: string | null) => void
  updateInstanceHeartbeat: (instanceId: string) => void
  updateInstanceCost: (instanceId: string, tokens: number, costUsd: number) => void
  incrementInstanceCycles: (instanceId: string) => void
  incrementInstanceErrors: (instanceId: string) => void

  // Task management
  enqueueTask: (description: string, domain: string | null, priority: TaskQueueItem['priority'], source: TaskQueueItem['source']) => string
  dequeueTask: () => TaskQueueItem | null
  routeTask: (taskId: string, instanceId: string) => void
  startTask: (taskId: string) => void
  completeTask: (taskId: string, result: string) => void
  failTask: (taskId: string, reason: string) => void

  // Alerts
  addAlert: (severity: FleetAlert['severity'], message: string, agentInstanceId?: string) => void
  acknowledgeAlert: (alertId: string) => void
  clearAlerts: () => void

  // Queries
  getInstancesByDomain: (domain: string) => FleetAgentInstance[]
  getInstancesByStatus: (status: FleetAgentInstance['status']) => FleetAgentInstance[]
  getQueuedTasks: () => TaskQueueItem[]
  getActiveTasks: () => TaskQueueItem[]
  getUnacknowledgedAlerts: () => FleetAlert[]
  refreshMetrics: (totalRegistered: number) => void
}

export const useFleetStore = create<FleetState>()((_set, get) => ({
  activeInstances: {},
  taskQueue: [],
  fleetMetrics: {
    totalRegistered: 0,
    totalActive: 0,
    totalIdle: 0,
    totalErrored: 0,
    tasksTodayCompleted: 0,
    tasksTodayFailed: 0,
    totalTokensToday: 0,
    totalCostToday: 0,
    avgTaskDurationMs: 0,
  },
  alerts: [],
  lastRefreshedAt: null,

  addInstance: (instance) => {
    _set((s) => ({
      activeInstances: { ...s.activeInstances, [instance.instanceId]: instance },
    }))
    get().refreshMetrics(get().fleetMetrics.totalRegistered)
  },

  removeInstance: (instanceId) => {
    _set((s) => {
      const next = { ...s.activeInstances }
      delete next[instanceId]
      return { activeInstances: next }
    })
    get().refreshMetrics(get().fleetMetrics.totalRegistered)
  },

  updateInstanceStatus: (instanceId, status) => {
    _set((s) => {
      const inst = s.activeInstances[instanceId]
      if (!inst) return s
      return {
        activeInstances: {
          ...s.activeInstances,
          [instanceId]: { ...inst, status },
        },
      }
    })
    get().refreshMetrics(get().fleetMetrics.totalRegistered)
  },

  updateInstanceTask: (instanceId, task) => {
    _set((s) => {
      const inst = s.activeInstances[instanceId]
      if (!inst) return s
      return {
        activeInstances: {
          ...s.activeInstances,
          [instanceId]: {
            ...inst,
            currentTask: task,
            status: task ? FleetAgentStatus.Working : FleetAgentStatus.Idle,
          },
        },
      }
    })
  },

  updateInstanceHeartbeat: (instanceId) => {
    _set((s) => {
      const inst = s.activeInstances[instanceId]
      if (!inst) return s
      return {
        activeInstances: {
          ...s.activeInstances,
          [instanceId]: { ...inst, lastHeartbeat: new Date().toISOString() },
        },
      }
    })
  },

  updateInstanceCost: (instanceId, tokens, costUsd) => {
    _set((s) => {
      const inst = s.activeInstances[instanceId]
      if (!inst) return s
      return {
        activeInstances: {
          ...s.activeInstances,
          [instanceId]: {
            ...inst,
            tokensConsumed: inst.tokensConsumed + tokens,
            costUsd: inst.costUsd + costUsd,
          },
        },
        fleetMetrics: {
          ...s.fleetMetrics,
          totalTokensToday: s.fleetMetrics.totalTokensToday + tokens,
          totalCostToday: s.fleetMetrics.totalCostToday + costUsd,
        },
      }
    })
  },

  incrementInstanceCycles: (instanceId) => {
    _set((s) => {
      const inst = s.activeInstances[instanceId]
      if (!inst) return s
      return {
        activeInstances: {
          ...s.activeInstances,
          [instanceId]: { ...inst, cycleCount: inst.cycleCount + 1 },
        },
      }
    })
  },

  incrementInstanceErrors: (instanceId) => {
    _set((s) => {
      const inst = s.activeInstances[instanceId]
      if (!inst) return s
      return {
        activeInstances: {
          ...s.activeInstances,
          [instanceId]: { ...inst, errorCount: inst.errorCount + 1 },
        },
      }
    })
    get().refreshMetrics(get().fleetMetrics.totalRegistered)
  },

  enqueueTask: (description, domain, priority, source) => {
    const id = rid()
    const task: TaskQueueItem = {
      id,
      description,
      domain,
      priority,
      status: TaskStatus.Queued,
      assignedInstanceId: null,
      submittedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      source,
      result: null,
    }
    _set((s) => ({
      taskQueue: [...s.taskQueue, task],
    }))
    return id
  },

  dequeueTask: () => {
    const state = get()
    const priorityOrder = [TaskPriority.Critical, TaskPriority.High, TaskPriority.Normal, TaskPriority.Low]
    for (const p of priorityOrder) {
      const task = state.taskQueue.find(
        (t) => t.status === TaskStatus.Queued && t.priority === p
      )
      if (task) {
        _set((s) => ({
          taskQueue: s.taskQueue.map((t) =>
            t.id === task.id ? { ...t, status: TaskStatus.Routed } : t
          ),
        }))
        return task
      }
    }
    return null
  },

  routeTask: (taskId, instanceId) => {
    _set((s) => ({
      taskQueue: s.taskQueue.map((t) =>
        t.id === taskId
          ? { ...t, status: TaskStatus.Routed, assignedInstanceId: instanceId }
          : t
      ),
    }))
  },

  startTask: (taskId) => {
    _set((s) => ({
      taskQueue: s.taskQueue.map((t) =>
        t.id === taskId
          ? { ...t, status: TaskStatus.InProgress, startedAt: new Date().toISOString() }
          : t
      ),
    }))
  },

  completeTask: (taskId, result) => {
    _set((s) => ({
      taskQueue: s.taskQueue.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: TaskStatus.Completed,
              completedAt: new Date().toISOString(),
              result,
            }
          : t
      ),
      fleetMetrics: {
        ...s.fleetMetrics,
        tasksTodayCompleted: s.fleetMetrics.tasksTodayCompleted + 1,
      },
    }))
  },

  failTask: (taskId, reason) => {
    _set((s) => ({
      taskQueue: s.taskQueue.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: TaskStatus.Failed,
              completedAt: new Date().toISOString(),
              result: reason,
            }
          : t
      ),
      fleetMetrics: {
        ...s.fleetMetrics,
        tasksTodayFailed: s.fleetMetrics.tasksTodayFailed + 1,
      },
    }))
  },

  addAlert: (severity, message, agentInstanceId) => {
    const alert: FleetAlert = {
      id: rid(),
      severity,
      message,
      agentInstanceId: agentInstanceId ?? null,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    }
    _set((s) => ({
      alerts: [alert, ...s.alerts].slice(0, 200),
    }))
  },

  acknowledgeAlert: (alertId) => {
    _set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      ),
    }))
  },

  clearAlerts: () => {
    _set({ alerts: [] })
  },

  getInstancesByDomain: (domain) => {
    return Object.values(get().activeInstances).filter((i) => i.domain === domain)
  },

  getInstancesByStatus: (status) => {
    return Object.values(get().activeInstances).filter((i) => i.status === status)
  },

  getQueuedTasks: () => {
    return get().taskQueue.filter((t) => t.status === TaskStatus.Queued)
  },

  getActiveTasks: () => {
    return get().taskQueue.filter(
      (t) => t.status === TaskStatus.InProgress || t.status === TaskStatus.Routed
    )
  },

  getUnacknowledgedAlerts: () => {
    return get().alerts.filter((a) => !a.acknowledged)
  },

  refreshMetrics: (totalRegistered) => {
    const instances = Object.values(get().activeInstances)
    _set((s) => ({
      lastRefreshedAt: new Date().toISOString(),
      fleetMetrics: {
        ...s.fleetMetrics,
        totalRegistered,
        totalActive: instances.filter(
          (i) => i.status === FleetAgentStatus.Working || i.status === FleetAgentStatus.Spawning
        ).length,
        totalIdle: instances.filter((i) => i.status === FleetAgentStatus.Idle).length,
        totalErrored: instances.filter((i) => i.status === FleetAgentStatus.Error).length,
      },
    }))
  },
}))
