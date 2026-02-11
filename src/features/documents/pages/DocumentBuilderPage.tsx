import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Upload,
  FileText,
  Users,
  Eye,
  Send,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  GripVertical,
} from 'lucide-react'
import { type FieldType, SigningOrder } from '../../../types'
import { useDocumentStore } from '../../../stores/useDocumentStore'
import { useFieldPlacement } from '../hooks/useFieldPlacement'
import { FIELD_COLORS } from '../lib/fieldTypes'
import DocumentCanvas from '../components/DocumentCanvas/DocumentCanvas'
import FieldPalette from '../components/FieldPalette/FieldPalette'
import './DocumentBuilderPage.css'

// ─── Types ──────────────────────────────────────────────────────────

type BuilderStep = 'upload' | 'fields' | 'signers' | 'review' | 'send'

interface BuilderSigner {
  tempId: string
  name: string
  email: string
}

const STEPS: { key: BuilderStep; label: string; icon: React.ReactNode }[] = [
  { key: 'upload', label: 'Upload', icon: <Upload size={16} /> },
  { key: 'fields', label: 'Add Fields', icon: <FileText size={16} /> },
  { key: 'signers', label: 'Signers', icon: <Users size={16} /> },
  { key: 'review', label: 'Review', icon: <Eye size={16} /> },
  { key: 'send', label: 'Send', icon: <Send size={16} /> },
]

function generateTempId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const MAX_SIZE = 10 * 1024 * 1024

// ─── Component ──────────────────────────────────────────────────────

function DocumentBuilderPage() {
  const { createDocumentFromBuilder } = useDocumentStore()

  // Wizard state
  const [currentStep, setCurrentStep] = useState<BuilderStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [signers, setSigners] = useState<BuilderSigner[]>([])
  const [newSignerName, setNewSignerName] = useState('')
  const [newSignerEmail, setNewSignerEmail] = useState('')
  const [signingOrder, setSigningOrder] = useState<SigningOrder>(SigningOrder.Parallel)
  const [message, setMessage] = useState('')
  const [isSent, setIsSent] = useState(false)

  // Field placement
  const fieldPlacement = useFieldPlacement('builder', [])

  // File preview URL for document background
  const filePreviewUrl = useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file])

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
    }
  }, [filePreviewUrl])

  const stepIndex = STEPS.findIndex((s) => s.key === currentStep)

  // Recipient colors for field assignment
  const recipientColors = useMemo(() => {
    const colors: Record<string, string> = {}
    signers.forEach((_, i) => {
      colors[`signer-${i}`] = FIELD_COLORS[i % FIELD_COLORS.length] ?? '#6B7280'
    })
    colors['default'] = FIELD_COLORS[0] ?? '#4F46E5'
    return colors
  }, [signers])

  // ── Upload handlers ───────────────────────────────────────────────

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setFileError('Invalid file type. Accepted: PDF, PNG, JPG')
      return
    }
    if (selectedFile.size > MAX_SIZE) {
      setFileError(`File too large. Max size: ${formatFileSize(MAX_SIZE)}`)
      return
    }
    setFileError(null)
    setFile(selectedFile)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) handleFileSelect(droppedFile)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) handleFileSelect(selectedFile)
    },
    [handleFileSelect]
  )

  // ── Signer handlers ──────────────────────────────────────────────

  const handleAddSigner = useCallback(() => {
    if (!newSignerName.trim() || !newSignerEmail.trim()) return
    setSigners((prev) => [
      ...prev,
      { tempId: generateTempId(), name: newSignerName.trim(), email: newSignerEmail.trim() },
    ])
    setNewSignerName('')
    setNewSignerEmail('')
  }, [newSignerName, newSignerEmail])

  const handleRemoveSigner = useCallback((tempId: string) => {
    setSigners((prev) => prev.filter((s) => s.tempId !== tempId))
  }, [])

  // ── Field drop handler ───────────────────────────────────────────

  const handleFieldDrop = useCallback(
    (type: FieldType, recipientId: string, x: number, y: number) => {
      const rId = signers.length > 0 ? 'signer-0' : recipientId
      fieldPlacement.addField(type, rId, 1, x, y)
    },
    [fieldPlacement, signers.length]
  )

  const handleFieldDragStart = useCallback(() => {
    fieldPlacement.setDragging(true)
  }, [fieldPlacement])

  // ── Navigation ───────────────────────────────────────────────────

  const canAdvance = useMemo((): boolean => {
    switch (currentStep) {
      case 'upload':
        return file !== null
      case 'fields':
        return true // fields are optional
      case 'signers':
        return signers.length > 0
      case 'review':
        return true
      case 'send':
        return false
      default:
        return false
    }
  }, [currentStep, file, signers.length])

  const handleNext = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.key === currentStep)
    const nextStep = STEPS[idx + 1]
    if (nextStep) {
      setCurrentStep(nextStep.key)
    }
  }, [currentStep])

  const handleBack = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.key === currentStep)
    const prevStep = STEPS[idx - 1]
    if (prevStep) {
      setCurrentStep(prevStep.key)
    }
  }, [currentStep])

  const handleSend = useCallback(() => {
    if (!file || signers.length === 0) return

    createDocumentFromBuilder({
      file,
      signers: signers.map((s) => ({ name: s.name, email: s.email })),
      fields: fieldPlacement.fields,
      signingOrder,
      message: message.trim() || undefined,
    })

    setIsSent(true)
  }, [file, signers, fieldPlacement.fields, signingOrder, message, createDocumentFromBuilder])

  // ── Render step indicator ────────────────────────────────────────

  const renderStepIndicator = () => (
    <div className="doc-builder__steps" role="navigation" aria-label="Builder progress">
      {STEPS.map((step, i) => (
        <React.Fragment key={step.key}>
          <div
            className={`doc-builder__step${
              i === stepIndex ? ' doc-builder__step--active' : ''
            }${i < stepIndex ? ' doc-builder__step--completed' : ''}`}
          >
            <div className="doc-builder__step-circle">
              {i < stepIndex ? <Check size={14} /> : step.icon}
            </div>
            <span className="doc-builder__step-label">{step.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`doc-builder__step-line${
                i < stepIndex ? ' doc-builder__step-line--completed' : ''
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  // ── Step 1: Upload ───────────────────────────────────────────────

  const renderUploadStep = () => (
    <div className="doc-builder__upload">
      <h2>Upload Document</h2>
      <p className="doc-builder__subtitle">
        Upload a PDF, PNG, or JPG file to start building your document.
      </p>

      <div
        className={`doc-builder__dropzone${file ? ' doc-builder__dropzone--has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('builder-file-input')?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            document.getElementById('builder-file-input')?.click()
          }
        }}
      >
        <Upload size={48} className="doc-builder__dropzone-icon" />
        <p className="doc-builder__dropzone-text">
          Drag and drop a file here, or click to browse
        </p>
        <p className="doc-builder__dropzone-info">
          PDF, PNG, JPG -- Max {formatFileSize(MAX_SIZE)}
        </p>
        <input
          id="builder-file-input"
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileInputChange}
          className="doc-builder__file-input"
          aria-label="Upload document file"
        />
      </div>

      {fileError && (
        <p className="doc-builder__error" role="alert">{fileError}</p>
      )}

      {file && (
        <div className="doc-builder__file-info">
          <FileText size={20} />
          <div className="doc-builder__file-details">
            <span className="doc-builder__file-name">{file.name}</span>
            <span className="doc-builder__file-size">{formatFileSize(file.size)}</span>
          </div>
          <button
            type="button"
            className="doc-builder__file-remove"
            onClick={(e) => {
              e.stopPropagation()
              setFile(null)
            }}
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )

  // ── Step 2: Add Fields ───────────────────────────────────────────

  const renderFieldsStep = () => (
    <div className="doc-builder__fields">
      <h2>Place Fields</h2>
      <p className="doc-builder__subtitle">
        Drag fields from the palette onto the document. {fieldPlacement.fields.length} field{fieldPlacement.fields.length !== 1 ? 's' : ''} placed.
      </p>

      <div className="doc-builder__fields-layout">
        <div className="doc-builder__fields-palette">
          <FieldPalette
            onFieldDragStart={handleFieldDragStart}
            disabled={false}
          />

          {fieldPlacement.fields.length > 0 && (
            <div className="doc-builder__fields-summary">
              <div className="doc-builder__fields-summary-title">Placed Fields</div>
              {fieldPlacement.fields.map((f) => (
                <div key={f.id} className="doc-builder__field-summary-item">
                  <span>{f.label ?? f.type}</span>
                  <button
                    type="button"
                    onClick={() => fieldPlacement.removeField(f.id)}
                    className="doc-builder__field-remove-btn"
                    aria-label={`Remove ${f.label ?? f.type} field`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="doc-builder__fields-canvas">
          <DocumentCanvas
            fields={fieldPlacement.fields}
            selectedFieldId={fieldPlacement.selectedFieldId}
            onFieldSelect={fieldPlacement.selectField}
            onFieldMove={fieldPlacement.updateFieldPosition}
            onFieldDrop={handleFieldDrop}
            onFieldHover={fieldPlacement.hoverField}
            onFieldResize={fieldPlacement.updateFieldSize}
            recipientColors={recipientColors}
            backgroundUrl={filePreviewUrl}
            backgroundType={file?.type}
          />
        </div>
      </div>
    </div>
  )

  // ── Step 3: Add Signers ──────────────────────────────────────────

  const renderSignersStep = () => (
    <div className="doc-builder__signers">
      <h2>Add Signers</h2>
      <p className="doc-builder__subtitle">
        Add the people who need to sign this document.
      </p>

      <div className="doc-builder__signer-form">
        <div className="doc-builder__signer-inputs">
          <input
            type="text"
            placeholder="Full name"
            value={newSignerName}
            onChange={(e) => setNewSignerName(e.target.value)}
            className="doc-builder__signer-input"
            aria-label="Signer name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSigner()
            }}
          />
          <input
            type="email"
            placeholder="Email address"
            value={newSignerEmail}
            onChange={(e) => setNewSignerEmail(e.target.value)}
            className="doc-builder__signer-input"
            aria-label="Signer email"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSigner()
            }}
          />
          <button
            type="button"
            className="doc-builder__add-signer-btn"
            onClick={handleAddSigner}
            disabled={!newSignerName.trim() || !newSignerEmail.trim()}
            aria-label="Add signer"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {signers.length > 0 && (
        <div className="doc-builder__signer-list">
          {signers.map((signer, i) => {
            const color = FIELD_COLORS[i % FIELD_COLORS.length] ?? '#6B7280'
            return (
              <div key={signer.tempId} className="doc-builder__signer-item">
                <div className="doc-builder__signer-order">
                  <GripVertical size={14} />
                  <span
                    className="doc-builder__signer-color"
                    style={{ backgroundColor: color }}
                  />
                  <span className="doc-builder__signer-number">{i + 1}</span>
                </div>
                <div className="doc-builder__signer-info">
                  <span className="doc-builder__signer-name">{signer.name}</span>
                  <span className="doc-builder__signer-email">{signer.email}</span>
                </div>
                <button
                  type="button"
                  className="doc-builder__signer-remove"
                  onClick={() => handleRemoveSigner(signer.tempId)}
                  aria-label={`Remove ${signer.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="doc-builder__signing-order">
        <span className="doc-builder__signing-order-label">Signing Order</span>
        <div className="doc-builder__signing-order-toggle" role="radiogroup" aria-label="Signing order">
          <button
            type="button"
            role="radio"
            className={`doc-builder__order-btn${signingOrder === SigningOrder.Parallel ? ' doc-builder__order-btn--active' : ''}`}
            onClick={() => setSigningOrder(SigningOrder.Parallel)}
            aria-checked={signingOrder === SigningOrder.Parallel}
          >
            Parallel
          </button>
          <button
            type="button"
            role="radio"
            className={`doc-builder__order-btn${signingOrder === SigningOrder.Sequential ? ' doc-builder__order-btn--active' : ''}`}
            onClick={() => setSigningOrder(SigningOrder.Sequential)}
            aria-checked={signingOrder === SigningOrder.Sequential}
          >
            Sequential
          </button>
        </div>
      </div>
    </div>
  )

  // ── Step 4: Review ───────────────────────────────────────────────

  const renderReviewStep = () => (
    <div className="doc-builder__review">
      <h2>Review</h2>
      <p className="doc-builder__subtitle">
        Review your document before sending.
      </p>

      <div className="doc-builder__review-section">
        <div className="doc-builder__review-row">
          <span className="doc-builder__review-label">Document</span>
          <span className="doc-builder__review-value">{file?.name ?? 'No file'}</span>
        </div>
        <div className="doc-builder__review-row">
          <span className="doc-builder__review-label">Fields</span>
          <span className="doc-builder__review-value">{fieldPlacement.fields.length} placed</span>
        </div>
        <div className="doc-builder__review-row">
          <span className="doc-builder__review-label">Signers</span>
          <span className="doc-builder__review-value">{signers.length} recipient{signers.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="doc-builder__review-row">
          <span className="doc-builder__review-label">Signing Order</span>
          <span className="doc-builder__review-value">{signingOrder === SigningOrder.Sequential ? 'Sequential' : 'Parallel'}</span>
        </div>
      </div>

      {signers.length > 0 && (
        <div className="doc-builder__review-signers">
          <h3>Signers</h3>
          {signers.map((s, i) => (
            <div key={s.tempId} className="doc-builder__review-signer">
              <span className="doc-builder__review-signer-order">{i + 1}</span>
              <span className="doc-builder__review-signer-name">{s.name}</span>
              <span className="doc-builder__review-signer-email">{s.email}</span>
            </div>
          ))}
        </div>
      )}

      {fieldPlacement.fields.length > 0 && (
        <div className="doc-builder__review-fields">
          <h3>Fields</h3>
          {fieldPlacement.fields.map((f) => (
            <div key={f.id} className="doc-builder__review-field">
              <span>{f.label ?? f.type}</span>
              <span className="doc-builder__review-field-page">Page {f.page}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── Step 5: Send ─────────────────────────────────────────────────

  const renderSendStep = () => (
    <div className="doc-builder__send">
      {!isSent ? (
        <>
          <h2>Send Document</h2>
          <p className="doc-builder__subtitle">
            Add an optional message and send the document for signing.
          </p>

          <div className="doc-builder__message-section">
            <label htmlFor="builder-message" className="doc-builder__message-label">
              Message to signers (optional)
            </label>
            <textarea
              id="builder-message"
              className="doc-builder__message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please review and sign this document..."
              rows={4}
            />
          </div>

          <div className="doc-builder__send-summary">
            <div className="doc-builder__send-summary-row">
              <FileText size={16} />
              <span>{file?.name}</span>
            </div>
            <div className="doc-builder__send-summary-row">
              <Users size={16} />
              <span>Sending to {signers.length} signer{signers.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <button
            type="button"
            className="doc-builder__send-btn"
            onClick={handleSend}
          >
            <Send size={16} /> Send for Signing
          </button>
        </>
      ) : (
        <div className="doc-builder__sent-success">
          <div className="doc-builder__sent-icon">
            <Check size={32} />
          </div>
          <h2>Document Sent!</h2>
          <p className="doc-builder__subtitle">
            Your document has been sent to {signers.length} signer{signers.length !== 1 ? 's' : ''} for signing.
          </p>
          <a href="/documents" className="doc-builder__back-link">
            Back to Documents
          </a>
        </div>
      )}
    </div>
  )

  // ── Main render ──────────────────────────────────────────────────

  return (
    <div className="doc-builder">
      {renderStepIndicator()}

      <div className="doc-builder__content">
        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'fields' && renderFieldsStep()}
        {currentStep === 'signers' && renderSignersStep()}
        {currentStep === 'review' && renderReviewStep()}
        {currentStep === 'send' && renderSendStep()}
      </div>

      {!isSent && (
        <div className="doc-builder__footer">
          <div className="doc-builder__footer-left">
            {stepIndex > 0 && (
              <button
                type="button"
                className="doc-builder__nav-btn doc-builder__nav-btn--back"
                onClick={handleBack}
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
          </div>
          <div className="doc-builder__footer-right">
            {currentStep !== 'send' && (
              <button
                type="button"
                className="doc-builder__nav-btn doc-builder__nav-btn--next"
                onClick={handleNext}
                disabled={!canAdvance}
              >
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentBuilderPage
