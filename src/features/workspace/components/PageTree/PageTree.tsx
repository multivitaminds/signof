import { useCallback } from 'react'
import { Plus } from 'lucide-react'
import type { Page } from '../../types'
import PageTreeItem from './PageTreeItem'
import './PageTree.css'

interface PageTreeProps {
  pages: Page[]
  selectedPageId?: string
  onSelectPage: (pageId: string) => void
  onNewPage?: (parentId?: string) => void
  compact?: boolean
  maxItems?: number
}

export default function PageTree({
  pages,
  selectedPageId,
  onSelectPage,
  onNewPage,
  compact = false,
  maxItems,
}: PageTreeProps) {
  const rootPages = pages.filter((p) => p.parentId === null)
  const displayPages = maxItems ? rootPages.slice(0, maxItems) : rootPages

  const handleNewPage = useCallback(() => {
    onNewPage?.()
  }, [onNewPage])

  return (
    <div className={`page-tree ${compact ? 'page-tree--compact' : ''}`}>
      {!compact && (
        <div className="page-tree__header">
          <span className="page-tree__title">Pages</span>
          {onNewPage && (
            <button
              className="page-tree__new-btn"
              onClick={handleNewPage}
              aria-label="New page"
              title="New page"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      )}

      <div className="page-tree__list">
        {displayPages.map((page) => (
          <PageTreeItem
            key={page.id}
            page={page}
            allPages={pages}
            level={0}
            selectedPageId={selectedPageId}
            onSelectPage={onSelectPage}
            onNewPage={onNewPage}
            compact={compact}
          />
        ))}

        {displayPages.length === 0 && (
          <div className="page-tree__empty">
            No pages yet
          </div>
        )}

        {maxItems && rootPages.length > maxItems && (
          <button
            className="page-tree__view-all"
            onClick={() => onSelectPage('')}
          >
            View all ({rootPages.length})
          </button>
        )}
      </div>
    </div>
  )
}
