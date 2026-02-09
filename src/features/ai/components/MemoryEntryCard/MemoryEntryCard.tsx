import { useCallback } from 'react'
import { Pencil, Trash2, Tag, Clock } from 'lucide-react'
import { Button } from '../../../../components/ui'
import { Badge } from '../../../../components/ui'
import type { MemoryEntry } from '../../types'
import { formatTokenCount } from '../../lib/tokenCount'
import './MemoryEntryCard.css'

interface MemoryEntryCardProps {
  entry: MemoryEntry
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const scopeVariant: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
  workspace: 'primary',
  personal: 'success',
  team: 'warning',
  project: 'info',
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

export default function MemoryEntryCard({ entry, onEdit, onDelete }: MemoryEntryCardProps) {
  const preview = entry.content.length > 150
    ? entry.content.slice(0, 150) + '...'
    : entry.content

  const handleEdit = useCallback(() => onEdit(entry.id), [onEdit, entry.id])
  const handleDelete = useCallback(() => onDelete(entry.id), [onDelete, entry.id])

  return (
    <div className="memory-card">
      <div className="memory-card__header">
        <h3 className="memory-card__title">{entry.title}</h3>
        <Badge variant={scopeVariant[entry.scope] ?? 'default'} size="sm">
          {entry.scope}
        </Badge>
      </div>

      <p className="memory-card__content">{preview}</p>

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
        <span className="memory-card__time">
          <Clock size={12} aria-hidden="true" />
          {formatRelativeTime(entry.updatedAt)}
        </span>
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
