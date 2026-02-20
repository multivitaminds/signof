import { ChorusPresenceStatus } from '../../types'
import './PresenceAvatar.css'

interface PresenceAvatarProps {
  name: string
  presence: ChorusPresenceStatus
  avatarUrl?: string
  size?: number
  showStatus?: boolean
}

const PRESENCE_COLORS: Record<ChorusPresenceStatus, string> = {
  [ChorusPresenceStatus.Online]: 'var(--chorus-presence-online)',
  [ChorusPresenceStatus.Away]: 'var(--chorus-presence-away)',
  [ChorusPresenceStatus.DND]: 'var(--chorus-presence-dnd)',
  [ChorusPresenceStatus.Offline]: 'var(--chorus-presence-offline)',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 55%, 55%)`
}

export default function PresenceAvatar({
  name,
  presence,
  avatarUrl,
  size = 32,
  showStatus = true,
}: PresenceAvatarProps) {
  const initials = getInitials(name)
  const bgColor = getAvatarColor(name)
  const dotSize = Math.max(8, size * 0.3)

  return (
    <div
      className="presence-avatar"
      style={{ width: size, height: size }}
      aria-label={`${name} - ${presence}`}
    >
      {avatarUrl ? (
        <img
          className="presence-avatar__image"
          src={avatarUrl}
          alt={name}
          width={size}
          height={size}
        />
      ) : (
        <div
          className="presence-avatar__initials"
          style={{ background: bgColor, fontSize: size * 0.38 }}
        >
          {initials}
        </div>
      )}
      {showStatus && (
        <span
          className={`presence-avatar__dot presence-avatar__dot--${presence}`}
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: PRESENCE_COLORS[presence],
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
