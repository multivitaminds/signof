// RFC 4180-compliant CSV parser using state machine approach

export interface CsvParseOptions {
  delimiter?: string
  hasHeaders?: boolean
  maxRows?: number
  trimValues?: boolean
}

export interface CsvParseError {
  row: number
  message: string
}

export interface CsvParseResult {
  headers: string[]
  rows: string[][]
  totalRows: number
  errors: CsvParseError[]
}

const State = {
  FieldStart: 0,
  UnquotedField: 1,
  QuotedField: 2,
  QuoteInQuotedField: 3,
} as const

type State = (typeof State)[keyof typeof State]

export function parseCsv(text: string, options?: CsvParseOptions): CsvParseResult {
  const delimiter = options?.delimiter ?? ','
  const hasHeaders = options?.hasHeaders ?? true
  const maxRows = options?.maxRows
  const trimValues = options?.trimValues ?? true

  const errors: CsvParseError[] = []
  const allRows: string[][] = []

  let state: State = State.FieldStart
  let field = ''
  let currentRow: string[] = []
  let rowIndex = 0
  let fieldIsQuoted = false

  function pushField() {
    const value = fieldIsQuoted ? field : (trimValues ? field.trim() : field)
    currentRow.push(value)
    field = ''
    fieldIsQuoted = false
  }

  function pushRow() {
    // Skip completely empty rows (single empty field)
    if (currentRow.length === 1 && currentRow[0] === '') {
      currentRow = []
      return
    }
    allRows.push(currentRow)
    rowIndex++
    currentRow = []
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    switch (state) {
      case State.FieldStart:
        if (ch === '"') {
          state = State.QuotedField
          fieldIsQuoted = true
        } else if (ch === delimiter) {
          pushField()
          // stay in FieldStart
        } else if (ch === '\r') {
          pushField()
          pushRow()
          // consume \n if CRLF
          if (i + 1 < text.length && text[i + 1] === '\n') i++
          state = State.FieldStart
        } else if (ch === '\n') {
          pushField()
          pushRow()
          state = State.FieldStart
        } else {
          field += ch
          state = State.UnquotedField
        }
        break

      case State.UnquotedField:
        if (ch === delimiter) {
          pushField()
          state = State.FieldStart
        } else if (ch === '\r') {
          pushField()
          pushRow()
          if (i + 1 < text.length && text[i + 1] === '\n') i++
          state = State.FieldStart
        } else if (ch === '\n') {
          pushField()
          pushRow()
          state = State.FieldStart
        } else {
          field += ch
        }
        break

      case State.QuotedField:
        if (ch === '"') {
          state = State.QuoteInQuotedField
        } else {
          field += ch
        }
        break

      case State.QuoteInQuotedField:
        if (ch === '"') {
          // Escaped quote
          field += '"'
          state = State.QuotedField
        } else if (ch === delimiter) {
          pushField()
          state = State.FieldStart
        } else if (ch === '\r') {
          pushField()
          pushRow()
          if (i + 1 < text.length && text[i + 1] === '\n') i++
          state = State.FieldStart
        } else if (ch === '\n') {
          pushField()
          pushRow()
          state = State.FieldStart
        } else {
          // Malformed: character after closing quote that isn't delimiter or newline
          field += ch
          state = State.UnquotedField
        }
        break
    }
  }

  // Handle last field/row
  if (field !== '' || currentRow.length > 0) {
    if (state === State.QuotedField) {
      errors.push({ row: rowIndex + 1, message: 'Unclosed quoted field' })
    }
    pushField()
    pushRow()
  }

  // Split headers vs data
  let headers: string[]
  let dataRows: string[][]

  if (hasHeaders && allRows.length > 0) {
    headers = allRows[0]!
    dataRows = allRows.slice(1)
  } else {
    const firstRow = allRows[0]
    const colCount = firstRow ? firstRow.length : 0
    headers = Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`)
    dataRows = allRows
  }

  const totalRows = dataRows.length
  const limitedRows = maxRows !== undefined ? dataRows.slice(0, maxRows) : dataRows

  return {
    headers,
    rows: limitedRows,
    totalRows,
    errors,
  }
}
