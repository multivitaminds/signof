import type { DbRow, DbField, Filter, Sort, CellValue } from '../types'
import { FilterOperator } from '../types'

function cellStr(val: CellValue | undefined): string {
  if (val === null || val === undefined) return ''
  if (Array.isArray(val)) return val.join(', ')
  return String(val)
}

function matchFilter(row: DbRow, filter: Filter): boolean {
  const val = row.cells[filter.fieldId]
  const str = cellStr(val)
  const target = filter.value

  switch (filter.operator) {
    case FilterOperator.Is:
      return str === target
    case FilterOperator.IsNot:
      return str !== target
    case FilterOperator.Contains:
      return str.toLowerCase().includes(target.toLowerCase())
    case FilterOperator.NotContains:
      return !str.toLowerCase().includes(target.toLowerCase())
    case FilterOperator.IsEmpty:
      return str === '' || val === null
    case FilterOperator.IsNotEmpty:
      return str !== '' && val !== null
    case FilterOperator.Gt:
      return Number(str) > Number(target)
    case FilterOperator.Lt:
      return Number(str) < Number(target)
    default:
      return true
  }
}

export function applyFilters(rows: DbRow[], filters: Filter[]): DbRow[] {
  if (filters.length === 0) return rows
  return rows.filter((row) => filters.every((f) => matchFilter(row, f)))
}

export function applySorts(rows: DbRow[], sorts: Sort[], fields: DbField[]): DbRow[] {
  if (sorts.length === 0) return rows

  return [...rows].sort((a, b) => {
    for (const sort of sorts) {
      const field = fields.find((f) => f.id === sort.fieldId)
      const aVal = a.cells[sort.fieldId]
      const bVal = b.cells[sort.fieldId]
      const aStr = cellStr(aVal)
      const bStr = cellStr(bVal)

      let cmp: number
      if (field?.type === 'number') {
        cmp = (Number(aStr) || 0) - (Number(bStr) || 0)
      } else {
        cmp = aStr.localeCompare(bStr)
      }

      if (cmp !== 0) {
        return sort.direction === 'desc' ? -cmp : cmp
      }
    }
    return 0
  })
}

export function searchRows(rows: DbRow[], query: string): DbRow[] {
  if (!query.trim()) return rows
  const q = query.toLowerCase()
  return rows.filter((row) =>
    Object.values(row.cells).some((val) =>
      cellStr(val).toLowerCase().includes(q)
    )
  )
}

export function groupRows(rows: DbRow[], fieldId: string): Record<string, DbRow[]> {
  const groups: Record<string, DbRow[]> = {}
  for (const row of rows) {
    const key = cellStr(row.cells[fieldId]) || 'Uncategorized'
    if (!groups[key]) groups[key] = []
    groups[key]!.push(row)
  }
  return groups
}
