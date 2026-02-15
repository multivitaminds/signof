import type { MemoryEntry } from '../types'

const { mockGetAgentMemories, mockDeleteMemory, mockDeleteEntry } = vi.hoisted(() => ({
  mockGetAgentMemories: vi.fn().mockReturnValue([]),
  mockDeleteMemory: vi.fn(),
  mockDeleteEntry: vi.fn(),
}))

vi.mock('../stores/useAgentMemoryStore', () => ({
  default: {
    getState: vi.fn().mockReturnValue({
      getAgentMemories: mockGetAgentMemories,
      deleteMemory: mockDeleteMemory,
    }),
  },
}))

vi.mock('../stores/useMemoryStore', () => ({
  useMemoryStore: {
    getState: vi.fn().mockReturnValue({
      entries: [],
      deleteEntry: mockDeleteEntry,
    }),
  },
}))

import {
  computeImportanceScore,
  identifyStaleEntries,
  identifyExpiredEntries,
  pruneAgentMemories,
  pruneWorkspaceMemories,
  getMemoryHealthReport,
} from './memoryLifecycleManager'
import { useMemoryStore } from '../stores/useMemoryStore'

function makeEntry(overrides?: Partial<MemoryEntry>): MemoryEntry {
  return {
    id: 'mem-' + Math.random().toString(36).slice(2, 6),
    title: 'Test memory',
    content: 'Test content',
    category: 'facts',
    tags: [],
    scope: 'personal',
    tokenCount: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: false,
    sourceType: null,
    sourceRef: null,
    lastAccessedAt: new Date().toISOString(),
    accessCount: 0,
    ...overrides,
  }
}

function daysAgoISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetAgentMemories.mockReturnValue([])
})

describe('computeImportanceScore', () => {
  it('returns base score of 1 for plain entry', () => {
    const entry = makeEntry({ accessCount: 0, pinned: false })
    // lastAccessedAt is within 7 days but accessCount=0 so 0*10=0
    expect(computeImportanceScore(entry)).toBe(1)
  })

  it('adds 100 for pinned entries', () => {
    const entry = makeEntry({ pinned: true, accessCount: 0 })
    expect(computeImportanceScore(entry)).toBe(101)
  })

  it('adds per-access score for recently accessed entries', () => {
    const entry = makeEntry({ accessCount: 3, lastAccessedAt: new Date().toISOString() })
    // base(1) + 3*10 = 31
    expect(computeImportanceScore(entry)).toBe(31)
  })

  it('does not add access score if not accessed recently', () => {
    const entry = makeEntry({
      accessCount: 5,
      lastAccessedAt: daysAgoISO(10),
    })
    // base(1) only, since last access > 7 days
    expect(computeImportanceScore(entry)).toBe(1)
  })

  it('adds 20 for decisions category', () => {
    const entry = makeEntry({ category: 'decisions', accessCount: 0 })
    expect(computeImportanceScore(entry)).toBe(21)
  })

  it('adds 20 for workflows category', () => {
    const entry = makeEntry({ category: 'workflows', accessCount: 0 })
    expect(computeImportanceScore(entry)).toBe(21)
  })
})

describe('identifyStaleEntries', () => {
  it('finds entries not accessed in staleDays', () => {
    const stale = makeEntry({ lastAccessedAt: daysAgoISO(35) })
    const fresh = makeEntry({ lastAccessedAt: new Date().toISOString() })
    const result = identifyStaleEntries([stale, fresh], { staleDays: 30 })

    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe(stale.id)
  })

  it('excludes pinned entries', () => {
    const stalePinned = makeEntry({ lastAccessedAt: daysAgoISO(35), pinned: true })
    const result = identifyStaleEntries([stalePinned], { staleDays: 30 })
    expect(result).toHaveLength(0)
  })
})

describe('identifyExpiredEntries', () => {
  it('finds entries older than TTL', () => {
    const expired = makeEntry({ createdAt: daysAgoISO(100) })
    const fresh = makeEntry({ createdAt: new Date().toISOString() })
    const result = identifyExpiredEntries([expired, fresh], { defaultTtlDays: 90 })

    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe(expired.id)
  })

  it('excludes pinned entries', () => {
    const expiredPinned = makeEntry({ createdAt: daysAgoISO(100), pinned: true })
    const result = identifyExpiredEntries([expiredPinned], { defaultTtlDays: 90 })
    expect(result).toHaveLength(0)
  })
})

describe('pruneAgentMemories', () => {
  it('deletes expired and stale entries and returns correct PruneResult', () => {
    const expired = makeEntry({ id: 'e1', createdAt: daysAgoISO(100), tokenCount: 50 })
    const stale = makeEntry({
      id: 's1',
      createdAt: new Date().toISOString(),
      lastAccessedAt: daysAgoISO(35),
      tokenCount: 30,
    })
    const fresh = makeEntry({ id: 'f1' })
    mockGetAgentMemories.mockReturnValue([expired, stale, fresh])

    const result = pruneAgentMemories('agent-1', { defaultTtlDays: 90, staleDays: 30 })

    expect(result.deletedCount).toBe(2)
    expect(result.freedTokens).toBe(80)
    expect(result.deletedIds).toContain('e1')
    expect(result.deletedIds).toContain('s1')
    expect(mockDeleteMemory).toHaveBeenCalledWith('agent-1', 'e1')
    expect(mockDeleteMemory).toHaveBeenCalledWith('agent-1', 's1')
  })

  it('trims to maxEntriesPerAgent when over limit', () => {
    // Create 5 entries, set max to 3
    const entries = Array.from({ length: 5 }, (_, i) =>
      makeEntry({ id: `m${i}`, tokenCount: 10, accessCount: 0 }),
    )
    mockGetAgentMemories.mockReturnValue(entries)

    const result = pruneAgentMemories('agent-1', {
      defaultTtlDays: 90,
      staleDays: 30,
      maxEntriesPerAgent: 3,
    })

    // None are expired or stale (all recently created and accessed)
    // But 5 > 3, so 2 lowest importance should be deleted
    expect(result.deletedCount).toBe(2)
    expect(result.freedTokens).toBe(20)
  })
})

describe('pruneWorkspaceMemories', () => {
  it('deletes expired workspace entries', () => {
    const expired = makeEntry({ id: 'w1', createdAt: daysAgoISO(100), tokenCount: 25 })
    const fresh = makeEntry({ id: 'w2' })
    const mockState = { entries: [expired, fresh], deleteEntry: mockDeleteEntry }
    vi.mocked(useMemoryStore.getState).mockReturnValue(
      mockState as unknown as ReturnType<typeof useMemoryStore.getState>,
    )

    const result = pruneWorkspaceMemories({ defaultTtlDays: 90, staleDays: 30 })

    expect(result.deletedCount).toBeGreaterThanOrEqual(1)
    expect(result.deletedIds).toContain('w1')
    expect(mockDeleteEntry).toHaveBeenCalledWith('w1')
  })
})

describe('getMemoryHealthReport', () => {
  it('returns correct counts and token usage for agent memories', () => {
    const entries = [
      makeEntry({ tokenCount: 100, pinned: true }),
      makeEntry({ tokenCount: 200, lastAccessedAt: daysAgoISO(35) }),
      makeEntry({ tokenCount: 300, createdAt: daysAgoISO(100) }),
    ]
    mockGetAgentMemories.mockReturnValue(entries)

    const report = getMemoryHealthReport('agent-1')

    expect(report.totalEntries).toBe(3)
    expect(report.totalTokens).toBe(600)
    expect(report.pinnedCount).toBe(1)
    expect(report.staleCount).toBeGreaterThanOrEqual(1) // entry with lastAccessedAt 35 days ago
    expect(report.expiredCount).toBeGreaterThanOrEqual(1) // entry created 100 days ago
  })

  it('calculates token budget usage percentage', () => {
    const entries = [makeEntry({ tokenCount: 500000 })]
    mockGetAgentMemories.mockReturnValue(entries)

    const report = getMemoryHealthReport('agent-1')
    expect(report.tokenBudgetUsagePct).toBe(50)
  })

  it('gives healthy recommendation when under 50%', () => {
    const entries = [makeEntry({ tokenCount: 100 })]
    mockGetAgentMemories.mockReturnValue(entries)

    const report = getMemoryHealthReport('agent-1')
    expect(report.recommendation).toBe('healthy')
  })

  it('gives review_recommended when 50-80%', () => {
    const entries = [makeEntry({ tokenCount: 600000 })]
    mockGetAgentMemories.mockReturnValue(entries)

    const report = getMemoryHealthReport('agent-1')
    expect(report.recommendation).toBe('review_recommended')
  })

  it('gives pruning_needed when over 80%', () => {
    const entries = [makeEntry({ tokenCount: 900000 })]
    mockGetAgentMemories.mockReturnValue(entries)

    const report = getMemoryHealthReport('agent-1')
    expect(report.recommendation).toBe('pruning_needed')
  })

  it('uses workspace entries when no agentId provided', () => {
    const entries = [makeEntry({ tokenCount: 50 })]
    const mockState = { entries, deleteEntry: mockDeleteEntry }
    vi.mocked(useMemoryStore.getState).mockReturnValue(
      mockState as unknown as ReturnType<typeof useMemoryStore.getState>,
    )

    const report = getMemoryHealthReport()

    expect(report.totalEntries).toBe(1)
    expect(report.totalTokens).toBe(50)
  })
})
