import { create } from 'zustand'
import type { MemoryEntry, MemoryScope } from '../types'
import { countTokens, TOKEN_BUDGET } from '../lib/tokenCount'
import * as db from '../lib/indexedDB'

interface MemoryState {
  entries: MemoryEntry[]
  isHydrated: boolean
  searchQuery: string
  filterScope: MemoryScope | null
  filterTags: string[]

  hydrate: () => Promise<void>
  addEntry: (title: string, content: string, tags: string[], scope: MemoryScope) => Promise<MemoryEntry | null>
  updateEntry: (id: string, updates: Partial<Pick<MemoryEntry, 'title' | 'content' | 'tags' | 'scope'>>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  setSearchQuery: (query: string) => void
  setFilterScope: (scope: MemoryScope | null) => void
  setFilterTags: (tags: string[]) => void
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
  filterTags: [],

  hydrate: async () => {
    if (get().isHydrated) return
    const entries = await db.getAllEntries()
    set({ entries, isHydrated: true })
  },

  addEntry: async (title, content, tags, scope) => {
    const tokenCount = countTokens(content)
    const totalTokens = get().entries.reduce((sum, e) => sum + e.tokenCount, 0)
    if (totalTokens + tokenCount > TOKEN_BUDGET) return null
    const now = new Date().toISOString()
    const entry: MemoryEntry = {
      id: generateId(),
      title,
      content,
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
  setFilterTags: (tags) => set({ filterTags: tags }),

  exportEntries: async () => db.exportAllEntries(),
  importEntries: async (entries) => {
    await db.importEntries(entries)
    set({ entries })
  },
}))
