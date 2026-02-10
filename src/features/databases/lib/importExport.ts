import type { DbField, DbRow, CellValue } from '../types'
import { DbFieldType } from '../types'

// ─── CSV Escaping ────────────────────────────────────────────────────

function escapeCSVField(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

function cellValueToString(value: CellValue): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}

// ─── Export to CSV ───────────────────────────────────────────────────

export function exportToCSV(rows: DbRow[], fields: DbField[]): string {
  const headerLine = fields.map((f) => escapeCSVField(f.name)).join(',')

  const dataLines = rows.map((row) => {
    return fields
      .map((field) => {
        const val = row.cells[field.id] ?? null
        return escapeCSVField(cellValueToString(val))
      })
      .join(',')
  })

  return [headerLine, ...dataLines].join('\n')
}

// ─── Export to JSON ──────────────────────────────────────────────────

export function exportToJSON(rows: DbRow[], fields: DbField[]): string {
  const records = rows.map((row) => {
    const record: Record<string, CellValue> = {}
    for (const field of fields) {
      record[field.name] = row.cells[field.id] ?? null
    }
    return record
  })
  return JSON.stringify(records, null, 2)
}

// ─── Parse CSV ───────────────────────────────────────────────────────

export function parseCSV(csv: string): { headers: string[]; rows: string[][] } {
  const lines = parseCSVLines(csv.trim())
  if (lines.length === 0) return { headers: [], rows: [] }

  const firstLine = lines[0]
  if (!firstLine) return { headers: [], rows: [] }
  const headers: string[] = firstLine
  const rows: string[][] = lines.slice(1)
  return { headers, rows }
}

function parseCSVLines(text: string): string[][] {
  const results: string[][] = []
  let current: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0

  while (i < text.length) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          // Escaped quote
          field += '"'
          i += 2
          continue
        }
        // End of quoted field
        inQuotes = false
        i++
        continue
      }
      field += ch
      i++
      continue
    }

    if (ch === '"') {
      inQuotes = true
      i++
      continue
    }

    if (ch === ',') {
      current.push(field.trim())
      field = ''
      i++
      continue
    }

    if (ch === '\n' || ch === '\r') {
      current.push(field.trim())
      field = ''
      if (current.some((c) => c !== '')) {
        results.push(current)
      }
      current = []
      // Handle \r\n
      if (ch === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
        i++
      }
      i++
      continue
    }

    field += ch
    i++
  }

  // Last field
  current.push(field.trim())
  if (current.some((c) => c !== '')) {
    results.push(current)
  }

  return results
}

// ─── Import from CSV ─────────────────────────────────────────────────

export function importFromCSV(
  csv: string,
  databaseId: string,
  fields: DbField[]
): { records: Partial<DbRow>[]; errors: string[] } {
  const errors: string[] = []
  const { headers, rows } = parseCSV(csv)

  if (headers.length === 0) {
    errors.push('CSV file is empty or has no headers')
    return { records: [], errors }
  }

  // Build header → field mapping
  const fieldMap = new Map<number, DbField>()
  for (let col = 0; col < headers.length; col++) {
    const headerVal = headers[col]
    if (!headerVal) continue
    const header = headerVal.toLowerCase().trim()
    const match = fields.find((f) => f.name.toLowerCase() === header)
    if (match) {
      fieldMap.set(col, match)
    } else {
      errors.push(`Column "${headerVal}" does not match any field — skipped`)
    }
  }

  if (fieldMap.size === 0) {
    errors.push('No CSV columns matched database fields')
    return { records: [], errors }
  }

  const records: Partial<DbRow>[] = []

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx]
    if (!row) continue
    const cells: Record<string, CellValue> = {}
    let rowHasError = false

    for (const [col, field] of fieldMap.entries()) {
      const rawValue = col < row.length ? (row[col] ?? '') : ''

      const result = convertCellValue(rawValue, field)
      if (result.error) {
        errors.push(`Row ${rowIdx + 1}, column "${field.name}": ${result.error}`)
        rowHasError = true
      }
      cells[field.id] = result.value
    }

    if (!rowHasError || Object.keys(cells).length > 0) {
      const now = new Date().toISOString()
      records.push({
        cells,
        createdAt: now,
        updatedAt: now,
      })
    }
  }

  // Suppress the unused variable warning — databaseId is part of the public API
  // for future server-side validation and is included in the function signature
  // to maintain contract consistency
  void databaseId

  return { records, errors }
}

function convertCellValue(
  raw: string,
  field: DbField
): { value: CellValue; error?: string } {
  if (raw === '') return { value: null }

  switch (field.type) {
    case DbFieldType.Number: {
      const num = Number(raw)
      if (isNaN(num)) {
        return { value: null, error: `"${raw}" is not a valid number` }
      }
      return { value: num }
    }
    case DbFieldType.Checkbox: {
      const lower = raw.toLowerCase()
      if (lower === 'true' || lower === 'yes' || lower === '1') return { value: true }
      if (lower === 'false' || lower === 'no' || lower === '0') return { value: false }
      return { value: null, error: `"${raw}" is not a valid boolean` }
    }
    case DbFieldType.Select: {
      if (field.options?.choices) {
        const match = field.options.choices.find(
          (c) => c.name.toLowerCase() === raw.toLowerCase()
        )
        if (!match) {
          return {
            value: raw,
            error: `"${raw}" is not a valid option for "${field.name}"`,
          }
        }
        return { value: match.name }
      }
      return { value: raw }
    }
    case DbFieldType.MultiSelect: {
      const parts = raw.split(',').map((s) => s.trim()).filter(Boolean)
      if (field.options?.choices) {
        const validNames = new Set(field.options.choices.map((c) => c.name.toLowerCase()))
        const invalid = parts.filter((p) => !validNames.has(p.toLowerCase()))
        if (invalid.length > 0) {
          return {
            value: parts,
            error: `Invalid options: ${invalid.join(', ')}`,
          }
        }
      }
      return { value: parts }
    }
    case DbFieldType.Email: {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
        return { value: raw, error: `"${raw}" is not a valid email` }
      }
      return { value: raw }
    }
    case DbFieldType.Url: {
      try {
        new URL(raw)
        return { value: raw }
      } catch {
        return { value: raw, error: `"${raw}" is not a valid URL` }
      }
    }
    case DbFieldType.Date: {
      const d = new Date(raw)
      if (isNaN(d.getTime())) {
        return { value: raw, error: `"${raw}" is not a valid date` }
      }
      return { value: raw }
    }
    default:
      return { value: raw }
  }
}

// ─── File Download ───────────────────────────────────────────────────

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
