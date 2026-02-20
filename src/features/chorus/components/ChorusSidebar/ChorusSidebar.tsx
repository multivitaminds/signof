import { useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Hash,
  Lock,
  Star,
  ChevronDown,
  Plus,
  MessageSquare,
  Users,
  Search,
} from 'lucide-react'
import { useChorusStore } from '../../stores/useChorusStore'
import { ChorusChannelType, ConversationType } from '../../types'
import PresenceAvatar from '../PresenceAvatar/PresenceAvatar'
import './ChorusSidebar.css'

export default function ChorusSidebar() {
  const navigate = useNavigate()
  const { channelId, dmId } = useParams()

  const channels = useChorusStore((s) => s.channels)
  const directMessages = useChorusStore((s) => s.directMessages)
  const setActiveConversation = useChorusStore((s) => s.setActiveConversation)
  const clearUnreadCount = useChorusStore((s) => s.clearUnreadCount)
  const getUser = useChorusStore((s) => s.getUser)

  const starredChannels = useMemo(
    () => channels.filter((c) => c.isStarred),
    [channels]
  )

  const starredDMs = useMemo(
    () => directMessages.filter((d) => d.isStarred),
    [directMessages]
  )

  const regularChannels = useMemo(
    () => channels.filter((c) => c.type !== ChorusChannelType.Archived),
    [channels]
  )

  const handleChannelClick = useCallback(
    (channel: { id: string; name: string }) => {
      setActiveConversation(channel.id, ConversationType.Channel)
      clearUnreadCount(channel.id)
      navigate(`/chorus/channels/${channel.name}`)
    },
    [setActiveConversation, clearUnreadCount, navigate]
  )

  const handleDMClick = useCallback(
    (dm: { id: string }) => {
      setActiveConversation(dm.id, ConversationType.DM)
      clearUnreadCount(dm.id)
      navigate(`/chorus/dm/${dm.id}`)
    },
    [setActiveConversation, clearUnreadCount, navigate]
  )

  const handleBrowseChannels = useCallback(() => {
    navigate('/chorus/browse')
  }, [navigate])

  const handleNewMessage = useCallback(() => {
    navigate('/chorus/new')
  }, [navigate])

  const handleSearchClick = useCallback(() => {
    navigate('/chorus/search')
  }, [navigate])

  return (
    <aside className="chorus-sidebar" role="navigation" aria-label="Chorus messaging">
      {/* Header */}
      <div className="chorus-sidebar__header">
        <h2 className="chorus-sidebar__title">Chorus</h2>
        <button
          className="chorus-sidebar__icon-btn"
          onClick={handleNewMessage}
          aria-label="New message"
          title="New message"
        >
          <MessageSquare size={18} />
        </button>
      </div>

      {/* Search */}
      <button
        className="chorus-sidebar__search"
        onClick={handleSearchClick}
        aria-label="Search messages"
      >
        <Search size={16} />
        <span>Search messages</span>
      </button>

      <div className="chorus-sidebar__scrollable">
        {/* Starred Section */}
        {(starredChannels.length > 0 || starredDMs.length > 0) && (
          <div className="chorus-sidebar__section">
            <div className="chorus-sidebar__section-header">
              <Star size={14} />
              <span>Starred</span>
            </div>
            <ul className="chorus-sidebar__list" role="list">
              {starredChannels.map((ch) => (
                <li key={ch.id} role="listitem">
                  <button
                    className={`chorus-sidebar__item${channelId === ch.name ? ' chorus-sidebar__item--active' : ''}`}
                    onClick={() => handleChannelClick(ch)}
                  >
                    <span className="chorus-sidebar__item-icon">
                      {ch.type === ChorusChannelType.Private ? <Lock size={16} /> : <Hash size={16} />}
                    </span>
                    <span className="chorus-sidebar__item-name">{ch.name}</span>
                    {ch.unreadCount > 0 && (
                      <span className="chorus-sidebar__badge" aria-label={`${ch.unreadCount} unread`}>
                        {ch.unreadCount}
                      </span>
                    )}
                    {ch.mentionCount > 0 && (
                      <span className="chorus-sidebar__mention-badge" aria-label={`${ch.mentionCount} mentions`}>
                        @{ch.mentionCount}
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {starredDMs.map((dm) => {
                const otherUserId = dm.participantIds.find((id) => id !== 'user-you')
                const otherUser = otherUserId ? getUser(otherUserId) : undefined
                return (
                  <li key={dm.id} role="listitem">
                    <button
                      className={`chorus-sidebar__item${dmId === dm.id ? ' chorus-sidebar__item--active' : ''}`}
                      onClick={() => handleDMClick(dm)}
                    >
                      {otherUser && (
                        <PresenceAvatar
                          name={otherUser.displayName}
                          presence={otherUser.presence}
                          size={20}
                        />
                      )}
                      <span className="chorus-sidebar__item-name">{dm.name}</span>
                      {dm.unreadCount > 0 && (
                        <span className="chorus-sidebar__badge" aria-label={`${dm.unreadCount} unread`}>
                          {dm.unreadCount}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Channels Section */}
        <div className="chorus-sidebar__section">
          <div className="chorus-sidebar__section-header">
            <ChevronDown size={14} />
            <span>Channels</span>
            <button
              className="chorus-sidebar__section-action"
              onClick={handleBrowseChannels}
              aria-label="Browse channels"
              title="Browse channels"
            >
              <Plus size={14} />
            </button>
          </div>
          <ul className="chorus-sidebar__list" role="list">
            {regularChannels.map((ch) => (
              <li key={ch.id} role="listitem">
                <button
                  className={`chorus-sidebar__item${channelId === ch.name ? ' chorus-sidebar__item--active' : ''}${ch.unreadCount > 0 ? ' chorus-sidebar__item--unread' : ''}`}
                  onClick={() => handleChannelClick(ch)}
                >
                  <span className="chorus-sidebar__item-icon">
                    {ch.type === ChorusChannelType.Private ? <Lock size={16} /> : <Hash size={16} />}
                  </span>
                  <span className="chorus-sidebar__item-name">{ch.name}</span>
                  {ch.unreadCount > 0 && (
                    <span className="chorus-sidebar__badge" aria-label={`${ch.unreadCount} unread`}>
                      {ch.unreadCount}
                    </span>
                  )}
                  {ch.mentionCount > 0 && (
                    <span className="chorus-sidebar__mention-badge" aria-label={`${ch.mentionCount} mentions`}>
                      @{ch.mentionCount}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Direct Messages Section */}
        <div className="chorus-sidebar__section">
          <div className="chorus-sidebar__section-header">
            <ChevronDown size={14} />
            <Users size={14} />
            <span>Direct Messages</span>
            <button
              className="chorus-sidebar__section-action"
              onClick={handleNewMessage}
              aria-label="New direct message"
              title="New direct message"
            >
              <Plus size={14} />
            </button>
          </div>
          <ul className="chorus-sidebar__list" role="list">
            {directMessages.map((dm) => {
              const otherUserId = dm.participantIds.find((id) => id !== 'user-you')
              const otherUser = otherUserId ? getUser(otherUserId) : undefined
              const isGroupDM = dm.type === ConversationType.GroupDM
              return (
                <li key={dm.id} role="listitem">
                  <button
                    className={`chorus-sidebar__item${dmId === dm.id ? ' chorus-sidebar__item--active' : ''}${dm.unreadCount > 0 ? ' chorus-sidebar__item--unread' : ''}`}
                    onClick={() => handleDMClick(dm)}
                  >
                    {isGroupDM ? (
                      <Users size={16} className="chorus-sidebar__dm-group-icon" />
                    ) : otherUser ? (
                      <PresenceAvatar
                        name={otherUser.displayName}
                        presence={otherUser.presence}
                        size={20}
                      />
                    ) : null}
                    <span className="chorus-sidebar__item-name">{dm.name}</span>
                    {dm.unreadCount > 0 && (
                      <span className="chorus-sidebar__badge" aria-label={`${dm.unreadCount} unread`}>
                        {dm.unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </aside>
  )
}
