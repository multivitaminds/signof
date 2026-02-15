import { useMemo } from 'react'
import { FileText, Inbox } from 'lucide-react'
import { useTaxFilingStore } from '../stores/useTaxFilingStore'
import { useTaxStore } from '../stores/useTaxStore'
import { TAX_FORM_LABELS } from '../types'
import type { TaxFormType, TaxBanditSubmission } from '../types'
import SubmissionStatusTracker from '../components/SubmissionStatusTracker/SubmissionStatusTracker'
import './TaxSubmissionsPage.css'

function TaxSubmissionsPage() {
  const submissions = useTaxFilingStore((s) => s.submissions)
  const activeTaxYear = useTaxStore((s) => s.activeTaxYear)

  // Filter submissions by active tax year
  const filteredSubmissions = useMemo(
    () => submissions.filter((s) => s.taxYear === activeTaxYear),
    [submissions, activeTaxYear]
  )

  // Group submissions by form type
  const groupedSubmissions = useMemo(() => {
    const groups = new Map<TaxFormType, TaxBanditSubmission[]>()
    for (const submission of filteredSubmissions) {
      const existing = groups.get(submission.formType) ?? []
      existing.push(submission)
      groups.set(submission.formType, existing)
    }
    return groups
  }, [filteredSubmissions])

  // Sort groups alphabetically by form label
  const sortedGroups = useMemo(() => {
    const entries = Array.from(groupedSubmissions.entries())
    entries.sort((a, b) => {
      const labelA = TAX_FORM_LABELS[a[0]] ?? a[0]
      const labelB = TAX_FORM_LABELS[b[0]] ?? b[0]
      return labelA.localeCompare(labelB)
    })
    return entries
  }, [groupedSubmissions])

  if (filteredSubmissions.length === 0) {
    return (
      <div className="tax-submissions">
        <div className="tax-submissions__empty">
          <Inbox size={48} className="tax-submissions__empty-icon" />
          <h3 className="tax-submissions__empty-title">No Submissions Yet</h3>
          <p className="tax-submissions__empty-text">
            When you e-file tax forms, they will appear here with real-time status tracking.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="tax-submissions">
      <div className="tax-submissions__header">
        <h2 className="tax-submissions__title">
          Submissions
        </h2>
        <p className="tax-submissions__subtitle">
          {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''} for
          tax year {activeTaxYear}
        </p>
      </div>

      <div className="tax-submissions__groups">
        {sortedGroups.map(([formType, subs]) => (
          <div key={formType} className="tax-submissions__group">
            <div className="tax-submissions__group-header">
              <FileText size={16} />
              <span className="tax-submissions__group-label">
                {TAX_FORM_LABELS[formType]}
              </span>
              <span className="tax-submissions__group-count">
                {subs.length}
              </span>
            </div>
            <div className="tax-submissions__group-list">
              {subs.map((submission) => (
                <SubmissionStatusTracker
                  key={submission.id}
                  submission={submission}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaxSubmissionsPage
