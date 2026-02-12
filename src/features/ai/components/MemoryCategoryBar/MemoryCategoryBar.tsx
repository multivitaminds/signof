import {
  Gavel,
  GitBranch,
  Settings,
  Users,
  FolderOpen,
  BookOpen,
  Layers,
} from 'lucide-react'
import { CATEGORY_META } from '../../lib/memoryTemplates'
import type { MemoryCategory } from '../../types'
import './MemoryCategoryBar.css'

interface MemoryCategoryBarProps {
  activeTab: 'all' | MemoryCategory
  categoryStats: Array<{ category: MemoryCategory; count: number; tokenCount: number }>
  totalEntries: number
  onTabChange: (tab: 'all' | MemoryCategory) => void
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Gavel,
  GitBranch,
  Settings,
  Users,
  FolderOpen,
  BookOpen,
}

function MemoryCategoryBar({
  activeTab,
  categoryStats,
  totalEntries,
  onTabChange,
}: MemoryCategoryBarProps) {
  const handleClick = (tab: 'all' | MemoryCategory) => {
    if (tab === activeTab) {
      onTabChange('all')
    } else {
      onTabChange(tab)
    }
  }

  return (
    <div className="memory-category-bar" role="tablist" aria-label="Memory categories">
      {/* All tab */}
      <button
        className={`memory-category-bar__card${activeTab === 'all' ? ' memory-category-bar__card--active' : ''}`}
        role="tab"
        aria-selected={activeTab === 'all'}
        onClick={() => handleClick('all')}
        style={{
          '--card-color': 'var(--color-primary, #4F46E5)',
        } as React.CSSProperties}
      >
        <Layers className="memory-category-bar__icon" size={20} />
        <span className="memory-category-bar__label">All</span>
        <span className="memory-category-bar__count">{totalEntries}</span>
      </button>

      {/* Category tabs */}
      {CATEGORY_META.map((meta) => {
        const stat = categoryStats.find((s) => s.category === meta.key)
        const count = stat?.count ?? 0
        const Icon = ICON_MAP[meta.icon]
        const isActive = activeTab === meta.key

        return (
          <button
            key={meta.key}
            className={`memory-category-bar__card${isActive ? ' memory-category-bar__card--active' : ''}`}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleClick(meta.key)}
            style={{
              '--card-color': meta.color,
            } as React.CSSProperties}
          >
            {Icon && <Icon className="memory-category-bar__icon" size={20} />}
            <span className="memory-category-bar__label">{meta.label}</span>
            <span className="memory-category-bar__count">{count}</span>
          </button>
        )
      })}
    </div>
  )
}

export default MemoryCategoryBar
