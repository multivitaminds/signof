import { useDatabaseStore } from './useDatabaseStore'
import { DbFieldType, ViewType } from '../types'

describe('useDatabaseStore', () => {
  beforeEach(() => {
    useDatabaseStore.setState({
      databases: {},
      tables: {},
    })
  })

  describe('Database CRUD', () => {
    it('adds a new database with a default table and view', () => {
      const id = useDatabaseStore.getState().addDatabase('My DB', '\u{1F4CA}', 'A test database')
      const state = useDatabaseStore.getState()

      const db = state.databases[id]
      expect(db).toBeDefined()
      if (!db) return
      expect(db.name).toBe('My DB')
      expect(db.icon).toBe('\u{1F4CA}')
      expect(db.description).toBe('A test database')
      expect(db.tables).toHaveLength(1)

      const tableId = db.tables[0]
      if (!tableId) return
      const table = state.tables[tableId]
      expect(table).toBeDefined()
      if (!table) return
      expect(table.name).toBe('Table 1')
      expect(table.fields).toHaveLength(1)
      expect(table.fields[0]?.name).toBe('Name')
      expect(table.fields[0]?.type).toBe(DbFieldType.Text)
      expect(table.views).toHaveLength(1)
      expect(table.views[0]?.type).toBe(ViewType.Grid)
    })

    it('updates a database name and description', () => {
      const id = useDatabaseStore.getState().addDatabase('Original', '\u{1F4CB}', '')
      useDatabaseStore.getState().updateDatabase(id, { name: 'Updated', description: 'New desc' })

      const db = useDatabaseStore.getState().databases[id]
      expect(db).toBeDefined()
      if (!db) return
      expect(db.name).toBe('Updated')
      expect(db.description).toBe('New desc')
    })

    it('deletes a database and its tables', () => {
      const id = useDatabaseStore.getState().addDatabase('To Delete', '\u{1F5D1}', '')
      const db = useDatabaseStore.getState().databases[id]
      expect(db).toBeDefined()
      if (!db) return
      const tableId = db.tables[0]
      if (!tableId) return

      expect(useDatabaseStore.getState().tables[tableId]).toBeDefined()

      useDatabaseStore.getState().deleteDatabase(id)

      expect(useDatabaseStore.getState().databases[id]).toBeUndefined()
      expect(useDatabaseStore.getState().tables[tableId]).toBeUndefined()
    })
  })

  describe('Row CRUD', () => {
    let tableId = ''

    beforeEach(() => {
      const dbId = useDatabaseStore.getState().addDatabase('Test', '\u{1F4CB}', '')
      const db = useDatabaseStore.getState().databases[dbId]
      if (db?.tables[0]) {
        tableId = db.tables[0]
      }
    })

    it('adds a row to a table', () => {
      const rowId = useDatabaseStore.getState().addRow(tableId, { name: 'Row 1' })
      const table = useDatabaseStore.getState().tables[tableId]
      expect(table).toBeDefined()
      if (!table) return

      expect(table.rows).toHaveLength(1)
      expect(table.rows[0]?.id).toBe(rowId)
      expect(table.rows[0]?.cells).toEqual({ name: 'Row 1' })
    })

    it('updates a cell value', () => {
      const rowId = useDatabaseStore.getState().addRow(tableId, { name: 'Before' })
      const table = useDatabaseStore.getState().tables[tableId]
      if (!table) return
      const fieldId = table.fields[0]?.id
      if (!fieldId) return

      useDatabaseStore.getState().updateCell(tableId, rowId, fieldId, 'After')

      const updated = useDatabaseStore.getState().tables[tableId]
      expect(updated).toBeDefined()
      if (!updated) return
      expect(updated.rows[0]?.cells[fieldId]).toBe('After')
    })

    it('deletes a row from a table', () => {
      const rowId = useDatabaseStore.getState().addRow(tableId)
      expect(useDatabaseStore.getState().tables[tableId]?.rows).toHaveLength(1)

      useDatabaseStore.getState().deleteRow(tableId, rowId)
      expect(useDatabaseStore.getState().tables[tableId]?.rows).toHaveLength(0)
    })

    it('duplicates a row', () => {
      const rowId = useDatabaseStore.getState().addRow(tableId, { title: 'Original' })
      const newId = useDatabaseStore.getState().duplicateRow(tableId, rowId)

      expect(newId).not.toBeNull()
      const table = useDatabaseStore.getState().tables[tableId]
      expect(table).toBeDefined()
      if (!table) return
      expect(table.rows).toHaveLength(2)
      expect(table.rows[1]?.cells).toEqual({ title: 'Original' })
      expect(table.rows[1]?.id).not.toBe(rowId)
    })
  })

  describe('Field CRUD', () => {
    let tableId = ''

    beforeEach(() => {
      const dbId = useDatabaseStore.getState().addDatabase('Test', '\u{1F4CB}', '')
      const db = useDatabaseStore.getState().databases[dbId]
      if (db?.tables[0]) {
        tableId = db.tables[0]
      }
    })

    it('adds a field to a table', () => {
      const fieldId = useDatabaseStore.getState().addField(tableId, 'Status', DbFieldType.Select)
      const table = useDatabaseStore.getState().tables[tableId]
      expect(table).toBeDefined()
      if (!table) return

      expect(table.fields).toHaveLength(2) // Name + Status
      const statusField = table.fields.find((f) => f.id === fieldId)
      expect(statusField).toBeDefined()
      expect(statusField?.name).toBe('Status')
      expect(statusField?.type).toBe(DbFieldType.Select)
    })

    it('deletes a field and removes it from rows and views', () => {
      const fieldId = useDatabaseStore.getState().addField(tableId, 'ToDelete', DbFieldType.Text)
      useDatabaseStore.getState().addRow(tableId, { [fieldId]: 'value' })

      useDatabaseStore.getState().deleteField(tableId, fieldId)

      const table = useDatabaseStore.getState().tables[tableId]
      expect(table).toBeDefined()
      if (!table) return
      expect(table.fields.find((f) => f.id === fieldId)).toBeUndefined()
      for (const row of table.rows) {
        expect(row.cells[fieldId]).toBeUndefined()
      }
    })
  })

  describe('View CRUD', () => {
    let tableId = ''

    beforeEach(() => {
      const dbId = useDatabaseStore.getState().addDatabase('Test', '\u{1F4CB}', '')
      const db = useDatabaseStore.getState().databases[dbId]
      if (db?.tables[0]) {
        tableId = db.tables[0]
      }
    })

    it('adds a view to a table', () => {
      const viewId = useDatabaseStore.getState().addView(tableId, 'Board', ViewType.Kanban)
      const table = useDatabaseStore.getState().tables[tableId]
      expect(table).toBeDefined()
      if (!table) return

      expect(table.views).toHaveLength(2) // Grid (default) + Kanban
      const kanban = table.views.find((v) => v.id === viewId)
      expect(kanban?.name).toBe('Board')
      expect(kanban?.type).toBe(ViewType.Kanban)
    })

    it('does not delete the last view', () => {
      const table = useDatabaseStore.getState().tables[tableId]
      if (!table) return
      const onlyViewId = table.views[0]?.id
      if (!onlyViewId) return

      useDatabaseStore.getState().deleteView(tableId, onlyViewId)

      expect(useDatabaseStore.getState().tables[tableId]?.views).toHaveLength(1)
    })
  })

  describe('Queries', () => {
    it('getDatabase returns the correct database', () => {
      const id = useDatabaseStore.getState().addDatabase('Query Test', '\u{1F50D}', '')
      const db = useDatabaseStore.getState().getDatabase(id)
      expect(db?.name).toBe('Query Test')
    })

    it('getDatabase returns undefined for nonexistent id', () => {
      const db = useDatabaseStore.getState().getDatabase('nonexistent')
      expect(db).toBeUndefined()
    })
  })
})
