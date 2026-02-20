import { useCallback } from 'react'
import { ArrowDown } from 'lucide-react'
import './UnreadBanner.css'

interface UnreadBannerProps {
  count: number
  onJump: () => void
}

export default function UnreadBanner({ count, onJump }: UnreadBannerProps) {
  const handleClick = useCallback(() => {
    onJump()
  }, [onJump])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onJump()
      }
    },
    [onJump]
  )

  if (count <= 0) return null

  const label = count === 1 ? '1 new message' : `${count} new messages`

  return (
    <div
      className="unread-banner"
      role="button"
      tabIndex={0}
      aria-label={`${label} - click to jump`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className="unread-banner__text">{label}</span>
      <ArrowDown size={14} className="unread-banner__icon" />
    </div>
  )
}
