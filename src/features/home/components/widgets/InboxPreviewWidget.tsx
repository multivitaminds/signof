import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useInboxStore } from '../../../inbox/stores/useInboxStore'
import Card from '../../../../components/ui/Card'
import './InboxPreviewWidget.css'

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function InboxPreviewWidget() {
  const notifications = useInboxStore((s) => s.notifications)

  const latestThreads = useMemo(
    () =>
      [...notifications]
        .filter((n) => !n.archived)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3),
    [notifications]
  )

  return (
    <Card>
      <Card.Header>
        <Card.Title>Inbox</Card.Title>
      </Card.Header>
      <Card.Body>
        {latestThreads.length === 0 ? (
          <p className="inbox-preview__empty">No messages</p>
        ) : (
          <ul className="inbox-preview__list">
            {latestThreads.map((thread) => (
              <li key={thread.id} className="inbox-preview__item">
                <Link
                  to={thread.link ?? '/inbox'}
                  className="inbox-preview__link"
                >
                  {!thread.read && (
                    <span className="inbox-preview__unread-dot" />
                  )}
                  <div className="inbox-preview__content">
                    <span className={`inbox-preview__subject ${!thread.read ? 'inbox-preview__subject--unread' : ''}`}>
                      {thread.title}
                    </span>
                    <span className="inbox-preview__sender">
                      {thread.actorName ?? 'System'}
                    </span>
                  </div>
                  <span className="inbox-preview__time">
                    {timeAgo(thread.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card.Body>
      <Card.Footer>
        <Link to="/inbox" className="inbox-preview__view-all">
          Open inbox <ArrowRight size={14} />
        </Link>
      </Card.Footer>
    </Card>
  )
}
