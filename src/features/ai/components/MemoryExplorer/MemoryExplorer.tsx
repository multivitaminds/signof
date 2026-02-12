import { useState, useCallback, useMemo, useEffect } from 'react'
import { Plus, Download, Upload, Search, LayoutGrid, List } from 'lucide-react'
import { Button, Input } from '../../../../components/ui'
import { Badge } from '../../../../components/ui'
import { useMemoryStore } from '../../stores/useMemoryStore'
import { MemorySortOrder } from '../../types'
import type { MemoryScope as MemoryScopeType, MemoryCategory as MemoryCategoryType, MemorySortOrder as MemorySortOrderType, MemoryEntry } from '../../types'
import { CATEGORY_META } from '../../lib/memoryTemplates'
import MemoryEntryCard from '../MemoryEntryCard/MemoryEntryCard'
import MemoryEntryModal from '../MemoryEntryModal/MemoryEntryModal'
import './MemoryExplorer.css'

interface MemoryExplorerProps {
  onShowTemplates?: () => void
}

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

function getCategoryColor(category: MemoryCategoryType): string {
  const meta = CATEGORY_META.find((m) => m.key === category)
  return meta?.color ?? '#64748B'
}

export default function MemoryExplorer({ onShowTemplates }: MemoryExplorerProps) {
  const {
    entries,
    isHydrated,
    searchQuery,
    filterScope,
    filterCategory,
    sortOrder,
    expandedEntryId,
    pinnedIds,
    viewMode,
    hydrate,
    setSearchQuery,
    setSortOrder,
    setExpandedEntryId,
    setViewMode,
    togglePin,
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

  const pinnedEntries = useMemo(
    () => filteredEntries.filter((e) => pinnedIds.includes(e.id)),
    [filteredEntries, pinnedIds],
  )

  const unpinnedEntries = useMemo(
    () => filteredEntries.filter((e) => !pinnedIds.includes(e.id)),
    [filteredEntries, pinnedIds],
  )

  const existingTags = useMemo(
    () => Array.from(new Set(entries.flatMap((e) => e.tags))),
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

        <div className="memory-explorer__view-toggle" role="group" aria-label="View mode">
          <button
            className={`memory-explorer__view-btn${viewMode === 'grid' ? ' memory-explorer__view-btn--active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`memory-explorer__view-btn${viewMode === 'list' ? ' memory-explorer__view-btn--active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <List size={16} />
          </button>
        </div>

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
          <h3 className="memory-explorer__empty-title">Your memory is empty</h3>
          <p className="memory-explorer__empty-subtitle">Start building your organization&apos;s knowledge base</p>
          <Button variant="primary" icon={<Plus size={16} />} onClick={onShowTemplates ?? handleAdd}>
            Get Started
          </Button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="memory-explorer__list-container">
          {pinnedEntries.length > 0 && (
            <div className="memory-explorer__pinned-section">
              <h4 className="memory-explorer__section-header">Pinned</h4>
              <div className="memory-explorer__list">
                {pinnedEntries.map((entry) => (
                  <div key={entry.id} className="memory-explorer__list-row">
                    <span className="memory-explorer__list-title">{entry.title}</span>
                    <Badge
                      variant="default"
                      size="sm"
                    >
                      <span style={{ color: getCategoryColor(entry.category) }}>{entry.category}</span>
                    </Badge>
                    <span className="memory-explorer__list-tokens">{entry.tokenCount} tokens</span>
                    <span className="memory-explorer__list-date">{new Date(entry.updatedAt).toLocaleDateString()}</span>
                    <div className="memory-explorer__list-actions">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(entry.id)} aria-label={`Edit ${entry.title}`}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)} aria-label={`Delete ${entry.title}`}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {pinnedEntries.length > 0 && unpinnedEntries.length > 0 && (
            <h4 className="memory-explorer__section-header">All Entries</h4>
          )}
          <div className="memory-explorer__list">
            {unpinnedEntries.map((entry) => (
              <div key={entry.id} className="memory-explorer__list-row">
                <span className="memory-explorer__list-title">{entry.title}</span>
                <Badge
                  variant="default"
                  size="sm"
                >
                  <span style={{ color: getCategoryColor(entry.category) }}>{entry.category}</span>
                </Badge>
                <span className="memory-explorer__list-tokens">{entry.tokenCount} tokens</span>
                <span className="memory-explorer__list-date">{new Date(entry.updatedAt).toLocaleDateString()}</span>
                <div className="memory-explorer__list-actions">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(entry.id)} aria-label={`Edit ${entry.title}`}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)} aria-label={`Delete ${entry.title}`}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {pinnedEntries.length > 0 && (
            <div className="memory-explorer__pinned-section">
              <h4 className="memory-explorer__section-header">Pinned</h4>
              <div className="memory-explorer__grid">
                {pinnedEntries.map((entry) => (
                  <MemoryEntryCard
                    key={entry.id}
                    entry={entry}
                    expanded={expandedEntryId === entry.id}
                    isPinned={true}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleExpand={handleToggleExpand}
                    onTogglePin={togglePin}
                  />
                ))}
              </div>
            </div>
          )}
          {pinnedEntries.length > 0 && unpinnedEntries.length > 0 && (
            <h4 className="memory-explorer__section-header">All Entries</h4>
          )}
          <div className="memory-explorer__grid">
            {unpinnedEntries.map((entry) => (
              <MemoryEntryCard
                key={entry.id}
                entry={entry}
                expanded={expandedEntryId === entry.id}
                isPinned={false}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleExpand={handleToggleExpand}
                onTogglePin={togglePin}
              />
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <MemoryEntryModal
          entry={editingEntry}
          onSave={handleSave}
          onCancel={handleCancel}
          existingTags={existingTags}
        />
      )}
    </div>
  )
}
