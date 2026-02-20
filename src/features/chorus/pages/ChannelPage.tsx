import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import ChannelHeader from '../components/ChannelHeader/ChannelHeader'
import MessageList from '../components/MessageList/MessageList'
import MessageComposer from '../components/MessageComposer/MessageComposer'
import ChannelDigest from '../components/ChannelDigest/ChannelDigest'
import { useChorusStore } from '../stores/useChorusStore'
import { useChorusMessageStore } from '../stores/useChorusMessageStore'
import { useSmartCompose } from '../hooks/useSmartCompose'
import { AUTO_REPLY_MESSAGES } from '../data/mockData'
import { ConversationType } from '../types'
import type { ChorusMessage } from '../types'
import './ChannelPage.css'

const EMPTY_MESSAGES: ChorusMessage[] = []

function pickRandom<T>(arr: readonly T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function ChannelPage() {
  const { channelId } = useParams()
  const channels = useChorusStore((s) => s.channels)
  const currentUserId = useChorusStore((s) => s.currentUserId)
  const getCurrentUser = useChorusStore((s) => s.getCurrentUser)
  const openThread = useChorusStore((s) => s.openThread)
  const toggleMembersPanel = useChorusStore((s) => s.toggleMembersPanel)
  const clearUnreadCount = useChorusStore((s) => s.clearUnreadCount)
  const users = useChorusStore((s) => s.users)

  const [showDigest, setShowDigest] = useState(false)

  const channel = useMemo(
    () => channels.find((ch) => ch.name === channelId),
    [channels, channelId]
  )

  const conversationId = channel?.id ?? ''

  const messages = useChorusMessageStore((s) =>
    conversationId ? s.messages[conversationId] ?? EMPTY_MESSAGES : EMPTY_MESSAGES
  )
  const sendMessage = useChorusMessageStore((s) => s.sendMessage)

  const recentMessageContents = useMemo(
    () => messages.slice(-5).map((m) => `${m.senderName}: ${m.content}`),
    [messages]
  )

  const smartCompose = useSmartCompose({
    channelName: channel?.name,
    recentMessages: recentMessageContents,
    topic: channel?.topic,
  })

  const autoReplyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear unread count when entering channel
  useEffect(() => {
    if (conversationId) {
      clearUnreadCount(conversationId)
    }
  }, [conversationId, clearUnreadCount])

  // Cleanup auto-reply timer on unmount
  useEffect(() => {
    return () => {
      if (autoReplyTimerRef.current) {
        clearTimeout(autoReplyTimerRef.current)
      }
    }
  }, [])

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!channel) return
      const currentUser = getCurrentUser()
      if (!currentUser) return

      sendMessage({
        conversationId: channel.id,
        conversationType: ConversationType.Channel,
        senderId: currentUserId,
        senderName: currentUser.displayName,
        senderAvatarUrl: currentUser.avatarUrl,
        content,
      })

      // Auto-reply simulation
      if (autoReplyTimerRef.current) {
        clearTimeout(autoReplyTimerRef.current)
      }
      const delay = 2000 + Math.random() * 2000
      autoReplyTimerRef.current = setTimeout(() => {
        const otherMembers = channel.memberIds.filter((id) => id !== currentUserId)
        const replyUserId = pickRandom(otherMembers)
        if (!replyUserId) return
        const replyUser = users.find((u) => u.id === replyUserId)
        if (!replyUser) return
        const replyContent = pickRandom(AUTO_REPLY_MESSAGES)
        if (!replyContent) return

        sendMessage({
          conversationId: channel.id,
          conversationType: ConversationType.Channel,
          senderId: replyUser.id,
          senderName: replyUser.displayName,
          senderAvatarUrl: replyUser.avatarUrl,
          content: replyContent,
        })
      }, delay)
    },
    [channel, currentUserId, getCurrentUser, sendMessage, users]
  )

  const handleOpenThread = useCallback(
    (messageId: string) => {
      openThread(messageId)
    },
    [openThread]
  )

  const handleToggleMembers = useCallback(() => {
    toggleMembersPanel()
  }, [toggleMembersPanel])

  const handleDigestClick = useCallback(() => {
    setShowDigest(true)
  }, [])

  const handleDigestClose = useCallback(() => {
    setShowDigest(false)
  }, [])

  if (!channel) {
    return (
      <div className="chorus-channel-page chorus-channel-page--empty">
        <p>Channel not found</p>
      </div>
    )
  }

  return (
    <div className="chorus-channel-page">
      <ChannelHeader
        channel={channel}
        memberCount={channel.memberIds.length}
        onToggleMembers={handleToggleMembers}
        onSearchClick={() => {}}
        onDigestClick={handleDigestClick}
      />
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        conversationId={channel.id}
        conversationType={ConversationType.Channel}
        onOpenThread={handleOpenThread}
      />
      <MessageComposer
        onSend={handleSendMessage}
        placeholder={`Message #${channel.name}`}
        smartComposeSuggestion={smartCompose.suggestion}
        onAcceptSuggestion={smartCompose.acceptSuggestion}
        onDismissSuggestion={smartCompose.dismissSuggestion}
        onDraftChange={smartCompose.onDraftChange}
      />
      {showDigest && (
        <ChannelDigest
          channelId={channel.id}
          channelName={channel.name}
          onClose={handleDigestClose}
        />
      )}
    </div>
  )
}
