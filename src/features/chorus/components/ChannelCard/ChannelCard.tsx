import { useCallback } from 'react'
import { Hash, Lock, Users } from 'lucide-react'
import type { ChorusChannel } from '../../types'
import { ChorusChannelType } from '../../types'
import './ChannelCard.css'

interface ChannelCardProps {
  channel: ChorusChannel
  isMember: boolean
  onJoin: (channelId: string) => void
  onOpen: (channelId: string) => void
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString()
}

export default function ChannelCard({ channel, isMember, onJoin, onOpen }: ChannelCardProps) {
  const isPrivate = channel.type === ChorusChannelType.Private

  const handleAction = useCallback(() => {
    if (isMember) {
      onOpen(channel.id)
    } else {
      onJoin(channel.id)
    }
  }, [channel.id, isMember, onJoin, onOpen])

  const handleCardClick = useCallback(() => {
    if (isMember) {
      onOpen(channel.id)
    }
  }, [channel.id, isMember, onOpen])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardClick()
    }
  }, [handleCardClick])

  return (
    <div
      className={`chorus-channel-card${isMember ? ' chorus-channel-card--member' : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="article"
      tabIndex={isMember ? 0 : undefined}
      aria-label={`${channel.displayName} channel`}
    >
      <div className="chorus-channel-card__header">
        <span className="chorus-channel-card__icon">
          {isPrivate ? <Lock size={16} /> : <Hash size={16} />}
        </span>
        <h3 className="chorus-channel-card__name">{channel.displayName}</h3>
      </div>

      {channel.description && (
        <p className="chorus-channel-card__description">{channel.description}</p>
      )}

      <div className="chorus-channel-card__meta">
        <span className="chorus-channel-card__members">
          <Users size={14} />
          <span>{channel.memberIds.length} {channel.memberIds.length === 1 ? 'member' : 'members'}</span>
        </span>
        <span className="chorus-channel-card__date">
          {formatRelativeDate(channel.lastMessageAt)}
        </span>
      </div>

      <button
        className={`chorus-channel-card__action ${isMember ? 'chorus-channel-card__action--open' : 'chorus-channel-card__action--join'}`}
        onClick={(e) => {
          e.stopPropagation()
          handleAction()
        }}
      >
        {isMember ? 'Open' : 'Join'}
      </button>
    </div>
  )
}
