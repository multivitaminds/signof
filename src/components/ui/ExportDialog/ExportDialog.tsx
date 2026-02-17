import { useState, useCallback } from 'react'
import { Download, X } from 'lucide-react'
import { exportData } from '../../../lib/exportUtils'
import type { ExportFormat, ExportColumn } from '../../../lib/exportUtils'
import './ExportDialog.css'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport?: (format: ExportFormat, filename: string) => void
  defaultFilename: string
  data: Record<string, unknown>[]
  columns: ExportColumn[]
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string }[] = [
  { value: 'csv', label: 'CSV', description: 'Comma-separated values, opens in Excel/Sheets' },
  { value: 'json', label: 'JSON', description: 'Structured data format' },
  { value: 'markdown', label: 'Markdown', description: 'Markdown table, paste into docs' },
]

function ExportDialog({
  isOpen,
  onClose,
  onExport,
  defaultFilename,
  data,
  columns,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [filename, setFilename] = useState(defaultFilename)

  const handleExport = useCallback(() => {
    exportData(format, data, columns, filename)
    onExport?.(format, filename)
    onClose()
  }, [format, data, columns, filename, onExport, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Export data">
      <div className="modal-content export-dialog" onClick={e => e.stopPropagation()}>
        <div className="export-dialog__header">
          <h2 className="export-dialog__title">Export Data</h2>
          <button
            type="button"
            className="export-dialog__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="export-dialog__body">
          <div className="export-dialog__field">
            <label className="export-dialog__label" htmlFor="export-filename">
              Filename
            </label>
            <input
              id="export-filename"
              type="text"
              className="export-dialog__input"
              value={filename}
              onChange={e => setFilename(e.target.value)}
            />
          </div>

          <fieldset className="export-dialog__field">
            <legend className="export-dialog__label">Format</legend>
            <div className="export-dialog__formats">
              {FORMAT_OPTIONS.map(opt => (
                <label key={opt.value} className="export-dialog__format-option">
                  <input
                    type="radio"
                    name="export-format"
                    value={opt.value}
                    checked={format === opt.value}
                    onChange={() => setFormat(opt.value)}
                    className="export-dialog__radio"
                  />
                  <span className="export-dialog__format-card">
                    <span className="export-dialog__format-name">{opt.label}</span>
                    <span className="export-dialog__format-desc">{opt.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <p className="export-dialog__summary">
            {data.length} row{data.length !== 1 ? 's' : ''} will be exported
          </p>
        </div>

        <div className="export-dialog__footer">
          <button
            type="button"
            className="btn--secondary export-dialog__cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn--primary export-dialog__export-btn"
            onClick={handleExport}
            disabled={!filename.trim()}
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportDialog
