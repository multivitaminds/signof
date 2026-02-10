import { useState, useCallback, useMemo } from 'react'
import { Upload, Trash2, X, Plus } from 'lucide-react'
import { useTaxStore } from '../stores/useTaxStore'
import {
  TaxFormType,
  TAX_FORM_LABELS,
} from '../types'
import type { TaxYear, ExtractedField } from '../types'
import TaxExtractor from '../components/TaxExtractor/TaxExtractor'
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

function TaxDocumentsPage() {
  const activeTaxYear = useTaxStore((s) => s.activeTaxYear)
  const documents = useTaxStore((s) => s.documents)
  const addDocument = useTaxStore((s) => s.addDocument)
  const updateDocument = useTaxStore((s) => s.updateDocument)
  const deleteDocument = useTaxStore((s) => s.deleteDocument)
  const extractData = useTaxStore((s) => s.extractData)

  const [showUploadForm, setShowUploadForm] = useState(false)
  const [newDocName, setNewDocName] = useState('')
  const [newDocType, setNewDocType] = useState<TaxFormType>(TaxFormType.W2)
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null)

  const yearDocuments = useMemo(
    () => documents.filter((d) => d.taxYear === activeTaxYear),
    [documents, activeTaxYear]
  )

  const handleAddDocument = useCallback(() => {
    if (!newDocName.trim()) return
    addDocument({
      name: newDocName.trim(),
      type: newDocType,
      taxYear: activeTaxYear as TaxYear,
    })
    setNewDocName('')
    setNewDocType(TaxFormType.W2)
    setShowUploadForm(false)
  }, [newDocName, newDocType, activeTaxYear, addDocument])

  const handleDelete = useCallback(
    (id: string) => {
      deleteDocument(id)
      if (expandedDocId === id) {
        setExpandedDocId(null)
      }
    },
    [deleteDocument, expandedDocId]
  )

  const handleToggleExpand = useCallback(
    (id: string) => {
      setExpandedDocId((prev) => (prev === id ? null : id))
    },
    []
  )

  const handleSaveExtraction = useCallback(
    (id: string, data: ExtractedField[]) => {
      updateDocument(id, { extractedData: data })
    },
    [updateDocument]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAddDocument()
      }
    },
    [handleAddDocument]
  )

  return (
    <div className="tax-documents">
      <div className="tax-documents__header">
        <h2 className="tax-documents__title">
          Tax Documents ({yearDocuments.length})
        </h2>
        <button
          className="btn-primary tax-documents__upload-btn"
          onClick={() => setShowUploadForm(true)}
          type="button"
        >
          <Plus size={16} />
          <span>Add Document</span>
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="tax-documents__upload-form">
          <div className="tax-documents__form-header">
            <h3>Add Tax Document</h3>
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
              <label
                htmlFor="doc-name"
                className="tax-documents__label"
              >
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
              <label
                htmlFor="doc-type"
                className="tax-documents__label"
              >
                Document Type
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
          {yearDocuments.map((doc) => (
            <div key={doc.id} className="tax-documents__item">
              <div className="tax-documents__item-header">
                <button
                  className="tax-documents__item-toggle"
                  onClick={() => handleToggleExpand(doc.id)}
                  type="button"
                  aria-expanded={expandedDocId === doc.id}
                  aria-label={`Toggle details for ${doc.name}`}
                >
                  <div className="tax-documents__item-info">
                    <span className="tax-documents__item-name">{doc.name}</span>
                    <span className="tax-documents__item-meta">
                      <span
                        className={`tax-documents__type-badge tax-documents__type-badge--${doc.type.replace(/_/g, '-')}`}
                      >
                        {TAX_FORM_LABELS[doc.type]}
                      </span>
                      <span className="tax-documents__item-date">
                        {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                  </div>
                  <span
                    className={`tax-documents__extraction-badge tax-documents__extraction-badge--${doc.extractionStatus}`}
                  >
                    {doc.extractionStatus === 'completed'
                      ? 'Extracted'
                      : doc.extractionStatus === 'extracting'
                        ? 'Extracting...'
                        : doc.extractionStatus === 'failed'
                          ? 'Failed'
                          : 'Not Extracted'}
                  </span>
                </button>
                <button
                  className="btn-ghost tax-documents__delete-btn"
                  onClick={() => handleDelete(doc.id)}
                  type="button"
                  aria-label={`Delete ${doc.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {expandedDocId === doc.id && (
                <div className="tax-documents__item-detail">
                  <TaxExtractor
                    document={doc}
                    onExtract={extractData}
                    onSave={handleSaveExtraction}
                  />
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
