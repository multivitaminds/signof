import { useCallback } from 'react'
import type { Channel } from '../../types'
import { CHANNEL_STATUS_LABELS } from '../../types'
import './ChannelCard.css'

interface ChannelCardProps {
  channel: Channel
  onConnect?: (id: string) => void
  onDisconnect?: (id: string) => void
  onConfigure?: (id: string) => void
}

export default function ChannelCard({
  channel,
  onConnect,
  onDisconnect,
  onConfigure,
}: ChannelCardProps) {
  const isConnected = channel.status === 'connected'
  const isError = channel.status === 'error'

  const handleToggleConnection = useCallback(() => {
    if (isConnected) {
      onDisconnect?.(channel.id)
    } else {
      onConnect?.(channel.id)
    }
  }, [isConnected, channel.id, onConnect, onDisconnect])

  const handleConfigure = useCallback(() => {
    onConfigure?.(channel.id)
  }, [channel.id, onConfigure])

  const handleCardClick = useCallback(() => {
    onConfigure?.(channel.id)
  }, [channel.id, onConfigure])

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onConfigure?.(channel.id)
      }
    },
    [channel.id, onConfigure]
  )

  return (
    <div
      className="channel-card"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`${channel.name} channel — ${CHANNEL_STATUS_LABELS[channel.status]}`}
    >
      <div className="channel-card__header">
        <span className="channel-card__icon" aria-hidden="true">
          {channel.icon}
        </span>
        <div className="channel-card__title-row">
          <h3 className="channel-card__name">{channel.name}</h3>
          <span
            className={`channel-card__status channel-card__status--${channel.status}`}
          >
            {CHANNEL_STATUS_LABELS[channel.status]}
          </span>
        </div>
        {channel.unreadCount > 0 && (
          <span className="channel-card__unread" aria-label={`${channel.unreadCount} unread`}>
            {channel.unreadCount}
          </span>
        )}
      </div>

      <p className="channel-card__description">{channel.description}</p>

      <div className="channel-card__capabilities">
        {channel.capabilities.map((cap) => (
          <span key={cap} className="channel-card__capability">
            {cap}
          </span>
        ))}
      </div>

      <div className="channel-card__actions">
        <button
          className={`channel-card__connect-btn ${isConnected ? 'btn--danger' : 'btn--primary'}`}
          onClick={handleToggleConnection}
        >
          {isConnected ? 'Disconnect' : isError ? 'Reconnect' : 'Connect'}
        </button>
        {onConfigure && (
          <button
            className="channel-card__settings btn--ghost"
            onClick={handleConfigure}
            aria-label={`Configure ${channel.name}`}
          >
            Settings
          </button>
        )}
      </div>
    </div>
  )
}
