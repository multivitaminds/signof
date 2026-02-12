import { create } from 'zustand'
import type { MemoryEntry, MemoryScope, MemoryCategory, MemorySortOrder } from '../types'
import { countTokens, TOKEN_BUDGET } from '../lib/tokenCount'
import * as db from '../lib/indexedDB'
import { MEMORY_TEMPLATES } from '../lib/memoryTemplates'

interface MemoryState {
  entries: MemoryEntry[]
  isHydrated: boolean
  searchQuery: string
  filterScope: MemoryScope | null
  filterCategory: MemoryCategory | null
  filterTags: string[]
  sortOrder: MemorySortOrder
  expandedEntryId: string | null
  pinnedIds: string[]
  viewMode: 'grid' | 'list'
  activeTab: 'all' | MemoryCategory

  hydrate: () => Promise<void>
  addEntry: (
    title: string,
    content: string,
    category: MemoryCategory,
    tags: string[],
    scope: MemoryScope,
    opts?: { pinned?: boolean; sourceType?: string | null; sourceRef?: string | null },
  ) => Promise<MemoryEntry | null>
  updateEntry: (id: string, updates: Partial<Pick<MemoryEntry, 'title' | 'content' | 'category' | 'tags' | 'scope'>>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  setSearchQuery: (query: string) => void
  setFilterScope: (scope: MemoryScope | null) => void
  setFilterCategory: (category: MemoryCategory | null) => void
  setFilterTags: (tags: string[]) => void
  setSortOrder: (order: MemorySortOrder) => void
  setExpandedEntryId: (id: string | null) => void
  togglePin: (id: string) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setActiveTab: (tab: 'all' | MemoryCategory) => void
  addFromTemplate: (templateId: string) => Promise<MemoryEntry | null>
  exportEntries: () => Promise<MemoryEntry[]>
  importEntries: (entries: MemoryEntry[]) => Promise<void>
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const useMemoryStore = create<MemoryState>((set, get) => ({
  entries: [],
  isHydrated: false,
  searchQuery: '',
  filterScope: null,
  filterCategory: null,
  filterTags: [],
  sortOrder: 'recent' as MemorySortOrder,
  expandedEntryId: null,
  pinnedIds: [],
  viewMode: 'grid',
  activeTab: 'all',

  hydrate: async () => {
    if (get().isHydrated) return
    const entries = await db.getAllEntries()
    set({ entries, isHydrated: true })
  },

  addEntry: async (title, content, category, tags, scope, opts) => {
    const tokenCount = countTokens(content)
    const totalTokens = get().entries.reduce((sum, e) => sum + e.tokenCount, 0)
    if (totalTokens + tokenCount > TOKEN_BUDGET) return null
    const now = new Date().toISOString()
    const entry: MemoryEntry = {
      id: generateId(),
      title,
      content,
      category,
      tags,
      scope,
      tokenCount,
      createdAt: now,
      updatedAt: now,
      pinned: opts?.pinned ?? false,
      sourceType: opts?.sourceType ?? null,
      sourceRef: opts?.sourceRef ?? null,
      lastAccessedAt: now,
      accessCount: 0,
    }
    await db.putEntry(entry)
    set((state) => ({ entries: [...state.entries, entry] }))
    return entry
  },

  updateEntry: async (id, updates) => {
    const entry = get().entries.find((e) => e.id === id)
    if (!entry) return
    const updatedEntry: MemoryEntry = {
      ...entry,
      ...updates,
      tokenCount: updates.content ? countTokens(updates.content) : entry.tokenCount,
      updatedAt: new Date().toISOString(),
    }
    await db.putEntry(updatedEntry)
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? updatedEntry : e)),
    }))
  },

  deleteEntry: async (id) => {
    await db.deleteEntry(id)
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
      pinnedIds: state.pinnedIds.filter((pid) => pid !== id),
    }))
  },

  clearAll: async () => {
    await db.clearEntries()
    set({ entries: [], pinnedIds: [] })
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterScope: (scope) => set({ filterScope: scope }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  setFilterTags: (tags) => set({ filterTags: tags }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setExpandedEntryId: (id) => set({ expandedEntryId: id }),

  togglePin: (id) => set((state) => ({
    pinnedIds: state.pinnedIds.includes(id)
      ? state.pinnedIds.filter((pid) => pid !== id)
      : [...state.pinnedIds, id],
  })),

  setViewMode: (mode) => set({ viewMode: mode }),

  setActiveTab: (tab) => set({
    activeTab: tab,
    filterCategory: tab === 'all' ? null : tab,
  }),

  addFromTemplate: async (templateId) => {
    const template = MEMORY_TEMPLATES.find((t) => t.id === templateId)
    if (!template) return null
    return get().addEntry(
      template.title,
      template.placeholder,
      template.category,
      template.tags,
      template.scope,
    )
  },

  exportEntries: async () => db.exportAllEntries(),
  importEntries: async (entries) => {
    await db.importEntries(entries)
    set({ entries })
  },
}))
