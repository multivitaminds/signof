import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportToCSV, exportToJSON, exportToMarkdown } from './exportUtils'

// Track what gets passed to Blob constructor and download attributes
let lastBlobContent: string
let lastBlobType: string
let lastFilename: string

const mockClick = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  lastBlobContent = ''
  lastBlobType = ''
  lastFilename = ''

  // Mock Blob to capture content
  vi.stubGlobal('Blob', class MockBlob {
    constructor(parts: string[], options?: { type?: string }) {
      lastBlobContent = parts.join('')
      lastBlobType = options?.type ?? ''
    }
  })

  // Mock URL methods
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn().mockReturnValue('blob:mock'),
    revokeObjectURL: vi.fn(),
  })

  // Mock document.createElement for the anchor
  vi.spyOn(document, 'createElement').mockReturnValue({
    set href(_v: string) { /* noop */ },
    set download(v: string) { lastFilename = v },
    click: mockClick,
  } as unknown as HTMLAnchorElement)
})

describe('exportUtils', () => {
  describe('exportToCSV', () => {
    it('generates valid CSV with header and data rows', () => {
      const data = [
        { name: 'Alice', age: '30' },
        { name: 'Bob', age: '25' },
      ]
      const columns = [
        { key: 'name', label: 'Name' },
        { key: 'age', label: 'Age' },
      ]

      exportToCSV(data, columns, 'test')

      expect(lastBlobContent).toBe('Name,Age\r\nAlice,30\r\nBob,25')
      expect(lastFilename).toBe('test.csv')
      expect(lastBlobType).toContain('text/csv')
      expect(mockClick).toHaveBeenCalledOnce()
    })

    it('escapes values containing commas with double quotes', () => {
      const data = [{ value: 'hello, world' }]
      const columns = [{ key: 'value', label: 'Value' }]

      exportToCSV(data, columns, 'test.csv')

      expect(lastBlobContent).toContain('"hello, world"')
    })

    it('escapes values containing double quotes by doubling them', () => {
      const data = [{ value: 'say "hi"' }]
      const columns = [{ key: 'value', label: 'Value' }]

      exportToCSV(data, columns, 'test')

      expect(lastBlobContent).toContain('"say ""hi"""')
    })

    it('handles null and undefined values as empty strings', () => {
      const data = [{ a: null, b: undefined }] as unknown as Record<string, unknown>[]
      const columns = [
        { key: 'a', label: 'A' },
        { key: 'b', label: 'B' },
      ]

      exportToCSV(data, columns, 'test')

      expect(lastBlobContent).toBe('A,B\r\n,')
    })

    it('escapes newlines in values', () => {
      const data = [{ value: 'line1\nline2' }]
      const columns = [{ key: 'value', label: 'Value' }]

      exportToCSV(data, columns, 'test')

      expect(lastBlobContent).toContain('"line1\nline2"')
    })
  })

  describe('exportToJSON', () => {
    it('generates pretty-printed JSON', () => {
      const data = [{ name: 'Alice' }, { name: 'Bob' }]

      exportToJSON(data, 'test')

      expect(JSON.parse(lastBlobContent)).toEqual(data)
      expect(lastBlobContent).toContain('  ')
      expect(lastFilename).toBe('test.json')
      expect(lastBlobType).toContain('application/json')
    })

    it('does not double-add .json extension', () => {
      exportToJSON([], 'already.json')
      expect(lastFilename).toBe('already.json')
    })
  })

  describe('exportToMarkdown', () => {
    it('generates a valid markdown table', () => {
      const data = [
        { name: 'Alice', role: 'Admin' },
        { name: 'Bob', role: 'User' },
      ]
      const columns = [
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
      ]

      exportToMarkdown(data, columns, 'test')

      const lines = lastBlobContent.split('\n')
      expect(lines[0]).toBe('| Name | Role |')
      expect(lines[1]).toBe('| --- | --- |')
      expect(lines[2]).toBe('| Alice | Admin |')
      expect(lines[3]).toBe('| Bob | User |')
      expect(lastFilename).toBe('test.md')
    })

    it('escapes pipe characters in values', () => {
      const data = [{ value: 'a | b' }]
      const columns = [{ key: 'value', label: 'Value' }]

      exportToMarkdown(data, columns, 'test')

      expect(lastBlobContent).toContain('a \\| b')
    })
  })
})
