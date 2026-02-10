import { DbFieldType } from '../types'
import type { DbFieldType as DbFieldTypeType } from '../types'

// ─── Parse Unstructured Text ────────────────────────────────────────

export function parseUnstructuredText(text: string): { headers: string[]; rows: string[][] } {
  if (!text || !text.trim()) {
    return { headers: [], rows: [] }
  }

  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  // Try tab-delimited
  const tabResult = tryDelimited(lines, '\t')
  if (tabResult) return tabResult

  // Try comma-delimited (but only if first line has commas and is consistent)
  const commaResult = tryDelimited(lines, ',')
  if (commaResult) return commaResult

  // Try pipe-delimited
  const pipeResult = tryDelimited(lines, '|')
  if (pipeResult) return pipeResult

  // Try key-value pairs (Pattern: "Key: Value")
  const kvResult = tryKeyValuePairs(lines)
  if (kvResult) return kvResult

  // Try multi-space delimited (two or more spaces)
  const multiSpaceResult = tryMultiSpaceDelimited(lines)
  if (multiSpaceResult) return multiSpaceResult

  // Fallback: single "Content" column with each non-empty line as a row
  return {
    headers: ['Content'],
    rows: lines.map((line) => [line.trim()]),
  }
}

function tryDelimited(
  lines: string[],
  delimiter: string
): { headers: string[]; rows: string[][] } | null {
  const firstLine = lines[0]
  if (!firstLine) return null

  const headerParts = splitByDelimiter(firstLine, delimiter)
  if (headerParts.length < 2) return null

  // Check that at least 50% of data lines have the same number of columns
  const dataLines = lines.slice(1)
  if (dataLines.length === 0) {
    // Only header, no data
    return {
      headers: headerParts.map((h) => h.trim()),
      rows: [],
    }
  }

  let matchCount = 0
  for (const line of dataLines) {
    const parts = splitByDelimiter(line, delimiter)
    if (parts.length === headerParts.length) {
      matchCount++
    }
  }

  // Need at least 50% of data lines to match column count
  if (matchCount / dataLines.length < 0.5) return null

  const headers = headerParts.map((h) => h.trim())
  const rows = dataLines.map((line) => {
    const parts = splitByDelimiter(line, delimiter)
    // Pad or truncate to match header count
    const row: string[] = []
    for (let i = 0; i < headers.length; i++) {
      row.push(i < parts.length ? (parts[i] ?? '').trim() : '')
    }
    return row
  })

  return { headers, rows }
}

function splitByDelimiter(line: string, delimiter: string): string[] {
  if (delimiter === '|') {
    // For pipe, strip leading/trailing pipes
    const stripped = line.replace(/^\s*\|/, '').replace(/\|\s*$/, '')
    return stripped.split('|')
  }
  return line.split(delimiter)
}

function tryKeyValuePairs(lines: string[]): { headers: string[]; rows: string[][] } | null {
  // Check if lines look like "Key: Value" or "Key = Value"
  const kvPattern = /^([^:=]+)[=:](.+)$/
  let kvCount = 0
  const pairs: Array<{ key: string; value: string }> = []

  for (const line of lines) {
    const match = line.match(kvPattern)
    if (match && match[1] && match[2]) {
      kvCount++
      pairs.push({ key: match[1].trim(), value: match[2].trim() })
    }
  }

  // At least 60% of lines should be key-value pairs, and at least 2
  if (kvCount < 2 || kvCount / lines.length < 0.6) return null

  // Collect unique keys as headers
  const keySet = new Set<string>()
  for (const p of pairs) {
    keySet.add(p.key)
  }
  const headers = Array.from(keySet)

  // Group consecutive KV pairs into rows
  // A new "row" starts when we see a key that was already seen in the current row
  const rows: string[][] = []
  let currentRow: Record<string, string> = {}

  for (const p of pairs) {
    if (p.key in currentRow) {
      // Flush current row
      rows.push(headers.map((h) => currentRow[h] ?? ''))
      currentRow = {}
    }
    currentRow[p.key] = p.value
  }

  // Flush last row
  if (Object.keys(currentRow).length > 0) {
    rows.push(headers.map((h) => currentRow[h] ?? ''))
  }

  return { headers, rows }
}

function tryMultiSpaceDelimited(
  lines: string[]
): { headers: string[]; rows: string[][] } | null {
  const firstLine = lines[0]
  if (!firstLine) return null

  // Split on 2+ spaces
  const headerParts = firstLine.split(/\s{2,}/).filter((s) => s.trim() !== '')
  if (headerParts.length < 2) return null

  const dataLines = lines.slice(1)
  if (dataLines.length === 0) return null

  let matchCount = 0
  for (const line of dataLines) {
    const parts = line.split(/\s{2,}/).filter((s) => s.trim() !== '')
    if (parts.length === headerParts.length) {
      matchCount++
    }
  }

  if (matchCount / dataLines.length < 0.5) return null

  const headers = headerParts.map((h) => h.trim())
  const rows = dataLines.map((line) => {
    const parts = line.split(/\s{2,}/).filter((s) => s.trim() !== '')
    const row: string[] = []
    for (let i = 0; i < headers.length; i++) {
      row.push(i < parts.length ? (parts[i] ?? '').trim() : '')
    }
    return row
  })

  return { headers, rows }
}

// ─── Detect Field Type ──────────────────────────────────────────────

export function detectFieldType(values: string[]): DbFieldTypeType {
  const nonEmpty = values.filter((v) => v.trim() !== '')
  if (nonEmpty.length === 0) return DbFieldType.Text

  let numbers = 0
  let dates = 0
  let emails = 0
  let urls = 0
  let booleans = 0

  for (const val of nonEmpty) {
    const trimmed = val.trim()

    // Check boolean
    if (/^(true|false|yes|no)$/i.test(trimmed)) {
      booleans++
      continue
    }

    // Check number
    if (/^-?\d+(\.\d+)?$/.test(trimmed) || /^-?\d{1,3}(,\d{3})*(\.\d+)?$/.test(trimmed)) {
      numbers++
      continue
    }

    // Check email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      emails++
      continue
    }

    // Check URL
    if (/^https?:\/\/.+/.test(trimmed)) {
      urls++
      continue
    }

    // Check date
    if (isDateLike(trimmed)) {
      dates++
      continue
    }
  }

  const total = nonEmpty.length
  const threshold = 0.7

  if (booleans / total >= threshold) return DbFieldType.Checkbox
  if (numbers / total >= threshold) return DbFieldType.Number
  if (emails / total >= threshold) return DbFieldType.Email
  if (urls / total >= threshold) return DbFieldType.Url
  if (dates / total >= threshold) return DbFieldType.Date

  return DbFieldType.Text
}

function isDateLike(value: string): boolean {
  // Common date patterns
  const datePatterns = [
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/,               // 2024-01-15 or 2024/01/15
    /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/,              // 01/15/2024 or 1-15-24
    /^\w+ \d{1,2},?\s*\d{4}$/,                       // January 15, 2024
    /^\d{1,2} \w+ \d{4}$/,                           // 15 January 2024
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/,               // ISO 8601
  ]

  for (const pattern of datePatterns) {
    if (pattern.test(value)) return true
  }

  // Try native parse as fallback, but be strict
  const d = new Date(value)
  if (!isNaN(d.getTime()) && value.length > 5) {
    // Avoid matching plain numbers or short strings
    return true
  }

  return false
}

// ─── Extract Text from PDF Buffer ───────────────────────────────────

export function extractTextFromPDFBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const text = uint8ArrayToString(bytes)

  const extracted: string[] = []

  // Strategy 1: Extract text from BT...ET blocks (text objects)
  let pos = 0
  while (pos < text.length) {
    const btIdx = text.indexOf('BT', pos)
    if (btIdx === -1) break

    const etIdx = text.indexOf('ET', btIdx + 2)
    if (etIdx === -1) break

    const block = text.substring(btIdx + 2, etIdx)
    const blockTexts = extractTextFromBlock(block)
    if (blockTexts.length > 0) {
      extracted.push(blockTexts.join(''))
    }

    pos = etIdx + 2
  }

  if (extracted.length > 0) {
    return extracted.join('\n').trim()
  }

  // Strategy 2: Fallback - extract any text in parentheses from the whole document
  const parenTexts = extractParenthesizedText(text)
  if (parenTexts.length > 0) {
    return parenTexts.join('\n').trim()
  }

  // Strategy 3: Try to extract readable ASCII text
  return extractReadableText(text)
}

function uint8ArrayToString(bytes: Uint8Array): string {
  let result = ''
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i]
    if (byte !== undefined) {
      result += String.fromCharCode(byte)
    }
  }
  return result
}

function extractTextFromBlock(block: string): string[] {
  const results: string[] = []

  // Match Tj operator: (text) Tj
  const tjPattern = /\(([^)]*)\)\s*Tj/g
  let match: RegExpExecArray | null
  match = tjPattern.exec(block)
  while (match !== null) {
    if (match[1] !== undefined) {
      results.push(decodePDFString(match[1]))
    }
    match = tjPattern.exec(block)
  }

  // Match TJ operator: [(text) num (text)] TJ
  const tjArrayPattern = /\[([^\]]*)\]\s*TJ/g
  match = tjArrayPattern.exec(block)
  while (match !== null) {
    if (match[1] !== undefined) {
      const inner = match[1]
      const innerPattern = /\(([^)]*)\)/g
      let innerMatch: RegExpExecArray | null
      innerMatch = innerPattern.exec(inner)
      while (innerMatch !== null) {
        if (innerMatch[1] !== undefined) {
          results.push(decodePDFString(innerMatch[1]))
        }
        innerMatch = innerPattern.exec(inner)
      }
    }
    match = tjArrayPattern.exec(block)
  }

  return results
}

function decodePDFString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\([()])/g, '$1')
    .replace(/\\(\d{3})/g, (_m, octal: string) => String.fromCharCode(parseInt(octal, 8)))
}

function extractParenthesizedText(text: string): string[] {
  const results: string[] = []
  const pattern = /\(([^)]{2,})\)/g
  let match: RegExpExecArray | null
  match = pattern.exec(text)
  while (match !== null) {
    if (match[1] !== undefined) {
      const decoded = decodePDFString(match[1])
      // Only include if it has readable characters
      if (/[a-zA-Z0-9]/.test(decoded) && decoded.length > 1) {
        results.push(decoded)
      }
    }
    match = pattern.exec(text)
  }
  return results
}

function extractReadableText(text: string): string {
  // Extract sequences of printable ASCII characters
  const lines: string[] = []
  let currentLine = ''

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (code >= 32 && code <= 126) {
      currentLine += text[i]
    } else if (code === 10 || code === 13) {
      if (currentLine.trim().length > 3) {
        lines.push(currentLine.trim())
      }
      currentLine = ''
    }
  }

  if (currentLine.trim().length > 3) {
    lines.push(currentLine.trim())
  }

  return lines.join('\n')
}
