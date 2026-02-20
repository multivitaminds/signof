import { useCallback } from 'react'
import { Hash, Lock, Users, Pin, Search } from 'lucide-react'
import type { ChorusChannel } from '../../types'
import './ChannelHeader.css'

interface ChannelHeaderProps {
  channel: ChorusChannel | null
  dmName?: string
  memberCount?: number
  onToggleMembers?: () => void
  onTogglePins?: () => void
  onSearchClick?: () => void
}

export default function ChannelHeader({
  channel,
  dmName,
  memberCount,
  onToggleMembers,
  onTogglePins,
  onSearchClick,
}: ChannelHeaderProps) {
  const handleToggleMembers = useCallback(() => {
    onToggleMembers?.()
  }, [onToggleMembers])

  const handleTogglePins = useCallback(() => {
    onTogglePins?.()
  }, [onTogglePins])

  const handleSearchClick = useCallback(() => {
    onSearchClick?.()
  }, [onSearchClick])

  const isPrivate = channel?.type === 'private'
  const displayName = channel ? channel.displayName : dmName ?? 'Conversation'

  return (
    <div className="chorus-channel-header" role="banner">
      <div className="chorus-channel-header__info">
        <div className="chorus-channel-header__name">
          {channel && (
            isPrivate
              ? <Lock size={16} className="chorus-channel-header__icon" aria-label="Private channel" />
              : <Hash size={16} className="chorus-channel-header__icon" aria-hidden="true" />
          )}
          <h2 className="chorus-channel-header__title">{displayName}</h2>
        </div>
        {channel?.topic && (
          <p className="chorus-channel-header__topic" title={channel.topic}>
            {channel.topic}
          </p>
        )}
      </div>

      <div className="chorus-channel-header__actions">
        {onToggleMembers && (
          <button
            className="chorus-channel-header__action-btn"
            onClick={handleToggleMembers}
            aria-label="Toggle members"
            type="button"
          >
            <Users size={18} />
            {memberCount !== undefined && (
              <span className="chorus-channel-header__member-count">{memberCount}</span>
            )}
          </button>
        )}
        {onTogglePins && (
          <button
            className="chorus-channel-header__action-btn"
            onClick={handleTogglePins}
            aria-label="Toggle pins"
            type="button"
          >
            <Pin size={18} />
          </button>
        )}
        {onSearchClick && (
          <button
            className="chorus-channel-header__action-btn"
            onClick={handleSearchClick}
            aria-label="Search in channel"
            type="button"
          >
            <Search size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
