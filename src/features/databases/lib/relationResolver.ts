import type { DbRow, DbField, DbTable, CellValue } from '../types'
import { DbFieldType } from '../types'

// ─── Helpers ────────────────────────────────────────────────────────

function toNumber(val: CellValue): number {
  if (val === null || val === undefined) return 0
  if (typeof val === 'boolean') return val ? 1 : 0
  if (typeof val === 'number') return val
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

// ─── Get Related Rows ───────────────────────────────────────────────

export function getRelatedRows(
  rowIds: string[],
  targetTableId: string,
  tables: Record<string, DbTable>
): DbRow[] {
  const targetTable = tables[targetTableId]
  if (!targetTable) return []
  return rowIds
    .map((id) => targetTable.rows.find((r) => r.id === id))
    .filter((r): r is DbRow => r !== undefined)
}

// ─── Aggregate Values ───────────────────────────────────────────────

export function aggregateValues(
  values: CellValue[],
  aggregation: string
): CellValue {
  switch (aggregation) {
    case 'count':
      return values.length

    case 'sum': {
      return values.reduce((acc: number, v) => acc + toNumber(v), 0)
    }

    case 'avg': {
      if (values.length === 0) return 0
      const sum = values.reduce((acc: number, v) => acc + toNumber(v), 0)
      return sum / values.length
    }

    case 'min': {
      if (values.length === 0) return null
      const nums = values.map(toNumber)
      return Math.min(...nums)
    }

    case 'max': {
      if (values.length === 0) return null
      const nums = values.map(toNumber)
      return Math.max(...nums)
    }

    case 'percent_empty': {
      if (values.length === 0) return 0
      const emptyCount = values.filter(
        (v) => v === null || v === undefined || v === ''
      ).length
      return Math.round((emptyCount / values.length) * 100)
    }

    case 'percent_filled': {
      if (values.length === 0) return 0
      const filledCount = values.filter(
        (v) => v !== null && v !== undefined && v !== ''
      ).length
      return Math.round((filledCount / values.length) * 100)
    }

    default:
      return null
  }
}

// ─── Resolve Relation ───────────────────────────────────────────────

export function resolveRelation(
  row: DbRow,
  field: DbField,
  tables: Record<string, DbTable>,
  currentTableFields?: DbField[]
): CellValue {
  switch (field.type) {
    case DbFieldType.Relation: {
      // Relation cells store linked row IDs as string[]
      const val = row.cells[field.id]
      if (!val) return null
      if (Array.isArray(val)) return val
      // If stored as single string, wrap in array
      return [String(val)]
    }

    case DbFieldType.Lookup: {
      const config = field.lookupConfig
      if (!config) return null

      // Find the relation field we're looking through
      const allFields = currentTableFields ?? []
      const relationField = allFields.find((f) => f.id === config.relationFieldId)
      if (!relationField || !relationField.relationConfig) return null

      // Get the linked row IDs from the relation field
      const linkedIds = row.cells[relationField.id]
      if (!linkedIds) return null
      const ids = Array.isArray(linkedIds) ? linkedIds : [String(linkedIds)]

      // Get the related rows from the target table
      const targetTableId = relationField.relationConfig.targetTableId
      const relatedRows = getRelatedRows(ids, targetTableId, tables)

      // Pull the target field values
      const values = relatedRows.map((r) => r.cells[config.targetFieldId] ?? null)

      // Return as array if multiple, single value if one
      if (values.length === 0) return null
      if (values.length === 1) return values[0] ?? null
      // Flatten to string for display
      return values.map((v) => (v !== null ? String(v) : '')).join(', ')
    }

    case DbFieldType.Rollup: {
      const config = field.rollupConfig
      if (!config) return null

      // Find the relation field
      const allFields = currentTableFields ?? []
      const relationField = allFields.find((f) => f.id === config.relationFieldId)
      if (!relationField || !relationField.relationConfig) return null

      // Get linked row IDs
      const linkedIds = row.cells[relationField.id]
      if (!linkedIds) return aggregateValues([], config.aggregation)
      const ids = Array.isArray(linkedIds) ? linkedIds : [String(linkedIds)]

      // Get related rows and extract target field values
      const targetTableId = relationField.relationConfig.targetTableId
      const relatedRows = getRelatedRows(ids, targetTableId, tables)
      const values = relatedRows.map((r) => r.cells[config.targetFieldId] ?? null)

      return aggregateValues(values, config.aggregation)
    }

    default:
      return row.cells[field.id] ?? null
  }
}
