import { useState, useCallback, useRef } from 'react'
import { X, Download, Upload, FileText, AlertCircle } from 'lucide-react'
import type { DbField, DbRow } from '../../types'
import { exportToCSV, exportToJSON, parseCSV, importFromCSV, downloadFile } from '../../lib/importExport'
import './ImportExportModal.css'

type Tab = 'export' | 'import'
type ExportFormat = 'csv' | 'json'

interface ImportExportModalProps {
  fields: DbField[]
  rows: DbRow[]
  databaseId: string
  tableName: string
  onImport: (records: Partial<DbRow>[]) => void
  onClose: () => void
}

export default function ImportExportModal({
  fields,
  rows,
  databaseId,
  tableName,
  onImport,
  onClose,
}: ImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('export')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [csvContent, setCsvContent] = useState('')
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([])
  const [parsedRows, setParsedRows] = useState<string[][]>([])
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({})
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [importFileName, setImportFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Export ────────────────────────────────────────────────────────

  const getExportPreview = useCallback(() => {
    if (exportFormat === 'csv') {
      return exportToCSV(rows.slice(0, 5), fields)
    }
    return exportToJSON(rows.slice(0, 5), fields)
  }, [exportFormat, rows, fields])

  const handleDownload = useCallback(() => {
    if (exportFormat === 'csv') {
      const content = exportToCSV(rows, fields)
      downloadFile(content, `${tableName}.csv`, 'text/csv')
    } else {
      const content = exportToJSON(rows, fields)
      downloadFile(content, `${tableName}.json`, 'application/json')
    }
  }, [exportFormat, rows, fields, tableName])

  // ─── Import ────────────────────────────────────────────────────────

  const processCSVFile = useCallback((text: string) => {
    setCsvContent(text)
    setImportErrors([])
    const { headers, rows: parsed } = parseCSV(text)
    setParsedHeaders(headers)
    setParsedRows(parsed)

    // Auto-map columns by name match
    const mapping: Record<number, string> = {}
    headers.forEach((header, idx) => {
      const match = fields.find(
        (f) => f.name.toLowerCase() === header.toLowerCase().trim()
      )
      if (match) {
        mapping[idx] = match.id
      }
    })
    setColumnMapping(mapping)
  }, [fields])

  const handleFileSelect = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setImportErrors(['Only CSV files are supported'])
      return
    }
    setImportFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text === 'string') {
        processCSVFile(text)
      }
    }
    reader.readAsText(file)
  }, [processCSVFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleColumnMap = useCallback((colIdx: number, fieldId: string) => {
    setColumnMapping((prev) => {
      const next = { ...prev }
      if (fieldId === '') {
        delete next[colIdx]
      } else {
        next[colIdx] = fieldId
      }
      return next
    })
  }, [])

  const handleImport = useCallback(() => {
    if (!csvContent) return

    // Rebuild CSV with mapped columns
    const mappedFields = Object.entries(columnMapping)
      .map(([colIdx, fieldId]) => ({
        colIdx: Number(colIdx),
        field: fields.find((f) => f.id === fieldId),
      }))
      .filter((m): m is { colIdx: number; field: DbField } => m.field !== undefined)

    if (mappedFields.length === 0) {
      setImportErrors(['No columns are mapped to fields'])
      return
    }

    // Build a new CSV with matched field names as headers
    const newHeaders = mappedFields.map((m) => m.field.name)
    const newRows = parsedRows.map((row) =>
      mappedFields.map((m) => (m.colIdx < row.length ? (row[m.colIdx] ?? '') : ''))
    )
    const rebuiltCSV = [
      newHeaders.join(','),
      ...newRows.map((r) => r.map((c) => {
        const cell = c ?? ''
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return '"' + cell.replace(/"/g, '""') + '"'
        }
        return cell
      }).join(',')),
    ].join('\n')

    const { records, errors } = importFromCSV(rebuiltCSV, databaseId, fields)
    setImportErrors(errors)

    if (records.length > 0) {
      onImport(records)
      if (errors.length === 0) {
        onClose()
      }
    }
  }, [csvContent, columnMapping, fields, parsedRows, databaseId, onImport, onClose])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Import Export">
      <div className="modal-content import-export-modal">
        <div className="modal-header">
          <h2>Import / Export</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="import-export-modal__tabs">
          <button
            className={`import-export-modal__tab ${activeTab === 'export' ? 'import-export-modal__tab--active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            <Download size={14} />
            Export
          </button>
          <button
            className={`import-export-modal__tab ${activeTab === 'import' ? 'import-export-modal__tab--active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            <Upload size={14} />
            Import
          </button>
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="import-export-modal__body">
            <div className="import-export-modal__format">
              <label className="import-export-modal__label">Format</label>
              <div className="import-export-modal__format-options">
                <label className="import-export-modal__radio">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={() => setExportFormat('csv')}
                  />
                  <span>CSV</span>
                </label>
                <label className="import-export-modal__radio">
                  <input
                    type="radio"
                    name="format"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={() => setExportFormat('json')}
                  />
                  <span>JSON</span>
                </label>
              </div>
            </div>

            <div className="import-export-modal__preview">
              <label className="import-export-modal__label">
                Preview ({rows.length} records{rows.length > 5 ? ', showing first 5' : ''})
              </label>
              <pre className="import-export-modal__code">{getExportPreview()}</pre>
            </div>

            <div className="import-export-modal__actions">
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleDownload}>
                <Download size={14} />
                Download {exportFormat.toUpperCase()}
              </button>
            </div>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="import-export-modal__body">
            {/* Dropzone */}
            {!csvContent && (
              <div
                className={`import-export-modal__dropzone ${isDragging ? 'import-export-modal__dropzone--active' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Drop CSV file here or click to browse"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
              >
                <FileText size={32} className="import-export-modal__dropzone-icon" />
                <p className="import-export-modal__dropzone-text">
                  Drag & drop a CSV file here, or click to browse
                </p>
                <p className="import-export-modal__dropzone-hint">
                  Only .csv files are supported
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleInputChange}
                  className="import-export-modal__file-input"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>
            )}

            {/* Parsed data preview + mapping */}
            {csvContent && parsedHeaders.length > 0 && (
              <>
                <div className="import-export-modal__file-info">
                  <FileText size={14} />
                  <span>{importFileName}</span>
                  <span className="import-export-modal__file-count">
                    {parsedRows.length} rows
                  </span>
                  <button
                    className="import-export-modal__file-clear"
                    onClick={() => {
                      setCsvContent('')
                      setParsedHeaders([])
                      setParsedRows([])
                      setColumnMapping({})
                      setImportErrors([])
                      setImportFileName('')
                    }}
                    aria-label="Clear file"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Column mapping */}
                <div className="import-export-modal__mapping">
                  <label className="import-export-modal__label">Column Mapping</label>
                  <div className="import-export-modal__mapping-grid">
                    <span className="import-export-modal__mapping-header">CSV Column</span>
                    <span className="import-export-modal__mapping-header">Database Field</span>
                    {parsedHeaders.map((header, idx) => (
                      <div key={idx} className="import-export-modal__mapping-row">
                        <span className="import-export-modal__mapping-source">{header}</span>
                        <select
                          className="import-export-modal__mapping-select"
                          value={columnMapping[idx] ?? ''}
                          onChange={(e) => handleColumnMap(idx, e.target.value)}
                        >
                          <option value="">-- Skip --</option>
                          {fields.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview table */}
                <div className="import-export-modal__table-wrapper">
                  <label className="import-export-modal__label">
                    Data Preview (first {Math.min(parsedRows.length, 5)} rows)
                  </label>
                  <table className="import-export-modal__table">
                    <thead>
                      <tr>
                        {parsedHeaders.map((h, i) => (
                          <th key={i}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 5).map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Errors */}
            {importErrors.length > 0 && (
              <div className="import-export-modal__errors">
                <div className="import-export-modal__errors-header">
                  <AlertCircle size={14} />
                  <span>{importErrors.length} issue{importErrors.length > 1 ? 's' : ''} found</span>
                </div>
                <ul className="import-export-modal__errors-list">
                  {importErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            {csvContent && (
              <div className="import-export-modal__actions">
                <button className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleImport}
                  disabled={Object.keys(columnMapping).length === 0}
                >
                  <Upload size={14} />
                  Import {parsedRows.length} Records
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
