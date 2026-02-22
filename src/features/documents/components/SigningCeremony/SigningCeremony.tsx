import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import {
  X,
  Clock,
  FileText,
  Users,
  PenTool,
  Type,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle,
  Download,
  ArrowLeft,
  Calendar,
  ListChecks,
  Undo2,
  Eraser,
  SkipForward,
} from 'lucide-react'
import type { Document, Signer, DocumentField } from '../../../../types'
import { FieldType, SigningOrder, SignerStatus, SignerRole } from '../../../../types'
import FieldChecklist from '../FieldChecklist/FieldChecklist'
import './SigningCeremony.css'

// ─── Types ─────────────────────────────────────────────────────────

interface SigningCeremonyProps {
  document: Document
  signer: Signer
  onComplete: (dataUrl: string) => void
  onCancel: () => void
  onDecline?: (reason: string) => void
}

type CeremonyStep = 'review' | 'sign' | 'complete'

type SignatureMode = 'draw' | 'type'

interface Point {
  x: number
  y: number
}

const CEREMONY_STEPS: { key: CeremonyStep; label: string }[] = [
  { key: 'review', label: 'Review' },
  { key: 'sign', label: 'Sign' },
  { key: 'complete', label: 'Complete' },
]

// ─── Helper: format elapsed time ───────────────────────────────────

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return `${mm}:${ss}`
}

// ─── Helper: get icon for field type ───────────────────────────────

function getFieldIcon(type: FieldType): React.ReactNode {
  switch (type) {
    case FieldType.Signature:
      return <PenTool />
    case FieldType.Initial:
      return <Type />
    case FieldType.DateSigned:
      return <Calendar />
    case FieldType.Text:
      return <Type />
    case FieldType.Checkbox:
      return <CheckCircle />
    case FieldType.Dropdown:
      return <ListChecks />
    default:
      return <FileText />
  }
}

function getFieldLabel(type: FieldType): string {
  switch (type) {
    case FieldType.Signature:
      return 'Signature'
    case FieldType.Initial:
      return 'Initials'
    case FieldType.DateSigned:
      return 'Date Signed'
    case FieldType.Text:
      return 'Text'
    case FieldType.Checkbox:
      return 'Checkbox'
    case FieldType.Dropdown:
      return 'Dropdown'
    case FieldType.Attachment:
      return 'Attachment'
    default:
      return 'Field'
  }
}

// ─── Helper: validation messages ──────────────────────────────────

function getValidationMessage(field: DocumentField): string {
  switch (field.type) {
    case FieldType.Signature:
      return 'Please provide your signature to continue'
    case FieldType.Initial:
      return 'Please enter your initials'
    case FieldType.Text:
      return 'This field is required'
    case FieldType.Checkbox:
      return 'Please check this box to continue'
    case FieldType.Dropdown:
      return 'Please select an option'
    case FieldType.DateSigned:
      return ''
    default:
      return 'This field is required'
  }
}

// ─── Component ─────────────────────────────────────────────────────

function SigningCeremony({
  document: doc,
  signer,
  onComplete,
  onCancel,
  onDecline,
}: SigningCeremonyProps) {
  // ── State ──────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<CeremonyStep>('review')
  const [reviewConfirmed, setReviewConfirmed] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)
  const [signatureMode, setSignatureMode] = useState<SignatureMode>('draw')
  const [typedSignature, setTypedSignature] = useState('')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [signedTimestamp, setSignedTimestamp] = useState('')
  const [capturedDataUrl, setCapturedDataUrl] = useState('')

  // Validation state
  const [validationMessage, setValidationMessage] = useState<string | null>(null)

  // Decline state
  const [showDecline, setShowDecline] = useState(false)
  const [declineReason, setDeclineReason] = useState('')

  // Canvas drawing state
  const [strokes, setStrokes] = useState<Point[][]>([])
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  // Timer state
  const [startTime] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [finalElapsed, setFinalElapsed] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // ── Derived data ───────────────────────────────────────────────
  const signerFields = useMemo(
    () => doc.fields.filter((f) => f.recipientId === signer.id),
    [doc.fields, signer.id]
  )

  // If the signer has no fields assigned, create a virtual signature field
  const effectiveFields: DocumentField[] = useMemo(() => {
    if (signerFields.length > 0) return signerFields
    return [
      {
        id: '__virtual_signature__',
        type: FieldType.Signature,
        recipientId: signer.id,
        page: 1,
        x: 0,
        y: 0,
        width: 200,
        height: 60,
        required: true,
        label: 'Signature',
      },
    ]
  }, [signerFields, signer.id])

  const currentField = effectiveFields[currentFieldIndex] ?? null
  const isFirstField = currentFieldIndex === 0
  const isLastField = currentFieldIndex === effectiveFields.length - 1

  const stepIndex = CEREMONY_STEPS.findIndex((s) => s.key === currentStep)
  const canvasIsEmpty = strokes.length === 0 && currentStroke.length === 0

  // ── Timer effect ───────────────────────────────────────────────
  useEffect(() => {
    if (currentStep === 'complete') return
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime)
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime, currentStep])

  // ── Canvas setup ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width: cssWidth, height: cssHeight } = entry.contentRect
      const dpr = window.devicePixelRatio || 1
      canvas.width = cssWidth * dpr
      canvas.height = cssHeight * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
    })
    resizeObserver.observe(canvas)
    return () => resizeObserver.disconnect()
  }, [currentStep, currentFieldIndex, signatureMode])

  // Redraw canvas when strokes change
  const drawStroke = useCallback(
    (ctx: CanvasRenderingContext2D, points: Point[]) => {
      if (points.length < 2) return
      const firstPoint = points[0]
      if (!firstPoint) return
      ctx.strokeStyle = '#1A1A2E'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(firstPoint.x, firstPoint.y)
      for (let i = 1; i < points.length; i++) {
        const point = points[i]
        if (point) {
          ctx.lineTo(point.x, point.y)
        }
      }
      ctx.stroke()
    },
    []
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(dpr, dpr)
    strokes.forEach((stroke) => drawStroke(ctx, stroke))
    ctx.restore()
  }, [strokes, drawStroke])

  // ── Canvas handlers ────────────────────────────────────────────
  const getCanvasPoint = useCallback(
    (e: React.MouseEvent | React.TouchEvent): Point => {
      const canvas = canvasRef.current!
      const rect = canvas.getBoundingClientRect()
      let clientX: number
      let clientY: number

      if ('touches' in e && e.touches[0]) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else if (!('touches' in e)) {
        clientX = e.clientX
        clientY = e.clientY
      } else {
        return { x: 0, y: 0 }
      }
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      }
    },
    []
  )

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      const point = getCanvasPoint(e)
      setIsDrawing(true)
      setCurrentStroke([point])
    },
    [getCanvasPoint]
  )

  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return
      e.preventDefault()
      const point = getCanvasPoint(e)
      setCurrentStroke((prev) => {
        const updated = [...prev, point]
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            const prevPoint = prev[prev.length - 1]
            if (prevPoint) {
              ctx.strokeStyle = '#1A1A2E'
              ctx.lineWidth = 2
              ctx.lineCap = 'round'
              ctx.lineJoin = 'round'
              ctx.beginPath()
              ctx.moveTo(prevPoint.x, prevPoint.y)
              ctx.lineTo(point.x, point.y)
              ctx.stroke()
            }
          }
        }
        return updated
      })
    },
    [isDrawing, getCanvasPoint]
  )

  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return
    setIsDrawing(false)
    setValidationMessage(null)
    setCurrentStroke((prev) => {
      if (prev.length > 1) {
        setStrokes((s) => [...s, prev])
      }
      return []
    })
  }, [isDrawing])

  const handleClearCanvas = useCallback(() => {
    setStrokes([])
    setCurrentStroke([])
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [])

  const handleUndoStroke = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1))
  }, [])

  // ── Field value management ─────────────────────────────────────
  const setFieldValue = useCallback((fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }))
    if (value) setValidationMessage(null)
  }, [])

  // Auto-fill date fields inline (computed at init time)
  // Date fields are pre-filled in the initializer below and during field navigation

  // ── Save current field's signature/initial from canvas ─────────
  const saveCurrentDrawnField = useCallback((): string => {
    const canvas = canvasRef.current
    if (!canvas || canvasIsEmpty) return ''
    return canvas.toDataURL()
  }, [canvasIsEmpty])

  // ── Navigation ─────────────────────────────────────────────────
  const handleNextStep = useCallback(() => {
    if (currentStep === 'review') {
      // Pre-fill all date fields with today's date
      const datePreFills: Record<string, string> = {}
      for (const field of effectiveFields) {
        if (field.type === FieldType.DateSigned) {
          datePreFills[field.id] = new Date().toLocaleDateString()
        }
      }
      if (Object.keys(datePreFills).length > 0) {
        setFieldValues((prev) => ({ ...prev, ...datePreFills }))
      }
      setCurrentStep('sign')
      setCurrentFieldIndex(0)
      // Reset drawing state for first field
      setStrokes([])
      setCurrentStroke([])
      setTypedSignature('')
      setSignatureMode('draw')
    }
  }, [currentStep, effectiveFields])

  const handlePrevStep = useCallback(() => {
    if (currentStep === 'sign') {
      setCurrentStep('review')
    }
  }, [currentStep])

  // ── Determine if current field can advance ─────────────────────
  const canAdvanceField = useMemo((): boolean => {
    if (!currentField) return false

    if (currentField.type === FieldType.DateSigned) {
      return true // auto-filled
    }

    if (
      currentField.type === FieldType.Signature ||
      currentField.type === FieldType.Initial
    ) {
      if (signatureMode === 'draw') {
        return !canvasIsEmpty || Boolean(fieldValues[currentField.id])
      }
      return typedSignature.trim().length > 0 || Boolean(fieldValues[currentField.id])
    }

    if (currentField.type === FieldType.Checkbox) {
      return Boolean(fieldValues[currentField.id])
    }

    // Text, Dropdown, Attachment
    if (currentField.required) {
      return Boolean(fieldValues[currentField.id])
    }
    return true
  }, [currentField, signatureMode, canvasIsEmpty, typedSignature, fieldValues])

  const handleNextField = useCallback(() => {
    if (!currentField) return

    // Validate before advancing
    if (!canAdvanceField && currentField.required) {
      setValidationMessage(getValidationMessage(currentField))
      return
    }
    setValidationMessage(null)

    // Save current field value from canvas or typed input
    if (
      currentField.type === FieldType.Signature ||
      currentField.type === FieldType.Initial
    ) {
      if (signatureMode === 'draw') {
        const dataUrl = saveCurrentDrawnField()
        if (dataUrl) {
          setFieldValue(currentField.id, dataUrl)
        }
      } else if (typedSignature.trim()) {
        setFieldValue(currentField.id, typedSignature.trim())
      }
    }

    if (isLastField) {
      // All fields done - complete
      const now = new Date().toISOString()
      setSignedTimestamp(now)
      setFinalElapsed(Date.now() - startTime)

      // Determine final signature data: use the first signature-type field's value,
      // or the canvas data, or the typed signature
      let finalDataUrl = ''
      const sigField = effectiveFields.find(
        (f) => f.type === FieldType.Signature
      )
      if (sigField) {
        if (signatureMode === 'draw') {
          const drawnUrl = saveCurrentDrawnField()
          finalDataUrl = fieldValues[sigField.id] ?? drawnUrl
        } else {
          finalDataUrl = fieldValues[sigField.id] ?? typedSignature.trim()
        }
      }
      // If still empty, try to get any drawn signature
      if (!finalDataUrl) {
        const canvas = canvasRef.current
        if (canvas && !canvasIsEmpty) {
          finalDataUrl = canvas.toDataURL()
        }
      }
      // If still empty and typed, use typed text as fallback
      if (!finalDataUrl && typedSignature.trim()) {
        finalDataUrl = `typed:${typedSignature.trim()}`
      }
      // Final fallback to a placeholder
      if (!finalDataUrl) {
        finalDataUrl = 'data:text/plain;base64,c2lnbmVk'
      }

      setCapturedDataUrl(finalDataUrl)
      setCurrentStep('complete')
    } else {
      // Save and move to next field
      setCurrentFieldIndex((i) => i + 1)
      // Reset canvas for next field
      setStrokes([])
      setCurrentStroke([])
      setTypedSignature('')
      setSignatureMode('draw')
    }
  }, [
    currentField,
    isLastField,
    signatureMode,
    typedSignature,
    saveCurrentDrawnField,
    setFieldValue,
    fieldValues,
    effectiveFields,
    startTime,
    canvasIsEmpty,
    canAdvanceField,
  ])

  const handlePrevField = useCallback(() => {
    if (!isFirstField) {
      setCurrentFieldIndex((i) => i - 1)
      setStrokes([])
      setCurrentStroke([])
      setTypedSignature('')
      setSignatureMode('draw')
      setValidationMessage(null)
    }
  }, [isFirstField])

  // ── Field select (from FieldChecklist sidebar) ──────────────────
  const handleFieldSelect = useCallback(
    (index: number) => {
      if (!currentField) return

      // Save current field value before jumping
      if (
        currentField.type === FieldType.Signature ||
        currentField.type === FieldType.Initial
      ) {
        if (signatureMode === 'draw') {
          const dataUrl = saveCurrentDrawnField()
          if (dataUrl) {
            setFieldValue(currentField.id, dataUrl)
          }
        } else if (typedSignature.trim()) {
          setFieldValue(currentField.id, typedSignature.trim())
        }
      }

      // Jump to the selected field
      setCurrentFieldIndex(index)
      setStrokes([])
      setCurrentStroke([])
      setTypedSignature('')
      setSignatureMode('draw')
      setValidationMessage(null)
    },
    [currentField, signatureMode, typedSignature, saveCurrentDrawnField, setFieldValue]
  )

  // ── Skip optional field ─────────────────────────────────────────
  const handleSkipField = useCallback(() => {
    if (!currentField || currentField.required || isLastField) return

    setCurrentFieldIndex((i) => i + 1)
    setStrokes([])
    setCurrentStroke([])
    setTypedSignature('')
    setSignatureMode('draw')
    setValidationMessage(null)
  }, [currentField, isLastField])

  // ── Completed fields count ──────────────────────────────────────
  const completedFieldsCount = useMemo(() => {
    return effectiveFields.filter((f) => {
      if (f.type === FieldType.DateSigned) return true // auto-filled
      return Boolean(fieldValues[f.id])
    }).length
  }, [effectiveFields, fieldValues])

  // ── Decline handler ─────────────────────────────────────────────
  const handleDeclineSubmit = useCallback(() => {
    if (!declineReason.trim() || !onDecline) return
    onDecline(declineReason.trim())
  }, [declineReason, onDecline])

  const handleDone = useCallback(() => {
    onComplete(capturedDataUrl)
  }, [onComplete, capturedDataUrl])

  const handleDownload = useCallback(() => {
    // In a real app, this would generate a signed PDF
    // For now, show the document name as a download indicator
    const link = window.document.createElement('a')
    link.href = '#'
    link.download = `${doc.name} - Signed.pdf`
    link.click()
  }, [doc.name])

  // ── Keyboard shortcuts ─────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (currentStep !== 'complete') {
          onCancel()
        }
        return
      }

      // Signing step shortcuts
      if (currentStep === 'sign' && currentField) {
        if (e.key === 'Tab' && !e.shiftKey) {
          e.preventDefault()
          handleNextField()
          return
        }
        if (e.key === 'Tab' && e.shiftKey) {
          e.preventDefault()
          handlePrevField()
          return
        }
        if (
          e.key === 'Enter' &&
          currentField.type !== FieldType.Signature &&
          currentField.type !== FieldType.Initial
        ) {
          e.preventDefault()
          handleNextField()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, currentStep, currentField, handleNextField, handlePrevField])

  // ── Render helpers ─────────────────────────────────────────────

  const renderStepIndicator = () => (
    <div className="signing-ceremony-v2__steps" role="navigation" aria-label="Signing progress">
      <div className="signing-ceremony-v2__steps-inner">
        {CEREMONY_STEPS.map((step, i) => (
          <React.Fragment key={step.key}>
            <div
              className={`signing-ceremony-v2__step${
                i === stepIndex ? ' signing-ceremony-v2__step--active' : ''
              }${i < stepIndex ? ' signing-ceremony-v2__step--completed' : ''}`}
            >
              <div className="signing-ceremony-v2__step-circle">
                {i < stepIndex ? <Check size={16} /> : i + 1}
              </div>
              <span className="signing-ceremony-v2__step-label">{step.label}</span>
            </div>
            {i < CEREMONY_STEPS.length - 1 && (
              <div
                className={`signing-ceremony-v2__step-line${
                  i < stepIndex ? ' signing-ceremony-v2__step-line--completed' : ''
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="signing-ceremony-v2__review">
      <div className="signing-ceremony-v2__review-header">
        <h2>Review Document</h2>
        <p>Please review the document details before signing.</p>
      </div>

      <div className="signing-ceremony-v2__doc-info">
        <div className="signing-ceremony-v2__doc-info-row">
          <span className="signing-ceremony-v2__doc-info-label">
            <FileText /> Document
          </span>
          <span className="signing-ceremony-v2__doc-info-value">{doc.name}</span>
        </div>
        <div className="signing-ceremony-v2__doc-info-row">
          <span className="signing-ceremony-v2__doc-info-label">
            <Users /> Signing as
          </span>
          <span className="signing-ceremony-v2__doc-info-value">{signer.name}</span>
        </div>
        <div className="signing-ceremony-v2__doc-info-row">
          <span className="signing-ceremony-v2__doc-info-label">
            <Calendar /> Date
          </span>
          <span className="signing-ceremony-v2__doc-info-value">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Signing order & progress tracker */}
      {doc.signers.length > 1 && (
        <div className="signing-ceremony-v2__signers-progress" data-testid="signers-progress">
          <div className="signing-ceremony-v2__fields-list-title">
            <Users /> Signer Progress ({doc.signers.filter((s) => s.status === SignerStatus.Signed && s.role === SignerRole.Signer).length} of {doc.signers.filter((s) => s.role === SignerRole.Signer).length} completed)
          </div>
          {[...doc.signers]
            .sort((a, b) => a.order - b.order)
            .map((s) => {
              const isCurrent = s.id === signer.id
              const isActive = doc.signingOrder === SigningOrder.Sequential
                ? [...doc.signers]
                    .filter((sig) => sig.status === SignerStatus.Pending)
                    .sort((a, b) => a.order - b.order)[0]?.id === s.id
                : s.status === SignerStatus.Pending

              return (
                <div
                  key={s.id}
                  className={`signing-ceremony-v2__signer-item${isCurrent ? ' signing-ceremony-v2__signer-item--current' : ''}${s.status === SignerStatus.Signed ? ' signing-ceremony-v2__signer-item--signed' : ''}`}
                >
                  <span className="signing-ceremony-v2__signer-order">
                    {doc.signingOrder === SigningOrder.Sequential ? `Step ${s.order}` : `#${s.order}`}
                  </span>
                  <span className="signing-ceremony-v2__signer-name">
                    {s.name}
                    {isCurrent && <span className="signing-ceremony-v2__signer-you"> (You)</span>}
                  </span>
                  <span className={`signing-ceremony-v2__signer-status signing-ceremony-v2__signer-status--${s.status}`}>
                    {s.status === SignerStatus.Signed
                      ? 'Signed'
                      : isActive
                        ? 'Ready to sign'
                        : 'Waiting'}
                  </span>
                </div>
              )
            })}
          {doc.signingOrder === SigningOrder.Sequential && (
            <div className="signing-ceremony-v2__signing-order-note">
              Sequential signing: signers must sign in order
            </div>
          )}
        </div>
      )}

      {effectiveFields.length > 0 && (
        <div className="signing-ceremony-v2__fields-list">
          <div className="signing-ceremony-v2__fields-list-title">
            <PenTool /> Fields to complete ({effectiveFields.length})
          </div>
          {effectiveFields.map((field) => (
            <div key={field.id} className="signing-ceremony-v2__field-item">
              <span className="signing-ceremony-v2__field-item-icon">
                {getFieldIcon(field.type)}
              </span>
              <span className="signing-ceremony-v2__field-item-label">
                {field.label ?? getFieldLabel(field.type)}
              </span>
              {field.required && (
                <span className="signing-ceremony-v2__field-item-badge">Required</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="signing-ceremony-v2__review-confirm">
        <label className="signing-ceremony-v2__review-checkbox">
          <input
            type="checkbox"
            checked={reviewConfirmed}
            onChange={(e) => setReviewConfirmed(e.target.checked)}
          />
          I have reviewed this document and agree to sign it electronically.
        </label>
        <label className="signing-ceremony-v2__review-checkbox">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          I agree to use electronic signatures for this document.
        </label>
        <div className="signing-ceremony-v2__legal-notice">
          By checking these boxes, you consent to sign this document electronically.
          Electronic signatures are legally binding under the ESIGN Act and UETA.
          You may request a paper copy at any time.
        </div>
      </div>
    </div>
  )

  const renderSignatureDrawPad = () => (
    <>
      <div
        className={`signing-ceremony-v2__canvas-wrapper${
          !canvasIsEmpty ? ' signing-ceremony-v2__canvas-wrapper--has-content' : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          className="signing-ceremony-v2__canvas"
          style={{ height: 160 }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          data-testid="signature-canvas"
        />
        {canvasIsEmpty && (
          <div className="signing-ceremony-v2__canvas-placeholder">
            <PenTool />
            <span>Draw your signature here</span>
          </div>
        )}
      </div>
      <div className="signing-ceremony-v2__canvas-actions">
        <button
          type="button"
          className="signing-ceremony-v2__canvas-action-btn"
          onClick={handleUndoStroke}
          disabled={canvasIsEmpty}
          aria-label="Undo"
        >
          <Undo2 /> Undo
        </button>
        <button
          type="button"
          className="signing-ceremony-v2__canvas-action-btn"
          onClick={handleClearCanvas}
          disabled={canvasIsEmpty}
          aria-label="Clear"
        >
          <Eraser /> Clear
        </button>
      </div>
    </>
  )

  const renderSignatureTypePad = () => (
    <div className="signing-ceremony-v2__type-input-wrapper">
      <input
        type="text"
        className="signing-ceremony-v2__type-input"
        value={typedSignature}
        onChange={(e) => { setTypedSignature(e.target.value); setValidationMessage(null) }}
        placeholder="Type your full name"
        autoFocus
        aria-label="Type your signature"
      />
      {typedSignature.trim() && (
        <div className="signing-ceremony-v2__type-preview" aria-label="Signature preview">
          {typedSignature}
        </div>
      )}
    </div>
  )

  const renderInitialsPad = () => (
    <input
      type="text"
      className="signing-ceremony-v2__initials-input"
      value={fieldValues[currentField?.id ?? ''] ?? ''}
      onChange={(e) => {
        if (currentField) {
          setFieldValue(currentField.id, e.target.value.slice(0, 5))
        }
      }}
      placeholder="Initials"
      maxLength={5}
      autoFocus
      aria-label="Type your initials"
    />
  )

  const renderDateField = () => (
    <>
      <div className="signing-ceremony-v2__date-display">
        <Calendar />
        {fieldValues[currentField?.id ?? ''] ?? new Date().toLocaleDateString()}
      </div>
      <span className="signing-ceremony-v2__date-auto-label">
        Date auto-filled with today&apos;s date
      </span>
    </>
  )

  const renderTextField = () => (
    <input
      type="text"
      className="signing-ceremony-v2__text-input"
      value={fieldValues[currentField?.id ?? ''] ?? ''}
      onChange={(e) => {
        if (currentField) {
          setFieldValue(currentField.id, e.target.value)
        }
      }}
      placeholder={currentField?.placeholder ?? 'Enter text'}
      autoFocus
      aria-label={currentField?.label ?? 'Text input'}
    />
  )

  const renderCheckboxField = () => (
    <div className="signing-ceremony-v2__checkbox-wrapper">
      <input
        type="checkbox"
        className="signing-ceremony-v2__checkbox-input"
        checked={fieldValues[currentField?.id ?? ''] === 'true'}
        onChange={(e) => {
          if (currentField) {
            setFieldValue(currentField.id, e.target.checked ? 'true' : '')
          }
        }}
        id="ceremony-checkbox-field"
        aria-label={currentField?.label ?? 'Checkbox'}
      />
      <label
        className="signing-ceremony-v2__checkbox-label-text"
        htmlFor="ceremony-checkbox-field"
      >
        {currentField?.label ?? 'I agree'}
      </label>
    </div>
  )

  const renderDropdownField = () => (
    <select
      className="signing-ceremony-v2__dropdown"
      value={fieldValues[currentField?.id ?? ''] ?? ''}
      onChange={(e) => {
        if (currentField) {
          setFieldValue(currentField.id, e.target.value)
        }
      }}
      aria-label={currentField?.label ?? 'Select an option'}
    >
      <option value="">Select an option</option>
      {(currentField?.options ?? []).map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )

  const renderCurrentFieldInput = () => {
    if (!currentField) return null

    switch (currentField.type) {
      case FieldType.Signature:
        return (
          <>
            <div className="signing-ceremony-v2__sig-tabs" role="tablist" aria-label="Signature method">
              <button
                type="button"
                role="tab"
                className={`signing-ceremony-v2__sig-tab${
                  signatureMode === 'draw' ? ' signing-ceremony-v2__sig-tab--active' : ''
                }`}
                onClick={() => setSignatureMode('draw')}
                aria-selected={signatureMode === 'draw'}
              >
                <PenTool /> Draw
              </button>
              <button
                type="button"
                role="tab"
                className={`signing-ceremony-v2__sig-tab${
                  signatureMode === 'type' ? ' signing-ceremony-v2__sig-tab--active' : ''
                }`}
                onClick={() => setSignatureMode('type')}
                aria-selected={signatureMode === 'type'}
              >
                <Type /> Type
              </button>
            </div>
            {signatureMode === 'draw' ? renderSignatureDrawPad() : renderSignatureTypePad()}
          </>
        )

      case FieldType.Initial:
        return renderInitialsPad()

      case FieldType.DateSigned:
        return renderDateField()

      case FieldType.Text:
        return renderTextField()

      case FieldType.Checkbox:
        return renderCheckboxField()

      case FieldType.Dropdown:
        return renderDropdownField()

      default:
        return renderTextField()
    }
  }

  const renderSignStep = () => (
    <div className="signing-ceremony-v2__sign-layout">
      {effectiveFields.length > 1 && (
        <FieldChecklist
          fields={effectiveFields}
          currentFieldIndex={currentFieldIndex}
          fieldValues={fieldValues}
          onFieldSelect={handleFieldSelect}
        />
      )}
      <div className="signing-ceremony-v2__sign-main">
        <div className="signing-ceremony-v2__sign">
          <div className="signing-ceremony-v2__sign-header">
            <h2>Sign Document</h2>
            <p>Complete each field below to sign the document.</p>
          </div>

          {/* Completion progress */}
          <div className="signing-ceremony-v2__completion-progress" data-testid="completion-progress">
            <div className="signing-ceremony-v2__progress-text">
              {completedFieldsCount} of {effectiveFields.length} fields completed
            </div>
            <div className="signing-ceremony-v2__progress-bar">
              <div
                className="signing-ceremony-v2__progress-fill"
                style={{ width: `${effectiveFields.length > 0 ? (completedFieldsCount / effectiveFields.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {effectiveFields.length > 1 && (
            <div className="signing-ceremony-v2__field-nav">
              <span className="signing-ceremony-v2__field-counter">
                Field <span>{currentFieldIndex + 1}</span> of {effectiveFields.length}
              </span>
              <div className="signing-ceremony-v2__field-nav-buttons">
                <button
                  type="button"
                  className="signing-ceremony-v2__field-nav-btn"
                  onClick={handlePrevField}
                  disabled={isFirstField}
                  aria-label="Previous field"
                >
                  <ChevronLeft />
                </button>
                <button
                  type="button"
                  className="signing-ceremony-v2__field-nav-btn"
                  onClick={handleNextField}
                  aria-label="Next field"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          )}

          {currentField && (
            <div className="signing-ceremony-v2__field-card" key={currentField.id}>
              <div className="signing-ceremony-v2__field-card-header">
                <span className="signing-ceremony-v2__field-card-title">
                  {getFieldIcon(currentField.type)}
                  {currentField.label ?? getFieldLabel(currentField.type)}
                </span>
                {currentField.required && (
                  <span className="signing-ceremony-v2__field-required-badge">Required</span>
                )}
              </div>

              {renderCurrentFieldInput()}

              {validationMessage && (
                <div className="signing-ceremony-v2__field-validation" role="alert">
                  {validationMessage}
                </div>
              )}
            </div>
          )}

          {effectiveFields.length > 1 && (
            <div className="signing-ceremony-v2__keyboard-hint">
              Press Tab to advance &middot; Shift+Tab to go back
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="signing-ceremony-v2__complete">
      <div className="signing-ceremony-v2__success-icon">
        <Check strokeWidth={3} />
      </div>
      <h2>Document Signed Successfully</h2>
      <p className="signing-ceremony-v2__complete-subtitle">
        All fields have been completed. The document has been signed by {signer.name}.
      </p>

      <div className="signing-ceremony-v2__complete-details">
        <div className="signing-ceremony-v2__complete-detail-row">
          <span className="signing-ceremony-v2__complete-detail-label">Signed by</span>
          <span className="signing-ceremony-v2__complete-detail-value">{signer.name}</span>
        </div>
        <div className="signing-ceremony-v2__complete-detail-row">
          <span className="signing-ceremony-v2__complete-detail-label">Email</span>
          <span className="signing-ceremony-v2__complete-detail-value">{signer.email}</span>
        </div>
        <div className="signing-ceremony-v2__complete-detail-row">
          <span className="signing-ceremony-v2__complete-detail-label">Signed at</span>
          <span className="signing-ceremony-v2__complete-detail-value">
            {signedTimestamp ? new Date(signedTimestamp).toLocaleString() : ''}
          </span>
        </div>
      </div>

      <div className="signing-ceremony-v2__complete-timer">
        <Clock size={16} />
        Completed in {formatElapsed(finalElapsed)}
      </div>

      <div className="signing-ceremony-v2__complete-actions">
        <button
          type="button"
          className="signing-ceremony-v2__btn-download"
          onClick={handleDownload}
        >
          <Download /> Download Signed Document
        </button>
        <button
          type="button"
          className="signing-ceremony-v2__btn-secondary"
          onClick={handleDone}
        >
          <ArrowLeft /> Back to Documents
        </button>
      </div>
    </div>
  )

  // ── Main render ────────────────────────────────────────────────
  return (
    <div className="signing-ceremony-v2" role="dialog" aria-modal="true" aria-label="Signing Ceremony">
      {/* Top bar */}
      <div className="signing-ceremony-v2__top-bar">
        <div className="signing-ceremony-v2__top-bar-left">
          <span className="signing-ceremony-v2__logo">
            <PenTool className="signing-ceremony-v2__logo-icon" />
            OriginA
          </span>
          <span className="signing-ceremony-v2__doc-name">{doc.name}</span>
        </div>
        <div className="signing-ceremony-v2__top-bar-right">
          <span className="signing-ceremony-v2__timer" aria-label="Time elapsed">
            <Clock className="signing-ceremony-v2__timer-icon" />
            {currentStep === 'complete'
              ? formatElapsed(finalElapsed)
              : formatElapsed(elapsed)}
          </span>
          {currentStep !== 'complete' && (
            <button
              type="button"
              className="signing-ceremony-v2__close-btn"
              onClick={onCancel}
              aria-label="Close signing ceremony"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Step indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <div className="signing-ceremony-v2__content">
        <div className="signing-ceremony-v2__content-inner" key={currentStep}>
          {currentStep === 'review' && renderReviewStep()}
          {currentStep === 'sign' && renderSignStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </div>
      </div>

      {/* Decline modal */}
      {showDecline && (
        <div className="signing-ceremony-v2__decline-overlay" role="dialog" aria-modal="true" aria-label="Decline signing">
          <div className="signing-ceremony-v2__decline-modal">
            <h3>Decline to Sign</h3>
            <p>Please provide a reason for declining to sign this document.</p>
            <textarea
              className="signing-ceremony-v2__decline-textarea"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter your reason for declining..."
              rows={4}
              aria-label="Decline reason"
              autoFocus
            />
            <div className="signing-ceremony-v2__decline-actions">
              <button
                type="button"
                className="signing-ceremony-v2__btn-secondary"
                onClick={() => { setShowDecline(false); setDeclineReason('') }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="signing-ceremony-v2__btn-danger"
                onClick={handleDeclineSubmit}
                disabled={!declineReason.trim()}
              >
                Decline Signing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer navigation (not shown on complete step) */}
      {currentStep !== 'complete' && (
        <div className="signing-ceremony-v2__footer">
          <div className="signing-ceremony-v2__footer-left">
            {currentStep === 'sign' && (
              <button
                type="button"
                className="signing-ceremony-v2__btn-secondary"
                onClick={isFirstField ? handlePrevStep : handlePrevField}
              >
                <ChevronLeft /> Back
              </button>
            )}
            {onDecline && (
              <button
                type="button"
                className="signing-ceremony-v2__btn-decline"
                onClick={() => setShowDecline(true)}
                aria-label="Decline to sign"
              >
                Decline
              </button>
            )}
          </div>
          <div className="signing-ceremony-v2__footer-right">
            {currentStep === 'review' && (
              <button
                type="button"
                className="signing-ceremony-v2__btn-primary"
                onClick={handleNextStep}
                disabled={!reviewConfirmed || !termsAccepted}
              >
                Next <ChevronRight />
              </button>
            )}
            {currentStep === 'sign' && currentField && !currentField.required && !isLastField && (
              <button
                type="button"
                className="signing-ceremony-v2__btn-skip"
                onClick={handleSkipField}
              >
                <SkipForward /> Skip
              </button>
            )}
            {currentStep === 'sign' && (
              <button
                type="button"
                className="signing-ceremony-v2__btn-primary"
                onClick={handleNextField}
              >
                {isLastField ? (
                  <>
                    <Check /> Finish Signing
                  </>
                ) : (
                  <>
                    Next Field <ChevronRight />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SigningCeremony
