// ─── Export Utilities ────────────────────────────────────────────────
// CSV (RFC 4180), JSON, and Markdown table export with browser download

export interface ExportColumn {
  key: string
  label: string
}

function escapeCSVField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function resolveValue(obj: Record<string, unknown>, key: string): string {
  const val = obj[key]
  if (val === null || val === undefined) return ''
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

export function exportToCSV(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
): void {
  const header = columns.map(c => escapeCSVField(c.label)).join(',')
  const rows = data.map(row =>
    columns.map(c => escapeCSVField(resolveValue(row, c.key))).join(','),
  )
  const csv = [header, ...rows].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`)
}

export function exportToJSON(data: unknown[], filename: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  triggerDownload(blob, filename.endsWith('.json') ? filename : `${filename}.json`)
}

export function exportToMarkdown(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
): void {
  const header = `| ${columns.map(c => c.label).join(' | ')} |`
  const separator = `| ${columns.map(() => '---').join(' | ')} |`
  const rows = data.map(
    row => `| ${columns.map(c => resolveValue(row, c.key).replace(/\|/g, '\\|')).join(' | ')} |`,
  )
  const md = [header, separator, ...rows].join('\n')
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  triggerDownload(blob, filename.endsWith('.md') ? filename : `${filename}.md`)
}

export type ExportFormat = 'csv' | 'json' | 'markdown'

export function exportData(
  format: ExportFormat,
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
): void {
  switch (format) {
    case 'csv':
      exportToCSV(data, columns, filename)
      break
    case 'json':
      exportToJSON(data, filename)
      break
    case 'markdown':
      exportToMarkdown(data, columns, filename)
      break
  }
}
