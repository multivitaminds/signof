import type { PresenceUser } from '../../hooks/usePresenceSimulator'
import './PresenceAvatars.css'

interface PresenceCursorsProps {
  users: PresenceUser[]
}

export default function PresenceCursors({ users }: PresenceCursorsProps) {
  const activeUsers = users.filter((u) => u.isActive)

  if (activeUsers.length === 0) return null

  return (
    <>
      {activeUsers.map((user) => (
        <div
          key={user.id}
          className="presence-cursor"
          style={{ top: `${user.cursorY}px` }}
          aria-hidden="true"
        >
          <div
            className="presence-cursor__line"
            style={{ backgroundColor: user.color }}
          />
          <span
            className="presence-cursor__label"
            style={{ backgroundColor: user.color }}
          >
            {user.name}
          </span>
        </div>
      ))}
    </>
  )
}
