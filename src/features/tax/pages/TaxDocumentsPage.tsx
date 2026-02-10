import { useState, useCallback, useMemo } from 'react'
import { Upload, Trash2, X, Plus, FileCheck, Clock, AlertTriangle, FileText } from 'lucide-react'
import {
  useTaxDocumentStore,
  DocReviewStatus,
  DOC_REVIEW_LABELS,
  detectFormType,
} from '../stores/useTaxDocumentStore'
import {
  TaxFormType,
  TAX_FORM_LABELS,
} from '../types'
import type { TaxYear } from '../types'
import './TaxDocumentsPage.css'

const FORM_TYPE_OPTIONS: { value: TaxFormType; label: string }[] = [
  { value: TaxFormType.W2, label: 'W-2' },
  { value: TaxFormType.NEC1099, label: '1099-NEC' },
  { value: TaxFormType.INT1099, label: '1099-INT' },
  { value: TaxFormType.DIV1099, label: '1099-DIV' },
  { value: TaxFormType.MISC1099, label: '1099-MISC' },
  { value: TaxFormType.Mortgage1098, label: '1098' },
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
  const verifiedCount = useTaxDocumentStore((s) => s.verifiedCount)
  const pendingCount = useTaxDocumentStore((s) => s.pendingCount)
  const issueCount = useTaxDocumentStore((s) => s.issueCount)

  const [showUploadForm, setShowUploadForm] = useState(false)
  const [newDocName, setNewDocName] = useState('')
  const [newDocType, setNewDocType] = useState<TaxFormType>(TaxFormType.W2)
  const [newEmployer, setNewEmployer] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<DocReviewStatus>(DocReviewStatus.PendingReview)
  const [editNote, setEditNote] = useState('')

  const yearDocuments = useMemo(
    () => documents.filter((d) => d.taxYear === activeTaxYear),
    [documents, activeTaxYear]
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
        addDocument({
          fileName: file.name,
          formType: detectedType,
          taxYear: activeTaxYear as TaxYear,
          employerName: 'Auto-detected',
          fileSize: file.size,
        })
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
        addDocument({
          fileName: file.name,
          formType: detectedType,
          taxYear: activeTaxYear as TaxYear,
          employerName: 'Auto-detected',
          fileSize: file.size,
        })
      }
      e.target.value = ''
    },
    [addDocument, activeTaxYear]
  )

  return (
    <div className="tax-documents">
      <div className="tax-documents__header">
        <h2 className="tax-documents__title">Tax Documents</h2>
        <button
          className="btn-primary tax-documents__upload-btn"
          onClick={() => setShowUploadForm(true)}
          type="button"
        >
          <Plus size={16} />
          <span>Add Document</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="tax-documents__summary" role="region" aria-label="Document summary">
        <div className="tax-documents__stat-card">
          <div className="tax-documents__stat-icon tax-documents__stat-icon--total">
            <FileText size={20} />
          </div>
          <div className="tax-documents__stat-info">
            <span className="tax-documents__stat-value">{totalCount()}</span>
            <span className="tax-documents__stat-label">Total Uploaded</span>
          </div>
        </div>
        <div className="tax-documents__stat-card">
          <div className="tax-documents__stat-icon tax-documents__stat-icon--verified">
            <FileCheck size={20} />
          </div>
          <div className="tax-documents__stat-info">
            <span className="tax-documents__stat-value">{verifiedCount()}</span>
            <span className="tax-documents__stat-label">Verified</span>
          </div>
        </div>
        <div className="tax-documents__stat-card">
          <div className="tax-documents__stat-icon tax-documents__stat-icon--pending">
            <Clock size={20} />
          </div>
          <div className="tax-documents__stat-info">
            <span className="tax-documents__stat-value">{pendingCount()}</span>
            <span className="tax-documents__stat-label">Pending Review</span>
          </div>
        </div>
        <div className="tax-documents__stat-card">
          <div className="tax-documents__stat-icon tax-documents__stat-icon--issues">
            <AlertTriangle size={20} />
          </div>
          <div className="tax-documents__stat-info">
            <span className="tax-documents__stat-value">{issueCount()}</span>
            <span className="tax-documents__stat-label">Issues Found</span>
          </div>
        </div>
      </div>

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
          Supports PDF, PNG, JPG. Auto-detects W-2, 1099, 1098 form types from filename.
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
            <span>Upload Date</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {yearDocuments.map((doc) => (
            <div key={doc.id} className="tax-documents__item">
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
                <span className="tax-documents__item-date">
                  {new Date(doc.uploadDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
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
          ))}
        </div>
      )}
    </div>
  )
}

export default TaxDocumentsPage
