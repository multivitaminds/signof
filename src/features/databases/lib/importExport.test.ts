import { exportToCSV, exportToJSON, parseCSV, importFromCSV } from './importExport'
import type { DbField, DbRow } from '../types'
import { DbFieldType } from '../types'

// ─── Test Data ───────────────────────────────────────────────────────

const fields: DbField[] = [
  { id: 'f1', name: 'Name', type: DbFieldType.Text, width: 200 },
  { id: 'f2', name: 'Age', type: DbFieldType.Number, width: 100 },
  { id: 'f3', name: 'Email', type: DbFieldType.Email, width: 200 },
  { id: 'f4', name: 'Active', type: DbFieldType.Checkbox, width: 100 },
  {
    id: 'f5',
    name: 'Status',
    type: DbFieldType.Select,
    width: 120,
    options: {
      choices: [
        { id: 'c1', name: 'Open', color: '#3B82F6' },
        { id: 'c2', name: 'Closed', color: '#22C55E' },
      ],
    },
  },
]

const rows: DbRow[] = [
  {
    id: 'r1',
    cells: {
      f1: 'Alice',
      f2: 30,
      f3: 'alice@example.com',
      f4: true,
      f5: 'Open',
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'r2',
    cells: {
      f1: 'Bob',
      f2: 25,
      f3: 'bob@example.com',
      f4: false,
      f5: 'Closed',
    },
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
]

// ─── exportToCSV ─────────────────────────────────────────────────────

describe('exportToCSV', () => {
  it('generates correct headers', () => {
    const csv = exportToCSV(rows, fields)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Name,Age,Email,Active,Status')
  })

  it('exports all rows', () => {
    const csv = exportToCSV(rows, fields)
    const lines = csv.split('\n')
    expect(lines.length).toBe(3) // header + 2 rows
  })

  it('exports correct cell values', () => {
    const csv = exportToCSV(rows, fields)
    const lines = csv.split('\n')
    expect(lines[1]).toBe('Alice,30,alice@example.com,true,Open')
    expect(lines[2]).toBe('Bob,25,bob@example.com,false,Closed')
  })

  it('handles null values as empty strings', () => {
    const rowsWithNull: DbRow[] = [
      {
        id: 'r3',
        cells: { f1: 'Charlie', f2: null, f3: null, f4: false, f5: null },
        createdAt: '2026-01-03T00:00:00Z',
        updatedAt: '2026-01-03T00:00:00Z',
      },
    ]
    const csv = exportToCSV(rowsWithNull, fields)
    const lines = csv.split('\n')
    expect(lines[1]).toBe('Charlie,,,false,')
  })

  it('escapes commas in values', () => {
    const rowsWithComma: DbRow[] = [
      {
        id: 'r4',
        cells: { f1: 'Last, First', f2: 20, f3: 'test@test.com', f4: true, f5: 'Open' },
        createdAt: '2026-01-04T00:00:00Z',
        updatedAt: '2026-01-04T00:00:00Z',
      },
    ]
    const csv = exportToCSV(rowsWithComma, fields)
    const lines = csv.split('\n')
    expect(lines[1]).toContain('"Last, First"')
  })

  it('escapes quotes in values', () => {
    const rowsWithQuotes: DbRow[] = [
      {
        id: 'r5',
        cells: { f1: 'She said "hi"', f2: 10, f3: 'a@b.com', f4: false, f5: 'Open' },
        createdAt: '2026-01-05T00:00:00Z',
        updatedAt: '2026-01-05T00:00:00Z',
      },
    ]
    const csv = exportToCSV(rowsWithQuotes, fields)
    const lines = csv.split('\n')
    expect(lines[1]).toContain('"She said ""hi"""')
  })

  it('handles empty rows array', () => {
    const csv = exportToCSV([], fields)
    const lines = csv.split('\n')
    expect(lines.length).toBe(1) // header only
    expect(lines[0]).toBe('Name,Age,Email,Active,Status')
  })
})

// ─── exportToJSON ────────────────────────────────────────────────────

describe('exportToJSON', () => {
  it('returns valid JSON', () => {
    const json = exportToJSON(rows, fields)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('exports correct record structure', () => {
    const json = exportToJSON(rows, fields)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveLength(2)
    expect(parsed[0]).toEqual({
      Name: 'Alice',
      Age: 30,
      Email: 'alice@example.com',
      Active: true,
      Status: 'Open',
    })
  })

  it('uses field names as keys', () => {
    const json = exportToJSON(rows, fields)
    const parsed = JSON.parse(json)
    const keys = Object.keys(parsed[0])
    expect(keys).toEqual(['Name', 'Age', 'Email', 'Active', 'Status'])
  })

  it('handles null values', () => {
    const rowsWithNull: DbRow[] = [
      {
        id: 'r3',
        cells: { f1: 'Test', f2: null },
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ]
    const json = exportToJSON(rowsWithNull, fields)
    const parsed = JSON.parse(json)
    expect(parsed[0].Age).toBeNull()
  })
})

// ─── parseCSV ────────────────────────────────────────────────────────

describe('parseCSV', () => {
  it('parses simple CSV', () => {
    const { headers, rows } = parseCSV('Name,Age\nAlice,30\nBob,25')
    expect(headers).toEqual(['Name', 'Age'])
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual(['Alice', '30'])
  })

  it('handles quoted fields with commas', () => {
    const { rows } = parseCSV('Name,City\n"Last, First","New York, NY"')
    expect(rows[0]).toEqual(['Last, First', 'New York, NY'])
  })

  it('handles escaped quotes', () => {
    const { rows } = parseCSV('Name\n"She said ""hello"""')
    expect(rows[0]).toEqual(['She said "hello"'])
  })

  it('handles empty CSV', () => {
    const { headers, rows } = parseCSV('')
    expect(headers).toEqual([])
    expect(rows).toEqual([])
  })

  it('handles header-only CSV', () => {
    const { headers, rows } = parseCSV('Name,Age')
    expect(headers).toEqual(['Name', 'Age'])
    expect(rows).toEqual([])
  })

  it('handles CRLF line endings', () => {
    const { headers, rows } = parseCSV('Name,Age\r\nAlice,30\r\nBob,25')
    expect(headers).toEqual(['Name', 'Age'])
    expect(rows).toHaveLength(2)
  })
})

// ─── importFromCSV ───────────────────────────────────────────────────

describe('importFromCSV', () => {
  it('imports matching columns', () => {
    const csv = 'Name,Age,Email\nAlice,30,alice@example.com\nBob,25,bob@example.com'
    const { records, errors } = importFromCSV(csv, 'db1', fields)
    expect(records).toHaveLength(2)
    expect(records[0]!.cells?.f1).toBe('Alice')
    expect(records[0]!.cells?.f2).toBe(30)
    expect(errors.length).toBe(0)
  })

  it('reports unmatched columns', () => {
    const csv = 'Name,Unknown\nAlice,test'
    const { errors } = importFromCSV(csv, 'db1', fields)
    expect(errors.some((e) => e.includes('Unknown'))).toBe(true)
  })

  it('validates number fields', () => {
    const csv = 'Name,Age\nAlice,notanumber'
    const { records, errors } = importFromCSV(csv, 'db1', fields)
    expect(errors.some((e) => e.includes('not a valid number'))).toBe(true)
    expect(records).toHaveLength(1)
    expect(records[0]!.cells?.f2).toBeNull()
  })

  it('validates email fields', () => {
    const csv = 'Name,Email\nAlice,invalid-email'
    const { errors } = importFromCSV(csv, 'db1', fields)
    expect(errors.some((e) => e.includes('not a valid email'))).toBe(true)
  })

  it('validates boolean fields', () => {
    const csv = 'Name,Active\nAlice,true\nBob,yes\nCharlie,maybe'
    const { records, errors } = importFromCSV(csv, 'db1', fields)
    expect(records[0]!.cells?.f4).toBe(true)
    expect(records[1]!.cells?.f4).toBe(true)
    expect(errors.some((e) => e.includes('not a valid boolean'))).toBe(true)
  })

  it('validates select fields against choices', () => {
    const csv = 'Name,Status\nAlice,Open\nBob,InvalidStatus'
    const { records, errors } = importFromCSV(csv, 'db1', fields)
    expect(records[0]!.cells?.f5).toBe('Open')
    expect(errors.some((e) => e.includes('not a valid option'))).toBe(true)
  })

  it('handles case-insensitive column matching', () => {
    const csv = 'name,age\nAlice,30'
    const { records, errors } = importFromCSV(csv, 'db1', fields)
    expect(records).toHaveLength(1)
    expect(records[0]!.cells?.f1).toBe('Alice')
    expect(errors.filter((e) => e.includes('does not match')).length).toBe(0)
  })

  it('returns errors for empty CSV', () => {
    const { records, errors } = importFromCSV('', 'db1', fields)
    expect(records).toHaveLength(0)
    expect(errors.some((e) => e.includes('empty'))).toBe(true)
  })

  it('returns errors when no columns match', () => {
    const csv = 'X,Y,Z\n1,2,3'
    const { records, errors } = importFromCSV(csv, 'db1', fields)
    expect(records).toHaveLength(0)
    expect(errors.some((e) => e.includes('No CSV columns matched'))).toBe(true)
  })

  it('sets createdAt and updatedAt on records', () => {
    const csv = 'Name\nAlice'
    const { records } = importFromCSV(csv, 'db1', fields)
    expect(records[0]!.createdAt).toBeDefined()
    expect(records[0]!.updatedAt).toBeDefined()
  })
})
