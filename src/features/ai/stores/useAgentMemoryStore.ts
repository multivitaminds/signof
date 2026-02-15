import { create } from 'zustand'
import type { MemoryEntry, MemoryCategory, MemoryScope } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

function tfidfScore(query: string, document: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/)
  const docTerms = document.toLowerCase().split(/\s+/)
  const docLength = docTerms.length
  if (docLength === 0) return 0

  let score = 0
  for (const term of queryTerms) {
    const termFreq = docTerms.filter((t) => t === term).length / docLength
    if (termFreq > 0) {
      score += termFreq * (1 + Math.log(1 / (termFreq + 0.01)))
    }
  }
  return score
}

export interface AgentMemoryState {
  agentMemories: Map<string, MemoryEntry[]>
  sharedInsights: MemoryEntry[]

  remember: (agentId: string, content: string, category: MemoryCategory, title?: string) => string
  recall: (agentId: string, query: string, limit?: number) => MemoryEntry[]
  shareInsight: (agentId: string, memoryId: string) => void
  getContextWindow: (agentId: string, tokenBudget: number) => string
  getAgentMemories: (agentId: string) => MemoryEntry[]
  deleteMemory: (agentId: string, memoryId: string) => void
  clearAgentMemories: (agentId: string) => void
}

const useAgentMemoryStore = create<AgentMemoryState>()((set, get) => ({
  agentMemories: new Map(),
  sharedInsights: [],

  remember: (agentId, content, category, title) => {
    const memoryId = generateId()
    const now = new Date().toISOString()
    const entry: MemoryEntry = {
      id: memoryId,
      title: title ?? content.slice(0, 50),
      content,
      category,
      tags: [],
      scope: 'personal' as MemoryScope,
      tokenCount: estimateTokens(content),
      createdAt: now,
      updatedAt: now,
      pinned: false,
      sourceType: 'agent',
      sourceRef: agentId,
      lastAccessedAt: now,
      accessCount: 0,
    }
    set((state) => {
      const next = new Map(state.agentMemories)
      const existing = next.get(agentId) ?? []
      next.set(agentId, [...existing, entry])
      return { agentMemories: next }
    })
    return memoryId
  },

  recall: (agentId, query, limit = 10) => {
    const memories = get().agentMemories.get(agentId) ?? []
    const shared = get().sharedInsights

    const allMemories = [...memories, ...shared]
    const scored = allMemories.map((m) => ({
      memory: m,
      score: tfidfScore(query, `${m.title} ${m.content}`),
    }))

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, limit).filter((s) => s.score > 0).map((s) => s.memory)
  },

  shareInsight: (agentId, memoryId) => {
    const memories = get().agentMemories.get(agentId) ?? []
    const memory = memories.find((m) => m.id === memoryId)
    if (!memory) return

    const sharedEntry: MemoryEntry = {
      ...memory,
      id: generateId(),
      scope: 'workspace' as MemoryScope,
      sourceType: 'agent-shared',
      sourceRef: agentId,
    }

    set((state) => ({
      sharedInsights: [...state.sharedInsights, sharedEntry],
    }))
  },

  getContextWindow: (agentId, tokenBudget) => {
    const memories = get().agentMemories.get(agentId) ?? []
    const shared = get().sharedInsights

    const sorted = [...memories, ...shared].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.accessCount - a.accessCount
    })

    const lines: string[] = []
    let tokensUsed = 0

    for (const mem of sorted) {
      const line = `[${mem.category}] ${mem.title}: ${mem.content}`
      const lineTokens = estimateTokens(line)
      if (tokensUsed + lineTokens > tokenBudget) break
      lines.push(line)
      tokensUsed += lineTokens
    }

    return lines.join('\n')
  },

  getAgentMemories: (agentId) => {
    return get().agentMemories.get(agentId) ?? []
  },

  deleteMemory: (agentId, memoryId) => {
    set((state) => {
      const next = new Map(state.agentMemories)
      const existing = next.get(agentId) ?? []
      next.set(agentId, existing.filter((m) => m.id !== memoryId))
      return { agentMemories: next }
    })
  },

  clearAgentMemories: (agentId) => {
    set((state) => {
      const next = new Map(state.agentMemories)
      next.delete(agentId)
      return { agentMemories: next }
    })
  },
}))

export default useAgentMemoryStore
