import { useState, useCallback, useRef } from 'react'
import { X, Upload, FileText, AlertCircle, Check, Trash2 } from 'lucide-react'
import type { DbField, CellValue, DbRow } from '../../types'
import { DbFieldType, FIELD_TYPE_LABELS } from '../../types'
import type { DbFieldType as DbFieldTypeType } from '../../types'
import { parseCSV } from '../../lib/importExport'
import { parseUnstructuredText, detectFieldType, extractTextFromPDFBuffer } from '../../lib/textParser'
import './FileUploadParser.css'

interface DetectedColumn {
  name: string
  type: DbFieldTypeType
  values: string[]
}

interface ExistingTableInfo {
  id: string
  name: string
  fields: DbField[]
}

interface FileUploadParserProps {
  databaseId: string
  onCreateTable: (
    name: string,
    icon: string,
    fields: Array<{ name: string; type: DbFieldTypeType }>,
    rows: Array<Record<string, CellValue>>
  ) => void
  onImportToTable: (tableId: string, records: Partial<DbRow>[]) => void
  existingTables: ExistingTableInfo[]
  onClose: () => void
}

export default function FileUploadParser({
  databaseId,
  onCreateTable,
  onImportToTable,
  existingTables,
  onClose,
}: FileUploadParserProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [columns, setColumns] = useState<DetectedColumn[]>([])
  const [parsedRows, setParsedRows] = useState<string[][]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [importMode, setImportMode] = useState<'new' | 'existing'>('new')
  const [newTableName, setNewTableName] = useState('')
  const [selectedTableId, setSelectedTableId] = useState(existingTables[0]?.id ?? '')
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Suppress unused variable lint
  void databaseId

  const hasData = columns.length > 0 && parsedRows.length > 0

  const processData = useCallback((headers: string[], rows: string[][]) => {
    // Detect column types from values
    const detected: DetectedColumn[] = headers.map((name, colIdx) => {
      const values = rows.map((row) => row[colIdx] ?? '')
      const type = detectFieldType(values)
      return { name, type, values }
    })
    setColumns(detected)
    setParsedRows(rows)

    // Auto-map columns when importing to existing table
    const mapping: Record<number, string> = {}
    if (existingTables.length > 0) {
      const firstTable = existingTables[0]
      if (firstTable) {
        headers.forEach((header, idx) => {
          const match = firstTable.fields.find(
            (f) => f.name.toLowerCase() === header.toLowerCase().trim()
          )
          if (match) {
            mapping[idx] = match.id
          }
        })
      }
    }
    setColumnMapping(mapping)
  }, [existingTables])

  const handleCSVFile = useCallback((text: string) => {
    const { headers, rows } = parseCSV(text)
    if (headers.length === 0) {
      setErrors(['File appears to be empty or has no headers'])
      return
    }
    processData(headers, rows)
  }, [processData])

  const handlePDFFile = useCallback((buffer: ArrayBuffer) => {
    const text = extractTextFromPDFBuffer(buffer)
    if (!text.trim()) {
      setErrors(['Could not extract text from this PDF. The file may be image-based or encrypted.'])
      return
    }
    const { headers, rows } = parseUnstructuredText(text)
    if (headers.length === 0) {
      setErrors(['No structured data could be detected in this PDF'])
      return
    }
    processData(headers, rows)
  }, [processData])

  const handleFileSelect = useCallback((file: File) => {
    setErrors([])
    setColumns([])
    setParsedRows([])
    setFileName(file.name)

    const baseName = file.name.replace(/\.[^.]+$/, '')
    setNewTableName(baseName)

    if (file.name.toLowerCase().endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result
        if (typeof text === 'string') {
          handleCSVFile(text)
        }
      }
      reader.onerror = () => {
        setErrors(['Failed to read file'])
      }
      reader.readAsText(file)
    } else if (file.name.toLowerCase().endsWith('.pdf')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const buffer = e.target?.result
        if (buffer instanceof ArrayBuffer) {
          handlePDFFile(buffer)
        }
      }
      reader.onerror = () => {
        setErrors(['Failed to read file'])
      }
      reader.readAsArrayBuffer(file)
    } else {
      setErrors(['Unsupported file type. Please upload a CSV or PDF file.'])
    }
  }, [handleCSVFile, handlePDFFile])

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

  const handleColumnNameChange = useCallback((idx: number, newName: string) => {
    setColumns((prev) => prev.map((col, i) => (i === idx ? { ...col, name: newName } : col)))
  }, [])

  const handleColumnTypeChange = useCallback((idx: number, newType: DbFieldTypeType) => {
    setColumns((prev) => prev.map((col, i) => (i === idx ? { ...col, type: newType } : col)))
  }, [])

  const handleRemoveColumn = useCallback((idx: number) => {
    setColumns((prev) => prev.filter((_, i) => i !== idx))
    setParsedRows((prev) => prev.map((row) => row.filter((_, i) => i !== idx)))
  }, [])

  const handleCreateNewTable = useCallback(() => {
    if (!newTableName.trim()) {
      setErrors(['Please enter a table name'])
      return
    }

    const fieldDefs = columns.map((col) => ({ name: col.name, type: col.type }))
    const rowData: Array<Record<string, CellValue>> = parsedRows.map((row) => {
      const record: Record<string, CellValue> = {}
      columns.forEach((col, idx) => {
        const raw = row[idx] ?? ''
        record[col.name] = convertValue(raw, col.type)
      })
      return record
    })

    onCreateTable(newTableName.trim(), '\uD83D\uDCCB', fieldDefs, rowData)
    onClose()
  }, [newTableName, columns, parsedRows, onCreateTable, onClose])

  const handleImportToExisting = useCallback(() => {
    if (!selectedTableId) return
    const targetTable = existingTables.find((t) => t.id === selectedTableId)
    if (!targetTable) return

    const mappedFields = Object.entries(columnMapping)
      .map(([colIdx, fieldId]) => ({
        colIdx: Number(colIdx),
        field: targetTable.fields.find((f) => f.id === fieldId),
      }))
      .filter((m): m is { colIdx: number; field: DbField } => m.field !== undefined)

    if (mappedFields.length === 0) {
      setErrors(['No columns are mapped to fields'])
      return
    }

    const records: Partial<DbRow>[] = parsedRows.map((row) => {
      const cells: Record<string, CellValue> = {}
      for (const m of mappedFields) {
        const raw = m.colIdx < row.length ? (row[m.colIdx] ?? '') : ''
        cells[m.field.id] = convertValue(raw, m.field.type)
      }
      const ts = new Date().toISOString()
      return { cells, createdAt: ts, updatedAt: ts }
    })

    onImportToTable(selectedTableId, records)
    onClose()
  }, [selectedTableId, existingTables, columnMapping, parsedRows, onImportToTable, onClose])

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

  const handleClearFile = useCallback(() => {
    setFileName('')
    setColumns([])
    setParsedRows([])
    setErrors([])
    setNewTableName('')
    setColumnMapping({})
  }, [])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const selectedTable = existingTables.find((t) => t.id === selectedTableId)

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Upload File">
      <div className="modal-content file-upload-parser">
        <div className="modal-header">
          <h2>Upload File</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="file-upload-parser__body">
          {/* Dropzone */}
          {!hasData && errors.length === 0 && (
            <div
              className={`file-upload-parser__dropzone ${isDragging ? 'file-upload-parser__dropzone--active' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Drop CSV or PDF file here or click to browse"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
            >
              <Upload size={32} className="file-upload-parser__dropzone-icon" />
              <p className="file-upload-parser__dropzone-text">
                Drag & drop a file here, or click to browse
              </p>
              <p className="file-upload-parser__dropzone-hint">
                Supports CSV and PDF files
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.pdf"
                onChange={handleInputChange}
                className="file-upload-parser__file-input"
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
          )}

          {/* File info */}
          {fileName && (
            <div className="file-upload-parser__file-info">
              <FileText size={14} />
              <span>{fileName}</span>
              {hasData && (
                <span className="file-upload-parser__file-count">
                  {parsedRows.length} rows, {columns.length} columns
                </span>
              )}
              <button
                className="file-upload-parser__file-clear"
                onClick={handleClearFile}
                aria-label="Clear file"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="file-upload-parser__errors">
              <div className="file-upload-parser__errors-header">
                <AlertCircle size={14} />
                <span>{errors.length} issue{errors.length > 1 ? 's' : ''} found</span>
              </div>
              <ul className="file-upload-parser__errors-list">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Column Editor */}
          {hasData && (
            <>
              <div className="file-upload-parser__columns">
                <label className="file-upload-parser__section-label">
                  Detected Columns ({columns.length})
                </label>
                <div className="file-upload-parser__column-list">
                  {columns.map((col, idx) => (
                    <div key={idx} className="file-upload-parser__column-row">
                      <input
                        className="file-upload-parser__column-name"
                        type="text"
                        value={col.name}
                        onChange={(e) => handleColumnNameChange(idx, e.target.value)}
                        aria-label={`Column ${idx + 1} name`}
                      />
                      <select
                        className="file-upload-parser__column-type"
                        value={col.type}
                        onChange={(e) => handleColumnTypeChange(idx, e.target.value as DbFieldTypeType)}
                        aria-label={`Column ${idx + 1} type`}
                      >
                        {Object.entries(FIELD_TYPE_LABELS)
                          .filter(([key]) => key !== DbFieldType.CreatedTime && key !== DbFieldType.LastEditedTime && key !== DbFieldType.Attachment)
                          .map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                      </select>
                      <button
                        className="file-upload-parser__column-remove"
                        onClick={() => handleRemoveColumn(idx)}
                        aria-label={`Remove column ${col.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Table */}
              <div className="file-upload-parser__preview">
                <label className="file-upload-parser__section-label">
                  Data Preview (first {Math.min(parsedRows.length, 5)} rows)
                </label>
                <div className="file-upload-parser__table-wrapper">
                  <table className="file-upload-parser__table">
                    <thead>
                      <tr>
                        {columns.map((col, i) => (
                          <th key={i}>{col.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 5).map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {columns.map((_, colIdx) => (
                            <td key={colIdx}>{row[colIdx] ?? ''}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import mode */}
              <div className="file-upload-parser__mode">
                <label className="file-upload-parser__section-label">Import To</label>
                <div className="file-upload-parser__mode-options">
                  <label className="file-upload-parser__radio">
                    <input
                      type="radio"
                      name="import-mode"
                      value="new"
                      checked={importMode === 'new'}
                      onChange={() => setImportMode('new')}
                    />
                    <span>Create as New Table</span>
                  </label>
                  {existingTables.length > 0 && (
                    <label className="file-upload-parser__radio">
                      <input
                        type="radio"
                        name="import-mode"
                        value="existing"
                        checked={importMode === 'existing'}
                        onChange={() => setImportMode('existing')}
                      />
                      <span>Import to Existing Table</span>
                    </label>
                  )}
                </div>
              </div>

              {/* New table name */}
              {importMode === 'new' && (
                <div className="file-upload-parser__new-table">
                  <label className="file-upload-parser__section-label" htmlFor="new-table-name">
                    Table Name
                  </label>
                  <input
                    id="new-table-name"
                    className="file-upload-parser__input"
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Enter table name..."
                  />
                </div>
              )}

              {/* Existing table mapping */}
              {importMode === 'existing' && existingTables.length > 0 && (
                <div className="file-upload-parser__existing-table">
                  <label className="file-upload-parser__section-label" htmlFor="target-table">
                    Target Table
                  </label>
                  <select
                    id="target-table"
                    className="file-upload-parser__select"
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                  >
                    {existingTables.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>

                  {selectedTable && (
                    <div className="file-upload-parser__mapping">
                      <label className="file-upload-parser__section-label">Column Mapping</label>
                      <div className="file-upload-parser__mapping-grid">
                        <span className="file-upload-parser__mapping-header">File Column</span>
                        <span className="file-upload-parser__mapping-header">Table Field</span>
                        {columns.map((col, idx) => (
                          <div key={idx} className="file-upload-parser__mapping-row">
                            <span className="file-upload-parser__mapping-source">{col.name}</span>
                            <select
                              className="file-upload-parser__mapping-select"
                              value={columnMapping[idx] ?? ''}
                              onChange={(e) => handleColumnMap(idx, e.target.value)}
                            >
                              <option value="">-- Skip --</option>
                              {selectedTable.fields.map((f) => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        {hasData && (
          <div className="file-upload-parser__actions">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {importMode === 'new' ? (
              <button
                className="btn-primary"
                onClick={handleCreateNewTable}
                disabled={!newTableName.trim()}
              >
                <Check size={14} />
                Create Table with {parsedRows.length} Rows
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={handleImportToExisting}
                disabled={Object.keys(columnMapping).length === 0}
              >
                <Upload size={14} />
                Import {parsedRows.length} Records
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Value Conversion ─────────────────────────────────────────────

function convertValue(raw: string, type: DbFieldTypeType): CellValue {
  if (raw === '') return null

  switch (type) {
    case DbFieldType.Number: {
      const cleaned = raw.replace(/,/g, '')
      const num = Number(cleaned)
      return isNaN(num) ? raw : num
    }
    case DbFieldType.Checkbox: {
      const lower = raw.toLowerCase()
      if (lower === 'true' || lower === 'yes' || lower === '1') return true
      if (lower === 'false' || lower === 'no' || lower === '0') return false
      return raw
    }
    case DbFieldType.MultiSelect:
      return raw.split(',').map((s) => s.trim()).filter(Boolean)
    default:
      return raw
  }
}
