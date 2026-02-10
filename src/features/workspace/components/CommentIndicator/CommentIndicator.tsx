import { useMemo } from 'react'
import { MessageCircle } from 'lucide-react'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import './CommentIndicator.css'

interface CommentIndicatorProps {
  pageId: string
  blockId: string
  onClick: () => void
}

export default function CommentIndicator({ pageId, blockId, onClick }: CommentIndicatorProps) {
  const pageComments = useWorkspaceStore((s) => s.comments[pageId])
  const comments = useMemo(
    () => (pageComments ?? []).filter((c) => c.blockId === blockId),
    [pageComments, blockId]
  )

  if (comments.length === 0) return null

  const unresolvedCount = comments.filter((c) => !c.resolved).length
  const allResolved = unresolvedCount === 0

  return (
    <button
      className={`comment-indicator ${allResolved ? 'comment-indicator--resolved' : ''}`}
      onClick={onClick}
      aria-label={`${unresolvedCount} unresolved comment${unresolvedCount === 1 ? '' : 's'}`}
      title={allResolved ? 'All comments resolved' : `${unresolvedCount} open comment${unresolvedCount === 1 ? '' : 's'}`}
    >
      <MessageCircle size={14} />
      {!allResolved && (
        <span className="comment-indicator__count">{unresolvedCount}</span>
      )}
      <span className={`comment-indicator__dot ${allResolved ? 'comment-indicator__dot--resolved' : ''}`} />
    </button>
  )
}
