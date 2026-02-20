import { useMemo } from 'react'
import { X } from 'lucide-react'
import { useChorusStore } from '../../stores/useChorusStore'
import PresenceAvatar from '../PresenceAvatar/PresenceAvatar'
import { PRESENCE_LABELS } from '../../types'
import './MemberList.css'

interface MemberListProps {
  channelId: string
  isOpen: boolean
  onClose: () => void
}

export default function MemberList({ channelId, isOpen, onClose }: MemberListProps) {
  const getChannel = useChorusStore((s) => s.getChannel)
  const getUser = useChorusStore((s) => s.getUser)

  const channel = getChannel(channelId)

  const members = useMemo(() => {
    if (!channel) return []
    return channel.memberIds
      .map((id) => getUser(id))
      .filter((u) => u !== undefined)
      .sort((a, b) => {
        // Online users first
        const presOrder = { online: 0, away: 1, dnd: 2, offline: 3 }
        const aOrder = presOrder[a.presence] ?? 4
        const bOrder = presOrder[b.presence] ?? 4
        if (aOrder !== bOrder) return aOrder - bOrder
        return a.displayName.localeCompare(b.displayName)
      })
  }, [channel, getUser])

  if (!isOpen || !channel) return null

  const onlineCount = members.filter((m) => m.presence === 'online').length

  return (
    <div className="member-list" role="complementary" aria-label="Channel members">
      <div className="member-list__header">
        <h3 className="member-list__title">Members</h3>
        <span className="member-list__count">{members.length}</span>
        <button
          className="member-list__close"
          onClick={onClose}
          aria-label="Close member list"
        >
          <X size={18} />
        </button>
      </div>

      <div className="member-list__summary">
        <span className="member-list__online-dot" />
        <span>{onlineCount} online</span>
      </div>

      <ul className="member-list__list" role="list">
        {members.map((member) => (
          <li key={member.id} className="member-list__item" role="listitem">
            <PresenceAvatar
              name={member.displayName}
              presence={member.presence}
              avatarUrl={member.avatarUrl || undefined}
              size={32}
            />
            <div className="member-list__info">
              <span className="member-list__name">{member.displayName}</span>
              {member.customStatus && (
                <span className="member-list__status">
                  {member.customStatusEmoji && <span>{member.customStatusEmoji} </span>}
                  {member.customStatus}
                </span>
              )}
              {!member.customStatus && (
                <span className="member-list__presence">
                  {PRESENCE_LABELS[member.presence]}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
