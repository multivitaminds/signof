import { useState, useCallback, useMemo } from 'react'
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Printer,
  Maximize2,
  PenTool,
  Type,
  Calendar,
  CheckSquare,
  ChevronDown,
  Paperclip,
} from 'lucide-react'
import type { Document, DocumentField } from '../../../../types'
import { FieldType } from '../../../../types'
import { FIELD_COLORS } from '../../lib/fieldTypes'
import './DocumentPreview.css'

// ─── Types ──────────────────────────────────────────────────────────

interface DocumentPreviewProps {
  document: Document
  onClose?: () => void
}

// ─── Helpers ────────────────────────────────────────────────────────

function getFieldIcon(type: FieldType): React.ReactNode {
  switch (type) {
    case FieldType.Signature:
      return <PenTool size={12} />
    case FieldType.Initial:
      return <Type size={12} />
    case FieldType.DateSigned:
      return <Calendar size={12} />
    case FieldType.Text:
      return <Type size={12} />
    case FieldType.Checkbox:
      return <CheckSquare size={12} />
    case FieldType.Dropdown:
      return <ChevronDown size={12} />
    case FieldType.Attachment:
      return <Paperclip size={12} />
    default:
      return <Type size={12} />
  }
}

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2]
const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const PLACEHOLDER_LINE_WIDTHS = [78, 91, 65, 83, 72, 87, 69, 94, 76, 81, 88, 63, 79, 85, 71, 90, 67, 82, 74, 86]

// ─── Component ──────────────────────────────────────────────────────

function DocumentPreview({ document: doc, onClose }: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  // Determine total pages from fields
  const totalPages = useMemo(() => {
    if (doc.fields.length === 0) return 1
    return Math.max(1, ...doc.fields.map((f) => f.page))
  }, [doc.fields])

  // Fields for current page
  const pageFields = useMemo(
    () => doc.fields.filter((f) => f.page === currentPage),
    [doc.fields, currentPage]
  )

  // Signer color map
  const signerColors = useMemo(() => {
    const colors: Record<string, string> = {}
    doc.signers.forEach((s, i) => {
      colors[s.id] = FIELD_COLORS[i % FIELD_COLORS.length] ?? '#6B7280'
    })
    return colors
  }, [doc.signers])

  // Signer name map
  const signerNames = useMemo(() => {
    const names: Record<string, string> = {}
    doc.signers.forEach((s) => {
      names[s.id] = s.name
    })
    return names
  }, [doc.signers])

  // Check if a field has been signed
  const getFieldValue = useCallback(
    (field: DocumentField): string | null => {
      // Check if there's a signature for this field's signer
      const sig = doc.signatures.find((s) => s.signerId === field.recipientId)
      if (sig && (field.type === FieldType.Signature || field.type === FieldType.Initial)) {
        return sig.dataUrl
      }
      return field.value ?? null
    },
    [doc.signatures]
  )

  // ── Zoom controls ─────────────────────────────────────────────────

  const handleZoomIn = useCallback(() => {
    setZoom((z) => {
      const idx = ZOOM_LEVELS.indexOf(z)
      return idx < ZOOM_LEVELS.length - 1 ? (ZOOM_LEVELS[idx + 1] ?? z) : z
    })
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      const idx = ZOOM_LEVELS.indexOf(z)
      return idx > 0 ? (ZOOM_LEVELS[idx - 1] ?? z) : z
    })
  }, [])

  const handleResetZoom = useCallback(() => {
    setZoom(1)
  }, [])

  // ── Page navigation ───────────────────────────────────────────────

  const handlePrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages, p + 1))
  }, [totalPages])

  // ── Print ─────────────────────────────────────────────────────────

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  // ── Render field overlay ──────────────────────────────────────────

  const renderField = (field: DocumentField) => {
    const value = getFieldValue(field)
    const color = signerColors[field.recipientId] ?? '#6B7280'
    const signerName = signerNames[field.recipientId] ?? 'Unknown'
    const isSigned = value !== null && value !== ''
    const leftPct = (field.x / PAGE_WIDTH) * 100
    const topPct = (field.y / PAGE_HEIGHT) * 100
    const widthPct = (field.width / PAGE_WIDTH) * 100
    const heightPct = (field.height / PAGE_HEIGHT) * 100

    return (
      <div
        key={field.id}
        className={`doc-preview__field${isSigned ? ' doc-preview__field--signed' : ''}`}
        style={{
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
          borderColor: color,
          backgroundColor: isSigned ? `${color}1A` : `${color}0D`,
        }}
        title={`${field.label ?? field.type} - ${signerName}`}
      >
        {isSigned ? (
          <div className="doc-preview__field-value">
            {value?.startsWith('data:image') ? (
              <img
                src={value}
                alt={`${field.type} by ${signerName}`}
                className="doc-preview__field-signature-img"
              />
            ) : value?.startsWith('typed:') ? (
              <span className="doc-preview__field-typed">{value.slice(6)}</span>
            ) : (
              <span className="doc-preview__field-text">{value}</span>
            )}
          </div>
        ) : (
          <div className="doc-preview__field-placeholder" style={{ color }}>
            {getFieldIcon(field.type)}
            <span>{field.label ?? field.type}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="doc-preview" role="region" aria-label="Document preview">
      {/* Toolbar */}
      <div className="doc-preview__toolbar">
        <div className="doc-preview__toolbar-left">
          <span className="doc-preview__doc-name">{doc.name}</span>
        </div>

        <div className="doc-preview__toolbar-center">
          {/* Zoom controls */}
          <button
            type="button"
            className="doc-preview__tool-btn"
            onClick={handleZoomOut}
            disabled={zoom <= ZOOM_LEVELS[0]!}
            aria-label="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            className="doc-preview__zoom-label"
            onClick={handleResetZoom}
            aria-label="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            className="doc-preview__tool-btn"
            onClick={handleZoomIn}
            disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]!}
            aria-label="Zoom in"
          >
            <ZoomIn size={16} />
          </button>

          {/* Separator */}
          <div className="doc-preview__separator" />

          {/* Page navigation */}
          {totalPages > 1 && (
            <>
              <button
                type="button"
                className="doc-preview__tool-btn"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="doc-preview__page-label">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                className="doc-preview__tool-btn"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        <div className="doc-preview__toolbar-right">
          <button
            type="button"
            className="doc-preview__tool-btn"
            onClick={handleResetZoom}
            aria-label="Fit to width"
          >
            <Maximize2 size={16} />
          </button>
          <button
            type="button"
            className="doc-preview__tool-btn"
            onClick={handlePrint}
            aria-label="Print document"
          >
            <Printer size={16} />
          </button>
          {onClose && (
            <button
              type="button"
              className="doc-preview__close-btn"
              onClick={onClose}
              aria-label="Close preview"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Document canvas */}
      <div className="doc-preview__viewport">
        <div
          className="doc-preview__page"
          style={{
            width: PAGE_WIDTH * zoom,
            height: PAGE_HEIGHT * zoom,
          }}
        >
          {/* Document background */}
          <div className="doc-preview__page-bg">
            {/* Placeholder lines for document content */}
            <div className="doc-preview__placeholder-lines">
              {PLACEHOLDER_LINE_WIDTHS.map((w, i) => (
                <div
                  key={i}
                  className="doc-preview__placeholder-line"
                  style={{
                    width: `${w}%`,
                    top: `${5 + i * 4.5}%`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Field overlays */}
          {pageFields.map(renderField)}
        </div>
      </div>

      {/* Signer legend */}
      {doc.signers.length > 0 && (
        <div className="doc-preview__legend">
          {doc.signers.map((s, i) => {
            const color = FIELD_COLORS[i % FIELD_COLORS.length] ?? '#6B7280'
            const fieldCount = doc.fields.filter((f) => f.recipientId === s.id).length
            return (
              <div key={s.id} className="doc-preview__legend-item">
                <span className="doc-preview__legend-dot" style={{ backgroundColor: color }} />
                <span className="doc-preview__legend-name">{s.name}</span>
                <span className="doc-preview__legend-count">
                  {fieldCount} field{fieldCount !== 1 ? 's' : ''}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DocumentPreview
