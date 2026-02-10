import { create } from 'zustand'
import type { MemoryEntry, MemoryScope, MemoryCategory, MemorySortOrder } from '../types'
import { countTokens, TOKEN_BUDGET } from '../lib/tokenCount'
import * as db from '../lib/indexedDB'

interface MemoryState {
  entries: MemoryEntry[]
  isHydrated: boolean
  searchQuery: string
  filterScope: MemoryScope | null
  filterCategory: MemoryCategory | null
  filterTags: string[]
  sortOrder: MemorySortOrder
  expandedEntryId: string | null

  hydrate: () => Promise<void>
  addEntry: (title: string, content: string, category: MemoryCategory, tags: string[], scope: MemoryScope) => Promise<MemoryEntry | null>
  updateEntry: (id: string, updates: Partial<Pick<MemoryEntry, 'title' | 'content' | 'category' | 'tags' | 'scope'>>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  setSearchQuery: (query: string) => void
  setFilterScope: (scope: MemoryScope | null) => void
  setFilterCategory: (category: MemoryCategory | null) => void
  setFilterTags: (tags: string[]) => void
  setSortOrder: (order: MemorySortOrder) => void
  setExpandedEntryId: (id: string | null) => void
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

  hydrate: async () => {
    if (get().isHydrated) return
    const entries = await db.getAllEntries()
    set({ entries, isHydrated: true })
  },

  addEntry: async (title, content, category, tags, scope) => {
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
    set((state) => ({ entries: state.entries.filter((e) => e.id !== id) }))
  },

  clearAll: async () => {
    await db.clearEntries()
    set({ entries: [] })
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterScope: (scope) => set({ filterScope: scope }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  setFilterTags: (tags) => set({ filterTags: tags }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setExpandedEntryId: (id) => set({ expandedEntryId: id }),

  exportEntries: async () => db.exportAllEntries(),
  importEntries: async (entries) => {
    await db.importEntries(entries)
    set({ entries })
  },
}))
