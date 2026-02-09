import { User } from 'lucide-react'
import './Avatar.css'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: AvatarSize
  status?: AvatarStatus
  className?: string
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function getColorFromName(name: string): string {
  const colors = [
    '#E94560', // coral
    '#4F46E5', // indigo
    '#0EA5E9', // sky
    '#10B981', // emerald
    '#F59E0B', // amber
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index] ?? '#E94560'
}

export default function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  status,
  className = '',
}: AvatarProps) {
  const classes = ['avatar', `avatar--${size}`, className].filter(Boolean).join(' ')
  const initials = name ? getInitials(name) : ''
  const bgColor = name ? getColorFromName(name) : 'var(--signof-navy)'

  return (
    <div className={classes}>
      {src ? (
        <img src={src} alt={alt || name} className="avatar__image" />
      ) : initials ? (
        <span
          className="avatar__initials"
          style={{ backgroundColor: bgColor }}
          title={name}
        >
          {initials}
        </span>
      ) : (
        <span className="avatar__placeholder">
          <User className="avatar__icon" />
        </span>
      )}
      {status && <span className={`avatar__status avatar__status--${status}`} />}
    </div>
  )
}
