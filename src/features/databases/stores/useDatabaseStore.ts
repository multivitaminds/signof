import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Database, DbTable, DbField, DbRow, DbView, CellValue } from '../types'
import { DbFieldType, ViewType } from '../types'
import { sampleDatabase, sampleTable } from '../lib/sampleData'
import { applyFilters, applySorts, searchRows, groupRows } from '../lib/filterEngine'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function now(): string {
  return new Date().toISOString()
}

interface DatabaseState {
  databases: Record<string, Database>
  tables: Record<string, DbTable>

  // Database CRUD
  addDatabase: (name: string, icon: string, description: string) => string
  updateDatabase: (id: string, updates: Partial<Pick<Database, 'name' | 'icon' | 'description'>>) => void
  deleteDatabase: (id: string) => void

  // Table CRUD
  addTable: (databaseId: string, name: string, icon: string) => string
  updateTable: (id: string, updates: Partial<Pick<DbTable, 'name' | 'icon'>>) => void
  deleteTable: (databaseId: string, tableId: string) => void

  // Row CRUD
  addRow: (tableId: string, cells?: Record<string, CellValue>) => string
  updateCell: (tableId: string, rowId: string, fieldId: string, value: CellValue) => void
  deleteRow: (tableId: string, rowId: string) => void
  duplicateRow: (tableId: string, rowId: string) => string | null

  // Field CRUD
  addField: (tableId: string, name: string, type: DbFieldType) => string
  updateField: (tableId: string, fieldId: string, updates: Partial<DbField>) => void
  deleteField: (tableId: string, fieldId: string) => void

  // View CRUD
  addView: (tableId: string, name: string, type: ViewType) => string
  updateView: (tableId: string, viewId: string, updates: Partial<DbView>) => void
  deleteView: (tableId: string, viewId: string) => void

  // Queries
  getFilteredRows: (tableId: string, viewId: string, query?: string) => DbRow[]
  getGroupedRows: (tableId: string, viewId: string, query?: string) => Record<string, DbRow[]>
  getDatabase: (id: string) => Database | undefined
  getTable: (id: string) => DbTable | undefined
}

export const useDatabaseStore = create<DatabaseState>()(
  persist(
    (set, get) => ({
      databases: { [sampleDatabase.id]: sampleDatabase },
      tables: { [sampleTable.id]: sampleTable },

      addDatabase: (name, icon, description) => {
        const id = rid()
        const tableId = rid()
        const defaultField: DbField = { id: rid(), name: 'Name', type: DbFieldType.Text, width: 280 }
        const defaultView: DbView = {
          id: rid(), name: 'Grid view', type: ViewType.Grid, tableId,
          filters: [], sorts: [], hiddenFields: [], fieldOrder: [defaultField.id],
        }
        const table: DbTable = { id: tableId, name: 'Table 1', icon: '📋', fields: [defaultField], rows: [], views: [defaultView] }
        const db: Database = { id, name, icon, description, tables: [tableId], createdAt: now(), updatedAt: now() }

        set((s) => ({
          databases: { ...s.databases, [id]: db },
          tables: { ...s.tables, [tableId]: table },
        }))
        return id
      },

      updateDatabase: (id, updates) => {
        set((s) => {
          const db = s.databases[id]
          if (!db) return s
          return { databases: { ...s.databases, [id]: { ...db, ...updates, updatedAt: now() } } }
        })
      },

      deleteDatabase: (id) => {
        set((s) => {
          const db = s.databases[id]
          if (!db) return s
          const newDatabases = { ...s.databases }
          const newTables = { ...s.tables }
          for (const tid of db.tables) delete newTables[tid]
          delete newDatabases[id]
          return { databases: newDatabases, tables: newTables }
        })
      },

      addTable: (databaseId, name, icon) => {
        const id = rid()
        const defaultField: DbField = { id: rid(), name: 'Name', type: DbFieldType.Text, width: 280 }
        const defaultView: DbView = {
          id: rid(), name: 'Grid view', type: ViewType.Grid, tableId: id,
          filters: [], sorts: [], hiddenFields: [], fieldOrder: [defaultField.id],
        }
        const table: DbTable = { id, name, icon, fields: [defaultField], rows: [], views: [defaultView] }

        set((s) => {
          const db = s.databases[databaseId]
          if (!db) return s
          return {
            databases: { ...s.databases, [databaseId]: { ...db, tables: [...db.tables, id], updatedAt: now() } },
            tables: { ...s.tables, [id]: table },
          }
        })
        return id
      },

      updateTable: (id, updates) => {
        set((s) => {
          const table = s.tables[id]
          if (!table) return s
          return { tables: { ...s.tables, [id]: { ...table, ...updates } } }
        })
      },

      deleteTable: (databaseId, tableId) => {
        set((s) => {
          const db = s.databases[databaseId]
          if (!db) return s
          const newTables = { ...s.tables }
          delete newTables[tableId]
          return {
            databases: { ...s.databases, [databaseId]: { ...db, tables: db.tables.filter((t) => t !== tableId) } },
            tables: newTables,
          }
        })
      },

      addRow: (tableId, cells = {}) => {
        const id = rid()
        const row: DbRow = { id, cells, createdAt: now(), updatedAt: now() }
        set((s) => {
          const table = s.tables[tableId]
          if (!table) return s
          return { tables: { ...s.tables, [tableId]: { ...table, rows: [...table.rows, row] } } }
        })
        return id
      },

      updateCell: (tableId, rowId, fieldId, value) => {
        set((s) => {
          const table = s.tables[tableId]
          if (!table) return s
          const rows = table.rows.map((r) =>
            r.id === rowId ? { ...r, cells: { ...r.cells, [fieldId]: value }, updatedAt: now() } : r
          )
          return { tables: { ...s.tables, [tableId]: { ...table, rows } } }
        })
      },

      deleteRow: (tableId, rowId) => {
        set((s) => {
          const table = s.tables[tableId]
          if (!table) return s
          return { tables: { ...s.tables, [tableId]: { ...table, rows: table.rows.filter((r) => r.id !== rowId) } } }
        })
      },

      duplicateRow: (tableId, rowId) => {
        const state = get()
        const table = state.tables[tableId]
        if (!table) return null
        const row = table.rows.find((r) => r.id === rowId)
        if (!row) return null
        const newId = rid()
        const newRow: DbRow = { ...row, id: newId, createdAt: now(), updatedAt: now() }
        set((s) => ({
          tables: { ...s.tables, [tableId]: { ...table, rows: [...table.rows, newRow] } },
        }))
        return newId
      },

      addField: (tableId, name, type) => {
        const id = rid()
        const field: DbField = { id, name, type, width: 160 }
        set((s) => {
          const table = s.tables[tableId]
          if (!table) return s
          const views = table.views.map((v) => ({ ...v, fieldOrder: [...v.fieldOrder, id] }))
          return { tables: { ...s.tables, [tableId]: { ...table, fields: [...table.fields, field], views } } }
        })
        return id
      },

      updateField: (tableId, fieldId, updates) => {
        set((s) => {
          const table = s.tables[tableId]
          if (!table) return s
          const fields = table.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
          return { tables: { ...s.tables, [tableId]: { ...table, fields } } }
        })
      },

      deleteField: (tableId, fieldId) => {
        set((s) => {
          const table = s.tables[tableId]
          if (!table) return s
          const fields = table.fields.filter((f) => f.id !== fieldId)
          const rows = table.rows.map((r) => {
            const cells = { ...r.cells }
            delete cells[fieldId]
            return { ...r, cells }
          })
          const views = table.views.map((v) => ({
            ...v,
            fieldOrder: v.fieldOrder.filter((id) => id !== fieldId),
            hiddenFields: v.hiddenFields.filter((id) => id !== fieldId),
            filters: v.filters.filter((f) => f.fieldId !== fieldId),
            sorts: v.sorts.filter((s) => s.fieldId !== fieldId),
          }))
          return { tables: { ...s.tables, [tableId]: { ...table, fields, rows, views } } }
        })
      },

      addView: (tableId, name, type) => {
        const id = rid()
        const state = get()
        const table = state.tables[tableId]
        if (!table) return id
        const view: DbView = {
          id, name, type, tableId,
          filters: [], sorts: [], hiddenFields: [],
          fieldOrder: table.fields.map((f) => f.id),
        }
        set((s) => ({
          tables: { ...s.tables, [tableId]: { ...table, views: [...table.views, view] } },
        }))
        return id
      },

      updateView: (tableId, viewId, updates) => {
        set((s) => {
          const table = s.tables[tableId]
          if (!table) return s
          const views = table.views.map((v) => (v.id === viewId ? { ...v, ...updates } : v))
          return { tables: { ...s.tables, [tableId]: { ...table, views } } }
        })
      },

      deleteView: (tableId, viewId) => {
        set((s) => {
          const table = s.tables[tableId]
          if (!table || table.views.length <= 1) return s
          return { tables: { ...s.tables, [tableId]: { ...table, views: table.views.filter((v) => v.id !== viewId) } } }
        })
      },

      getFilteredRows: (tableId, viewId, query) => {
        const state = get()
        const table = state.tables[tableId]
        if (!table) return []
        const view = table.views.find((v) => v.id === viewId)
        if (!view) return table.rows

        let rows = table.rows
        if (query) rows = searchRows(rows, query)
        rows = applyFilters(rows, view.filters)
        rows = applySorts(rows, view.sorts, table.fields)
        return rows
      },

      getGroupedRows: (tableId, viewId, query) => {
        const state = get()
        const table = state.tables[tableId]
        if (!table) return {}
        const view = table.views.find((v) => v.id === viewId)
        if (!view || !view.groupBy) return { 'All': state.getFilteredRows(tableId, viewId, query) }

        const filtered = state.getFilteredRows(tableId, viewId, query)
        return groupRows(filtered, view.groupBy)
      },

      getDatabase: (id) => get().databases[id],
      getTable: (id) => get().tables[id],
    }),
    {
      name: 'signof-database-storage',
      partialize: (state) => ({
        databases: state.databases,
        tables: state.tables,
      }),
    }
  )
)
