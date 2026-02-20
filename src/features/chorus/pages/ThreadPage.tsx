import { useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useChorusStore } from '../stores/useChorusStore'
import { useChorusMessageStore } from '../stores/useChorusMessageStore'
import MessageBubble from '../components/MessageBubble/MessageBubble'
import MessageComposer from '../components/MessageComposer/MessageComposer'
import { ConversationType } from '../types'
import './ThreadPage.css'

export default function ThreadPage() {
  const { threadId } = useParams()
  const navigate = useNavigate()
  const currentUserId = useChorusStore((s) => s.currentUserId)
  const getCurrentUser = useChorusStore((s) => s.getCurrentUser)
  const activeConversationId = useChorusStore((s) => s.activeConversationId)
  const activeConversationType = useChorusStore((s) => s.activeConversationType)
  const replyInThread = useChorusMessageStore((s) => s.replyInThread)
  const allMessages = useChorusMessageStore((s) => s.messages)

  const messages = useMemo(
    () => (activeConversationId ? allMessages[activeConversationId] ?? [] : []),
    [allMessages, activeConversationId]
  )

  const parentMessage = useMemo(
    () => messages.find((m) => m.id === threadId),
    [messages, threadId]
  )

  const threadMessages = useMemo(
    () => (threadId ? messages.filter((m) => m.threadId === threadId) : []),
    [messages, threadId]
  )

  // Open the thread in store for consistent state
  useEffect(() => {
    if (threadId) {
      useChorusStore.getState().openThread(threadId)
    }
    return () => {
      useChorusStore.getState().closeThread()
    }
  }, [threadId])

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const handleSendReply = useCallback(
    (content: string) => {
      if (!activeConversationId || !activeConversationType || !threadId) return
      const currentUser = getCurrentUser()
      if (!currentUser) return

      replyInThread({
        conversationId: activeConversationId,
        conversationType: activeConversationType,
        senderId: currentUserId,
        senderName: currentUser.displayName,
        senderAvatarUrl: currentUser.avatarUrl,
        content,
        parentMessageId: threadId,
      })
    },
    [activeConversationId, activeConversationType, threadId, currentUserId, getCurrentUser, replyInThread]
  )

  if (!parentMessage) {
    return (
      <div className="thread-page thread-page--empty">
        <p>Thread not found.</p>
        <button className="btn-secondary" onClick={handleBack}>
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="thread-page">
      <div className="thread-page__header">
        <button className="thread-page__back" onClick={handleBack} aria-label="Go back">
          <ArrowLeft size={18} />
        </button>
        <h2 className="thread-page__title">Thread</h2>
        <span className="thread-page__count">
          {threadMessages.length} {threadMessages.length === 1 ? 'reply' : 'replies'}
        </span>
      </div>

      <div className="thread-page__messages">
        <div className="thread-page__parent">
          <MessageBubble
            message={parentMessage}
            isCompact={false}
            currentUserId={currentUserId}
            conversationId={activeConversationId ?? ''}
            conversationType={activeConversationType ?? ConversationType.Channel}
          />
        </div>

        {threadMessages.length > 0 && (
          <div className="thread-page__divider">
            <span>{threadMessages.length} {threadMessages.length === 1 ? 'reply' : 'replies'}</span>
          </div>
        )}

        {threadMessages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isCompact={false}
            currentUserId={currentUserId}
            conversationId={activeConversationId ?? ''}
            conversationType={activeConversationType ?? ConversationType.Channel}
          />
        ))}
      </div>

      <div className="thread-page__composer">
        <MessageComposer onSend={handleSendReply} placeholder="Reply in thread..." />
      </div>
    </div>
  )
}
