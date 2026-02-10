import { parseUnstructuredText, detectFieldType, extractTextFromPDFBuffer } from './textParser'
import { DbFieldType } from '../types'

// ─── parseUnstructuredText ──────────────────────────────────────────

describe('parseUnstructuredText', () => {
  it('parses tab-delimited text', () => {
    const text = 'Name\tAge\tCity\nAlice\t30\tNew York\nBob\t25\tBoston'
    const { headers, rows } = parseUnstructuredText(text)
    expect(headers).toEqual(['Name', 'Age', 'City'])
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual(['Alice', '30', 'New York'])
    expect(rows[1]).toEqual(['Bob', '25', 'Boston'])
  })

  it('parses comma-delimited text', () => {
    const text = 'Name,Email,Role\nAlice,alice@test.com,Admin\nBob,bob@test.com,User'
    const { headers, rows } = parseUnstructuredText(text)
    expect(headers).toEqual(['Name', 'Email', 'Role'])
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual(['Alice', 'alice@test.com', 'Admin'])
  })

  it('parses key-value pairs', () => {
    const text = 'Name: Alice\nEmail: alice@test.com\nAge: 30\nName: Bob\nEmail: bob@test.com\nAge: 25'
    const { headers, rows } = parseUnstructuredText(text)
    expect(headers).toContain('Name')
    expect(headers).toContain('Email')
    expect(headers).toContain('Age')
    expect(rows).toHaveLength(2)
  })

  it('falls back to Content column for plain text', () => {
    const text = 'Hello world\nThis is a paragraph\nAnother line'
    const { headers, rows } = parseUnstructuredText(text)
    expect(headers).toEqual(['Content'])
    expect(rows).toHaveLength(3)
    expect(rows[0]).toEqual(['Hello world'])
  })

  it('handles empty input', () => {
    const { headers, rows } = parseUnstructuredText('')
    expect(headers).toEqual([])
    expect(rows).toEqual([])
  })

  it('handles mixed delimiters by choosing the best match', () => {
    // Tab-delimited should win over comma since tabs are checked first
    const text = 'Name\tValue\nAlice, Bob\t100\nCharlie, Dave\t200'
    const { headers, rows } = parseUnstructuredText(text)
    expect(headers).toEqual(['Name', 'Value'])
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual(['Alice, Bob', '100'])
  })
})

// ─── detectFieldType ────────────────────────────────────────────────

describe('detectFieldType', () => {
  it('detects number field type', () => {
    const result = detectFieldType(['10', '20', '30', '42.5'])
    expect(result).toBe(DbFieldType.Number)
  })

  it('detects email field type', () => {
    const result = detectFieldType(['alice@test.com', 'bob@example.org', 'charlie@mail.net'])
    expect(result).toBe(DbFieldType.Email)
  })

  it('detects date field type', () => {
    const result = detectFieldType(['2024-01-15', '2024-02-20', '2024-03-10'])
    expect(result).toBe(DbFieldType.Date)
  })

  it('detects URL field type', () => {
    const result = detectFieldType(['https://example.com', 'http://test.org', 'https://foo.bar/baz'])
    expect(result).toBe(DbFieldType.Url)
  })
})

// ─── extractTextFromPDFBuffer ───────────────────────────────────────

describe('extractTextFromPDFBuffer', () => {
  it('extracts text from a simple PDF-like buffer with BT/ET blocks', () => {
    // Simulate a minimal PDF text object
    const pdfText = '%PDF-1.4\nBT (Hello World) Tj ET\nBT (Second Line) Tj ET'
    const encoder = new TextEncoder()
    const buffer = encoder.encode(pdfText).buffer as ArrayBuffer
    const result = extractTextFromPDFBuffer(buffer)
    expect(result).toContain('Hello World')
    expect(result).toContain('Second Line')
  })
})
