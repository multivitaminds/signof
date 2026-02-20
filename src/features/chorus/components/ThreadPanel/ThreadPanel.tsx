import { useCallback, useMemo } from 'react'
import { X } from 'lucide-react'
import { useChorusStore } from '../../stores/useChorusStore'
import { useChorusMessageStore } from '../../stores/useChorusMessageStore'
import MessageBubble from '../MessageBubble/MessageBubble'
import MessageComposer from '../MessageComposer/MessageComposer'
import ThreadSummary from '../ThreadSummary/ThreadSummary'
import { ConversationType } from '../../types'
import './ThreadPanel.css'

export default function ThreadPanel() {
  const activeThreadId = useChorusStore((s) => s.activeThreadId)
  const activeConversationId = useChorusStore((s) => s.activeConversationId)
  const activeConversationType = useChorusStore((s) => s.activeConversationType)
  const closeThread = useChorusStore((s) => s.closeThread)
  const currentUserId = useChorusStore((s) => s.currentUserId)
  const getCurrentUser = useChorusStore((s) => s.getCurrentUser)
  const allMessages = useChorusMessageStore((s) => s.messages)
  const replyInThread = useChorusMessageStore((s) => s.replyInThread)

  const messages = useMemo(
    () => (activeConversationId ? allMessages[activeConversationId] ?? [] : []),
    [allMessages, activeConversationId]
  )

  const parentMessage = useMemo(
    () => messages.find((m) => m.id === activeThreadId),
    [messages, activeThreadId]
  )

  const threadMessages = useMemo(
    () =>
      activeThreadId
        ? messages.filter((m) => m.threadId === activeThreadId)
        : [],
    [messages, activeThreadId]
  )

  const handleSendReply = useCallback(
    (content: string) => {
      if (!activeConversationId || !activeConversationType || !activeThreadId) return
      const currentUser = getCurrentUser()
      if (!currentUser) return

      replyInThread({
        conversationId: activeConversationId,
        conversationType: activeConversationType,
        senderId: currentUserId,
        senderName: currentUser.displayName,
        senderAvatarUrl: currentUser.avatarUrl,
        content,
        parentMessageId: activeThreadId,
      })
    },
    [activeConversationId, activeConversationType, activeThreadId, currentUserId, getCurrentUser, replyInThread]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeThread()
      }
    },
    [closeThread]
  )

  if (!parentMessage) return null

  const replyCountLabel = threadMessages.length === 1
    ? '1 reply'
    : `${threadMessages.length} replies`

  return (
    <div
      className="thread-panel"
      role="complementary"
      aria-label="Thread"
      onKeyDown={handleKeyDown}
    >
      <div className="thread-panel__header">
        <h3 className="thread-panel__title">Thread</h3>
        <span className="thread-panel__count">{replyCountLabel}</span>
        <button
          className="thread-panel__close"
          onClick={closeThread}
          aria-label="Close thread"
        >
          <X size={18} />
        </button>
      </div>

      <div className="thread-panel__messages">
        <div className="thread-panel__parent">
          <MessageBubble
            message={parentMessage}
            isCompact={false}
            currentUserId={currentUserId}
            conversationId={activeConversationId ?? ''}
            conversationType={activeConversationType ?? ConversationType.Channel}
          />
        </div>

        {activeConversationId && activeThreadId && (
          <ThreadSummary
            channelId={activeConversationId}
            threadId={activeThreadId}
            replyCount={threadMessages.length}
          />
        )}

        {threadMessages.length > 0 && (
          <div className="thread-panel__divider">
            <span>{replyCountLabel}</span>
          </div>
        )}

        <div className="thread-panel__replies">
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
      </div>

      <div className="thread-panel__composer">
        <MessageComposer
          onSend={handleSendReply}
          placeholder="Reply in thread..."
          compact
        />
      </div>
    </div>
  )
}
