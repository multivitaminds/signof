import { useState, useCallback, useEffect } from 'react'
import { Scan, Loader, CheckCircle, AlertTriangle, Save } from 'lucide-react'
import type { TaxDocument, ExtractedField, ExtractionResult, ExtractionField } from '../../types'
import { TAX_FORM_LABELS } from '../../types'
import ExtractionConfirmation from '../ExtractionConfirmation/ExtractionConfirmation'
import './TaxExtractor.css'

const EXTRACTION_STEPS = [
  'Analyzing document format...',
  'Identifying form type...',
  'Reading field values...',
  'Validating extracted data...',
]

interface TaxExtractorProps {
  document: TaxDocument
  extractionResult?: ExtractionResult
  onExtract: (id: string) => void
  onSave: (id: string, data: ExtractedField[]) => void
  onConfirmExtraction?: (id: string, fields: ExtractionField[]) => void
  onRejectExtraction?: (id: string) => void
}

function TaxExtractor({
  document,
  extractionResult,
  onExtract,
  onSave,
  onConfirmExtraction,
  onRejectExtraction,
}: TaxExtractorProps) {
  const [editedData, setEditedData] = useState<ExtractedField[]>(document.extractedData)
  const [hasChanges, setHasChanges] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const handleExtract = useCallback(() => {
    setIsExtracting(true)
    setCurrentStep(0)
    onExtract(document.id)
  }, [document.id, onExtract])

  // Step-by-step progress during extraction
  useEffect(() => {
    if (!isExtracting) return

    const timers: ReturnType<typeof setTimeout>[] = []
    EXTRACTION_STEPS.forEach((_, i) => {
      if (i === 0) return // Step 0 shown immediately
      timers.push(
        setTimeout(() => {
          setCurrentStep(i)
        }, i * 600)
      )
    })

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [isExtracting])

  // Stop extraction progress when result arrives or status changes to completed/failed
  const shouldStopExtracting =
    !!extractionResult?.extractedAt ||
    document.extractionStatus === 'completed' ||
    document.extractionStatus === 'failed'
  if (shouldStopExtracting && isExtracting) {
    setIsExtracting(false)
  }

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

  const handleConfirm = useCallback(
    (fields: ExtractionField[]) => {
      onConfirmExtraction?.(document.id, fields)
    },
    [document.id, onConfirmExtraction]
  )

  const handleEdit = useCallback((_fieldIndex: number, _value: string) => {
    // Edit is handled internally by ExtractionConfirmation
  }, [])

  const handleReject = useCallback(() => {
    onRejectExtraction?.(document.id)
  }, [document.id, onRejectExtraction])

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
        document.extractionStatus === 'failed') &&
        !isExtracting && (
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
            Extracts form fields using PDF text parsing and OCR.
          </p>
        </div>
      )}

      {(document.extractionStatus === 'extracting' || isExtracting) && (
        <div className="tax-extractor__loading">
          <div className="tax-extractor__steps">
            {EXTRACTION_STEPS.map((step, i) => {
              const isDone = i < currentStep
              const isActive = i === currentStep
              return (
                <div
                  key={step}
                  className={`tax-extractor__step${
                    isDone ? ' tax-extractor__step--done' : ''
                  }${isActive ? ' tax-extractor__step--active' : ''
                  }${!isDone && !isActive ? ' tax-extractor__step--pending' : ''}`}
                >
                  <div className="tax-extractor__step-dot" />
                  <span>{step}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {document.extractionStatus === 'completed' && extractionResult && (
        <ExtractionConfirmation
          result={extractionResult}
          onConfirm={handleConfirm}
          onEdit={handleEdit}
          onReject={handleReject}
        />
      )}

      {document.extractionStatus === 'completed' && !extractionResult && editedData.length > 0 && (
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
