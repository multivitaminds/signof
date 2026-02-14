import { useState, useRef, useCallback, useMemo } from 'react'
import { parseCsv } from '../../lib/csvParser'
import type { CsvParseResult } from '../../lib/csvParser'
import type { ImportConfig, ImportFieldConfig } from '../../lib/importConfigs'
import './BulkImportModal.css'

interface BulkImportModalProps<T> {
  config: ImportConfig<T>
  onImport: (items: Partial<T>[]) => void
  onClose: () => void
  onImportComplete?: (count: number) => void
}

type Step = 1 | 2 | 3 | 4

const STEP_LABELS = ['Upload', 'Map Columns', 'Preview', 'Done']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function autoMapHeaders(
  csvHeaders: string[],
  fields: ImportFieldConfig[]
): Record<string, string> {
  const mapping: Record<string, string> = {}

  for (const field of fields) {
    const matchCandidates = [field.key, field.label, ...field.aliases].map(a =>
      a.toLowerCase().replace(/[^a-z0-9]/g, '')
    )

    for (const csvHeader of csvHeaders) {
      const normalized = csvHeader.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (matchCandidates.includes(normalized)) {
        mapping[field.key] = csvHeader
        break
      }
    }
  }

  return mapping
}

function BulkImportModal<T>({
  config,
  onImport,
  onClose,
  onImportComplete,
}: BulkImportModalProps<T>) {
  const [step, setStep] = useState<Step>(1)
  const [csvResult, setCsvResult] = useState<CsvParseResult | null>(null)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [importValidOnly, setImportValidOnly] = useState(true)
  const [importedCount, setImportedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Step 1: Upload handlers ──────────────────────────────

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please upload a CSV file')
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('File is too large. Maximum size is 10MB')
        return
      }

      setError(null)
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result
        if (typeof text !== 'string') return
        const result = parseCsv(text)
        setCsvResult(result)
        const autoMap = autoMapHeaders(result.headers, config.fields)
        setColumnMapping(autoMap)
        setStep(2)
      }
      reader.readAsText(file)
    },
    [config.fields]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleZoneClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // ─── Step 2: Mapping handlers ─────────────────────────────

  const handleMappingChange = useCallback(
    (fieldKey: string, csvHeader: string) => {
      setColumnMapping(prev => ({
        ...prev,
        [fieldKey]: csvHeader,
      }))
    },
    []
  )

  const sampleBlobUrl = useMemo(() => {
    const blob = new Blob([config.sampleCsv], { type: 'text/csv' })
    return URL.createObjectURL(blob)
  }, [config.sampleCsv])

  // ─── Step 3: Validation ───────────────────────────────────

  const validationResults = useMemo(() => {
    if (!csvResult) return []

    const previewRows = csvResult.rows.slice(0, 10)
    return previewRows.map(row => {
      const mapped: Record<string, string> = {}
      for (const field of config.fields) {
        const csvHeader = columnMapping[field.key]
        if (csvHeader) {
          const colIndex = csvResult.headers.indexOf(csvHeader)
          if (colIndex >= 0) {
            mapped[field.key] = row[colIndex] ?? ''
          }
        }
      }
      return {
        row,
        mapped,
        result: config.validate(mapped),
      }
    })
  }, [csvResult, columnMapping, config])

  // Total counts across all rows (not just preview)
  const allRowValidation = useMemo(() => {
    if (!csvResult) return { valid: 0, errors: 0 }
    let valid = 0
    let errors = 0
    for (const row of csvResult.rows) {
      const mapped: Record<string, string> = {}
      for (const field of config.fields) {
        const csvHeader = columnMapping[field.key]
        if (csvHeader) {
          const colIndex = csvResult.headers.indexOf(csvHeader)
          if (colIndex >= 0) {
            mapped[field.key] = row[colIndex] ?? ''
          }
        }
      }
      const result = config.validate(mapped)
      if (result.valid) valid++
      else errors++
    }
    return { valid, errors }
  }, [csvResult, columnMapping, config])

  // ─── Step 4: Import ───────────────────────────────────────

  const handleImport = useCallback(() => {
    if (!csvResult) return

    const items: Partial<T>[] = []
    for (const row of csvResult.rows) {
      const mapped: Record<string, string> = {}
      for (const field of config.fields) {
        const csvHeader = columnMapping[field.key]
        if (csvHeader) {
          const colIndex = csvResult.headers.indexOf(csvHeader)
          if (colIndex >= 0) {
            mapped[field.key] = row[colIndex] ?? ''
          }
        }
      }
      const result = config.validate(mapped)
      if (importValidOnly && !result.valid) continue
      items.push(result.data)
    }

    onImport(items)
    setImportedCount(items.length)
    onImportComplete?.(items.length)
    setStep(4)
  }, [csvResult, config, columnMapping, importValidOnly, onImport, onImportComplete])

  // ─── Render helpers ───────────────────────────────────────

  const mappedFieldKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const field of config.fields) {
      if (columnMapping[field.key]) keys.add(field.key)
    }
    return keys
  }, [config.fields, columnMapping])

  const errorFieldsForRow = useCallback(
    (rowResult: { result: { errors: string[] } }) => {
      const errorFields = new Set<string>()
      for (const err of rowResult.result.errors) {
        for (const field of config.fields) {
          if (err.startsWith(field.label)) {
            errorFields.add(field.key)
          }
        }
      }
      return errorFields
    },
    [config.fields]
  )

  // ─── Step indicator ───────────────────────────────────────

  function renderSteps() {
    return (
      <div className="bulk-import__steps" aria-label="Import steps">
        {STEP_LABELS.map((label, i) => {
          const stepNum = (i + 1) as Step
          let className = 'bulk-import__step'
          if (stepNum === step) className += ' bulk-import__step--active'
          else if (stepNum < step) className += ' bulk-import__step--done'

          return (
            <span key={label}>
              {i > 0 && <span className="bulk-import__step-separator" />}
              <span className={className}>
                <span className="bulk-import__step-dot">{stepNum < step ? '\u2713' : stepNum}</span>
                <span className="bulk-import__step-label">{label}</span>
              </span>
            </span>
          )
        })}
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="modal-overlay bulk-import" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label={`Import ${config.entityName}s`}
      >
        <div className="modal-header">
          <h2>Import {config.entityName}s</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {renderSteps()}

        {/* Step 1: Upload */}
        {step === 1 && (
          <div>
            <div
              className={`bulk-import__dropzone${dragOver ? ' bulk-import__dropzone--active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleZoneClick}
              role="button"
              tabIndex={0}
              aria-label="Upload CSV file"
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') handleZoneClick()
              }}
            >
              <div className="bulk-import__dropzone-icon" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M20 4L12 14H17V24H23V14H28L20 4Z" fill="currentColor" />
                  <path d="M6 28V34C6 35 6.9 36 8 36H32C33.1 36 34 35 34 34V28H30V32H10V28H6Z" fill="currentColor" />
                </svg>
              </div>
              <p className="bulk-import__dropzone-text">
                Drag and drop a CSV file here, or click to browse
              </p>
              <p className="bulk-import__dropzone-hint">
                .csv files only — Max 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="bulk-import__file-input"
                accept=".csv"
                onChange={handleInputChange}
                aria-label="CSV file input"
              />
            </div>
            {error && (
              <p className="bulk-import__error" role="alert">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Step 2: Map Columns */}
        {step === 2 && csvResult && (
          <div>
            <div className="bulk-import__mapping-list">
              {config.fields.map(field => (
                <div key={field.key} className="bulk-import__mapping-row">
                  <label className="bulk-import__mapping-label">
                    {field.label}
                    {field.required && (
                      <span className="bulk-import__mapping-required">*</span>
                    )}
                  </label>
                  <select
                    className="bulk-import__mapping-select"
                    value={columnMapping[field.key] ?? ''}
                    onChange={e => handleMappingChange(field.key, e.target.value)}
                    aria-label={`Map ${field.label}`}
                  >
                    <option value="">— Skip —</option>
                    {csvResult.headers.map(h => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <a
              className="bulk-import__sample-link"
              href={sampleBlobUrl}
              download={`${config.entityName.toLowerCase()}-sample.csv`}
            >
              Download sample CSV
            </a>
            <div className="bulk-import__actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn-primary" onClick={() => setStep(3)}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Validate */}
        {step === 3 && csvResult && (
          <div>
            <div className="bulk-import__summary">
              <span className="bulk-import__summary-valid">
                {allRowValidation.valid} valid
              </span>
              <span className="bulk-import__summary-errors">
                {allRowValidation.errors} errors
              </span>
            </div>

            <div className="bulk-import__table-wrap">
              <table className="bulk-import__table">
                <thead>
                  <tr>
                    {config.fields
                      .filter(f => mappedFieldKeys.has(f.key))
                      .map(f => (
                        <th key={f.key}>{f.label}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {validationResults.map((vr, i) => {
                    const errFields = errorFieldsForRow(vr)
                    return (
                      <tr key={i}>
                        {config.fields
                          .filter(f => mappedFieldKeys.has(f.key))
                          .map(f => (
                            <td
                              key={f.key}
                              className={
                                errFields.has(f.key)
                                  ? 'bulk-import__cell--error'
                                  : undefined
                              }
                            >
                              {vr.mapped[f.key] ?? ''}
                            </td>
                          ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <label className="bulk-import__checkbox-label">
              <input
                type="checkbox"
                checked={importValidOnly}
                onChange={e => setImportValidOnly(e.target.checked)}
              />
              Import valid rows only
            </label>

            <div className="bulk-import__actions">
              <button className="btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="btn-primary" onClick={handleImport}>
                Import
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="bulk-import__success">
            <div className="bulk-import__success-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="3" fill="none" />
                <path d="M14 24L22 32L34 16" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="bulk-import__success-count">
              {importedCount} {config.entityName.toLowerCase()}{importedCount !== 1 ? 's' : ''} imported
            </p>
            <p className="bulk-import__success-detail">
              Your data has been imported successfully.
            </p>
            <div className="bulk-import__actions" style={{ justifyContent: 'center' }}>
              <button className="btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BulkImportModal
