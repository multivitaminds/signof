import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Layout,
  CircleDot,
  Calendar,
  Database,
  User,
  Receipt,
  Bot,
  FileSpreadsheet,
  Settings,
} from 'lucide-react'
import type { SearchResult as SearchResultType } from '../../types/index'
import { highlightMatches } from '../../../../lib/fuzzyMatch'
import './SearchResult.css'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FileText,
  Layout,
  CircleDot,
  Calendar,
  Database,
  User,
  Receipt,
  Bot,
  FileSpreadsheet,
  Settings,
}

const MODULE_LABELS: Record<string, string> = {
  document: 'Document',
  page: 'Page',
  issue: 'Issue',
  event: 'Event',
  database: 'Database',
  contact: 'Contact',
  invoice: 'Invoice',
  agent: 'Agent',
  tax: 'Tax',
  setting: 'Notification',
}

function formatRelativeTime(timestamp: string): string {
  if (!timestamp) return ''
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

interface Props {
  result: SearchResultType
  isSelected: boolean
  onSelect: () => void
  onMouseEnter: () => void
}

export default function SearchResult({ result, isSelected, onSelect, onMouseEnter }: Props) {
  const navigate = useNavigate()
  const Icon = ICON_MAP[result.icon] ?? FileText
  const badgeLabel = MODULE_LABELS[result.type] ?? result.type

  const segments = highlightMatches(result.title, result.matchedIndices)

  const handleClick = useCallback(() => {
    navigate(result.modulePath)
    onSelect()
  }, [navigate, result.modulePath, onSelect])

  return (
    <button
      className={`search-result ${isSelected ? 'search-result--selected' : ''}`}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      type="button"
    >
      <div className="search-result__icon">
        <Icon size={18} />
      </div>
      <div className="search-result__content">
        <span className="search-result__title">
          {segments.map((seg, i) =>
            seg.highlight ? (
              <mark key={i} className="search-result__match">{seg.text}</mark>
            ) : (
              <span key={i}>{seg.text}</span>
            )
          )}
        </span>
        <span className="search-result__description">{result.description}</span>
      </div>
      <span className={`search-result__badge search-result__badge--${result.type}`}>
        {badgeLabel}
      </span>
      {result.timestamp && (
        <span className="search-result__time">
          {formatRelativeTime(result.timestamp)}
        </span>
      )}
    </button>
  )
}
