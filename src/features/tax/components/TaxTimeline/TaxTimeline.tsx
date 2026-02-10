import { useCallback } from 'react'
import { CheckCircle, Circle, AlertCircle } from 'lucide-react'
import type { TaxDeadline } from '../../types'
import './TaxTimeline.css'

interface TaxTimelineProps {
  deadlines: TaxDeadline[]
  onToggle: (id: string) => void
}

function TaxTimeline({ deadlines, onToggle }: TaxTimelineProps) {
  const getStatus = useCallback(
    (deadline: TaxDeadline): 'completed' | 'upcoming' | 'overdue' => {
      if (deadline.completed) return 'completed'
      const deadlineDate = new Date(deadline.date)
      return deadlineDate < new Date() ? 'overdue' : 'upcoming'
    },
    []
  )

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }, [])

  const sorted = [...deadlines].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  if (sorted.length === 0) {
    return (
      <div className="tax-timeline tax-timeline--empty">
        <p className="tax-timeline__empty-text">No deadlines to display.</p>
      </div>
    )
  }

  return (
    <div className="tax-timeline" role="list" aria-label="Tax deadlines timeline">
      {sorted.map((deadline, index) => {
        const status = getStatus(deadline)
        return (
          <div
            key={deadline.id}
            className={`tax-timeline__item tax-timeline__item--${status}`}
            role="listitem"
          >
            <div className="tax-timeline__line-container">
              <button
                className={`tax-timeline__icon tax-timeline__icon--${status}`}
                onClick={() => onToggle(deadline.id)}
                aria-label={
                  deadline.completed
                    ? `Mark "${deadline.title}" as incomplete`
                    : `Mark "${deadline.title}" as complete`
                }
                type="button"
              >
                {status === 'completed' && <CheckCircle size={20} />}
                {status === 'upcoming' && <Circle size={20} />}
                {status === 'overdue' && <AlertCircle size={20} />}
              </button>
              {index < sorted.length - 1 && (
                <div
                  className={`tax-timeline__connector tax-timeline__connector--${status}`}
                />
              )}
            </div>
            <div className="tax-timeline__content">
              <div className="tax-timeline__header">
                <span className="tax-timeline__title">{deadline.title}</span>
                <span className={`tax-timeline__date tax-timeline__date--${status}`}>
                  {formatDate(deadline.date)}
                </span>
              </div>
              <p className="tax-timeline__description">{deadline.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TaxTimeline
