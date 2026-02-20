import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Users } from 'lucide-react'
import { useChorusStore } from '../stores/useChorusStore'
import { useChorusMessageStore } from '../stores/useChorusMessageStore'
import { useChorusPresenceStore } from '../stores/useChorusPresenceStore'
import { useTypingIndicator } from '../hooks/useTypingIndicator'
import { useUnreadTracker } from '../hooks/useUnreadTracker'
import PresenceAvatar from '../components/PresenceAvatar/PresenceAvatar'
import TypingIndicator from '../components/TypingIndicator/TypingIndicator'
import MessageList from '../components/MessageList/MessageList'
import MessageComposer from '../components/MessageComposer/MessageComposer'
import { ConversationType } from '../types'
import { AUTO_REPLY_MESSAGES } from '../data/mockData'
import './DirectMessagePage.css'

const AUTO_REPLY_MIN_DELAY = 2000
const AUTO_REPLY_MAX_DELAY = 4000

export default function DirectMessagePage() {
  const { dmId } = useParams<{ dmId: string }>()
  const getDM = useChorusStore((s) => s.getDM)
  const getUser = useChorusStore((s) => s.getUser)
  const currentUserId = useChorusStore((s) => s.currentUserId)
  const users = useChorusStore((s) => s.users)
  const setActiveConversation = useChorusStore((s) => s.setActiveConversation)
  const sendMessage = useChorusMessageStore((s) => s.sendMessage)
  const allMessages = useChorusMessageStore((s) => s.messages)
  const messages = useMemo(
    () => (dmId ? allMessages[dmId] ?? [] : []),
    [allMessages, dmId]
  )
  const startTyping = useChorusPresenceStore((s) => s.startTyping)
  const stopTyping = useChorusPresenceStore((s) => s.stopTyping)

  const dm = dmId ? getDM(dmId) : undefined
  const autoReplyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useTypingIndicator(dmId ?? '')
  useUnreadTracker(dmId ?? '')

  const participants = useMemo(() => {
    if (!dm) return []
    return dm.participantIds
      .filter((id) => id !== currentUserId)
      .map((id) => getUser(id))
      .filter((u): u is NonNullable<typeof u> => u !== undefined && u !== null)
  }, [dm, currentUserId, getUser])

  const isGroupDM = dm?.type === ConversationType.GroupDM

  const headerName = dm?.name ?? 'Direct Message'

  useEffect(() => {
    if (dmId && dm) {
      setActiveConversation(dmId, dm.type)
    }
  }, [dmId, dm, setActiveConversation])

  useEffect(() => {
    return () => {
      if (autoReplyTimerRef.current) clearTimeout(autoReplyTimerRef.current)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
  }, [])

  const handleSend = useCallback(
    (content: string) => {
      if (!dmId || !dm) return

      const currentUser = users.find((u) => u.id === currentUserId)
      if (!currentUser) return

      sendMessage({
        conversationId: dmId,
        conversationType: dm.type,
        senderId: currentUserId,
        senderName: currentUser.displayName,
        senderAvatarUrl: currentUser.avatarUrl,
        content,
      })

      // Simulate auto-reply from a random participant
      if (participants.length > 0) {
        const randomIndex = Math.floor(Math.random() * participants.length)
        const responder = participants[randomIndex]
        if (!responder) return

        // Start typing indicator after a short pause
        const typingDelay = 500 + Math.random() * 1000
        typingTimerRef.current = setTimeout(() => {
          startTyping(responder.id, responder.displayName, dmId)
        }, typingDelay)

        const replyDelay =
          AUTO_REPLY_MIN_DELAY + Math.random() * (AUTO_REPLY_MAX_DELAY - AUTO_REPLY_MIN_DELAY)

        autoReplyTimerRef.current = setTimeout(() => {
          stopTyping(responder.id, dmId)

          const replyIndex = Math.floor(Math.random() * AUTO_REPLY_MESSAGES.length)
          const replyContent = AUTO_REPLY_MESSAGES[replyIndex] ?? 'Got it!'

          sendMessage({
            conversationId: dmId,
            conversationType: dm.type,
            senderId: responder.id,
            senderName: responder.displayName,
            senderAvatarUrl: responder.avatarUrl,
            content: replyContent,
          })
        }, replyDelay)
      }
    },
    [dmId, dm, currentUserId, users, participants, sendMessage, startTyping, stopTyping]
  )

  if (!dm) {
    return (
      <div className="dm-page__empty">
        <p>Conversation not found</p>
      </div>
    )
  }

  return (
    <div className="dm-page">
      <header className="dm-page__header">
        <div className="dm-page__header-left">
          {isGroupDM ? (
            <div className="dm-page__header-avatar dm-page__header-avatar--group">
              <Users size={20} />
            </div>
          ) : participants[0] ? (
            <PresenceAvatar
              name={participants[0].displayName}
              presence={participants[0].presence}
              size={36}
            />
          ) : null}
          <div className="dm-page__header-info">
            <h2 className="dm-page__header-name">{headerName}</h2>
            {!isGroupDM && participants[0]?.customStatus && (
              <span className="dm-page__header-status">
                {participants[0].customStatusEmoji && (
                  <span>{participants[0].customStatusEmoji} </span>
                )}
                {participants[0].customStatus}
              </span>
            )}
            {isGroupDM && (
              <span className="dm-page__header-members">
                {dm.participantIds.length} members
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="dm-page__messages">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          conversationId={dmId ?? ''}
          conversationType={dm.type}
        />
      </div>

      <div className="dm-page__footer">
        <TypingIndicator conversationId={dmId ?? ''} />
        <MessageComposer
          onSend={handleSend}
          placeholder={`Message ${headerName}`}
        />
      </div>
    </div>
  )
}
