import { create } from 'zustand'
import { AgentLifecycle } from '../types'
import type { AutonomyMode, AutonomousAgent, AgentGoal, ThinkingStep, PendingApproval, MarketplaceAgent } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export interface AgentRuntimeState {
  deployedAgents: Map<string, AutonomousAgent>
  approvalQueue: PendingApproval[]

  deployAgent: (agent: MarketplaceAgent, autonomyMode: AutonomyMode, connectorIds: string[]) => string
  retireAgent: (agentId: string) => void
  setAutonomyMode: (agentId: string, mode: AutonomyMode) => void
  setLifecycle: (agentId: string, lifecycle: AgentLifecycle) => void
  pushGoal: (agentId: string, description: string, priority: number) => string
  completeGoal: (agentId: string, goalId: string) => void
  addThinkingStep: (agentId: string, step: Omit<ThinkingStep, 'id' | 'timestamp'>) => void
  queueApproval: (agentId: string, action: string, description: string) => string
  approveAction: (approvalId: string) => PendingApproval | null
  rejectAction: (approvalId: string) => void
  heartbeat: (agentId: string) => void
  incrementErrorCount: (agentId: string) => void
  getAgent: (agentId: string) => AutonomousAgent | undefined
}

const useAgentRuntimeStore = create<AgentRuntimeState>()((set, get) => ({
  deployedAgents: new Map(),
  approvalQueue: [],

  deployAgent: (agent, autonomyMode, connectorIds) => {
    const agentId = generateId()
    const autonomousAgent: AutonomousAgent = {
      ...agent,
      id: agent.id,
      lifecycle: AgentLifecycle.Deployed,
      autonomyMode,
      memoryIds: [],
      goalStack: [],
      thinkingLog: [],
      errorCount: 0,
      lastHeartbeat: new Date().toISOString(),
      connectorIds,
    }
    set((state) => {
      const next = new Map(state.deployedAgents)
      next.set(agentId, autonomousAgent)
      return { deployedAgents: next }
    })
    return agentId
  },

  retireAgent: (agentId) => {
    set((state) => {
      const next = new Map(state.deployedAgents)
      const agent = next.get(agentId)
      if (agent) {
        next.set(agentId, { ...agent, lifecycle: AgentLifecycle.Retired })
      }
      return { deployedAgents: next }
    })
  },

  setAutonomyMode: (agentId, mode) => {
    set((state) => {
      const next = new Map(state.deployedAgents)
      const agent = next.get(agentId)
      if (agent) {
        next.set(agentId, { ...agent, autonomyMode: mode })
      }
      return { deployedAgents: next }
    })
  },

  setLifecycle: (agentId, lifecycle) => {
    set((state) => {
      const next = new Map(state.deployedAgents)
      const agent = next.get(agentId)
      if (agent) {
        next.set(agentId, { ...agent, lifecycle })
      }
      return { deployedAgents: next }
    })
  },

  pushGoal: (agentId, description, priority) => {
    const goalId = generateId()
    const goal: AgentGoal = {
      id: goalId,
      description,
      priority,
      status: 'active',
      subGoals: [],
      createdAt: new Date().toISOString(),
    }
    set((state) => {
      const next = new Map(state.deployedAgents)
      const agent = next.get(agentId)
      if (agent) {
        next.set(agentId, { ...agent, goalStack: [...agent.goalStack, goal] })
      }
      return { deployedAgents: next }
    })
    return goalId
  },

  completeGoal: (agentId, goalId) => {
    set((state) => {
      const next = new Map(state.deployedAgents)
      const agent = next.get(agentId)
      if (agent) {
        next.set(agentId, {
          ...agent,
          goalStack: agent.goalStack.map((g) =>
            g.id === goalId ? { ...g, status: 'completed' as const } : g,
          ),
        })
      }
      return { deployedAgents: next }
    })
  },

  addThinkingStep: (agentId, step) => {
    const thinkingStep: ThinkingStep = {
      ...step,
      id: generateId(),
      timestamp: new Date().toISOString(),
    }
    set((state) => {
      const next = new Map(state.deployedAgents)
      const agent = next.get(agentId)
      if (agent) {
        next.set(agentId, {
          ...agent,
          thinkingLog: [...agent.thinkingLog, thinkingStep],
        })
      }
      return { deployedAgents: next }
    })
  },

  queueApproval: (agentId, action, description) => {
    const approvalId = generateId()
    const approval: PendingApproval = {
      id: approvalId,
      agentId,
      action,
      description,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      approvalQueue: [...state.approvalQueue, approval],
    }))
    return approvalId
  },

  approveAction: (approvalId) => {
    const approval = get().approvalQueue.find((a) => a.id === approvalId) ?? null
    set((state) => ({
      approvalQueue: state.approvalQueue.filter((a) => a.id !== approvalId),
    }))
    return approval
  },

  rejectAction: (approvalId) => {
    set((state) => ({
      approvalQueue: state.approvalQueue.filter((a) => a.id !== approvalId),
    }))
  },

  heartbeat: (agentId) => {
    set((state) => {
      const next = new Map(state.deployedAgents)
      const agent = next.get(agentId)
      if (agent) {
        next.set(agentId, { ...agent, lastHeartbeat: new Date().toISOString() })
      }
      return { deployedAgents: next }
    })
  },

  incrementErrorCount: (agentId) => {
    set((state) => {
      const next = new Map(state.deployedAgents)
      const agent = next.get(agentId)
      if (agent) {
        next.set(agentId, { ...agent, errorCount: agent.errorCount + 1 })
      }
      return { deployedAgents: next }
    })
  },

  getAgent: (agentId) => {
    return get().deployedAgents.get(agentId)
  },
}))

export default useAgentRuntimeStore
