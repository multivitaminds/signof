import { useCallback } from 'react'
import { Pencil, Trash2, Tag, Clock, ChevronDown, ChevronUp, CircleDot, Star } from 'lucide-react'
import { Button } from '../../../../components/ui'
import { Badge } from '../../../../components/ui'
import type { MemoryEntry, MemoryCategory } from '../../types'
import { formatTokenCount } from '../../lib/tokenCount'
import { isAutoCaptured } from '../../hooks/useAutoCapture'
import { CATEGORY_META } from '../../lib/memoryTemplates'
import './MemoryEntryCard.css'

interface MemoryEntryCardProps {
  entry: MemoryEntry
  expanded?: boolean
  isPinned?: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleExpand?: (id: string) => void
  onTogglePin?: (id: string) => void
}

const scopeVariant: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
  workspace: 'primary',
  personal: 'success',
  team: 'warning',
  project: 'info',
}

const categoryVariant: Record<MemoryCategory, 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  decisions: 'primary',
  workflows: 'success',
  preferences: 'warning',
  people: 'info',
  projects: 'danger',
  facts: 'default',
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

function getCategoryColor(category: MemoryCategory): string {
  const meta = CATEGORY_META.find((m) => m.key === category)
  return meta?.color ?? '#64748B'
}

function getSourceLabel(sourceType: string): string {
  if (sourceType === 'manual') return 'Manual'
  if (sourceType === 'template') return 'Template'
  if (sourceType.startsWith('auto-')) return 'Auto-captured'
  return sourceType
}

export default function MemoryEntryCard({ entry, expanded = false, isPinned = false, onEdit, onDelete, onToggleExpand, onTogglePin }: MemoryEntryCardProps) {
  const preview = entry.content.length > 150
    ? entry.content.slice(0, 150) + '...'
    : entry.content
  const autoCaptured = isAutoCaptured(entry.tags)
  const categoryColor = getCategoryColor(entry.category)

  const handleEdit = useCallback(() => onEdit(entry.id), [onEdit, entry.id])
  const handleDelete = useCallback(() => onDelete(entry.id), [onDelete, entry.id])
  const handleToggle = useCallback(() => onToggleExpand?.(entry.id), [onToggleExpand, entry.id])
  const handleTogglePin = useCallback(() => onTogglePin?.(entry.id), [onTogglePin, entry.id])

  return (
    <div
      className={`memory-card${expanded ? ' memory-card--expanded' : ''}`}
      style={{ borderLeft: `3px solid ${categoryColor}` }}
    >
      <div className="memory-card__header">
        <h3 className="memory-card__title">
          {entry.title}
          {autoCaptured && (
            <span className="memory-card__auto-badge" title="Auto-captured">
              <CircleDot size={10} />
              Auto-captured
            </span>
          )}
        </h3>
        <div className="memory-card__badges">
          {onTogglePin && (
            <button
              className={`memory-card__pin${isPinned ? ' memory-card__pin--active' : ''}`}
              onClick={handleTogglePin}
              aria-label={isPinned ? 'Unpin entry' : 'Pin entry'}
            >
              <Star size={14} />
            </button>
          )}
          <Badge variant={categoryVariant[entry.category] ?? 'default'} size="sm">
            {entry.category}
          </Badge>
          <Badge variant={scopeVariant[entry.scope] ?? 'default'} size="sm">
            {entry.scope}
          </Badge>
          {entry.sourceType && (
            <Badge variant="default" size="sm">
              {getSourceLabel(entry.sourceType)}
            </Badge>
          )}
        </div>
      </div>

      <button
        className="memory-card__expand-btn"
        onClick={handleToggle}
        aria-label={expanded ? 'Collapse entry' : 'Expand entry'}
        aria-expanded={expanded}
      >
        <p className="memory-card__content">
          {expanded ? entry.content : preview}
        </p>
        {entry.content.length > 150 && (
          <span className="memory-card__expand-icon">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        )}
      </button>

      {entry.tags.length > 0 && (
        <div className="memory-card__tags">
          <Tag size={14} aria-hidden="true" />
          {entry.tags.map((tag) => (
            <Badge key={tag} variant="default" size="sm">{tag}</Badge>
          ))}
        </div>
      )}

      <div className="memory-card__meta">
        <span className="memory-card__tokens">
          {formatTokenCount(entry.tokenCount)} tokens
        </span>
        <span className="memory-card__date">
          {new Date(entry.createdAt).toLocaleDateString()}
        </span>
        <span className="memory-card__time">
          <Clock size={12} aria-hidden="true" />
          {formatRelativeTime(entry.updatedAt)}
        </span>
        {entry.accessCount > 0 && (
          <span className="memory-card__access-count">
            Accessed {entry.accessCount} times
          </span>
        )}
      </div>

      <div className="memory-card__actions">
        <Button
          variant="ghost"
          size="sm"
          icon={<Pencil size={14} />}
          onClick={handleEdit}
          aria-label={`Edit ${entry.title}`}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={14} />}
          onClick={handleDelete}
          aria-label={`Delete ${entry.title}`}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
