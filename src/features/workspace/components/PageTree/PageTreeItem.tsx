import { useState, useCallback } from 'react'
import { ChevronRight, FileText, Plus, Star } from 'lucide-react'
import type { Page } from '../../types'
import './PageTreeItem.css'

interface PageTreeItemProps {
  page: Page
  allPages: Page[]
  level: number
  selectedPageId?: string
  onSelectPage: (pageId: string) => void
  onNewPage?: (parentId?: string) => void
  onToggleFavorite?: (pageId: string) => void
  compact?: boolean
}

export default function PageTreeItem({
  page,
  allPages,
  level,
  selectedPageId,
  onSelectPage,
  onNewPage,
  onToggleFavorite,
  compact = false,
}: PageTreeItemProps) {
  const children = allPages.filter((p) => p.parentId === page.id)
  const hasChildren = children.length > 0
  const [isExpanded, setIsExpanded] = useState(false)
  const isActive = selectedPageId === page.id

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded((prev) => !prev)
  }, [])

  const handleSelect = useCallback(() => {
    onSelectPage(page.id)
  }, [onSelectPage, page.id])

  const handleAddChild = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onNewPage?.(page.id)
    },
    [onNewPage, page.id]
  )

  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onToggleFavorite?.(page.id)
    },
    [onToggleFavorite, page.id]
  )

  return (
    <div className="page-tree-item__wrapper">
      <div
        className={`page-tree-item ${isActive ? 'page-tree-item--active' : ''}`}
        style={{ paddingLeft: `${level * 20 + 4}px` }}
        onClick={handleSelect}
        role="treeitem"
        aria-selected={isActive}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        {hasChildren ? (
          <button
            className={`page-tree-item__chevron ${isExpanded ? 'page-tree-item__chevron--expanded' : ''}`}
            onClick={handleToggle}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            tabIndex={-1}
          >
            <ChevronRight size={14} />
          </button>
        ) : (
          <span className="page-tree-item__chevron-placeholder" />
        )}

        <span className="page-tree-item__icon">
          {page.icon || <FileText size={14} />}
        </span>

        <span className="page-tree-item__title" title={page.title}>
          {page.title || 'Untitled'}
        </span>

        {!compact && onToggleFavorite && (
          <button
            className={`page-tree-item__star ${page.isFavorite ? 'page-tree-item__star--active' : ''}`}
            onClick={handleToggleFavorite}
            aria-label={page.isFavorite ? `Remove ${page.title} from favorites` : `Add ${page.title} to favorites`}
            tabIndex={-1}
          >
            <Star size={12} fill={page.isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
        {!compact && onNewPage && (
          <button
            className="page-tree-item__add"
            onClick={handleAddChild}
            aria-label={`Add sub-page to ${page.title}`}
            tabIndex={-1}
          >
            <Plus size={12} />
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="page-tree-item__children" role="group">
          {children.map((child) => (
            <PageTreeItem
              key={child.id}
              page={child}
              allPages={allPages}
              level={level + 1}
              selectedPageId={selectedPageId}
              onSelectPage={onSelectPage}
              onNewPage={onNewPage}
              onToggleFavorite={onToggleFavorite}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  )
}
