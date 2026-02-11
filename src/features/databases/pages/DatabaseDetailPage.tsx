import { useState, useMemo, useCallback } from 'react'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Upload, Plus, Zap, Palette } from 'lucide-react'
import { useDatabaseStore } from '../stores/useDatabaseStore'
import { ViewType, DbFieldType } from '../types'
import type { CellValue, Filter, Sort, DbRow, RowColorRule, RelationConfig, LookupConfig, RollupConfig, FormulaConfig } from '../types'
import type { DbFieldType as DbFieldTypeType } from '../types'
import ViewSwitcher from '../components/ViewSwitcher/ViewSwitcher'
import ToolbarRow from '../components/ToolbarRow/ToolbarRow'
import FilterBar from '../components/FilterBar/FilterBar'
import GridView from '../components/GridView/GridView'
import KanbanView from '../components/KanbanView/KanbanView'
import GalleryView from '../components/GalleryView/GalleryView'
import CalendarView from '../components/CalendarView/CalendarView'
import FormView from '../components/FormView/FormView'
import TimelineView from '../components/TimelineView/TimelineView'
import CreateTableModal from '../components/CreateTableModal/CreateTableModal'
import FileUploadParser from '../components/FileUploadParser/FileUploadParser'
import AutomationsPanel from '../components/AutomationsPanel/AutomationsPanel'
import RowDetailModal from '../components/RowDetailModal/RowDetailModal'
import FieldStats from '../components/FieldStats/FieldStats'
import RowColorSettings from '../components/RowColorSettings/RowColorSettings'
import { RowColorOperator } from '../types'
import './DatabaseDetailPage.css'

// ─── Row color matching ─────────────────────────────────────────────

function matchesColorRule(
  cellValue: CellValue,
  rule: RowColorRule
): boolean {
  const strVal = cellValue !== null && cellValue !== undefined ? String(cellValue) : ''

  switch (rule.operator) {
    case RowColorOperator.Equals:
      return strVal === rule.value
    case RowColorOperator.NotEquals:
      return strVal !== rule.value
    case RowColorOperator.Contains:
      return strVal.toLowerCase().includes(rule.value.toLowerCase())
    case RowColorOperator.Gt:
      return Number(strVal) > Number(rule.value)
    case RowColorOperator.Lt:
      return Number(strVal) < Number(rule.value)
    case RowColorOperator.IsEmpty:
      return strVal === ''
    case RowColorOperator.IsNotEmpty:
      return strVal !== ''
    default:
      return false
  }
}

function getRowColor(row: DbRow, rules: RowColorRule[]): string | undefined {
  for (const rule of rules) {
    const cellValue = row.cells[rule.fieldId] ?? null
    if (matchesColorRule(cellValue, rule)) {
      return rule.color
    }
  }
  return undefined
}

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
  const updateField = useDatabaseStore((s) => s.updateField)
  const addView = useDatabaseStore((s) => s.addView)
  const updateView = useDatabaseStore((s) => s.updateView)
  const getFilteredRows = useDatabaseStore((s) => s.getFilteredRows)

  const [searchQuery, setSearchQuery] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [showCreateTable, setShowCreateTable] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showAutomations, setShowAutomations] = useState(false)
  const [showRowColorSettings, setShowRowColorSettings] = useState(false)
  const [detailRowId, setDetailRowId] = useState<string | null>(null)

  // Per-view field selections
  const [kanbanFieldId, setKanbanFieldId] = useState<string | null>(null)
  const [calendarFieldId, setCalendarFieldId] = useState<string | null>(null)

  const database = databaseId ? databasesMap[databaseId] : undefined

  // Track active table by ID (default to first table)
  const [activeTableId, setActiveTableId] = useState(() => database?.tables[0] ?? '')

  // If activeTableId is stale or not set, fall back to first table
  const resolvedTableId = (activeTableId && tablesMap[activeTableId]) ? activeTableId : (database?.tables[0] ?? '')
  const resolvedTable = resolvedTableId ? tablesMap[resolvedTableId] : undefined

  const [activeViewId, setActiveViewId] = useState(() => resolvedTable?.views[0]?.id ?? '')

  const activeView = useMemo(
    () => resolvedTable?.views.find((v) => v.id === activeViewId) ?? resolvedTable?.views[0],
    [resolvedTable, activeViewId]
  )

  const debouncedSearch = useDebouncedValue(searchQuery, 200)

  const filteredRows = useMemo(
    () => (resolvedTable && activeView ? getFilteredRows(resolvedTable.id, activeView.id, debouncedSearch) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resolvedTable, activeView, debouncedSearch, getFilteredRows, tablesMap]
  )

  // Row color rules from active view
  const rowColorRules = useMemo(
    () => activeView?.rowColorRules ?? [],
    [activeView?.rowColorRules]
  )

  // Compute row colors
  const rowColors = useMemo(() => {
    if (rowColorRules.length === 0) return {}
    const colors: Record<string, string> = {}
    for (const row of filteredRows) {
      const color = getRowColor(row, rowColorRules)
      if (color) colors[row.id] = color
    }
    return colors
  }, [filteredRows, rowColorRules])

  // Resolve kanban and calendar field IDs
  const resolvedKanbanFieldId = useMemo(() => {
    if (!resolvedTable) return ''
    if (kanbanFieldId && resolvedTable.fields.find((f) => f.id === kanbanFieldId)) return kanbanFieldId
    if (activeView?.groupBy) return activeView.groupBy
    const selectField = resolvedTable.fields.find((f) => f.type === DbFieldType.Select)
    return selectField?.id ?? ''
  }, [resolvedTable, kanbanFieldId, activeView?.groupBy])

  const resolvedCalendarFieldId = useMemo(() => {
    if (!resolvedTable) return ''
    if (calendarFieldId && resolvedTable.fields.find((f) => f.id === calendarFieldId)) return calendarFieldId
    const dateField = resolvedTable.fields.find((f) => f.type === DbFieldType.Date)
    return dateField?.id ?? ''
  }, [resolvedTable, calendarFieldId])

  // Timeline date field IDs
  const timelineDateFieldIds = useMemo(() => {
    if (!resolvedTable) return { start: '', end: '' }
    const dateFields = resolvedTable.fields.filter((f) => f.type === DbFieldType.Date)
    const startId = activeView?.timelineStartFieldId ?? dateFields[0]?.id ?? ''
    const endId = activeView?.timelineEndFieldId ?? dateFields[1]?.id ?? dateFields[0]?.id ?? ''
    return { start: startId, end: endId }
  }, [resolvedTable, activeView?.timelineStartFieldId, activeView?.timelineEndFieldId])

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

  // Row detail modal
  const detailRow = useMemo(
    () => detailRowId ? filteredRows.find((r) => r.id === detailRowId) ?? null : null,
    [detailRowId, filteredRows]
  )
  const detailRowIndex = useMemo(
    () => detailRowId ? filteredRows.findIndex((r) => r.id === detailRowId) : -1,
    [detailRowId, filteredRows]
  )

  const handleSwitchTable = useCallback((tableId: string) => {
    setActiveTableId(tableId)
    const t = tablesMap[tableId]
    if (t?.views[0]) {
      setActiveViewId(t.views[0].id)
    }
    setSearchQuery('')
    setKanbanFieldId(null)
    setCalendarFieldId(null)
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

  const handleAddField = useCallback((
    name: string,
    type: DbFieldTypeType,
    config?: {
      relationConfig?: RelationConfig
      lookupConfig?: LookupConfig
      rollupConfig?: RollupConfig
      formulaConfig?: FormulaConfig
    }
  ) => {
    if (!resolvedTable) return
    const fieldId = addField(resolvedTable.id, name, type)
    if (config) {
      updateField(resolvedTable.id, fieldId, config)
    }
  }, [resolvedTable, addField, updateField])

  const handleAddView = useCallback((type: ViewType) => {
    if (!resolvedTable) return
    const viewNames: Record<string, string> = {
      [ViewType.Grid]: 'Grid view',
      [ViewType.Kanban]: 'Board view',
      [ViewType.Calendar]: 'Calendar view',
      [ViewType.Gallery]: 'Gallery view',
      [ViewType.Form]: 'Form view',
      [ViewType.Timeline]: 'Timeline view',
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

  const handleKanbanFieldChange = useCallback((fieldId: string) => {
    setKanbanFieldId(fieldId)
    if (resolvedTable && activeView) {
      updateView(resolvedTable.id, activeView.id, { groupBy: fieldId })
    }
  }, [resolvedTable, activeView, updateView])

  const handleCalendarFieldChange = useCallback((fieldId: string) => {
    setCalendarFieldId(fieldId)
  }, [])

  // Row detail navigation
  const handleRowClick = useCallback((rowId: string) => {
    setDetailRowId(rowId)
  }, [])

  const handleDetailNavigate = useCallback((direction: 'prev' | 'next') => {
    const idx = filteredRows.findIndex((r) => r.id === detailRowId)
    if (idx < 0) return
    const nextIdx = direction === 'prev' ? idx - 1 : idx + 1
    if (nextIdx >= 0 && nextIdx < filteredRows.length) {
      setDetailRowId(filteredRows[nextIdx]!.id)
    }
  }, [detailRowId, filteredRows])

  // Row color rules change
  const handleRowColorRulesChange = useCallback((rules: RowColorRule[]) => {
    if (resolvedTable && activeView) {
      updateView(resolvedTable.id, activeView.id, { rowColorRules: rules })
    }
  }, [resolvedTable, activeView, updateView])

  if (!database || !resolvedTable) {
    return (
      <div className="db-detail-page__empty">
        <p>Database not found</p>
        <button className="btn-primary" onClick={() => navigate('/data')}>Back to Databases</button>
      </div>
    )
  }

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

        {/* Header actions */}
        <div className="db-detail-page__header-actions">
          <button
            className="db-detail-page__action-btn"
            onClick={() => setShowAutomations(true)}
            aria-label="Automations"
            title="Automations"
          >
            <Zap size={16} />
          </button>
          <button
            className="db-detail-page__action-btn"
            onClick={() => setShowRowColorSettings(true)}
            aria-label="Row Color Rules"
            title="Row Color Rules"
          >
            <Palette size={16} />
          </button>
        </div>
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
          fields={resolvedTable.fields}
          kanbanFieldId={resolvedKanbanFieldId}
          calendarFieldId={resolvedCalendarFieldId}
          onKanbanFieldChange={handleKanbanFieldChange}
          onCalendarFieldChange={handleCalendarFieldChange}
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
          <>
            <GridView
              fields={resolvedTable.fields}
              rows={filteredRows}
              hiddenFields={activeView.hiddenFields}
              fieldOrder={activeView.fieldOrder}
              onCellChange={handleCellChange}
              onAddRow={() => handleAddRow()}
              onAddField={handleAddField}
              onDeleteRow={handleDeleteRow}
              tables={tablesMap}
              currentTableId={resolvedTableId}
              rowColors={rowColors}
              onRowClick={handleRowClick}
            />
            <FieldStats
              fields={resolvedTable.fields}
              rows={filteredRows}
              hiddenFields={activeView.hiddenFields}
              fieldOrder={activeView.fieldOrder}
            />
          </>
        )}
        {activeView?.type === ViewType.Kanban && resolvedKanbanFieldId && (
          <KanbanView
            table={resolvedTable}
            tables={tablesMap}
            groupFieldId={resolvedKanbanFieldId}
            onUpdateCell={handleCellChange}
            onAddRow={handleAddRow}
            onDeleteRow={handleDeleteRow}
            onCardOpen={handleRowClick}
          />
        )}
        {activeView?.type === ViewType.Gallery && (
          <GalleryView
            table={resolvedTable}
            tables={tablesMap}
            onUpdateCell={handleCellChange}
          />
        )}
        {activeView?.type === ViewType.Calendar && resolvedCalendarFieldId && (
          <CalendarView
            table={resolvedTable}
            tables={tablesMap}
            dateFieldId={resolvedCalendarFieldId}
            onUpdateCell={handleCellChange}
            onAddRow={handleAddRow}
          />
        )}
        {activeView?.type === ViewType.Form && (
          <FormView
            fields={resolvedTable.fields.filter((f) =>
              f.type !== DbFieldType.CreatedTime &&
              f.type !== DbFieldType.LastEditedTime &&
              f.type !== DbFieldType.Formula &&
              f.type !== DbFieldType.Lookup &&
              f.type !== DbFieldType.Rollup
            )}
            tableName={resolvedTable.name}
            formDescription={database.description}
            onSubmit={(cells) => addRow(resolvedTable.id, cells)}
          />
        )}
        {activeView?.type === ViewType.Timeline && timelineDateFieldIds.start && (
          <TimelineView
            table={resolvedTable}
            tables={tablesMap}
            startDateFieldId={timelineDateFieldIds.start}
            endDateFieldId={timelineDateFieldIds.end}
            onUpdateCell={handleCellChange}
            onRowClick={handleRowClick}
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

      {/* Automations Panel */}
      {showAutomations && (
        <AutomationsPanel
          fields={resolvedTable.fields}
          onClose={() => setShowAutomations(false)}
        />
      )}

      {/* Row Color Settings */}
      {showRowColorSettings && (
        <RowColorSettings
          fields={resolvedTable.fields}
          rules={rowColorRules}
          onRulesChange={handleRowColorRulesChange}
          onClose={() => setShowRowColorSettings(false)}
        />
      )}

      {/* Row Detail Modal */}
      {detailRow && detailRowIndex >= 0 && (
        <RowDetailModal
          table={resolvedTable}
          tables={tablesMap}
          row={detailRow}
          rowIndex={detailRowIndex}
          totalRows={filteredRows.length}
          onClose={() => setDetailRowId(null)}
          onUpdateCell={handleCellChange}
          onDeleteRow={(id) => { handleDeleteRow(id); setDetailRowId(null) }}
          onNavigate={handleDetailNavigate}
        />
      )}
    </div>
  )
}
