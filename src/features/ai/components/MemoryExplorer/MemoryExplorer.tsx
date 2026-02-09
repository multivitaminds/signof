import { useState, useCallback, useMemo, useEffect } from 'react'
import { Plus, Download, Upload, Search } from 'lucide-react'
import { Button, Input } from '../../../../components/ui'
import { useMemoryStore } from '../../stores/useMemoryStore'
import { MemoryScope } from '../../types'
import type { MemoryScope as MemoryScopeType, MemoryEntry } from '../../types'
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

export default function MemoryExplorer() {
  const {
    entries,
    isHydrated,
    searchQuery,
    filterScope,
    hydrate,
    setSearchQuery,
    setFilterScope,
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
    return result
  }, [entries, searchQuery, filterScope])

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

  const handleSave = useCallback(
    async (title: string, content: string, tags: string[], scope: MemoryScopeType) => {
      if (editingEntry) {
        await updateEntry(editingEntry.id, { title, content, tags, scope })
      } else {
        await addEntry(title, content, tags, scope)
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

        <div className="memory-explorer__actions">
          <Button variant="ghost" size="sm" icon={<Download size={16} />} onClick={handleExport}>
            Export
          </Button>
          <Button variant="ghost" size="sm" icon={<Upload size={16} />} onClick={handleImport}>
            Import
          </Button>
          <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={handleAdd}>
            Add Entry
          </Button>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="memory-explorer__empty">
          <p>No memory entries yet. Add your first entry to start building context.</p>
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleAdd}>
            Add Entry
          </Button>
        </div>
      ) : (
        <div className="memory-explorer__grid">
          {filteredEntries.map((entry) => (
            <MemoryEntryCard
              key={entry.id}
              entry={entry}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
