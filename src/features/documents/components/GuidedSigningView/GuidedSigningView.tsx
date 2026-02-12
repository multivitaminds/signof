import { useCallback, useEffect, useRef, useState } from 'react'
import type { Document } from '../../../../types'
import { FieldType } from '../../../../types'
import FieldRenderer from '../FieldRenderer/FieldRenderer'
import SigningProgress from '../SigningProgress/SigningProgress'
import { useGuidedSigning } from '../../hooks/useGuidedSigning'
import { FIELD_COLORS } from '../../lib/fieldTypes'
import './GuidedSigningView.css'

interface GuidedSigningViewProps {
  document: Document
  signerId: string
  onComplete: (fieldValues: Record<string, string>) => void
  onCancel: () => void
}

function GuidedSigningView({
  document: doc,
  signerId,
  onComplete,
  onCancel,
}: GuidedSigningViewProps) {
  const {
    currentFieldIndex,
    currentField,
    fieldValues,
    goToNext,
    goToPrev,
    goToField,
    setFieldValue,
    isFirstField,
    isLastField,
    progress,
    canComplete,
    signerFields,
  } = useGuidedSigning(doc.fields, signerId)

  const [showIntro, setShowIntro] = useState(true)
  const [showComplete, setShowComplete] = useState(false)
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (currentField && !showIntro) {
      fieldRefs.current[currentField.id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentFieldIndex, currentField, showIntro])

  const signer = doc.signers.find((s) => s.id === signerId)
  const signerIndex = doc.signers.findIndex((s) => s.id === signerId)
  const recipientColor = FIELD_COLORS[signerIndex % FIELD_COLORS.length] ?? FIELD_COLORS[0] ?? '#4F46E5'

  const handleStart = useCallback(() => {
    setShowIntro(false)
  }, [])

  const handleComplete = useCallback(() => {
    if (canComplete) {
      setShowComplete(true)
      setTimeout(() => {
        onComplete(fieldValues)
      }, 300)
    }
  }, [canComplete, fieldValues, onComplete])

  const handleFieldValueChange = useCallback(
    (value: string) => {
      if (currentField) {
        setFieldValue(currentField.id, value)
      }
    },
    [currentField, setFieldValue]
  )

  if (!signer) {
    return (
      <div className="guided-signing guided-signing--error">
        <p>Signer not found</p>
        <button className="btn-secondary" onClick={onCancel}>Go back</button>
      </div>
    )
  }

  if (signerFields.length === 0) {
    return (
      <div className="guided-signing guided-signing--empty">
        <p>No fields assigned to this signer</p>
        <button className="btn-secondary" onClick={onCancel}>Go back</button>
      </div>
    )
  }

  return (
    <div className="guided-signing" role="main" aria-label="Document signing">
      {showIntro && (
        <div className="guided-signing__intro-overlay">
          <div className="guided-signing__intro-card">
            <h3>Ready to sign</h3>
            <p>You have {signerFields.length} field{signerFields.length !== 1 ? 's' : ''} to complete.</p>
            <button className="btn-primary guided-signing__intro-btn" onClick={handleStart}>
              Start Signing
            </button>
          </div>
        </div>
      )}

      <div className="guided-signing__header">
        <h2 className="guided-signing__title">{doc.name}</h2>
        <span className="guided-signing__signer">
          Signing as: <strong>{signer.name}</strong>
        </span>
      </div>

      <div className="guided-signing__body">
        <div className="guided-signing__document">
          <div className="guided-signing__document-preview">
            <div className="guided-signing__document-page">
              {signerFields.map((field, idx) => {
                const fieldWithValue = { ...field, value: fieldValues[field.id] ?? field.value }
                return (
                  <div
                    key={field.id}
                    ref={(el) => { fieldRefs.current[field.id] = el }}
                    className={`guided-signing__field ${idx === currentFieldIndex ? 'guided-signing__field--active' : ''}`}
                    style={{
                      left: `${field.x}px`,
                      top: `${field.y}px`,
                      width: `${field.width}px`,
                      height: `${field.height}px`,
                    }}
                    onClick={() => goToField(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        goToField(idx)
                      }
                    }}
                  >
                    <span className={`guided-signing__field-badge${
                      fieldValues[field.id] ? ' guided-signing__field-badge--completed' :
                      idx === currentFieldIndex ? ' guided-signing__field-badge--current' :
                      ' guided-signing__field-badge--pending'
                    }`}>
                      {fieldValues[field.id] ? '\u2713' : idx + 1}
                    </span>
                    <FieldRenderer
                      field={fieldWithValue}
                      recipientColor={recipientColor}
                      isCurrentSigner={true}
                      readOnly={idx !== currentFieldIndex}
                      focused={idx === currentFieldIndex}
                      onValueChange={idx === currentFieldIndex ? handleFieldValueChange : undefined}
                    />
                    {idx === currentFieldIndex && (fieldValues[field.id] || (isFirstField && !fieldValues[field.id])) && (
                      <button
                        className="guided-signing__field-action"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isLastField && canComplete) {
                            handleComplete()
                          } else {
                            goToNext()
                          }
                        }}
                      >
                        {isFirstField && !fieldValues[field.id] ? 'Start' : isLastField ? 'Finish' : 'Next'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="guided-signing__sidebar">
          <div className="guided-signing__field-info">
            <h3 className="guided-signing__field-info-title">Current Field</h3>
            {currentField && (
              <>
                <p className="guided-signing__field-info-label">
                  {currentField.label ?? currentField.type}
                </p>
                <p className="guided-signing__field-info-type">
                  Type: {currentField.type.replace('_', ' ')}
                </p>
                {currentField.required && (
                  <span className="guided-signing__field-info-required">Required</span>
                )}
                {currentField.type === FieldType.Signature && (
                  <div className="guided-signing__signature-prompt">
                    <p>Click the signature field to open the signature pad</p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="guided-signing__field-list">
            <h4 className="guided-signing__field-list-title">All Fields</h4>
            {signerFields.map((field, idx) => (
              <button
                key={field.id}
                className={`guided-signing__field-list-item ${idx === currentFieldIndex ? 'guided-signing__field-list-item--active' : ''} ${fieldValues[field.id] ? 'guided-signing__field-list-item--completed' : ''}`}
                onClick={() => goToField(idx)}
              >
                <span className="guided-signing__field-list-number">{idx + 1}</span>
                <span className="guided-signing__field-list-label">
                  {field.label ?? field.type}
                </span>
                {fieldValues[field.id] && (
                  <span className="guided-signing__field-list-check" aria-label="Completed">
                    &#10003;
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="guided-signing__nav">
        <button
          className="btn-secondary guided-signing__btn"
          onClick={onCancel}
        >
          Cancel
        </button>

        {currentField && (
          <SigningProgress
            totalFields={progress.total}
            completedFields={progress.completed}
            currentFieldIndex={currentFieldIndex}
            currentFieldType={currentField.type}
          />
        )}

        <div className="guided-signing__nav-buttons">
          <button
            className="btn-secondary guided-signing__btn"
            onClick={goToPrev}
            disabled={isFirstField}
          >
            Previous
          </button>
          {isLastField ? (
            <button
              className="btn-primary guided-signing__btn"
              onClick={handleComplete}
              disabled={!canComplete}
            >
              Complete
            </button>
          ) : (
            <button
              className="btn-primary guided-signing__btn"
              onClick={goToNext}
            >
              Next
            </button>
          )}
        </div>
      </div>

      {showComplete && (
        <div className="guided-signing__complete-overlay">
          <div className="guided-signing__complete-card">
            <span className="guided-signing__complete-check">&#10003;</span>
            <p>All fields completed!</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default GuidedSigningView
