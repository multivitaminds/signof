import { useState, useCallback, useMemo } from 'react'
import { X, Check, RotateCcw, Send } from 'lucide-react'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import type { BlockComment } from '../../types'
import './CommentThread.css'

interface CommentThreadProps {
  pageId: string
  blockId: string
  position: { top: number; right: number }
  onClose: () => void
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

export default function CommentThread({ pageId, blockId, position, onClose }: CommentThreadProps) {
  const pageComments = useWorkspaceStore((s) => s.comments[pageId])
  const comments = useMemo(
    () => (pageComments ?? []).filter((c) => c.blockId === blockId),
    [pageComments, blockId]
  )
  const addComment = useWorkspaceStore((s) => s.addComment)
  const addReply = useWorkspaceStore((s) => s.addReply)
  const resolveComment = useWorkspaceStore((s) => s.resolveComment)
  const unresolveComment = useWorkspaceStore((s) => s.unresolveComment)
  const deleteComment = useWorkspaceStore((s) => s.deleteComment)

  const [newCommentText, setNewCommentText] = useState('')
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})

  const handleAddComment = useCallback(() => {
    if (!newCommentText.trim()) return
    addComment(pageId, blockId, newCommentText.trim(), 'You', 'current-user')
    setNewCommentText('')
  }, [newCommentText, addComment, pageId, blockId])

  const handleAddReply = useCallback(
    (commentId: string) => {
      const text = replyTexts[commentId]
      if (!text?.trim()) return
      addReply(pageId, commentId, text.trim(), 'You', 'current-user')
      setReplyTexts((prev) => ({ ...prev, [commentId]: '' }))
    },
    [replyTexts, addReply, pageId]
  )

  const handleResolve = useCallback(
    (commentId: string) => {
      resolveComment(pageId, commentId)
    },
    [resolveComment, pageId]
  )

  const handleUnresolve = useCallback(
    (commentId: string) => {
      unresolveComment(pageId, commentId)
    },
    [unresolveComment, pageId]
  )

  const handleDelete = useCallback(
    (commentId: string) => {
      deleteComment(pageId, commentId)
    },
    [deleteComment, pageId]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, action: () => void) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        action()
      }
    },
    []
  )

  const renderComment = (comment: BlockComment) => (
    <div
      key={comment.id}
      className={`comment-thread__comment ${comment.resolved ? 'comment-thread__comment--resolved' : ''}`}
    >
      <div className="comment-thread__comment-header">
        <div className="comment-thread__avatar" title={comment.authorName}>
          {getInitials(comment.authorName)}
        </div>
        <div className="comment-thread__meta">
          <span className="comment-thread__author">{comment.authorName}</span>
          <span className="comment-thread__time">{formatTimeAgo(comment.createdAt)}</span>
        </div>
        <div className="comment-thread__actions">
          {comment.resolved ? (
            <button
              className="comment-thread__action-btn"
              onClick={() => handleUnresolve(comment.id)}
              aria-label="Unresolve comment"
              title="Unresolve"
            >
              <RotateCcw size={14} />
            </button>
          ) : (
            <button
              className="comment-thread__action-btn"
              onClick={() => handleResolve(comment.id)}
              aria-label="Resolve comment"
              title="Resolve"
            >
              <Check size={14} />
            </button>
          )}
          <button
            className="comment-thread__action-btn comment-thread__action-btn--danger"
            onClick={() => handleDelete(comment.id)}
            aria-label="Delete comment"
            title="Delete"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="comment-thread__content">{comment.content}</div>

      {comment.resolved && (
        <span className="comment-thread__resolved-badge">Resolved</span>
      )}

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="comment-thread__replies">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="comment-thread__reply">
              <div className="comment-thread__reply-header">
                <div className="comment-thread__avatar comment-thread__avatar--small" title={reply.authorName}>
                  {getInitials(reply.authorName)}
                </div>
                <span className="comment-thread__author">{reply.authorName}</span>
                <span className="comment-thread__time">{formatTimeAgo(reply.createdAt)}</span>
              </div>
              <div className="comment-thread__reply-content">{reply.content}</div>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      {!comment.resolved && (
        <div className="comment-thread__reply-input">
          <input
            type="text"
            className="comment-thread__input"
            placeholder="Reply..."
            value={replyTexts[comment.id] ?? ''}
            onChange={(e) =>
              setReplyTexts((prev) => ({ ...prev, [comment.id]: e.target.value }))
            }
            onKeyDown={(e) => handleKeyDown(e, () => handleAddReply(comment.id))}
          />
          <button
            className="comment-thread__send-btn"
            onClick={() => handleAddReply(comment.id)}
            disabled={!(replyTexts[comment.id]?.trim())}
            aria-label="Send reply"
          >
            <Send size={14} />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div
      className="comment-thread"
      style={{ top: `${position.top}px`, right: `${position.right}px` }}
    >
      <div className="comment-thread__header">
        <h4 className="comment-thread__title">Comments</h4>
        <button
          className="comment-thread__close"
          onClick={onClose}
          aria-label="Close comments"
        >
          <X size={16} />
        </button>
      </div>

      <div className="comment-thread__body">
        {comments.length === 0 ? (
          <div className="comment-thread__empty">
            <p>No comments yet</p>
          </div>
        ) : (
          comments.map(renderComment)
        )}
      </div>

      {/* New comment input */}
      <div className="comment-thread__new-comment">
        <input
          type="text"
          className="comment-thread__input"
          placeholder="Add a comment..."
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, handleAddComment)}
        />
        <button
          className="comment-thread__send-btn"
          onClick={handleAddComment}
          disabled={!newCommentText.trim()}
          aria-label="Add comment"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
