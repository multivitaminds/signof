import { useState, useCallback, useRef } from 'react'
import { Upload, FileText } from 'lucide-react'
import './CsvImportModal.css'

interface CsvImportModalProps {
  onClose: () => void
}

type ColumnMapping = {
  date: number | null
  description: number | null
  amount: number | null
  type: number | null
}

function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split('\n')
    .map((row) => row.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')))
}

function CsvImportModal({ onClose }: CsvImportModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<string[][]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    date: null,
    description: null,
    amount: null,
    type: null,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const rows = parseCsv(text)
      setPreviewData(rows.slice(0, 6))
      setStep(2)
    }
    reader.readAsText(selectedFile)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile && droppedFile.name.endsWith('.csv')) {
        handleFileSelect(droppedFile)
      }
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        handleFileSelect(selectedFile)
      }
    },
    [handleFileSelect]
  )

  const handleGoToMapping = useCallback(() => {
    setStep(3)
  }, [])

  const handleMappingChange = useCallback(
    (field: keyof ColumnMapping, value: string) => {
      setColumnMapping((prev) => ({
        ...prev,
        [field]: value === '' ? null : parseInt(value, 10),
      }))
    },
    []
  )

  const handleImport = useCallback(() => {
    onClose()
  }, [onClose])

  const columnCount = previewData[0]?.length ?? 0

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content csv-import"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Import CSV"
      >
        <div className="modal-header">
          <h2>Import CSV</h2>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close">
            &times;
          </button>
        </div>

        <div className="csv-import__steps">
          <div
            className={`csv-import__step ${step >= 1 ? 'csv-import__step--active' : ''}`}
          >
            1. Upload
          </div>
          <div
            className={`csv-import__step ${step >= 2 ? 'csv-import__step--active' : ''}`}
          >
            2. Preview
          </div>
          <div
            className={`csv-import__step ${step >= 3 ? 'csv-import__step--active' : ''}`}
          >
            3. Map Columns
          </div>
        </div>

        {step === 1 && (
          <div
            className="csv-import__dropzone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleBrowseClick}
            role="button"
            tabIndex={0}
            aria-label="Drop CSV file here or click to browse"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleBrowseClick()
            }}
          >
            <Upload size={32} className="csv-import__dropzone-icon" />
            <p className="csv-import__dropzone-text">
              Drop CSV file here or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="csv-import__file-input"
              onChange={handleInputChange}
            />
          </div>
        )}

        {step === 2 && (
          <div className="csv-import__preview">
            {file && (
              <div className="csv-import__file-info">
                <FileText size={16} />
                <span>{file.name}</span>
                <span className="csv-import__file-size">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}
            <div className="csv-import__table-wrapper">
              <table className="csv-import__table">
                <thead>
                  <tr>
                    {previewData[0]?.map((header, i) => (
                      <th key={i}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(1).map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="csv-import__preview-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="button" className="btn-primary" onClick={handleGoToMapping}>
                Next: Map Columns
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="csv-import__mapping">
            <p className="csv-import__mapping-desc">
              Map each column from your CSV to the corresponding transaction field.
            </p>
            {(['date', 'description', 'amount', 'type'] as const).map((field) => (
              <div key={field} className="csv-import__mapping-row">
                <label
                  htmlFor={`map-${field}`}
                  className="csv-import__mapping-label"
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <select
                  id={`map-${field}`}
                  className="csv-import__mapping-select"
                  value={columnMapping[field] ?? ''}
                  onChange={(e) => handleMappingChange(field, e.target.value)}
                >
                  <option value="">-- Select column --</option>
                  {Array.from({ length: columnCount }, (_, i) => (
                    <option key={i} value={i}>
                      Column {i + 1}
                      {previewData[0]?.[i] ? ` (${previewData[0][i]})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div className="csv-import__mapping-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button type="button" className="btn-primary" onClick={handleImport}>
                Import Transactions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CsvImportModal
