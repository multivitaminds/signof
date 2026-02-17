import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useDocumentStore } from '../../../../stores/useDocumentStore'
import Card from '../../../../components/ui/Card'
import './RecentDocumentsWidget.css'

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  draft: { text: 'Draft', className: 'recent-docs__badge--draft' },
  pending: { text: 'Pending', className: 'recent-docs__badge--pending' },
  sent: { text: 'Sent', className: 'recent-docs__badge--pending' },
  delivered: { text: 'Delivered', className: 'recent-docs__badge--pending' },
  viewed: { text: 'Viewed', className: 'recent-docs__badge--pending' },
  completed: { text: 'Completed', className: 'recent-docs__badge--completed' },
  voided: { text: 'Voided', className: 'recent-docs__badge--voided' },
  declined: { text: 'Declined', className: 'recent-docs__badge--voided' },
}

export default function RecentDocumentsWidget() {
  const documents = useDocumentStore((s) => s.documents)

  const recentDocs = useMemo(
    () =>
      [...documents]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 5),
    [documents]
  )

  return (
    <Card>
      <Card.Header>
        <Card.Title>Recent Documents</Card.Title>
      </Card.Header>
      <Card.Body>
        {recentDocs.length === 0 ? (
          <p className="recent-docs__empty">No documents yet</p>
        ) : (
          <ul className="recent-docs__list">
            {recentDocs.map((doc) => {
              const statusInfo = STATUS_LABELS[doc.status] ?? { text: doc.status, className: '' }
              return (
                <li key={doc.id} className="recent-docs__item">
                  <Link to={`/documents/${doc.id}`} className="recent-docs__link">
                    <span className="recent-docs__name">{doc.name}</span>
                    <span className={`recent-docs__badge ${statusInfo.className}`}>
                      {statusInfo.text}
                    </span>
                    <span className="recent-docs__date">
                      {new Date(doc.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card.Body>
      <Card.Footer>
        <Link to="/documents" className="recent-docs__view-all">
          View all <ArrowRight size={14} />
        </Link>
      </Card.Footer>
    </Card>
  )
}
