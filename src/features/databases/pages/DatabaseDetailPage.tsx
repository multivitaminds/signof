import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useDatabaseStore } from '../stores/useDatabaseStore'
import { ViewType, DbFieldType } from '../types'
import type { CellValue, Filter, Sort } from '../types'
import ViewSwitcher from '../components/ViewSwitcher/ViewSwitcher'
import ToolbarRow from '../components/ToolbarRow/ToolbarRow'
import FilterBar from '../components/FilterBar/FilterBar'
import GridView from '../components/GridView/GridView'
import KanbanView from '../components/KanbanView/KanbanView'
import GalleryView from '../components/GalleryView/GalleryView'
import CalendarView from '../components/CalendarView/CalendarView'
import FormView from '../components/FormView/FormView'
import './DatabaseDetailPage.css'

export default function DatabaseDetailPage() {
  const { databaseId } = useParams<{ databaseId: string }>()
  const navigate = useNavigate()
  const databasesMap = useDatabaseStore((s) => s.databases)
  const tablesMap = useDatabaseStore((s) => s.tables)
  const updateDatabase = useDatabaseStore((s) => s.updateDatabase)
  const addRow = useDatabaseStore((s) => s.addRow)
  const updateCell = useDatabaseStore((s) => s.updateCell)
  const deleteRow = useDatabaseStore((s) => s.deleteRow)
  const addField = useDatabaseStore((s) => s.addField)
  const addView = useDatabaseStore((s) => s.addView)
  const updateView = useDatabaseStore((s) => s.updateView)
  const getFilteredRows = useDatabaseStore((s) => s.getFilteredRows)
  const getGroupedRows = useDatabaseStore((s) => s.getGroupedRows)

  const [searchQuery, setSearchQuery] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')

  const database = databaseId ? databasesMap[databaseId] : undefined
  const firstTableId = database?.tables[0]
  const table = firstTableId ? tablesMap[firstTableId] : undefined

  const [activeViewId, setActiveViewId] = useState(() => table?.views[0]?.id ?? '')

  const activeView = useMemo(
    () => table?.views.find((v) => v.id === activeViewId) ?? table?.views[0],
    [table, activeViewId]
  )

  const filteredRows = useMemo(
    () => (table && activeView ? getFilteredRows(table.id, activeView.id, searchQuery) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, activeView, searchQuery, getFilteredRows, tablesMap]
  )

  const groupedRows = useMemo(
    () => (table && activeView ? getGroupedRows(table.id, activeView.id, searchQuery) : {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table, activeView, searchQuery, getGroupedRows, tablesMap]
  )

  const handleAddRow = useCallback((cells?: Record<string, CellValue>) => {
    if (table) addRow(table.id, cells)
  }, [table, addRow])

  const handleCellChange = useCallback((rowId: string, fieldId: string, value: CellValue) => {
    if (table) updateCell(table.id, rowId, fieldId, value)
  }, [table, updateCell])

  const handleDeleteRow = useCallback((rowId: string) => {
    if (table) deleteRow(table.id, rowId)
  }, [table, deleteRow])

  const handleAddField = useCallback(() => {
    if (table) addField(table.id, 'New Field', DbFieldType.Text)
  }, [table, addField])

  const handleAddView = useCallback((type: ViewType) => {
    if (!table) return
    const viewNames: Record<string, string> = {
      [ViewType.Grid]: 'Grid view',
      [ViewType.Kanban]: 'Board view',
      [ViewType.Calendar]: 'Calendar view',
      [ViewType.Gallery]: 'Gallery view',
      [ViewType.Form]: 'Form view',
    }
    const id = addView(table.id, viewNames[type] ?? 'New view', type)
    setActiveViewId(id)
  }, [table, addView])

  const handleFiltersChange = useCallback((filters: Filter[]) => {
    if (table && activeView) updateView(table.id, activeView.id, { filters })
  }, [table, activeView, updateView])

  const handleSortsChange = useCallback((sorts: Sort[]) => {
    if (table && activeView) updateView(table.id, activeView.id, { sorts })
  }, [table, activeView, updateView])

  const handleToggleField = useCallback((fieldId: string) => {
    if (!table || !activeView) return
    const hidden = activeView.hiddenFields.includes(fieldId)
      ? activeView.hiddenFields.filter((id) => id !== fieldId)
      : [...activeView.hiddenFields, fieldId]
    updateView(table.id, activeView.id, { hiddenFields: hidden })
  }, [table, activeView, updateView])

  const handleTitleSave = useCallback(() => {
    if (database && titleDraft.trim()) {
      updateDatabase(database.id, { name: titleDraft.trim() })
    }
    setEditingTitle(false)
  }, [database, titleDraft, updateDatabase])

  if (!database || !table) {
    return (
      <div className="db-detail-page__empty">
        <p>Database not found</p>
        <button className="btn-primary" onClick={() => navigate('/data')}>Back to Databases</button>
      </div>
    )
  }

  const titleField = table.fields[0]
  const groupField = activeView?.groupBy ? table.fields.find((f) => f.id === activeView.groupBy) : undefined
  const dateField = table.fields.find((f) => f.type === DbFieldType.Date)

  return (
    <div className="db-detail-page">
      <div className="db-detail-page__header">
        <button className="db-detail-page__back" onClick={() => navigate('/data')}>
          <ChevronLeft size={16} />
        </button>
        <span className="db-detail-page__icon">{database.icon}</span>
        {editingTitle ? (
          <input
            className="db-detail-page__title-input"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave() }}
            autoFocus
          />
        ) : (
          <h1
            className="db-detail-page__title"
            onClick={() => { setTitleDraft(database.name); setEditingTitle(true) }}
          >
            {database.name}
          </h1>
        )}
      </div>

      {activeView && table.views.length > 0 && (
        <ViewSwitcher
          views={table.views}
          activeViewId={activeView.id}
          onSelectView={setActiveViewId}
          onAddView={handleAddView}
        />
      )}

      <ToolbarRow
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        fields={table.fields}
        hiddenFields={activeView?.hiddenFields ?? []}
        onToggleField={handleToggleField}
      />

      {activeView && (
        <FilterBar
          fields={table.fields}
          filters={activeView.filters}
          sorts={activeView.sorts}
          onFiltersChange={handleFiltersChange}
          onSortsChange={handleSortsChange}
        />
      )}

      <div className="db-detail-page__view">
        {activeView?.type === ViewType.Grid && (
          <GridView
            fields={table.fields}
            rows={filteredRows}
            hiddenFields={activeView.hiddenFields}
            fieldOrder={activeView.fieldOrder}
            onCellChange={handleCellChange}
            onAddRow={() => handleAddRow()}
            onAddField={handleAddField}
            onDeleteRow={handleDeleteRow}
          />
        )}
        {activeView?.type === ViewType.Kanban && (
          <KanbanView
            groupField={groupField ?? table.fields.find((f) => f.type === DbFieldType.Select)}
            groups={groupedRows}
            titleFieldId={titleField?.id ?? ''}
            onAddRow={handleAddRow}
            onRowClick={() => {}}
          />
        )}
        {activeView?.type === ViewType.Gallery && (
          <GalleryView
            fields={table.fields}
            rows={filteredRows}
            titleFieldId={titleField?.id ?? ''}
            onAddRow={() => handleAddRow()}
            onRowClick={() => {}}
          />
        )}
        {activeView?.type === ViewType.Calendar && dateField && (
          <CalendarView
            rows={filteredRows}
            dateFieldId={dateField.id}
            titleFieldId={titleField?.id ?? ''}
            onAddRow={(date) => handleAddRow({ [dateField.id]: date })}
            onRowClick={() => {}}
          />
        )}
        {activeView?.type === ViewType.Form && (
          <FormView
            fields={table.fields.filter((f) => f.type !== DbFieldType.CreatedTime && f.type !== DbFieldType.LastEditedTime)}
            onSubmit={(cells) => addRow(table.id, cells)}
          />
        )}
      </div>
    </div>
  )
}
