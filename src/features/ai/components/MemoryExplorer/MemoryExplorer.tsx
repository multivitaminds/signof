import { useState, useCallback, useMemo, useEffect } from 'react'
import { Plus, Download, Upload, Search } from 'lucide-react'
import { Button, Input } from '../../../../components/ui'
import { useMemoryStore } from '../../stores/useMemoryStore'
import { MemoryScope, MemoryCategory, MemorySortOrder } from '../../types'
import type { MemoryScope as MemoryScopeType, MemoryCategory as MemoryCategoryType, MemorySortOrder as MemorySortOrderType, MemoryEntry } from '../../types'
import UsageMeter from '../UsageMeter/UsageMeter'
import MemoryEntryCard from '../MemoryEntryCard/MemoryEntryCard'
import MemoryEntryModal from '../MemoryEntryModal/MemoryEntryModal'
import './MemoryExplorer.css'

const SCOPE_OPTIONS: Array<{ value: MemoryScopeType; label: string }> = [
  { value: MemoryScope.Workspace, label: 'Workspace' },
  { value: MemoryScope.Personal, label: 'Personal' },
  { value: MemoryScope.Team, label: 'Team' },
  { value: MemoryScope.Project, label: 'Project' },
]

const CATEGORY_OPTIONS: Array<{ value: MemoryCategoryType; label: string }> = [
  { value: MemoryCategory.Decisions, label: 'Decisions' },
  { value: MemoryCategory.Workflows, label: 'Workflows' },
  { value: MemoryCategory.Preferences, label: 'Preferences' },
  { value: MemoryCategory.People, label: 'People' },
  { value: MemoryCategory.Projects, label: 'Projects' },
  { value: MemoryCategory.Facts, label: 'Facts' },
]

const SORT_OPTIONS: Array<{ value: MemorySortOrderType; label: string }> = [
  { value: MemorySortOrder.Recent, label: 'Recent' },
  { value: MemorySortOrder.Oldest, label: 'Oldest' },
  { value: MemorySortOrder.Largest, label: 'Largest' },
  { value: MemorySortOrder.Category, label: 'Category' },
]

function sortEntries(entries: MemoryEntry[], order: MemorySortOrderType): MemoryEntry[] {
  const sorted = [...entries]
  switch (order) {
    case MemorySortOrder.Recent:
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    case MemorySortOrder.Oldest:
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case MemorySortOrder.Largest:
      return sorted.sort((a, b) => b.tokenCount - a.tokenCount)
    case MemorySortOrder.Category:
      return sorted.sort((a, b) => a.category.localeCompare(b.category))
    default:
      return sorted
  }
}

export default function MemoryExplorer() {
  const {
    entries,
    isHydrated,
    searchQuery,
    filterScope,
    filterCategory,
    sortOrder,
    expandedEntryId,
    hydrate,
    setSearchQuery,
    setFilterScope,
    setFilterCategory,
    setSortOrder,
    setExpandedEntryId,
    addEntry,
    updateEntry,
    deleteEntry,
    exportEntries,
    importEntries,
  } = useMemoryStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MemoryEntry | null>(null)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const filteredEntries = useMemo(() => {
    let result = entries
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.content.toLowerCase().includes(query),
      )
    }
    if (filterScope) {
      result = result.filter((e) => e.scope === filterScope)
    }
    if (filterCategory) {
      result = result.filter((e) => e.category === filterCategory)
    }
    return sortEntries(result, sortOrder)
  }, [entries, searchQuery, filterScope, filterCategory, sortOrder])

  const totalTokens = useMemo(
    () => entries.reduce((sum, e) => sum + e.tokenCount, 0),
    [entries],
  )

  const handleAdd = useCallback(() => {
    setEditingEntry(null)
    setModalOpen(true)
  }, [])

  const handleEdit = useCallback(
    (id: string) => {
      const entry = entries.find((e) => e.id === id)
      if (entry) {
        setEditingEntry(entry)
        setModalOpen(true)
      }
    },
    [entries],
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteEntry(id)
    },
    [deleteEntry],
  )

  const handleToggleExpand = useCallback(
    (id: string) => {
      setExpandedEntryId(expandedEntryId === id ? null : id)
    },
    [expandedEntryId, setExpandedEntryId],
  )

  const handleSave = useCallback(
    async (title: string, content: string, category: MemoryCategoryType, tags: string[], scope: MemoryScopeType) => {
      if (editingEntry) {
        await updateEntry(editingEntry.id, { title, content, category, tags, scope })
      } else {
        await addEntry(title, content, category, tags, scope)
      }
      setModalOpen(false)
      setEditingEntry(null)
    },
    [editingEntry, addEntry, updateEntry],
  )

  const handleCancel = useCallback(() => {
    setModalOpen(false)
    setEditingEntry(null)
  }, [])

  const handleExport = useCallback(async () => {
    const data = await exportEntries()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'signof-memory-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [exportEntries])

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const text = await file.text()
      const data = JSON.parse(text) as MemoryEntry[]
      await importEntries(data)
    }
    input.click()
  }, [importEntries])

  const handleScopeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      setFilterScope(value === '' ? null : (value as MemoryScopeType))
    },
    [setFilterScope],
  )

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      setFilterCategory(value === '' ? null : (value as MemoryCategoryType))
    },
    [setFilterCategory],
  )

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSortOrder(e.target.value as MemorySortOrderType)
    },
    [setSortOrder],
  )

  if (!isHydrated) {
    return (
      <div className="memory-explorer">
        <p className="memory-explorer__loading">Loading memory...</p>
      </div>
    )
  }

  return (
    <div className="memory-explorer">
      <UsageMeter usedTokens={totalTokens} />

      <div className="memory-explorer__toolbar">
        <div className="memory-explorer__search">
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        <select
          className="memory-explorer__scope-filter"
          value={filterScope ?? ''}
          onChange={handleScopeChange}
          aria-label="Filter by scope"
        >
          <option value="">All Scopes</option>
          {SCOPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="memory-explorer__category-filter"
          value={filterCategory ?? ''}
          onChange={handleCategoryChange}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="memory-explorer__sort-select"
          value={sortOrder}
          onChange={handleSortChange}
          aria-label="Sort entries"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="memory-explorer__actions">
          <Button variant="ghost" size="sm" icon={<Download size={16} />} onClick={handleExport}>
            Export
          </Button>
          <Button variant="ghost" size="sm" icon={<Upload size={16} />} onClick={handleImport}>
            Import
          </Button>
          <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={handleAdd}>
            Add Memory
          </Button>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="memory-explorer__empty">
          <p>No memory entries yet. Add your first entry to start building context.</p>
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleAdd}>
            Add Memory
          </Button>
        </div>
      ) : (
        <div className="memory-explorer__grid">
          {filteredEntries.map((entry) => (
            <MemoryEntryCard
              key={entry.id}
              entry={entry}
              expanded={expandedEntryId === entry.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleExpand={handleToggleExpand}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <MemoryEntryModal
          entry={editingEntry}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
