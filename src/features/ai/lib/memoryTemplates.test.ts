import { describe, it, expect } from 'vitest'
import type { MemoryEntry } from '../types'
import {
  CATEGORY_META,
  MEMORY_TEMPLATES,
  getCategoryStats,
  getInsights,
  getPinnedEntries,
} from './memoryTemplates'

function makeEntry(overrides: Partial<MemoryEntry> = {}): MemoryEntry {
  return {
    id: 'test-1',
    title: 'Test Entry',
    content: 'Test content',
    category: 'decisions',
    tags: [],
    scope: 'workspace',
    tokenCount: 100,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    pinned: false,
    sourceType: null,
    sourceRef: null,
    lastAccessedAt: '2025-01-01T00:00:00Z',
    accessCount: 0,
    ...overrides,
  }
}

describe('CATEGORY_META', () => {
  it('has exactly 6 entries', () => {
    expect(CATEGORY_META).toHaveLength(6)
  })

  it('each entry has key, label, description, icon, color, and at least 2 examples', () => {
    for (const meta of CATEGORY_META) {
      expect(meta.key).toBeTruthy()
      expect(meta.label).toBeTruthy()
      expect(meta.description).toBeTruthy()
      expect(meta.icon).toBeTruthy()
      expect(meta.color).toBeTruthy()
      expect(meta.examples.length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('MEMORY_TEMPLATES', () => {
  it('has exactly 8 templates', () => {
    expect(MEMORY_TEMPLATES).toHaveLength(8)
  })

  it('each template has all required fields', () => {
    for (const template of MEMORY_TEMPLATES) {
      expect(template.id).toBeTruthy()
      expect(template.title).toBeTruthy()
      expect(template.description).toBeTruthy()
      expect(template.category).toBeTruthy()
      expect(template.scope).toBeTruthy()
      expect(template.placeholder).toBeTruthy()
      expect(Array.isArray(template.tags)).toBe(true)
      expect(template.icon).toBeTruthy()
    }
  })
})

describe('getCategoryStats', () => {
  it('returns correct counts per category', () => {
    const entries: MemoryEntry[] = [
      makeEntry({ id: '1', category: 'decisions', tokenCount: 50 }),
      makeEntry({ id: '2', category: 'decisions', tokenCount: 150 }),
      makeEntry({ id: '3', category: 'facts', tokenCount: 200 }),
    ]

    const stats = getCategoryStats(entries)

    const decisions = stats.find((s) => s.category === 'decisions')
    expect(decisions?.count).toBe(2)
    expect(decisions?.tokenCount).toBe(200)

    const facts = stats.find((s) => s.category === 'facts')
    expect(facts?.count).toBe(1)
    expect(facts?.tokenCount).toBe(200)

    const workflows = stats.find((s) => s.category === 'workflows')
    expect(workflows?.count).toBe(0)
    expect(workflows?.tokenCount).toBe(0)
  })

  it('returns all 6 categories even with empty entries', () => {
    const stats = getCategoryStats([])
    expect(stats).toHaveLength(6)
    for (const stat of stats) {
      expect(stat.count).toBe(0)
      expect(stat.tokenCount).toBe(0)
    }
  })
})

describe('getInsights', () => {
  it('suggests adding entries for empty categories', () => {
    const entries: MemoryEntry[] = [
      makeEntry({ id: '1', category: 'decisions' }),
    ]

    const insights = getInsights(entries)

    // 5 categories have no entries (all except decisions)
    expect(insights).toHaveLength(5)
    expect(insights.every((i) => i.type === 'suggestion')).toBe(true)

    const categoryTitles = insights.map((i) => i.title)
    expect(categoryTitles).not.toContain('Add Decisions memories')
    expect(categoryTitles).toContain('Add Workflows memories')
  })

  it('returns no insights when all categories have entries', () => {
    const entries: MemoryEntry[] = [
      makeEntry({ id: '1', category: 'decisions' }),
      makeEntry({ id: '2', category: 'workflows' }),
      makeEntry({ id: '3', category: 'preferences' }),
      makeEntry({ id: '4', category: 'people' }),
      makeEntry({ id: '5', category: 'projects' }),
      makeEntry({ id: '6', category: 'facts' }),
    ]

    const insights = getInsights(entries)
    expect(insights).toHaveLength(0)
  })
})

describe('getPinnedEntries', () => {
  it('filters to only pinned entries', () => {
    const entries: MemoryEntry[] = [
      makeEntry({ id: 'a', accessCount: 5 }),
      makeEntry({ id: 'b', accessCount: 10 }),
      makeEntry({ id: 'c', accessCount: 1 }),
    ]

    const pinned = getPinnedEntries(entries, ['a', 'c'])
    expect(pinned).toHaveLength(2)
    expect(pinned.map((e) => e.id)).toEqual(['a', 'c'])
  })

  it('sorts by accessCount descending', () => {
    const entries: MemoryEntry[] = [
      makeEntry({ id: 'a', accessCount: 5 }),
      makeEntry({ id: 'b', accessCount: 10 }),
      makeEntry({ id: 'c', accessCount: 1 }),
    ]

    const pinned = getPinnedEntries(entries, ['a', 'b', 'c'])
    expect(pinned.map((e) => e.id)).toEqual(['b', 'a', 'c'])
  })

  it('returns empty array when no pinned ids match', () => {
    const entries: MemoryEntry[] = [
      makeEntry({ id: 'a' }),
    ]

    const pinned = getPinnedEntries(entries, ['x', 'y'])
    expect(pinned).toHaveLength(0)
  })
})
