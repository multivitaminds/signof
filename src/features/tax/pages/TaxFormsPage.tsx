import { useMemo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTaxStore } from '../stores/useTaxStore'
import {
  TaxFormType,
  TAX_FORM_LABELS,
} from '../types'
import TaxFormCard from '../components/TaxFormCard/TaxFormCard'
import './TaxFormsPage.css'

const ALL_FORM_TYPES: TaxFormType[] = [
  TaxFormType.W2,
  TaxFormType.NEC1099,
  TaxFormType.INT1099,
  TaxFormType.DIV1099,
  TaxFormType.MISC1099,
  TaxFormType.Mortgage1098,
  TaxFormType.ACA1095A,
  TaxFormType.W9,
]

function TaxFormsPage() {
  const activeTaxYear = useTaxStore((s) => s.activeTaxYear)
  const documents = useTaxStore((s) => s.documents)
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<TaxFormType | null>(null)

  const yearDocuments = useMemo(
    () => documents.filter((d) => d.taxYear === activeTaxYear),
    [documents, activeTaxYear]
  )

  const documentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const formType of ALL_FORM_TYPES) {
      counts[formType] = yearDocuments.filter((d) => d.type === formType).length
    }
    return counts
  }, [yearDocuments])

  const filteredDocuments = useMemo(() => {
    if (!activeFilter) return null
    return yearDocuments.filter((d) => d.type === activeFilter)
  }, [yearDocuments, activeFilter])

  const handleFormClick = useCallback(
    (formType: TaxFormType) => {
      if (activeFilter === formType) {
        setActiveFilter(null)
      } else {
        setActiveFilter(formType)
      }
    },
    [activeFilter]
  )

  const handleViewInDocuments = useCallback(() => {
    navigate('/tax/documents')
  }, [navigate])

  return (
    <div className="tax-forms">
      <div className="tax-forms__header">
        <h2 className="tax-forms__title">Tax Form Types</h2>
        <p className="tax-forms__subtitle">
          Click a form type to filter your uploaded documents.
        </p>
      </div>

      {/* Form Type Grid */}
      <div className="tax-forms__grid">
        {ALL_FORM_TYPES.map((formType) => (
          <TaxFormCard
            key={formType}
            formType={formType}
            documentCount={documentCounts[formType] ?? 0}
            onClick={handleFormClick}
          />
        ))}
      </div>

      {/* Filtered Documents */}
      {activeFilter && (
        <div className="tax-forms__filtered">
          <div className="tax-forms__filtered-header">
            <h3 className="tax-forms__filtered-title">
              {TAX_FORM_LABELS[activeFilter]} Documents
              <span className="tax-forms__filtered-count">
                ({filteredDocuments?.length ?? 0})
              </span>
            </h3>
            <button
              className="btn-ghost"
              onClick={() => setActiveFilter(null)}
              type="button"
            >
              Clear filter
            </button>
          </div>

          {filteredDocuments && filteredDocuments.length > 0 ? (
            <div className="tax-forms__filtered-list">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="tax-forms__doc-row">
                  <div className="tax-forms__doc-info">
                    <span className="tax-forms__doc-name">{doc.name}</span>
                    <span className="tax-forms__doc-date">
                      {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span
                    className={`tax-forms__doc-status tax-forms__doc-status--${doc.extractionStatus}`}
                  >
                    {doc.extractionStatus === 'completed'
                      ? 'Extracted'
                      : doc.extractionStatus === 'extracting'
                        ? 'Extracting...'
                        : 'Not Extracted'}
                  </span>
                </div>
              ))}
              <button
                className="btn-secondary tax-forms__view-all"
                onClick={handleViewInDocuments}
                type="button"
              >
                View in Documents
              </button>
            </div>
          ) : (
            <div className="tax-forms__filtered-empty">
              <p>
                No {TAX_FORM_LABELS[activeFilter]} documents uploaded for{' '}
                {activeTaxYear}.
              </p>
              <button
                className="btn-primary"
                onClick={handleViewInDocuments}
                type="button"
              >
                Upload Document
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TaxFormsPage
