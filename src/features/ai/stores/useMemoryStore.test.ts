import type { MemoryEntry } from '../types'

vi.mock('../lib/indexedDB', () => {
  const store = new Map<string, MemoryEntry>()
  return {
    getAllEntries: vi.fn(async () => Array.from(store.values())),
    getEntry: vi.fn(async (id: string) => store.get(id)),
    putEntry: vi.fn(async (entry: MemoryEntry) => { store.set(entry.id, entry) }),
    deleteEntry: vi.fn(async (id: string) => { store.delete(id) }),
    clearEntries: vi.fn(async () => { store.clear() }),
    exportAllEntries: vi.fn(async () => Array.from(store.values())),
    importEntries: vi.fn(async (entries: MemoryEntry[]) => {
      store.clear()
      for (const e of entries) store.set(e.id, e)
    }),
    __store: store,
  }
})

vi.mock('../lib/memoryTemplates', () => ({
  MEMORY_TEMPLATES: [
    {
      id: 'tpl-1',
      title: 'Test Template',
      description: 'A test template',
      category: 'decisions',
      scope: 'workspace',
      placeholder: 'Template placeholder content',
      tags: ['template-tag'],
      icon: 'icon',
    },
  ],
}))

import { useMemoryStore } from './useMemoryStore'
import * as db from '../lib/indexedDB'

const mockDB = db as unknown as {
  getAllEntries: ReturnType<typeof vi.fn>
  putEntry: ReturnType<typeof vi.fn>
  deleteEntry: ReturnType<typeof vi.fn>
  clearEntries: ReturnType<typeof vi.fn>
  exportAllEntries: ReturnType<typeof vi.fn>
  importEntries: ReturnType<typeof vi.fn>
  __store: Map<string, MemoryEntry>
}

const makeEntry = (id: string, content = 'test content'): MemoryEntry => ({
  id,
  title: `Entry ${id}`,
  content,
  category: 'facts',
  tags: ['test'],
  scope: 'workspace',
  tokenCount: Math.ceil(content.length / 4),
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  pinned: false,
  sourceType: null,
  sourceRef: null,
  lastAccessedAt: '2025-01-01T00:00:00.000Z',
  accessCount: 0,
})

describe('useMemoryStore', () => {
  beforeEach(() => {
    // Reset the store state
    useMemoryStore.setState({
      entries: [],
      isHydrated: false,
      searchQuery: '',
      filterScope: null,
      filterCategory: null,
      filterTags: [],
      sortOrder: 'recent',
      expandedEntryId: null,
      pinnedIds: [],
      viewMode: 'grid',
      activeTab: 'all',
    })
    mockDB.__store.clear()
    vi.clearAllMocks()
  })

  it('starts with empty state', () => {
    const state = useMemoryStore.getState()
    expect(state.entries).toEqual([])
    expect(state.isHydrated).toBe(false)
    expect(state.searchQuery).toBe('')
    expect(state.filterScope).toBeNull()
    expect(state.filterCategory).toBeNull()
    expect(state.filterTags).toEqual([])
    expect(state.sortOrder).toBe('recent')
    expect(state.expandedEntryId).toBeNull()
    expect(state.pinnedIds).toEqual([])
    expect(state.viewMode).toBe('grid')
    expect(state.activeTab).toBe('all')
  })

  describe('hydrate', () => {
    it('loads entries from indexedDB', async () => {
      const entry = makeEntry('h1')
      mockDB.__store.set('h1', entry)

      await useMemoryStore.getState().hydrate()

      const state = useMemoryStore.getState()
      expect(state.isHydrated).toBe(true)
      expect(state.entries).toHaveLength(1)
      expect(state.entries[0]!.id).toBe('h1')
    })

    it('does not re-hydrate if already hydrated', async () => {
      await useMemoryStore.getState().hydrate()
      await useMemoryStore.getState().hydrate()
      expect(mockDB.getAllEntries).toHaveBeenCalledTimes(1)
    })
  })

  describe('addEntry', () => {
    it('creates and stores a new entry with category', async () => {
      const result = await useMemoryStore.getState().addEntry(
        'Test Title',
        'Some content here',
        'decisions',
        ['tag1'],
        'workspace',
      )
      expect(result).not.toBeNull()
      expect(result?.title).toBe('Test Title')
      expect(result?.content).toBe('Some content here')
      expect(result?.category).toBe('decisions')
      expect(result?.tags).toEqual(['tag1'])
      expect(result?.scope).toBe('workspace')
      expect(result?.tokenCount).toBe(Math.ceil(17 / 4))
      expect(mockDB.putEntry).toHaveBeenCalledOnce()

      const state = useMemoryStore.getState()
      expect(state.entries).toHaveLength(1)
    })

    it('returns null when over budget', async () => {
      // Pre-fill with a large entry occupying the entire budget
      const bigEntry = makeEntry('big', 'x'.repeat(4_000_000))
      bigEntry.tokenCount = 1_000_000
      useMemoryStore.setState({ entries: [bigEntry] })

      const result = await useMemoryStore.getState().addEntry(
        'Over budget',
        'This will exceed the limit',
        'facts',
        [],
        'workspace',
      )
      expect(result).toBeNull()
      expect(mockDB.putEntry).not.toHaveBeenCalled()
    })

    it('sets default values for new fields', async () => {
      const result = await useMemoryStore.getState().addEntry(
        'New Fields',
        'content',
        'facts',
        [],
        'workspace',
      )
      expect(result).not.toBeNull()
      expect(result?.pinned).toBe(false)
      expect(result?.sourceType).toBeNull()
      expect(result?.sourceRef).toBeNull()
      expect(result?.lastAccessedAt).toBeTruthy()
      expect(result?.accessCount).toBe(0)
    })

    it('accepts opts parameter for pinned/sourceType/sourceRef', async () => {
      const result = await useMemoryStore.getState().addEntry(
        'With Opts',
        'content',
        'decisions',
        [],
        'workspace',
        { pinned: true, sourceType: 'agent', sourceRef: 'agent-123' },
      )
      expect(result).not.toBeNull()
      expect(result?.pinned).toBe(true)
      expect(result?.sourceType).toBe('agent')
      expect(result?.sourceRef).toBe('agent-123')
    })
  })

  describe('updateEntry', () => {
    it('updates an existing entry', async () => {
      const entry = makeEntry('u1')
      useMemoryStore.setState({ entries: [entry] })

      await useMemoryStore.getState().updateEntry('u1', { title: 'Updated' })

      const state = useMemoryStore.getState()
      expect(state.entries[0]!.title).toBe('Updated')
      expect(mockDB.putEntry).toHaveBeenCalledOnce()
    })

    it('recalculates tokenCount when content changes', async () => {
      const entry = makeEntry('u2')
      useMemoryStore.setState({ entries: [entry] })

      await useMemoryStore.getState().updateEntry('u2', { content: 'a'.repeat(100) })

      const state = useMemoryStore.getState()
      expect(state.entries[0]!.tokenCount).toBe(25)
    })

    it('updates category', async () => {
      const entry = makeEntry('u3')
      useMemoryStore.setState({ entries: [entry] })

      await useMemoryStore.getState().updateEntry('u3', { category: 'workflows' })

      const state = useMemoryStore.getState()
      expect(state.entries[0]!.category).toBe('workflows')
    })

    it('does nothing for non-existent id', async () => {
      await useMemoryStore.getState().updateEntry('nope', { title: 'X' })
      expect(mockDB.putEntry).not.toHaveBeenCalled()
    })
  })

  describe('deleteEntry', () => {
    it('removes an entry', async () => {
      useMemoryStore.setState({ entries: [makeEntry('d1'), makeEntry('d2')] })

      await useMemoryStore.getState().deleteEntry('d1')

      const state = useMemoryStore.getState()
      expect(state.entries).toHaveLength(1)
      expect(state.entries[0]!.id).toBe('d2')
      expect(mockDB.deleteEntry).toHaveBeenCalledWith('d1')
    })

    it('removes id from pinnedIds when deleting', async () => {
      useMemoryStore.setState({
        entries: [makeEntry('d1'), makeEntry('d2')],
        pinnedIds: ['d1', 'd2'],
      })

      await useMemoryStore.getState().deleteEntry('d1')

      const state = useMemoryStore.getState()
      expect(state.pinnedIds).toEqual(['d2'])
    })
  })

  describe('clearAll', () => {
    it('removes all entries', async () => {
      useMemoryStore.setState({ entries: [makeEntry('c1'), makeEntry('c2')] })

      await useMemoryStore.getState().clearAll()

      expect(useMemoryStore.getState().entries).toEqual([])
      expect(mockDB.clearEntries).toHaveBeenCalledOnce()
    })

    it('clears pinnedIds', async () => {
      useMemoryStore.setState({
        entries: [makeEntry('c1')],
        pinnedIds: ['c1'],
      })

      await useMemoryStore.getState().clearAll()

      expect(useMemoryStore.getState().pinnedIds).toEqual([])
    })
  })

  describe('togglePin', () => {
    it('adds id to pinnedIds', () => {
      useMemoryStore.getState().togglePin('pin1')
      expect(useMemoryStore.getState().pinnedIds).toEqual(['pin1'])
    })

    it('removes id if already pinned', () => {
      useMemoryStore.setState({ pinnedIds: ['pin1', 'pin2'] })
      useMemoryStore.getState().togglePin('pin1')
      expect(useMemoryStore.getState().pinnedIds).toEqual(['pin2'])
    })
  })

  describe('setViewMode', () => {
    it('updates viewMode', () => {
      useMemoryStore.getState().setViewMode('list')
      expect(useMemoryStore.getState().viewMode).toBe('list')
    })

    it('can switch back to grid', () => {
      useMemoryStore.getState().setViewMode('list')
      useMemoryStore.getState().setViewMode('grid')
      expect(useMemoryStore.getState().viewMode).toBe('grid')
    })
  })

  describe('setActiveTab', () => {
    it('updates activeTab', () => {
      useMemoryStore.getState().setActiveTab('decisions')
      expect(useMemoryStore.getState().activeTab).toBe('decisions')
    })

    it('sets filterCategory when tab is a category', () => {
      useMemoryStore.getState().setActiveTab('workflows')
      expect(useMemoryStore.getState().filterCategory).toBe('workflows')
    })

    it('clears filterCategory when tab is all', () => {
      useMemoryStore.getState().setActiveTab('decisions')
      useMemoryStore.getState().setActiveTab('all')
      expect(useMemoryStore.getState().filterCategory).toBeNull()
    })
  })

  describe('addFromTemplate', () => {
    it('creates entry from template', async () => {
      const result = await useMemoryStore.getState().addFromTemplate('tpl-1')
      expect(result).not.toBeNull()
      expect(result?.title).toBe('Test Template')
      expect(result?.content).toBe('Template placeholder content')
      expect(result?.category).toBe('decisions')
      expect(result?.tags).toEqual(['template-tag'])
    })

    it('returns null for unknown template', async () => {
      const result = await useMemoryStore.getState().addFromTemplate('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('filter and sort setters', () => {
    it('setSearchQuery updates searchQuery', () => {
      useMemoryStore.getState().setSearchQuery('hello')
      expect(useMemoryStore.getState().searchQuery).toBe('hello')
    })

    it('setFilterScope updates filterScope', () => {
      useMemoryStore.getState().setFilterScope('personal')
      expect(useMemoryStore.getState().filterScope).toBe('personal')
    })

    it('setFilterScope can be set to null', () => {
      useMemoryStore.getState().setFilterScope('personal')
      useMemoryStore.getState().setFilterScope(null)
      expect(useMemoryStore.getState().filterScope).toBeNull()
    })

    it('setFilterCategory updates filterCategory', () => {
      useMemoryStore.getState().setFilterCategory('decisions')
      expect(useMemoryStore.getState().filterCategory).toBe('decisions')
    })

    it('setFilterCategory can be set to null', () => {
      useMemoryStore.getState().setFilterCategory('workflows')
      useMemoryStore.getState().setFilterCategory(null)
      expect(useMemoryStore.getState().filterCategory).toBeNull()
    })

    it('setFilterTags updates filterTags', () => {
      useMemoryStore.getState().setFilterTags(['a', 'b'])
      expect(useMemoryStore.getState().filterTags).toEqual(['a', 'b'])
    })

    it('setSortOrder updates sortOrder', () => {
      useMemoryStore.getState().setSortOrder('oldest')
      expect(useMemoryStore.getState().sortOrder).toBe('oldest')
    })

    it('setExpandedEntryId updates expandedEntryId', () => {
      useMemoryStore.getState().setExpandedEntryId('abc')
      expect(useMemoryStore.getState().expandedEntryId).toBe('abc')
    })

    it('setExpandedEntryId can be set to null', () => {
      useMemoryStore.getState().setExpandedEntryId('abc')
      useMemoryStore.getState().setExpandedEntryId(null)
      expect(useMemoryStore.getState().expandedEntryId).toBeNull()
    })
  })

  describe('export/import', () => {
    it('exportEntries delegates to db', async () => {
      const entry = makeEntry('ex1')
      mockDB.__store.set('ex1', entry)

      const exported = await useMemoryStore.getState().exportEntries()
      expect(exported).toHaveLength(1)
      expect(mockDB.exportAllEntries).toHaveBeenCalledOnce()
    })

    it('importEntries replaces state', async () => {
      const entries = [makeEntry('i1'), makeEntry('i2')]
      await useMemoryStore.getState().importEntries(entries)

      expect(useMemoryStore.getState().entries).toEqual(entries)
      expect(mockDB.importEntries).toHaveBeenCalledWith(entries)
    })
  })
})
