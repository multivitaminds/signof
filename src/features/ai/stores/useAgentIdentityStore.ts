import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AgentIdentity,
  AgentType,
  CognitiveContract,
  ContractCheckResult,
  ContractViolationType,
  ParsedAction,
  AutonomyMode,
} from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export interface AgentIdentityState {
  identities: Map<string, AgentIdentity>

  createIdentity: (
    agentType: AgentType,
    displayName: string,
    contractConfig?: Partial<CognitiveContract>,
  ) => string
  getIdentity: (id: string) => AgentIdentity | undefined
  findByAgentType: (agentType: AgentType) => AgentIdentity[]
  recordDeployment: (id: string) => void
  recordCycle: (id: string) => void
  recordAction: (id: string) => void
  recordError: (id: string) => void
  recordRepair: (id: string) => void
  recordContractViolation: (id: string) => void
  checkContract: (id: string, action: ParsedAction) => ContractCheckResult
  computeReputationScore: (id: string) => number
  updateContract: (id: string, updates: Partial<CognitiveContract>) => void
  retire: (id: string) => void
}

function computeSuccessRate(totalActions: number, totalErrors: number): number {
  return totalActions > 0 ? (totalActions - totalErrors) / totalActions : 1
}

const useAgentIdentityStore = create<AgentIdentityState>()(
  persist(
    (set, get) => ({
      identities: new Map(),

      createIdentity: (agentType, displayName, contractConfig) => {
        const id = generateId()
        const now = new Date().toISOString()
        const contract: CognitiveContract = {
          agentId: id,
          allowedTools: [],
          allowedConnectors: [],
          maxAutonomyLevel: 'full_auto' as AutonomyMode,
          maxTokenBudget: 100000,
          maxCostUsdBudget: 10,
          restrictions: [],
          createdAt: now,
          updatedAt: now,
          ...contractConfig,
        }
        const identity: AgentIdentity = {
          id,
          agentType,
          displayName,
          createdAt: now,
          lastDeployedAt: null,
          retiredAt: null,
          totalDeployments: 0,
          totalCycles: 0,
          totalActionsExecuted: 0,
          totalErrors: 0,
          totalRepairs: 0,
          successRate: 1,
          reputationScore: 50,
          contractViolations: 0,
          contract,
        }
        set((state) => {
          const next = new Map(state.identities)
          next.set(id, identity)
          return { identities: next }
        })
        return id
      },

      getIdentity: (id) => get().identities.get(id),

      findByAgentType: (agentType) =>
        Array.from(get().identities.values()).filter((i) => i.agentType === agentType),

      recordDeployment: (id) => {
        set((state) => {
          const identity = state.identities.get(id)
          if (!identity) return state
          const next = new Map(state.identities)
          next.set(id, {
            ...identity,
            totalDeployments: identity.totalDeployments + 1,
            lastDeployedAt: new Date().toISOString(),
          })
          return { identities: next }
        })
      },

      recordCycle: (id) => {
        set((state) => {
          const identity = state.identities.get(id)
          if (!identity) return state
          const next = new Map(state.identities)
          next.set(id, { ...identity, totalCycles: identity.totalCycles + 1 })
          return { identities: next }
        })
      },

      recordAction: (id) => {
        set((state) => {
          const identity = state.identities.get(id)
          if (!identity) return state
          const newActions = identity.totalActionsExecuted + 1
          const next = new Map(state.identities)
          next.set(id, {
            ...identity,
            totalActionsExecuted: newActions,
            successRate: computeSuccessRate(newActions, identity.totalErrors),
          })
          return { identities: next }
        })
      },

      recordError: (id) => {
        set((state) => {
          const identity = state.identities.get(id)
          if (!identity) return state
          const newErrors = identity.totalErrors + 1
          const next = new Map(state.identities)
          next.set(id, {
            ...identity,
            totalErrors: newErrors,
            successRate: computeSuccessRate(identity.totalActionsExecuted, newErrors),
          })
          return { identities: next }
        })
      },

      recordRepair: (id) => {
        set((state) => {
          const identity = state.identities.get(id)
          if (!identity) return state
          const next = new Map(state.identities)
          next.set(id, { ...identity, totalRepairs: identity.totalRepairs + 1 })
          return { identities: next }
        })
      },

      recordContractViolation: (id) => {
        set((state) => {
          const identity = state.identities.get(id)
          if (!identity) return state
          const newViolations = identity.contractViolations + 1
          const next = new Map(state.identities)
          const updated = { ...identity, contractViolations: newViolations }
          next.set(id, updated)
          return { identities: next }
        })
        // Recalculate reputation after violation
        const identity = get().identities.get(id)
        if (identity) {
          const score = get().computeReputationScore(id)
          set((state) => {
            const next = new Map(state.identities)
            const current = next.get(id)
            if (current) next.set(id, { ...current, reputationScore: score })
            return { identities: next }
          })
        }
      },

      checkContract: (id, action) => {
        const identity = get().identities.get(id)
        if (!identity) {
          return { allowed: true, reason: 'Identity not found — allowing' }
        }
        const contract = identity.contract

        if (
          action.type === 'tool' &&
          contract.allowedTools.length > 0 &&
          action.toolName &&
          !contract.allowedTools.includes(action.toolName)
        ) {
          return {
            allowed: false,
            violationType: 'tool_denied' as ContractViolationType,
            reason: `Tool "${action.toolName}" not in allowed list`,
          }
        }

        if (
          action.type === 'connector' &&
          contract.allowedConnectors.length > 0 &&
          action.connectorId &&
          !contract.allowedConnectors.includes(action.connectorId)
        ) {
          return {
            allowed: false,
            violationType: 'connector_denied' as ContractViolationType,
            reason: `Connector "${action.connectorId}" not in allowed list`,
          }
        }

        return { allowed: true, reason: 'Within contract scope' }
      },

      computeReputationScore: (id) => {
        const identity = get().identities.get(id)
        if (!identity) return 50

        const reliabilityPoints = identity.successRate * 80
        const activityPoints = Math.min(identity.totalCycles / 100, 20)
        const violationPenalty = Math.min(identity.contractViolations * 5, 50)

        const raw = reliabilityPoints + activityPoints - violationPenalty
        return Math.max(0, Math.min(100, raw))
      },

      updateContract: (id, updates) => {
        set((state) => {
          const identity = state.identities.get(id)
          if (!identity) return state
          const next = new Map(state.identities)
          next.set(id, {
            ...identity,
            contract: { ...identity.contract, ...updates, updatedAt: new Date().toISOString() },
          })
          return { identities: next }
        })
      },

      retire: (id) => {
        set((state) => {
          const identity = state.identities.get(id)
          if (!identity) return state
          const next = new Map(state.identities)
          next.set(id, { ...identity, retiredAt: new Date().toISOString() })
          return { identities: next }
        })
      },
    }),
    {
      name: 'orchestree-agent-identity-storage',
      partialize: (state) => ({
        identities: Object.fromEntries(state.identities),
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (!state) return
          if (state.identities && !(state.identities instanceof Map)) {
            state.identities = new Map(
              Object.entries(state.identities as unknown as Record<string, AgentIdentity>),
            )
          }
        }
      },
    },
  ),
)

export default useAgentIdentityStore
