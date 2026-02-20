import { useCallback, useMemo } from 'react'
import { MessageSquare, Pin, ExternalLink } from 'lucide-react'
import PresenceAvatar from '../PresenceAvatar/PresenceAvatar'
import MessageCategoryLabel from '../MessageCategoryLabel/MessageCategoryLabel'
import { useChorusStore } from '../../stores/useChorusStore'
import { formatMessageTime, formatFullTimestamp } from '../../lib/chorusFormatters'
import { categorizeMessage } from '../../lib/messageCategorizer'
import type { ChorusMessage, ConversationType } from '../../types'
import './MessageBubble.css'

interface MessageBubbleProps {
  message: ChorusMessage
  isCompact: boolean
  currentUserId: string
  conversationId: string
  conversationType: ConversationType
  onOpenThread?: (messageId: string) => void
  onAddReaction?: (messageId: string, emoji: string) => void
}

function renderContent(content: string): React.ReactNode {
  // Split by code block fences first
  const parts = content.split(/(```[\s\S]*?```)/g)

  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const code = part.slice(3, -3)
      // Strip optional language identifier from first line
      const newlineIdx = code.indexOf('\n')
      const codeBody = newlineIdx >= 0 ? code.slice(newlineIdx + 1) : code
      return (
        <pre key={i} className="chorus-bubble__code-block">
          <code>{codeBody}</code>
        </pre>
      )
    }

    // Handle inline code within regular text
    const inlineParts = part.split(/(`[^`]+`)/g)
    return inlineParts.map((seg, j) => {
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code key={`${i}-${j}`} className="chorus-bubble__inline-code">
            {seg.slice(1, -1)}
          </code>
        )
      }
      return <span key={`${i}-${j}`}>{seg}</span>
    })
  })
}

export default function MessageBubble({
  message,
  isCompact,
  currentUserId,
  conversationId: _conversationId,
  conversationType: _conversationType,
  onOpenThread,
  onAddReaction,
}: MessageBubbleProps) {
  const getUser = useChorusStore((s) => s.getUser)

  const senderUser = useMemo(
    () => getUser(message.senderId),
    [getUser, message.senderId]
  )

  const isMentioned = message.mentions.includes(currentUserId)
  const isSystem = message.messageType === 'system'
  const timeLabel = formatMessageTime(message.timestamp)
  const fullTimestamp = formatFullTimestamp(message.timestamp)

  const messageCategory = useMemo(
    () => categorizeMessage(message.content),
    [message.content]
  )

  const handleOpenThread = useCallback(() => {
    onOpenThread?.(message.id)
  }, [onOpenThread, message.id])

  const handleReactionClick = useCallback(
    (emoji: string) => {
      onAddReaction?.(message.id, emoji)
    },
    [onAddReaction, message.id]
  )

  if (isSystem) {
    return (
      <div className="chorus-bubble chorus-bubble--system" data-testid="message-bubble">
        <span className="chorus-bubble__system-text">{message.content}</span>
      </div>
    )
  }

  const rootClass = [
    'chorus-bubble',
    isCompact ? 'chorus-bubble--compact' : '',
    isMentioned ? 'chorus-bubble--mentioned' : '',
    message.isPinned ? 'chorus-bubble--pinned' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass} data-testid="message-bubble">
      {!isCompact && (
        <div className="chorus-bubble__avatar">
          <PresenceAvatar
            name={message.senderName}
            presence={senderUser?.presence ?? 'offline'}
            avatarUrl={message.senderAvatarUrl || undefined}
            size={36}
            showStatus={false}
          />
        </div>
      )}

      <div className="chorus-bubble__body">
        {!isCompact && (
          <div className="chorus-bubble__header">
            <span className="chorus-bubble__sender">{message.senderName}</span>
            <time
              className="chorus-bubble__time"
              title={fullTimestamp}
              dateTime={message.timestamp}
            >
              {timeLabel}
            </time>
            {message.isEdited && (
              <span className="chorus-bubble__edited">(edited)</span>
            )}
            {message.isPinned && (
              <Pin size={12} className="chorus-bubble__pin-icon" aria-label="Pinned" />
            )}
            {messageCategory && (
              <MessageCategoryLabel category={messageCategory} />
            )}
          </div>
        )}

        {isCompact && (
          <time
            className="chorus-bubble__compact-time"
            title={fullTimestamp}
            dateTime={message.timestamp}
          >
            {timeLabel}
          </time>
        )}

        <div className="chorus-bubble__content">
          {renderContent(message.content)}
        </div>

        {message.crossModuleRef && (
          <a
            className="chorus-bubble__cross-ref"
            href={message.crossModuleRef.entityPath}
            aria-label={`Open ${message.crossModuleRef.entityTitle}`}
          >
            <ExternalLink size={14} />
            <span>{message.crossModuleRef.entityTitle}</span>
          </a>
        )}

        {message.reactions.length > 0 && (
          <div className="chorus-bubble__reactions" role="group" aria-label="Reactions">
            {message.reactions.map((reaction) => {
              const isActive = reaction.userIds.includes(currentUserId)
              return (
                <button
                  key={reaction.emoji}
                  className={`chorus-bubble__reaction${isActive ? ' chorus-bubble__reaction--active' : ''}`}
                  onClick={() => handleReactionClick(reaction.emoji)}
                  aria-label={`${reaction.emoji} ${reaction.count}`}
                  type="button"
                >
                  <span>{reaction.emoji}</span>
                  <span className="chorus-bubble__reaction-count">{reaction.count}</span>
                </button>
              )
            })}
          </div>
        )}

        {message.threadReplyCount > 0 && !message.threadId && (
          <button
            className="chorus-bubble__thread-link"
            onClick={handleOpenThread}
            type="button"
          >
            <MessageSquare size={14} />
            <span>
              {message.threadReplyCount === 1
                ? '1 reply'
                : `${message.threadReplyCount} replies`}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
