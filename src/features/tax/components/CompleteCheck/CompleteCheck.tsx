import { useCallback } from 'react'
import {
  CheckCircle,
  AlertTriangle,
  Edit3,
  Send,
  Loader,
} from 'lucide-react'
import type { InterviewSection, InterviewAnswer } from '../../types'
import { InterviewSectionStatus } from '../../types'
import './CompleteCheck.css'

interface CompleteCheckProps {
  sections: InterviewSection[]
  answers: Record<string, InterviewAnswer>
  onEditSection: (sectionId: string) => void
  onSubmit: () => void
  isSubmitting: boolean
}

function CompleteCheck({ sections, answers, onEditSection, onSubmit, isSubmitting }: CompleteCheckProps) {
  const handleEdit = useCallback(
    (sectionId: string) => {
      onEditSection(sectionId)
    },
    [onEditSection]
  )

  const handleSubmit = useCallback(() => {
    onSubmit()
  }, [onSubmit])

  const completedSections = sections.filter(
    (s) => s.status === InterviewSectionStatus.Completed
  )
  const incompleteSections = sections.filter(
    (s) =>
      s.status !== InterviewSectionStatus.Completed &&
      s.status !== InterviewSectionStatus.Skipped
  )
  const issueCount = incompleteSections.length
  const answerCount = Object.keys(answers).length

  return (
    <div className="complete-check">
      {/* Header */}
      <div className="complete-check__header">
        <span className="complete-check__header-icon">
          {issueCount === 0 ? (
            <CheckCircle size={24} />
          ) : (
            <AlertTriangle size={24} />
          )}
        </span>
        <div className="complete-check__header-text">
          <h2 className="complete-check__title">
            {issueCount === 0
              ? 'Everything looks good'
              : `${issueCount} issue${issueCount > 1 ? 's' : ''} found`}
          </h2>
          <p className="complete-check__subtitle">
            {answerCount} question{answerCount !== 1 ? 's' : ''} answered across{' '}
            {completedSections.length} section{completedSections.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Section Cards */}
      <div className="complete-check__sections">
        {sections.map((section) => {
          const isComplete = section.status === InterviewSectionStatus.Completed
          const isSkipped = section.status === InterviewSectionStatus.Skipped
          const hasIssue = !isComplete && !isSkipped

          return (
            <div
              key={section.id}
              className={`complete-check__section${hasIssue ? ' complete-check__section--issue' : ''}`}
            >
              <div className="complete-check__section-header">
                <span
                  className={`complete-check__section-icon${isComplete ? ' complete-check__section-icon--complete' : ''}${hasIssue ? ' complete-check__section-icon--issue' : ''}${isSkipped ? ' complete-check__section-icon--skipped' : ''}`}
                >
                  {isComplete && <CheckCircle size={16} />}
                  {hasIssue && <AlertTriangle size={16} />}
                  {isSkipped && <CheckCircle size={16} />}
                </span>
                <span className="complete-check__section-title">{section.title}</span>
                {hasIssue && (
                  <span className="complete-check__badge">Incomplete</span>
                )}
                {isSkipped && (
                  <span className="complete-check__badge complete-check__badge--skipped">
                    Skipped
                  </span>
                )}
              </div>
              <p className="complete-check__section-desc">{section.description}</p>
              <button
                type="button"
                className="btn-ghost complete-check__edit-btn"
                onClick={() => handleEdit(section.id)}
              >
                <Edit3 size={14} />
                <span>Edit</span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Submit CTA */}
      <div className="complete-check__cta">
        <button
          type="button"
          className="btn-primary complete-check__submit"
          onClick={handleSubmit}
          disabled={isSubmitting || issueCount > 0}
        >
          {isSubmitting ? (
            <>
              <Loader size={18} className="complete-check__spinner" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>File My Taxes</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default CompleteCheck
