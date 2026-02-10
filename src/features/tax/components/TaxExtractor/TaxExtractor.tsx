import { useState, useCallback } from 'react'
import { Scan, Loader, CheckCircle, AlertTriangle, Save } from 'lucide-react'
import type { TaxDocument, ExtractedField } from '../../types'
import { TAX_FORM_LABELS } from '../../types'
import './TaxExtractor.css'

interface TaxExtractorProps {
  document: TaxDocument
  onExtract: (id: string) => void
  onSave: (id: string, data: ExtractedField[]) => void
}

function TaxExtractor({ document, onExtract, onSave }: TaxExtractorProps) {
  const [editedData, setEditedData] = useState<ExtractedField[]>(document.extractedData)
  const [hasChanges, setHasChanges] = useState(false)

  const handleExtract = useCallback(() => {
    onExtract(document.id)
  }, [document.id, onExtract])

  const handleFieldChange = useCallback(
    (index: number, field: 'key' | 'value', newValue: string) => {
      setEditedData((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: newValue } : item
        )
      )
      setHasChanges(true)
    },
    []
  )

  const handleSave = useCallback(() => {
    onSave(document.id, editedData)
    setHasChanges(false)
  }, [document.id, editedData, onSave])

  // Sync editedData when document.extractedData changes (e.g., after extraction)
  const currentDataJson = JSON.stringify(document.extractedData)
  const editedDataJson = JSON.stringify(editedData)
  if (
    !hasChanges &&
    document.extractedData.length > 0 &&
    currentDataJson !== editedDataJson
  ) {
    setEditedData(document.extractedData)
  }

  const statusConfig = {
    pending: {
      icon: <Scan size={16} />,
      label: 'Not Extracted',
      className: 'tax-extractor__status--pending',
    },
    extracting: {
      icon: <Loader size={16} className="tax-extractor__spinner" />,
      label: 'Extracting...',
      className: 'tax-extractor__status--extracting',
    },
    completed: {
      icon: <CheckCircle size={16} />,
      label: 'Extracted',
      className: 'tax-extractor__status--completed',
    },
    failed: {
      icon: <AlertTriangle size={16} />,
      label: 'Failed',
      className: 'tax-extractor__status--failed',
    },
  }

  const status = statusConfig[document.extractionStatus]

  return (
    <div className="tax-extractor">
      <div className="tax-extractor__header">
        <div className="tax-extractor__info">
          <h3 className="tax-extractor__name">{document.name}</h3>
          <span className="tax-extractor__type">
            {TAX_FORM_LABELS[document.type]}
          </span>
        </div>
        <div className={`tax-extractor__status ${status.className}`}>
          {status.icon}
          <span>{status.label}</span>
        </div>
      </div>

      {(document.extractionStatus === 'pending' ||
        document.extractionStatus === 'failed') && (
        <div className="tax-extractor__action">
          <button
            className="btn-primary"
            onClick={handleExtract}
            type="button"
          >
            <Scan size={16} />
            <span>Extract Data</span>
          </button>
          <p className="tax-extractor__hint">
            Simulates OCR extraction of form fields from the document.
          </p>
        </div>
      )}

      {document.extractionStatus === 'extracting' && (
        <div className="tax-extractor__loading">
          <Loader size={24} className="tax-extractor__spinner" />
          <p>Analyzing document and extracting fields...</p>
        </div>
      )}

      {document.extractionStatus === 'completed' && editedData.length > 0 && (
        <div className="tax-extractor__data">
          <table className="tax-extractor__table" role="grid">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {editedData.map((field, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      className="tax-extractor__input tax-extractor__input--key"
                      value={field.key}
                      onChange={(e) =>
                        handleFieldChange(index, 'key', e.target.value)
                      }
                      aria-label={`Field name ${index + 1}`}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="tax-extractor__input tax-extractor__input--value"
                      value={field.value}
                      onChange={(e) =>
                        handleFieldChange(index, 'value', e.target.value)
                      }
                      aria-label={`Field value for ${field.key}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasChanges && (
            <div className="tax-extractor__save-bar">
              <button
                className="btn-primary"
                onClick={handleSave}
                type="button"
              >
                <Save size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TaxExtractor
