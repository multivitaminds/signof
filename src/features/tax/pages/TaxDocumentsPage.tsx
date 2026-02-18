import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  Upload,
  Trash2,
  X,
  Plus,
  FileCheck,
  AlertTriangle,
  FileText,
  Scan,
  ChevronDown,
  ChevronUp,
  Loader,
  CheckCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import {
  useTaxDocumentStore,
  DocReviewStatus,
  DOC_REVIEW_LABELS,
  detectFormType,
  setFileBlob,
} from '../stores/useTaxDocumentStore'
import {
  TaxFormType,
  TAX_FORM_LABELS,
} from '../types'
import type { TaxYear } from '../types'
import { useNavigate } from 'react-router-dom'
import { createExtractionQueue } from '../lib/extractionQueue'
import ExtractionConfirmation from '../components/ExtractionConfirmation/ExtractionConfirmation'
import './TaxDocumentsPage.css'

const FORM_TYPE_OPTIONS: { value: TaxFormType; label: string }[] = [
  { value: TaxFormType.W2, label: 'W-2' },
  { value: TaxFormType.NEC1099, label: '1099-NEC' },
  { value: TaxFormType.INT1099, label: '1099-INT' },
  { value: TaxFormType.DIV1099, label: '1099-DIV' },
  { value: TaxFormType.MISC1099, label: '1099-MISC' },
  { value: TaxFormType.K1099, label: '1099-K' },
  { value: TaxFormType.R1099, label: '1099-R' },
  { value: TaxFormType.Mortgage1098, label: '1098' },
  { value: TaxFormType.E1098, label: '1098-E' },
  { value: TaxFormType.T1098, label: '1098-T' },
  { value: TaxFormType.ACA1095A, label: '1095-A' },
  { value: TaxFormType.W9, label: 'W-9' },
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function TaxDocumentsPage() {
  const documents = useTaxDocumentStore((s) => s.documents)
  const activeTaxYear = useTaxDocumentStore((s) => s.activeTaxYear)
  const addDocument = useTaxDocumentStore((s) => s.addDocument)
  const deleteDocument = useTaxDocumentStore((s) => s.deleteDocument)
  const updateDocumentStatus = useTaxDocumentStore((s) => s.updateDocumentStatus)
  const isDragging = useTaxDocumentStore((s) => s.isDragging)
  const setDragging = useTaxDocumentStore((s) => s.setDragging)
  const totalCount = useTaxDocumentStore((s) => s.totalCount)
  const issueCount = useTaxDocumentStore((s) => s.issueCount)
  const extractDocument = useTaxDocumentStore((s) => s.extractDocument)
  const extractionResults = useTaxDocumentStore((s) => s.extractionResults)
  const setExtractionConfirmed = useTaxDocumentStore((s) => s.setExtractionConfirmed)
  const updateExtractionField = useTaxDocumentStore((s) => s.updateExtractionField)
  const setFieldConfirmed = useTaxDocumentStore((s) => s.setFieldConfirmed)
  const navigate = useNavigate()

  const [showUploadForm, setShowUploadForm] = useState(false)
  const [newDocName, setNewDocName] = useState('')
  const [newDocType, setNewDocType] = useState<TaxFormType>(TaxFormType.W2)
  const [newEmployer, setNewEmployer] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<DocReviewStatus>(DocReviewStatus.PendingReview)
  const [editNote, setEditNote] = useState('')
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null)
  const [extractingIds, setExtractingIds] = useState<Set<string>>(new Set())
  const [batchExtracting, setBatchExtracting] = useState(false)

  // Track which docs we've auto-extracted so we don't re-trigger
  const autoExtractedRef = useRef<Set<string>>(new Set())

  const yearDocuments = useMemo(
    () => documents.filter((d) => d.taxYear === activeTaxYear),
    [documents, activeTaxYear]
  )

  // Count extracted documents
  const extractedCount = useMemo(
    () => yearDocuments.filter((d) => extractionResults[d.id]?.extractedAt).length,
    [yearDocuments, extractionResults]
  )

  // Count confirmed documents
  const confirmedCount = useMemo(
    () => yearDocuments.filter((d) => {
      const result = extractionResults[d.id]
      return result?.extractedAt && result.fields.every((f) => f.confirmed)
    }).length,
    [yearDocuments, extractionResults]
  )

  // ─── Extraction Queue ───────────────────────────────────────────────

  const queueRef = useRef(
    createExtractionQueue(
      (docId: string) => extractDocument(docId),
      {
        concurrency: 2,
        maxRetries: 3,
        baseDelay: 1000,
        onStart: (docId) =>
          setExtractingIds((prev) => new Set(prev).add(docId)),
        onComplete: (docId) =>
          setExtractingIds((prev) => {
            const next = new Set(prev)
            next.delete(docId)
            return next
          }),
        onError: (docId) =>
          setExtractingIds((prev) => {
            const next = new Set(prev)
            next.delete(docId)
            return next
          }),
      },
    ),
  )

  // Auto-extract newly uploaded documents
  useEffect(() => {
    const toExtract: string[] = []
    for (const doc of yearDocuments) {
      if (
        !extractionResults[doc.id]?.extractedAt &&
        !extractingIds.has(doc.id) &&
        !autoExtractedRef.current.has(doc.id)
      ) {
        autoExtractedRef.current.add(doc.id)
        toExtract.push(doc.id)
      }
    }

    if (toExtract.length === 0) return
    void queueRef.current.enqueue(toExtract)
  }, [yearDocuments, extractionResults, extractingIds])

  const handleExtractAll = useCallback(() => {
    const unextracted = yearDocuments.filter(
      (d) => !extractionResults[d.id]?.extractedAt && !extractingIds.has(d.id)
    )
    if (unextracted.length === 0) return
    setBatchExtracting(true)
    void queueRef.current
      .enqueue(unextracted.map((d) => d.id))
      .finally(() => setBatchExtracting(false))
  }, [yearDocuments, extractionResults, extractingIds])

  const handleExtractSingle = useCallback(
    (docId: string) => {
      if (extractingIds.has(docId)) return
      void queueRef.current.enqueue([docId]).then(() => setExpandedDocId(docId))
    },
    [extractingIds]
  )

  const handleConfirmAll = useCallback(
    (docId: string) => {
      setExtractionConfirmed(docId, true)
      updateDocumentStatus(docId, DocReviewStatus.Verified)
    },
    [setExtractionConfirmed, updateDocumentStatus]
  )

  const handleAddDocument = useCallback(() => {
    if (!newDocName.trim()) return
    addDocument({
      fileName: newDocName.trim(),
      formType: newDocType,
      taxYear: activeTaxYear as TaxYear,
      employerName: newEmployer.trim() || 'Unknown',
      fileSize: Math.floor(Math.random() * 500000) + 50000,
    })
    setNewDocName('')
    setNewDocType(TaxFormType.W2)
    setNewEmployer('')
    setShowUploadForm(false)
  }, [newDocName, newDocType, newEmployer, activeTaxYear, addDocument])

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragging(true)
    },
    [setDragging]
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragging(false)
    },
    [setDragging]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragging(false)

      const files = Array.from(e.dataTransfer.files)
      for (const file of files) {
        const detectedType = detectFormType(file.name)
        const id = addDocument({
          fileName: file.name,
          formType: detectedType,
          taxYear: activeTaxYear as TaxYear,
          employerName: 'Auto-detected',
          fileSize: file.size,
        })
        setFileBlob(id, file)
      }
    },
    [addDocument, activeTaxYear, setDragging]
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteDocument(id)
    },
    [deleteDocument]
  )

  const handleStartEdit = useCallback(
    (id: string, currentStatus: DocReviewStatus, currentNote: string) => {
      setEditingId(id)
      setEditStatus(currentStatus)
      setEditNote(currentNote)
    },
    []
  )

  const handleSaveEdit = useCallback(() => {
    if (!editingId) return
    updateDocumentStatus(editingId, editStatus, editNote)
    setEditingId(null)
  }, [editingId, editStatus, editNote, updateDocumentStatus])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAddDocument()
      }
    },
    [handleAddDocument]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files) return
      for (const file of Array.from(files)) {
        const detectedType = detectFormType(file.name)
        const id = addDocument({
          fileName: file.name,
          formType: detectedType,
          taxYear: activeTaxYear as TaxYear,
          employerName: 'Auto-detected',
          fileSize: file.size,
        })
        setFileBlob(id, file)
      }
      e.target.value = ''
    },
    [addDocument, activeTaxYear]
  )

  const handleToggleExpand = useCallback((docId: string) => {
    setExpandedDocId((prev) => (prev === docId ? null : docId))
  }, [])

  const handleContinueToInterview = useCallback(() => {
    navigate('/tax/interview')
  }, [navigate])

  const handleEditField = useCallback(
    (docId: string, fieldIndex: number, value: string) => {
      updateExtractionField(docId, fieldIndex, value)
    },
    [updateExtractionField]
  )

  const handleToggleField = useCallback(
    (docId: string, fieldIndex: number, confirmed: boolean) => {
      setFieldConfirmed(docId, fieldIndex, confirmed)
    },
    [setFieldConfirmed]
  )

  return (
    <div className="tax-documents">
      <div className="tax-documents__header">
        <div>
          <h2 className="tax-documents__title">Tax Documents</h2>
          <p className="tax-documents__subtitle">
            Upload your tax forms and we will automatically extract the data for your filing.
          </p>
        </div>
        <div className="tax-documents__header-actions">
          {yearDocuments.length > 0 && (
            <button
              className="btn-secondary tax-documents__extract-all-btn"
              onClick={handleExtractAll}
              disabled={batchExtracting || extractedCount === yearDocuments.length}
              type="button"
            >
              {batchExtracting ? (
                <Loader size={16} className="tax-documents__spinner" />
              ) : (
                <Scan size={16} />
              )}
              <span>
                {extractedCount === yearDocuments.length
                  ? 'All Extracted'
                  : batchExtracting
                    ? 'Extracting...'
                    : 'Extract All'}
              </span>
            </button>
          )}
          <button
            className="btn-primary tax-documents__upload-btn"
            onClick={() => setShowUploadForm(true)}
            type="button"
          >
            <Plus size={16} />
            <span>Add Document</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="tax-documents__summary" role="region" aria-label="Document summary">
        <div className="tax-documents__stat-card">
          <div className="tax-documents__stat-icon tax-documents__stat-icon--total">
            <FileText size={20} />
          </div>
          <div className="tax-documents__stat-info">
            <span className="tax-documents__stat-value">{totalCount()}</span>
            <span className="tax-documents__stat-label">Uploaded</span>
          </div>
        </div>
        <div className="tax-documents__stat-card">
          <div className="tax-documents__stat-icon tax-documents__stat-icon--extracted">
            <Scan size={20} />
          </div>
          <div className="tax-documents__stat-info">
            <span className="tax-documents__stat-value">{extractedCount}</span>
            <span className="tax-documents__stat-label">Extracted</span>
          </div>
        </div>
        <div className="tax-documents__stat-card">
          <div className="tax-documents__stat-icon tax-documents__stat-icon--verified">
            <FileCheck size={20} />
          </div>
          <div className="tax-documents__stat-info">
            <span className="tax-documents__stat-value">{confirmedCount}</span>
            <span className="tax-documents__stat-label">Confirmed</span>
          </div>
        </div>
        <div className="tax-documents__stat-card">
          <div className="tax-documents__stat-icon tax-documents__stat-icon--issues">
            <AlertTriangle size={20} />
          </div>
          <div className="tax-documents__stat-info">
            <span className="tax-documents__stat-value">{issueCount()}</span>
            <span className="tax-documents__stat-label">Issues</span>
          </div>
        </div>
      </div>

      {/* Flow Indicator */}
      <div className="tax-documents__flow-steps">
        <div className={`tax-documents__flow-step ${yearDocuments.length > 0 ? 'tax-documents__flow-step--done' : 'tax-documents__flow-step--active'}`}>
          <div className="tax-documents__flow-dot">
            {yearDocuments.length > 0 ? <CheckCircle size={14} /> : '1'}
          </div>
          <span>Upload Documents</span>
        </div>
        <div className="tax-documents__flow-connector" />
        <div className={`tax-documents__flow-step ${extractedCount === yearDocuments.length && yearDocuments.length > 0 ? 'tax-documents__flow-step--done' : extractedCount > 0 ? 'tax-documents__flow-step--active' : ''}`}>
          <div className="tax-documents__flow-dot">
            {extractedCount === yearDocuments.length && yearDocuments.length > 0 ? <CheckCircle size={14} /> : '2'}
          </div>
          <span>Extract Data</span>
        </div>
        <div className="tax-documents__flow-connector" />
        <div className={`tax-documents__flow-step ${confirmedCount === yearDocuments.length && yearDocuments.length > 0 ? 'tax-documents__flow-step--done' : confirmedCount > 0 ? 'tax-documents__flow-step--active' : ''}`}>
          <div className="tax-documents__flow-dot">
            {confirmedCount === yearDocuments.length && yearDocuments.length > 0 ? <CheckCircle size={14} /> : '3'}
          </div>
          <span>Confirm & Review</span>
        </div>
        <div className="tax-documents__flow-connector" />
        <div className="tax-documents__flow-step">
          <div className="tax-documents__flow-dot">4</div>
          <span>File Taxes</span>
        </div>
      </div>

      {/* Continue to Interview CTA */}
      {confirmedCount > 0 && (
        <div className="tax-documents__continue-banner">
          <div className="tax-documents__continue-info">
            <Sparkles size={20} />
            <div>
              <strong>{confirmedCount} document{confirmedCount !== 1 ? 's' : ''} confirmed</strong>
              <p>Your extracted data will auto-populate the tax interview. Ready to file?</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={handleContinueToInterview}
          >
            Continue to File Taxes
          </button>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        className={`tax-documents__dropzone ${isDragging ? 'tax-documents__dropzone--active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Drop files here or click to browse"
      >
        <Upload size={32} />
        <p className="tax-documents__dropzone-text">
          {isDragging
            ? 'Drop your tax documents here'
            : 'Drag & drop tax forms here, or click to browse'}
        </p>
        <p className="tax-documents__dropzone-hint">
          Supports PDF, PNG, JPG. Auto-detects form type and extracts data automatically.
        </p>
        <input
          type="file"
          className="tax-documents__file-input"
          onChange={handleFileInputChange}
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          aria-label="Upload tax documents"
        />
      </div>

      {/* Manual Upload Form */}
      {showUploadForm && (
        <div className="tax-documents__upload-form">
          <div className="tax-documents__form-header">
            <h3>Add Tax Document Manually</h3>
            <button
              className="btn-ghost"
              onClick={() => setShowUploadForm(false)}
              type="button"
              aria-label="Close upload form"
            >
              <X size={16} />
            </button>
          </div>
          <div className="tax-documents__form-fields">
            <div className="tax-documents__field">
              <label htmlFor="doc-name" className="tax-documents__label">
                Document Name
              </label>
              <input
                id="doc-name"
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Acme Corp W-2"
                className="tax-documents__input"
                autoFocus
              />
            </div>
            <div className="tax-documents__field">
              <label htmlFor="doc-type" className="tax-documents__label">
                Form Type
              </label>
              <select
                id="doc-type"
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value as TaxFormType)}
                className="tax-documents__select"
              >
                {FORM_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="tax-documents__field">
              <label htmlFor="doc-employer" className="tax-documents__label">
                Employer / Institution
              </label>
              <input
                id="doc-employer"
                type="text"
                value={newEmployer}
                onChange={(e) => setNewEmployer(e.target.value)}
                placeholder="e.g., Acme Corporation"
                className="tax-documents__input"
              />
            </div>
          </div>
          <div className="tax-documents__form-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowUploadForm(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleAddDocument}
              disabled={!newDocName.trim()}
              type="button"
            >
              <Upload size={16} />
              <span>Upload</span>
            </button>
          </div>
        </div>
      )}

      {/* Document List */}
      {yearDocuments.length === 0 ? (
        <div className="tax-documents__empty">
          <Upload size={32} />
          <p>No documents uploaded for tax year {activeTaxYear}.</p>
          <p className="tax-documents__empty-hint">
            Upload your W-2s, 1099s, and other tax documents. We will automatically extract and organize the data.
          </p>
          <button
            className="btn-primary"
            onClick={() => setShowUploadForm(true)}
            type="button"
          >
            Upload your first document
          </button>
        </div>
      ) : (
        <div className="tax-documents__list">
          <div className="tax-documents__list-header">
            <span>Document</span>
            <span>Form Type</span>
            <span>Employer / Institution</span>
            <span>Extraction</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {yearDocuments.map((doc) => {
            const result = extractionResults[doc.id]
            const isExtracting = extractingIds.has(doc.id)
            const hasExtraction = !!result?.extractedAt
            const isExpanded = expandedDocId === doc.id
            const allConfirmed = hasExtraction && result.fields.every((f) => f.confirmed)

            return (
              <div key={doc.id} className={`tax-documents__item ${isExpanded ? 'tax-documents__item--expanded' : ''}`}>
                <div className="tax-documents__item-row">
                  <div className="tax-documents__item-name">
                    <FileText size={16} />
                    <div>
                      <span className="tax-documents__item-title">{doc.fileName}</span>
                      <span className="tax-documents__item-size">{formatFileSize(doc.fileSize)}</span>
                    </div>
                  </div>
                  <span className={`tax-documents__type-badge tax-documents__type-badge--${doc.formType.replace(/_/g, '-')}`}>
                    {TAX_FORM_LABELS[doc.formType]}
                  </span>
                  <span className="tax-documents__item-employer">{doc.employerName}</span>
                  <div className="tax-documents__extraction-status">
                    {isExtracting ? (
                      <span className="tax-documents__extracting">
                        <Loader size={14} className="tax-documents__spinner" />
                        <span>Extracting...</span>
                      </span>
                    ) : hasExtraction ? (
                      <button
                        type="button"
                        className={`tax-documents__extraction-badge ${allConfirmed ? 'tax-documents__extraction-badge--confirmed' : 'tax-documents__extraction-badge--ready'}`}
                        onClick={() => handleToggleExpand(doc.id)}
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} extraction results`}
                      >
                        {allConfirmed ? (
                          <CheckCircle size={12} />
                        ) : (
                          <ShieldCheck size={12} />
                        )}
                        <span>{allConfirmed ? 'Confirmed' : `${result.overallConfidence}%`}</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="tax-documents__extract-btn"
                        onClick={() => handleExtractSingle(doc.id)}
                      >
                        <Scan size={14} />
                        <span>Extract</span>
                      </button>
                    )}
                  </div>
                  <button
                    className={`tax-documents__status-badge tax-documents__status-badge--${doc.status}`}
                    onClick={() => handleStartEdit(doc.id, doc.status, doc.issueNote)}
                    type="button"
                    aria-label={`Status: ${DOC_REVIEW_LABELS[doc.status]}. Click to change.`}
                  >
                    {DOC_REVIEW_LABELS[doc.status]}
                  </button>
                  <button
                    className="btn-ghost tax-documents__delete-btn"
                    onClick={() => handleDelete(doc.id)}
                    type="button"
                    aria-label={`Delete ${doc.fileName}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {doc.status === DocReviewStatus.IssueFound && doc.issueNote && (
                  <div className="tax-documents__issue-note">
                    <AlertTriangle size={14} />
                    <span>{doc.issueNote}</span>
                  </div>
                )}

                {isExpanded && hasExtraction && (
                  <ExtractionConfirmation
                    result={result}
                    onEdit={(fieldIndex, value) => handleEditField(doc.id, fieldIndex, value)}
                    onConfirm={() => handleConfirmAll(doc.id)}
                    onReject={() => handleExtractSingle(doc.id)}
                    onToggleField={(fieldIndex, confirmed) => handleToggleField(doc.id, fieldIndex, confirmed)}
                  />
                )}

                {editingId === doc.id && (
                  <div className="tax-documents__edit-panel">
                    <div className="tax-documents__edit-fields">
                      <div className="tax-documents__field">
                        <label htmlFor={`status-${doc.id}`} className="tax-documents__label">
                          Review Status
                        </label>
                        <select
                          id={`status-${doc.id}`}
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as DocReviewStatus)}
                          className="tax-documents__select"
                        >
                          <option value={DocReviewStatus.PendingReview}>Pending Review</option>
                          <option value={DocReviewStatus.Verified}>Verified</option>
                          <option value={DocReviewStatus.IssueFound}>Issue Found</option>
                        </select>
                      </div>
                      {editStatus === DocReviewStatus.IssueFound && (
                        <div className="tax-documents__field">
                          <label htmlFor={`note-${doc.id}`} className="tax-documents__label">
                            Issue Description
                          </label>
                          <input
                            id={`note-${doc.id}`}
                            type="text"
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="Describe the issue..."
                            className="tax-documents__input"
                          />
                        </div>
                      )}
                    </div>
                    <div className="tax-documents__edit-actions">
                      <button className="btn-secondary" onClick={handleCancelEdit} type="button">
                        Cancel
                      </button>
                      <button className="btn-primary" onClick={handleSaveEdit} type="button">
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TaxDocumentsPage
