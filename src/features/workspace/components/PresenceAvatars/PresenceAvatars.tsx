import type { PresenceUser } from '../../hooks/usePresenceSimulator'
import './PresenceAvatars.css'

interface PresenceAvatarsProps {
  users: PresenceUser[]
}

export default function PresenceAvatars({ users }: PresenceAvatarsProps) {
  const activeUsers = users.filter((u) => u.isActive)

  if (activeUsers.length === 0) return null

  return (
    <div className="presence-avatars" aria-label={`${activeUsers.length} user${activeUsers.length === 1 ? '' : 's'} viewing this page`}>
      <div className="presence-avatars__stack">
        {activeUsers.map((user) => (
          <div
            key={user.id}
            className="presence-avatars__avatar"
            style={{ backgroundColor: user.color }}
            title={user.name}
            aria-label={user.name}
          >
            {user.initials}
          </div>
        ))}
      </div>
      <span className="presence-avatars__label">
        {activeUsers.length} viewing
      </span>
    </div>
  )
}
