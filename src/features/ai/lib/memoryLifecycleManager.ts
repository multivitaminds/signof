import type { MemoryEntry } from '../types'
import useAgentMemoryStore from '../stores/useAgentMemoryStore'
import { useMemoryStore } from '../stores/useMemoryStore'
import { TOKEN_BUDGET } from './tokenCount'

export interface MemoryLifecycleConfig {
  defaultTtlDays: number
  staleDays: number
  maxEntriesPerAgent: number
  maxTotalTokens: number
}

export const DEFAULT_LIFECYCLE_CONFIG: MemoryLifecycleConfig = {
  defaultTtlDays: 90,
  staleDays: 30,
  maxEntriesPerAgent: 500,
  maxTotalTokens: TOKEN_BUDGET,
}

export interface PruneResult {
  deletedCount: number
  freedTokens: number
  deletedIds: string[]
}

export interface MemoryHealthReport {
  totalEntries: number
  totalTokens: number
  staleCount: number
  expiredCount: number
  pinnedCount: number
  tokenBudgetUsagePct: number
  recommendation: 'healthy' | 'review_recommended' | 'pruning_needed'
}

function mergeConfig(config?: Partial<MemoryLifecycleConfig>): MemoryLifecycleConfig {
  return { ...DEFAULT_LIFECYCLE_CONFIG, ...config }
}

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

export function computeImportanceScore(
  entry: MemoryEntry,
  _config?: Partial<MemoryLifecycleConfig>,
): number {
  let score = 1

  if (entry.pinned) score += 100

  if (entry.lastAccessedAt) {
    const sevenDaysAgo = daysAgo(7)
    if (new Date(entry.lastAccessedAt) >= sevenDaysAgo) {
      score += entry.accessCount * 10
    }
  }

  if (entry.category === 'decisions' || entry.category === 'workflows') {
    score += 20
  }

  return score
}

export function identifyStaleEntries(
  entries: MemoryEntry[],
  config?: Partial<MemoryLifecycleConfig>,
): MemoryEntry[] {
  const merged = mergeConfig(config)
  const staleThreshold = daysAgo(merged.staleDays)

  return entries.filter((entry) => {
    if (entry.pinned) return false
    if (!entry.lastAccessedAt) return true
    return new Date(entry.lastAccessedAt) < staleThreshold
  })
}

export function identifyExpiredEntries(
  entries: MemoryEntry[],
  config?: Partial<MemoryLifecycleConfig>,
): MemoryEntry[] {
  const merged = mergeConfig(config)
  const expiredThreshold = daysAgo(merged.defaultTtlDays)

  return entries.filter((entry) => {
    if (entry.pinned) return false
    return new Date(entry.createdAt) < expiredThreshold
  })
}

export function pruneAgentMemories(
  agentId: string,
  config?: Partial<MemoryLifecycleConfig>,
): PruneResult {
  const merged = mergeConfig(config)
  const store = useAgentMemoryStore.getState()
  const memories = store.getAgentMemories(agentId)

  const deletedIds: string[] = []
  let freedTokens = 0

  const expired = identifyExpiredEntries(memories, merged)
  for (const entry of expired) {
    store.deleteMemory(agentId, entry.id)
    deletedIds.push(entry.id)
    freedTokens += entry.tokenCount
  }

  const expiredIds = new Set(deletedIds)
  const remaining = memories.filter((m) => !expiredIds.has(m.id))

  const stale = identifyStaleEntries(remaining, merged)
  for (const entry of stale) {
    store.deleteMemory(agentId, entry.id)
    deletedIds.push(entry.id)
    freedTokens += entry.tokenCount
  }

  const allDeletedIds = new Set(deletedIds)
  let afterPrune = memories.filter((m) => !allDeletedIds.has(m.id))

  if (afterPrune.length > merged.maxEntriesPerAgent) {
    const sorted = [...afterPrune].sort(
      (a, b) => computeImportanceScore(a, merged) - computeImportanceScore(b, merged),
    )
    const excess = afterPrune.length - merged.maxEntriesPerAgent
    for (let i = 0; i < excess; i++) {
      const entry = sorted[i]
      if (!entry) continue
      store.deleteMemory(agentId, entry.id)
      deletedIds.push(entry.id)
      freedTokens += entry.tokenCount
    }
    const finalDeletedIds = new Set(deletedIds)
    afterPrune = afterPrune.filter((m) => !finalDeletedIds.has(m.id))
  }

  return { deletedCount: deletedIds.length, freedTokens, deletedIds }
}

export function pruneWorkspaceMemories(
  config?: Partial<MemoryLifecycleConfig>,
): PruneResult {
  const merged = mergeConfig(config)
  const store = useMemoryStore.getState()
  const entries = store.entries

  const deletedIds: string[] = []
  let freedTokens = 0

  const expired = identifyExpiredEntries(entries, merged)
  for (const entry of expired) {
    store.deleteEntry(entry.id)
    deletedIds.push(entry.id)
    freedTokens += entry.tokenCount
  }

  const expiredIds = new Set(deletedIds)
  const remaining = entries.filter((m) => !expiredIds.has(m.id))

  const stale = identifyStaleEntries(remaining, merged)
  for (const entry of stale) {
    store.deleteEntry(entry.id)
    deletedIds.push(entry.id)
    freedTokens += entry.tokenCount
  }

  return { deletedCount: deletedIds.length, freedTokens, deletedIds }
}

export function getMemoryHealthReport(
  agentId?: string,
  config?: Partial<MemoryLifecycleConfig>,
): MemoryHealthReport {
  const merged = mergeConfig(config)

  let entries: MemoryEntry[]
  if (agentId) {
    entries = useAgentMemoryStore.getState().getAgentMemories(agentId)
  } else {
    entries = useMemoryStore.getState().entries
  }

  const totalTokens = entries.reduce((sum, e) => sum + e.tokenCount, 0)
  const staleCount = identifyStaleEntries(entries, merged).length
  const expiredCount = identifyExpiredEntries(entries, merged).length
  const pinnedCount = entries.filter((e) => e.pinned).length
  const tokenBudgetUsagePct = (totalTokens / merged.maxTotalTokens) * 100

  let recommendation: MemoryHealthReport['recommendation'] = 'healthy'
  if (tokenBudgetUsagePct > 80) {
    recommendation = 'pruning_needed'
  } else if (tokenBudgetUsagePct > 50) {
    recommendation = 'review_recommended'
  }

  return {
    totalEntries: entries.length,
    totalTokens,
    staleCount,
    expiredCount,
    pinnedCount,
    tokenBudgetUsagePct,
    recommendation,
  }
}
