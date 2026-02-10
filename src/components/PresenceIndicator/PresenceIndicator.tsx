import { useState, useEffect, useMemo } from 'react'
import './PresenceIndicator.css'

/* ------------------------------------------------------------------ */
/*  Presence Status (const object pattern)                             */
/* ------------------------------------------------------------------ */

export const PresenceStatus = {
  Online: 'online',
  Away: 'away',
  Offline: 'offline',
} as const

export type PresenceStatus = (typeof PresenceStatus)[keyof typeof PresenceStatus]

/* ------------------------------------------------------------------ */
/*  PresenceIndicator — Colored dot showing user presence              */
/* ------------------------------------------------------------------ */

interface PresenceIndicatorProps {
  status: PresenceStatus
  size?: 'sm' | 'md' | 'lg'
}

export function PresenceIndicator({
  status,
  size = 'md',
}: PresenceIndicatorProps) {
  return (
    <span
      className={`presence-indicator presence-indicator--${status} presence-indicator--${size}`}
      aria-label={`Status: ${status}`}
      role="status"
    />
  )
}

/* ------------------------------------------------------------------ */
/*  User type for AvatarStack                                          */
/* ------------------------------------------------------------------ */

export interface AvatarStackUser {
  name: string
  avatarUrl?: string
  status: PresenceStatus
}

/* ------------------------------------------------------------------ */
/*  AvatarStack — Multiple user avatars with presence dots             */
/* ------------------------------------------------------------------ */

interface AvatarStackProps {
  users: AvatarStackUser[]
  max?: number
  size?: 'sm' | 'md' | 'lg'
  simulate?: boolean
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0]?.charAt(0) ?? '') + (parts[1]?.charAt(0) ?? '')
  }
  return parts[0]?.charAt(0)?.toUpperCase() ?? ''
}

/** Deterministic color from name string */
function nameToColor(name: string): string {
  const colors = [
    '#4F46E5', '#059669', '#D97706', '#DC2626', '#8B5CF6',
    '#0EA5E9', '#EC4899', '#14B8A6', '#F97316', '#6366F1',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index] ?? colors[0] ?? '#4F46E5'
}

export function AvatarStack({
  users,
  max = 4,
  size = 'md',
  simulate = false,
}: AvatarStackProps) {
  /* Simulated presence cycling for demo */
  const [simulatedStatuses, setSimulatedStatuses] = useState<Record<string, PresenceStatus>>({})

  useEffect(() => {
    if (!simulate || users.length === 0) return

    const interval = setInterval(() => {
      setSimulatedStatuses((prev) => {
        const next = { ...prev }
        const randomUser = users[Math.floor(Math.random() * users.length)]
        if (randomUser) {
          const statuses: PresenceStatus[] = ['online', 'away', 'offline']
          const currentIdx = statuses.indexOf(next[randomUser.name] ?? randomUser.status)
          const nextIdx = (currentIdx + 1) % statuses.length
          next[randomUser.name] = statuses[nextIdx] ?? 'online'
        }
        return next
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [simulate, users])

  const visibleUsers = useMemo(() => users.slice(0, max), [users, max])
  const overflowCount = users.length - max

  function getStatus(user: AvatarStackUser): PresenceStatus {
    if (simulate) {
      const simulated = simulatedStatuses[user.name]
      if (simulated) return simulated
    }
    return user.status
  }

  return (
    <div
      className={`avatar-stack avatar-stack--${size}`}
      aria-label={`${users.length} team members`}
      role="group"
    >
      {visibleUsers.map((user) => (
        <div
          key={user.name}
          className="avatar-stack__item"
          title={`${user.name} (${getStatus(user)})`}
        >
          {user.avatarUrl ? (
            <img
              className="avatar-stack__image"
              src={user.avatarUrl}
              alt={user.name}
            />
          ) : (
            <div
              className="avatar-stack__initials"
              style={{ backgroundColor: nameToColor(user.name) }}
            >
              {getInitials(user.name)}
            </div>
          )}
          <PresenceIndicator status={getStatus(user)} size="sm" />
        </div>
      ))}
      {overflowCount > 0 && (
        <div
          className="avatar-stack__overflow"
          title={`${overflowCount} more`}
          aria-label={`${overflowCount} more members`}
        >
          +{overflowCount}
        </div>
      )}
    </div>
  )
}

export default PresenceIndicator
