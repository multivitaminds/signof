import { useState, useCallback } from 'react'
import { MessageSquare, Check, X } from 'lucide-react'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import type { BlockComment } from '../../types'
import './CommentsSidebar.css'

const EMPTY_COMMENTS: BlockComment[] = []

type FilterTab = 'all' | 'open' | 'resolved'

interface CommentsSidebarProps {
  isOpen: boolean
  pageId: string
  onClose: () => void
  onCommentClick: (blockId: string) => void
}

function formatTimeAgo(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime()
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export default function CommentsSidebar({ isOpen, pageId, onClose, onCommentClick }: CommentsSidebarProps) {
  const allComments = useWorkspaceStore((s) => s.comments[pageId] ?? EMPTY_COMMENTS)
  const blocks = useWorkspaceStore((s) => s.blocks)
  const resolveComment = useWorkspaceStore((s) => s.resolveComment)
  const unresolveComment = useWorkspaceStore((s) => s.unresolveComment)

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  const filteredComments = allComments.filter((comment) => {
    if (activeFilter === 'open') return !comment.resolved
    if (activeFilter === 'resolved') return comment.resolved
    return true
  })

  const handleResolve = useCallback(
    (e: React.MouseEvent, commentId: string) => {
      e.stopPropagation()
      resolveComment(pageId, commentId)
    },
    [resolveComment, pageId]
  )

  const handleUnresolve = useCallback(
    (e: React.MouseEvent, commentId: string) => {
      e.stopPropagation()
      unresolveComment(pageId, commentId)
    },
    [unresolveComment, pageId]
  )

  const handleCommentClick = useCallback(
    (comment: BlockComment) => {
      onCommentClick(comment.blockId)
    },
    [onCommentClick]
  )

  const openCount = allComments.filter((c) => !c.resolved).length

  if (!isOpen) return null

  const emptyMessages: Record<FilterTab, string> = {
    all: 'No comments on this page yet.',
    open: 'No open comments.',
    resolved: 'No resolved comments.',
  }

  return (
    <div className={`comments-sidebar ${isOpen ? 'comments-sidebar--open' : ''}`}>
      <div className="comments-sidebar__header">
        <MessageSquare size={16} />
        <h3 className="comments-sidebar__title">
          Comments
          {openCount > 0 && (
            <span className="comments-sidebar__count">{openCount}</span>
          )}
        </h3>
        <button
          className="comments-sidebar__close"
          onClick={onClose}
          aria-label="Close comments sidebar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="comments-sidebar__filters" role="tablist">
        {(['all', 'open', 'resolved'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeFilter === tab}
            className={`comments-sidebar__filter ${activeFilter === tab ? 'comments-sidebar__filter--active' : ''}`}
            onClick={() => setActiveFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Comment list */}
      <div className="comments-sidebar__content">
        {filteredComments.length === 0 ? (
          <div className="comments-sidebar__empty">
            <MessageSquare size={32} />
            <p>{emptyMessages[activeFilter]}</p>
          </div>
        ) : (
          <div className="comments-sidebar__list">
            {filteredComments.map((comment) => {
              const block = blocks[comment.blockId]
              const blockPreview = block ? truncate(block.content, 60) : 'Deleted block'

              return (
                <div
                  key={comment.id}
                  className={`comments-sidebar__item ${comment.resolved ? 'comments-sidebar__item--resolved' : ''}`}
                  onClick={() => handleCommentClick(comment)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleCommentClick(comment)
                    }
                  }}
                >
                  <div className="comments-sidebar__block-preview">
                    {blockPreview}
                  </div>
                  <div className="comments-sidebar__item-body">
                    <div className="comments-sidebar__item-header">
                      <div className="comments-sidebar__avatar" title={comment.authorName}>
                        {getInitials(comment.authorName)}
                      </div>
                      <span className="comments-sidebar__author">{comment.authorName}</span>
                      <span className="comments-sidebar__time">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <div className="comments-sidebar__item-content">
                      {truncate(comment.content, 120)}
                    </div>
                    {comment.replies.length > 0 && (
                      <span className="comments-sidebar__reply-count">
                        {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                  </div>
                  <div className="comments-sidebar__item-actions">
                    {comment.resolved ? (
                      <button
                        className="comments-sidebar__resolve-btn comments-sidebar__resolve-btn--resolved"
                        onClick={(e) => handleUnresolve(e, comment.id)}
                        aria-label="Unresolve comment"
                        title="Unresolve"
                      >
                        <Check size={14} />
                      </button>
                    ) : (
                      <button
                        className="comments-sidebar__resolve-btn"
                        onClick={(e) => handleResolve(e, comment.id)}
                        aria-label="Resolve comment"
                        title="Resolve"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
