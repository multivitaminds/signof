import { useCallback } from 'react'
import { Grid3X3, Kanban, CalendarDays, LayoutGrid, FileInput, Plus } from 'lucide-react'
import type { DbView } from '../../types'
import { ViewType } from '../../types'
import './ViewSwitcher.css'

interface ViewSwitcherProps {
  views: DbView[]
  activeViewId: string
  onSelectView: (viewId: string) => void
  onAddView: (type: ViewType) => void
}

const VIEW_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  [ViewType.Grid]: Grid3X3,
  [ViewType.Kanban]: Kanban,
  [ViewType.Calendar]: CalendarDays,
  [ViewType.Gallery]: LayoutGrid,
  [ViewType.Form]: FileInput,
}

export default function ViewSwitcher({ views, activeViewId, onSelectView, onAddView }: ViewSwitcherProps) {
  const handleAdd = useCallback(() => {
    onAddView(ViewType.Grid)
  }, [onAddView])

  return (
    <div className="view-switcher">
      {views.map((view) => {
        const Icon = VIEW_ICONS[view.type] ?? Grid3X3
        return (
          <button
            key={view.id}
            className={`view-switcher__tab ${view.id === activeViewId ? 'view-switcher__tab--active' : ''}`}
            onClick={() => onSelectView(view.id)}
          >
            <Icon size={14} />
            <span>{view.name}</span>
          </button>
        )
      })}
      <button className="view-switcher__add" onClick={handleAdd} title="Add view">
        <Plus size={14} />
      </button>
    </div>
  )
}
