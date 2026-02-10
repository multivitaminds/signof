import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Upload, Plus } from 'lucide-react'
import { useDatabaseStore } from '../stores/useDatabaseStore'
import { ViewType, DbFieldType } from '../types'
import type { CellValue, Filter, Sort, DbRow } from '../types'
import type { DbFieldType as DbFieldTypeType } from '../types'
import ViewSwitcher from '../components/ViewSwitcher/ViewSwitcher'
import ToolbarRow from '../components/ToolbarRow/ToolbarRow'
import FilterBar from '../components/FilterBar/FilterBar'
import GridView from '../components/GridView/GridView'
import KanbanView from '../components/KanbanView/KanbanView'
import GalleryView from '../components/GalleryView/GalleryView'
import CalendarView from '../components/CalendarView/CalendarView'
import FormView from '../components/FormView/FormView'
import CreateTableModal from '../components/CreateTableModal/CreateTableModal'
import FileUploadParser from '../components/FileUploadParser/FileUploadParser'
import './DatabaseDetailPage.css'

export default function DatabaseDetailPage() {
  const { databaseId } = useParams<{ databaseId: string }>()
  const navigate = useNavigate()
  const databasesMap = useDatabaseStore((s) => s.databases)
  const tablesMap = useDatabaseStore((s) => s.tables)
  const updateDatabase = useDatabaseStore((s) => s.updateDatabase)
  const addTable = useDatabaseStore((s) => s.addTable)
  const addTableWithData = useDatabaseStore((s) => s.addTableWithData)
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
  const [showCreateTable, setShowCreateTable] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)

  const database = databaseId ? databasesMap[databaseId] : undefined

  // Track active table by ID (default to first table)
  const [activeTableId, setActiveTableId] = useState(() => database?.tables[0] ?? '')
  const table = activeTableId ? tablesMap[activeTableId] : (database?.tables[0] ? tablesMap[database.tables[0]] : undefined)

  // If activeTableId is stale or not set, fall back to first table
  const resolvedTableId = (activeTableId && tablesMap[activeTableId]) ? activeTableId : (database?.tables[0] ?? '')
  const resolvedTable = resolvedTableId ? tablesMap[resolvedTableId] : undefined

  const [activeViewId, setActiveViewId] = useState(() => resolvedTable?.views[0]?.id ?? '')

  const activeView = useMemo(
    () => resolvedTable?.views.find((v) => v.id === activeViewId) ?? resolvedTable?.views[0],
    [resolvedTable, activeViewId]
  )

  const filteredRows = useMemo(
    () => (resolvedTable && activeView ? getFilteredRows(resolvedTable.id, activeView.id, searchQuery) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedTable, activeView, searchQuery, getFilteredRows, tablesMap]
  )

  const groupedRows = useMemo(
    () => (resolvedTable && activeView ? getGroupedRows(resolvedTable.id, activeView.id, searchQuery) : {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedTable, activeView, searchQuery, getGroupedRows, tablesMap]
  )

  // Existing table names for validation
  const existingTableNames = useMemo(() => {
    if (!database) return []
    return database.tables
      .map((tid) => tablesMap[tid]?.name ?? '')
      .filter((name) => name !== '')
  }, [database, tablesMap])

  // Existing tables info for FileUploadParser
  const existingTablesInfo = useMemo(() => {
    if (!database) return []
    return database.tables
      .map((tid) => {
        const t = tablesMap[tid]
        if (!t) return null
        return { id: t.id, name: t.name, fields: t.fields }
      })
      .filter((t): t is NonNullable<typeof t> => t !== null)
  }, [database, tablesMap])

  const handleSwitchTable = useCallback((tableId: string) => {
    setActiveTableId(tableId)
    const t = tablesMap[tableId]
    if (t?.views[0]) {
      setActiveViewId(t.views[0].id)
    }
    setSearchQuery('')
  }, [tablesMap])

  const handleAddRow = useCallback((cells?: Record<string, CellValue>) => {
    if (resolvedTable) addRow(resolvedTable.id, cells)
  }, [resolvedTable, addRow])

  const handleCellChange = useCallback((rowId: string, fieldId: string, value: CellValue) => {
    if (resolvedTable) updateCell(resolvedTable.id, rowId, fieldId, value)
  }, [resolvedTable, updateCell])

  const handleDeleteRow = useCallback((rowId: string) => {
    if (resolvedTable) deleteRow(resolvedTable.id, rowId)
  }, [resolvedTable, deleteRow])

  const handleAddField = useCallback(() => {
    if (resolvedTable) addField(resolvedTable.id, 'New Field', DbFieldType.Text)
  }, [resolvedTable, addField])

  const handleAddView = useCallback((type: ViewType) => {
    if (!resolvedTable) return
    const viewNames: Record<string, string> = {
      [ViewType.Grid]: 'Grid view',
      [ViewType.Kanban]: 'Board view',
      [ViewType.Calendar]: 'Calendar view',
      [ViewType.Gallery]: 'Gallery view',
      [ViewType.Form]: 'Form view',
    }
    const id = addView(resolvedTable.id, viewNames[type] ?? 'New view', type)
    setActiveViewId(id)
  }, [resolvedTable, addView])

  const handleFiltersChange = useCallback((filters: Filter[]) => {
    if (resolvedTable && activeView) updateView(resolvedTable.id, activeView.id, { filters })
  }, [resolvedTable, activeView, updateView])

  const handleSortsChange = useCallback((sorts: Sort[]) => {
    if (resolvedTable && activeView) updateView(resolvedTable.id, activeView.id, { sorts })
  }, [resolvedTable, activeView, updateView])

  const handleToggleField = useCallback((fieldId: string) => {
    if (!resolvedTable || !activeView) return
    const hidden = activeView.hiddenFields.includes(fieldId)
      ? activeView.hiddenFields.filter((id) => id !== fieldId)
      : [...activeView.hiddenFields, fieldId]
    updateView(resolvedTable.id, activeView.id, { hiddenFields: hidden })
  }, [resolvedTable, activeView, updateView])

  const handleTitleSave = useCallback(() => {
    if (database && titleDraft.trim()) {
      updateDatabase(database.id, { name: titleDraft.trim() })
    }
    setEditingTitle(false)
  }, [database, titleDraft, updateDatabase])

  const handleCreateTable = useCallback((name: string, icon: string) => {
    if (!databaseId) return
    const newTableId = addTable(databaseId, name, icon)
    setActiveTableId(newTableId)
    const t = useDatabaseStore.getState().tables[newTableId]
    if (t?.views[0]) {
      setActiveViewId(t.views[0].id)
    }
    setShowCreateTable(false)
  }, [databaseId, addTable])

  const handleCreateTableFromUpload = useCallback((
    name: string,
    icon: string,
    fields: Array<{ name: string; type: DbFieldTypeType }>,
    rowData: Array<Record<string, CellValue>>
  ) => {
    if (!databaseId) return
    const newTableId = addTableWithData(databaseId, name, icon, fields, rowData)
    setActiveTableId(newTableId)
    const t = useDatabaseStore.getState().tables[newTableId]
    if (t?.views[0]) {
      setActiveViewId(t.views[0].id)
    }
  }, [databaseId, addTableWithData])

  const handleImportToTable = useCallback((tableId: string, records: Partial<DbRow>[]) => {
    for (const record of records) {
      if (record.cells) {
        addRow(tableId, record.cells)
      }
    }
  }, [addRow])

  // Suppress unused variable
  void table

  if (!database || !resolvedTable) {
    return (
      <div className="db-detail-page__empty">
        <p>Database not found</p>
        <button className="btn-primary" onClick={() => navigate('/data')}>Back to Databases</button>
      </div>
    )
  }

  const titleField = resolvedTable.fields[0]
  const groupField = activeView?.groupBy ? resolvedTable.fields.find((f) => f.id === activeView.groupBy) : undefined
  const dateField = resolvedTable.fields.find((f) => f.type === DbFieldType.Date)

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

      {/* Table Tab Bar */}
      <div className="db-detail-page__table-tabs" role="tablist" aria-label="Database tables">
        {database.tables.map((tid) => {
          const t = tablesMap[tid]
          if (!t) return null
          const isActive = tid === resolvedTableId
          return (
            <button
              key={tid}
              className={`db-detail-page__table-tab ${isActive ? 'db-detail-page__table-tab--active' : ''}`}
              onClick={() => handleSwitchTable(tid)}
              role="tab"
              aria-selected={isActive}
              aria-label={`Table ${t.name}`}
            >
              <span className="db-detail-page__table-tab-icon">{t.icon}</span>
              <span className="db-detail-page__table-tab-name">{t.name}</span>
            </button>
          )
        })}
        <button
          className="db-detail-page__add-table-btn"
          onClick={() => setShowCreateTable(true)}
          aria-label="New Table"
        >
          <Plus size={14} />
          <span>New Table</span>
        </button>
        <button
          className="db-detail-page__upload-btn"
          onClick={() => setShowFileUpload(true)}
          aria-label="Upload File"
        >
          <Upload size={14} />
          <span>Upload File</span>
        </button>
      </div>

      {activeView && resolvedTable.views.length > 0 && (
        <ViewSwitcher
          views={resolvedTable.views}
          activeViewId={activeView.id}
          onSelectView={setActiveViewId}
          onAddView={handleAddView}
        />
      )}

      <ToolbarRow
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        fields={resolvedTable.fields}
        hiddenFields={activeView?.hiddenFields ?? []}
        onToggleField={handleToggleField}
      />

      {activeView && (
        <FilterBar
          fields={resolvedTable.fields}
          filters={activeView.filters}
          sorts={activeView.sorts}
          onFiltersChange={handleFiltersChange}
          onSortsChange={handleSortsChange}
        />
      )}

      <div className="db-detail-page__view">
        {activeView?.type === ViewType.Grid && (
          <GridView
            fields={resolvedTable.fields}
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
            groupField={groupField ?? resolvedTable.fields.find((f) => f.type === DbFieldType.Select)}
            groups={groupedRows}
            titleFieldId={titleField?.id ?? ''}
            onAddRow={handleAddRow}
            onRowClick={() => {}}
          />
        )}
        {activeView?.type === ViewType.Gallery && (
          <GalleryView
            fields={resolvedTable.fields}
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
            fields={resolvedTable.fields.filter((f) => f.type !== DbFieldType.CreatedTime && f.type !== DbFieldType.LastEditedTime)}
            onSubmit={(cells) => addRow(resolvedTable.id, cells)}
          />
        )}
      </div>

      {/* Create Table Modal */}
      {showCreateTable && databaseId && (
        <CreateTableModal
          databaseId={databaseId}
          existingTableNames={existingTableNames}
          onCreateTable={handleCreateTable}
          onClose={() => setShowCreateTable(false)}
        />
      )}

      {/* File Upload Parser Modal */}
      {showFileUpload && databaseId && (
        <FileUploadParser
          databaseId={databaseId}
          onCreateTable={handleCreateTableFromUpload}
          onImportToTable={handleImportToTable}
          existingTables={existingTablesInfo}
          onClose={() => setShowFileUpload(false)}
        />
      )}
    </div>
  )
}
