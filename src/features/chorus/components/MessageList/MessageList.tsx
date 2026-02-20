import { useCallback } from 'react'
import { ArrowDown } from 'lucide-react'
import MessageBubble from '../MessageBubble/MessageBubble'
import DateDivider from '../DateDivider/DateDivider'
import { groupMessages } from '../../lib/messageGrouping'
import { useMessageScroll } from '../../hooks/useMessageScroll'
import { useChorusMessageStore } from '../../stores/useChorusMessageStore'
import type { ChorusMessage, ConversationType } from '../../types'
import './MessageList.css'

interface MessageListProps {
  messages: ChorusMessage[]
  currentUserId: string
  conversationId: string
  conversationType: ConversationType
  onOpenThread?: (messageId: string) => void
}

function isDifferentDay(a: string, b: string): boolean {
  return new Date(a).toDateString() !== new Date(b).toDateString()
}

export default function MessageList({
  messages,
  currentUserId,
  conversationId,
  conversationType,
  onOpenThread,
}: MessageListProps) {
  const { scrollRef, showNewMessagesBanner, scrollToBottom } = useMessageScroll(messages)
  const addReaction = useChorusMessageStore((s) => s.addReaction)
  const removeReaction = useChorusMessageStore((s) => s.removeReaction)

  const handleAddReaction = useCallback(
    (messageId: string, emoji: string) => {
      const msg = messages.find((m) => m.id === messageId)
      if (!msg) return
      const existingReaction = msg.reactions.find((r) => r.emoji === emoji)
      if (existingReaction?.userIds.includes(currentUserId)) {
        removeReaction(conversationId, messageId, emoji, currentUserId)
      } else {
        addReaction(conversationId, messageId, emoji, currentUserId)
      }
    },
    [messages, conversationId, currentUserId, addReaction, removeReaction]
  )

  const groups = groupMessages(messages)

  // Build elements with date dividers
  const elements: React.ReactNode[] = []
  let lastTimestamp: string | null = null

  for (const group of groups) {
    const firstMsg = group.messages[0]
    if (!firstMsg) continue

    if (!lastTimestamp || isDifferentDay(lastTimestamp, firstMsg.timestamp)) {
      elements.push(
        <DateDivider key={`date-${firstMsg.timestamp}`} timestamp={firstMsg.timestamp} />
      )
    }
    lastTimestamp = firstMsg.timestamp

    for (let i = 0; i < group.messages.length; i++) {
      const msg = group.messages[i]
      if (!msg) continue
      elements.push(
        <MessageBubble
          key={msg.id}
          message={msg}
          isCompact={i > 0}
          currentUserId={currentUserId}
          conversationId={conversationId}
          conversationType={conversationType}
          onOpenThread={onOpenThread}
          onAddReaction={handleAddReaction}
        />
      )
    }
  }

  return (
    <div className="chorus-message-list" ref={scrollRef} role="log" aria-label="Messages">
      <div className="chorus-message-list__content">
        {elements}
      </div>

      {showNewMessagesBanner && (
        <button
          className="chorus-message-list__new-messages"
          onClick={scrollToBottom}
          type="button"
        >
          <ArrowDown size={14} />
          <span>New messages</span>
        </button>
      )}
    </div>
  )
}
