import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CostRecord, AgentBudget, BudgetCheckResult, TokenUsage } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const COST_PER_1K_INPUT = 0.003
export const COST_PER_1K_OUTPUT = 0.015
export const TOOL_EXECUTION_COST = 0.0001
export const CONNECTOR_EXECUTION_COST = 0.001

export interface CostTrackingState {
  budgets: Map<string, AgentBudget>
  costHistory: CostRecord[]

  setBudget: (agentId: string, maxTokens: number, maxCostUsd: number, warningPct?: number, pausePct?: number) => void
  recordUsage: (agentId: string, type: string, operation: string, tokenUsage: TokenUsage | null, costUsd: number) => string
  checkBudget: (agentId: string, estimatedTokens: number, estimatedCostUsd: number) => BudgetCheckResult
  getBudget: (agentId: string) => AgentBudget | undefined
  getCostHistory: (agentId: string, limit?: number) => CostRecord[]
  getTotalCost: () => number
}

const useCostTrackingStore = create<CostTrackingState>()(
  persist(
    (set, get) => ({
      budgets: new Map(),
      costHistory: [],

      setBudget: (agentId, maxTokens, maxCostUsd, warningPct = 80, pausePct = 95) => {
        set((state) => {
          const newBudgets = new Map(state.budgets)
          newBudgets.set(agentId, {
            agentId,
            maxTokens,
            maxCostUsd,
            usedTokens: 0,
            usedCostUsd: 0,
            warningThresholdPct: warningPct,
            pauseThresholdPct: pausePct,
          })
          return { budgets: newBudgets }
        })
      },

      recordUsage: (agentId, type, operation, tokenUsage, costUsd) => {
        const id = generateId()
        const record: CostRecord = {
          id,
          agentId,
          type,
          operation,
          tokenUsage,
          estimatedCostUsd: costUsd,
          timestamp: new Date().toISOString(),
        }
        set((state) => {
          const newHistory = [...state.costHistory, record]
          const budget = state.budgets.get(agentId)
          if (budget) {
            const newBudgets = new Map(state.budgets)
            newBudgets.set(agentId, {
              ...budget,
              usedTokens: budget.usedTokens + (tokenUsage?.totalTokens ?? 0),
              usedCostUsd: budget.usedCostUsd + costUsd,
            })
            return { costHistory: newHistory, budgets: newBudgets }
          }
          return { costHistory: newHistory }
        })
        return id
      },

      checkBudget: (agentId, estimatedTokens, estimatedCostUsd) => {
        const budget = get().budgets.get(agentId)
        if (!budget) {
          return {
            allowed: true,
            reason: 'No budget set',
            remainingTokens: Infinity,
            remainingCostUsd: Infinity,
            usagePct: 0,
          }
        }

        const projectedTokens = budget.usedTokens + estimatedTokens
        const projectedCost = budget.usedCostUsd + estimatedCostUsd
        const usagePct = Math.max(
          (projectedTokens / budget.maxTokens) * 100,
          (projectedCost / budget.maxCostUsd) * 100,
        )

        if (projectedTokens > budget.maxTokens) {
          return {
            allowed: false,
            reason: 'Token budget exhausted',
            remainingTokens: budget.maxTokens - budget.usedTokens,
            remainingCostUsd: budget.maxCostUsd - budget.usedCostUsd,
            usagePct,
          }
        }

        if (projectedCost > budget.maxCostUsd) {
          return {
            allowed: false,
            reason: 'Cost budget exhausted',
            remainingTokens: budget.maxTokens - budget.usedTokens,
            remainingCostUsd: budget.maxCostUsd - budget.usedCostUsd,
            usagePct,
          }
        }

        if (usagePct >= budget.pauseThresholdPct) {
          return {
            allowed: false,
            reason: 'Pause threshold reached',
            remainingTokens: budget.maxTokens - budget.usedTokens,
            remainingCostUsd: budget.maxCostUsd - budget.usedCostUsd,
            usagePct,
          }
        }

        return {
          allowed: true,
          reason: 'Within budget',
          remainingTokens: budget.maxTokens - budget.usedTokens,
          remainingCostUsd: budget.maxCostUsd - budget.usedCostUsd,
          usagePct,
        }
      },

      getBudget: (agentId) => {
        return get().budgets.get(agentId)
      },

      getCostHistory: (agentId, limit = 100) => {
        return get()
          .costHistory.filter((r) => r.agentId === agentId)
          .slice(-limit)
      },

      getTotalCost: () => {
        return get().costHistory.reduce((sum, r) => sum + r.estimatedCostUsd, 0)
      },
    }),
    {
      name: 'origina-cost-tracking-storage',
      partialize: (state) => ({
        budgets: Object.fromEntries(state.budgets),
        costHistory: state.costHistory.slice(-1000),
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (!state) return
          if (state.budgets && !(state.budgets instanceof Map)) {
            state.budgets = new Map(
              Object.entries(state.budgets as unknown as Record<string, AgentBudget>),
            )
          }
        }
      },
    },
  ),
)

export default useCostTrackingStore
