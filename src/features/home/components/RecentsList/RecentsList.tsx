import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { useFavoritesStore } from '../../../../stores/useFavoritesStore'
import './RecentsList.css'

const MAX_VISIBLE = 8

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

export default function RecentsList() {
  const navigate = useNavigate()
  const recents = useFavoritesStore((s) => s.recents)
  const clearRecents = useFavoritesStore((s) => s.clearRecents)

  const visibleRecents = useMemo(
    () => recents.slice(0, MAX_VISIBLE),
    [recents]
  )

  const handleClick = useCallback(
    (path: string) => {
      navigate(path)
    },
    [navigate]
  )

  const handleClear = useCallback(() => {
    clearRecents()
  }, [clearRecents])

  if (recents.length === 0) return null

  return (
    <div className="recents-list">
      <div className="recents-list__header">
        <div className="recents-list__header-left">
          <Clock size={14} className="recents-list__header-icon" />
          <span className="recents-list__title">Recent</span>
        </div>
        <button
          className="recents-list__clear"
          onClick={handleClear}
          aria-label="Clear recent items"
        >
          Clear
        </button>
      </div>
      <ul className="recents-list__items">
        {visibleRecents.map((item) => (
          <li key={item.id} className="recents-list__item">
            <button
              className="recents-list__link"
              onClick={() => handleClick(item.path)}
              title={item.title}
            >
              <span className="recents-list__icon">{item.icon}</span>
              <span className="recents-list__label">{item.title}</span>
              <span className="recents-list__time">
                {formatRelativeTime(item.accessedAt)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
