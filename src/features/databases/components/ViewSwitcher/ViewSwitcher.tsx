import { useState, useCallback, useRef, useEffect } from 'react'
import { Grid3X3, Kanban, CalendarDays, LayoutGrid, FileInput, Plus, ChevronDown } from 'lucide-react'
import type { DbView, DbField } from '../../types'
import { ViewType, DbFieldType } from '../../types'
import './ViewSwitcher.css'

interface ViewSwitcherProps {
  views: DbView[]
  activeViewId: string
  onSelectView: (viewId: string) => void
  onAddView: (type: ViewType) => void
  fields?: DbField[]
  kanbanFieldId?: string
  calendarFieldId?: string
  onKanbanFieldChange?: (fieldId: string) => void
  onCalendarFieldChange?: (fieldId: string) => void
}

const VIEW_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  [ViewType.Grid]: Grid3X3,
  [ViewType.Kanban]: Kanban,
  [ViewType.Calendar]: CalendarDays,
  [ViewType.Gallery]: LayoutGrid,
  [ViewType.Form]: FileInput,
}

const VIEW_TYPE_LABELS: Record<string, string> = {
  [ViewType.Grid]: 'Grid',
  [ViewType.Kanban]: 'Board',
  [ViewType.Calendar]: 'Calendar',
  [ViewType.Gallery]: 'Gallery',
  [ViewType.Form]: 'Form',
}

const ADDABLE_VIEWS = [
  ViewType.Grid,
  ViewType.Kanban,
  ViewType.Calendar,
  ViewType.Gallery,
  ViewType.Form,
] as const

export default function ViewSwitcher({
  views,
  activeViewId,
  onSelectView,
  onAddView,
  fields,
  kanbanFieldId,
  calendarFieldId,
  onKanbanFieldChange,
  onCalendarFieldChange,
}: ViewSwitcherProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showFieldPicker, setShowFieldPicker] = useState<'kanban' | 'calendar' | null>(null)
  const addMenuRef = useRef<HTMLDivElement>(null)
  const fieldPickerRef = useRef<HTMLDivElement>(null)

  const activeView = views.find((v) => v.id === activeViewId)

  const selectFields = fields?.filter(
    (f) => f.type === DbFieldType.Select || f.type === DbFieldType.MultiSelect
  ) ?? []

  const dateFields = fields?.filter(
    (f) => f.type === DbFieldType.Date
  ) ?? []

  const handleAddView = useCallback(
    (type: ViewType) => {
      onAddView(type)
      setShowAddMenu(false)
    },
    [onAddView]
  )

  const handleKanbanFieldChange = useCallback(
    (fieldId: string) => {
      onKanbanFieldChange?.(fieldId)
      setShowFieldPicker(null)
    },
    [onKanbanFieldChange]
  )

  const handleCalendarFieldChange = useCallback(
    (fieldId: string) => {
      onCalendarFieldChange?.(fieldId)
      setShowFieldPicker(null)
    },
    [onCalendarFieldChange]
  )

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        showAddMenu &&
        addMenuRef.current &&
        !addMenuRef.current.contains(e.target as Node)
      ) {
        setShowAddMenu(false)
      }
      if (
        showFieldPicker &&
        fieldPickerRef.current &&
        !fieldPickerRef.current.contains(e.target as Node)
      ) {
        setShowFieldPicker(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showAddMenu, showFieldPicker])

  return (
    <div className="view-switcher" role="tablist" aria-label="View tabs">
      {views.map((view) => {
        const Icon = VIEW_ICONS[view.type] ?? Grid3X3
        const isActive = view.id === activeViewId
        return (
          <button
            key={view.id}
            className={`view-switcher__tab ${isActive ? 'view-switcher__tab--active' : ''}`}
            onClick={() => onSelectView(view.id)}
            role="tab"
            aria-selected={isActive}
          >
            <Icon size={14} />
            <span>{view.name}</span>
          </button>
        )
      })}

      {/* Field picker for Kanban */}
      {activeView?.type === ViewType.Kanban && selectFields.length > 0 && onKanbanFieldChange && (
        <div className="view-switcher__field-picker" ref={showFieldPicker === 'kanban' ? fieldPickerRef : undefined}>
          <button
            className="view-switcher__field-btn"
            onClick={() => setShowFieldPicker((p) => (p === 'kanban' ? null : 'kanban'))}
            aria-label="Select group field"
          >
            <span>Group by: {selectFields.find((f) => f.id === kanbanFieldId)?.name ?? 'Select field'}</span>
            <ChevronDown size={12} />
          </button>
          {showFieldPicker === 'kanban' && (
            <div className="view-switcher__field-dropdown">
              {selectFields.map((field) => (
                <button
                  key={field.id}
                  className={`view-switcher__field-option ${field.id === kanbanFieldId ? 'view-switcher__field-option--active' : ''}`}
                  onClick={() => handleKanbanFieldChange(field.id)}
                >
                  {field.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Field picker for Calendar */}
      {activeView?.type === ViewType.Calendar && dateFields.length > 0 && onCalendarFieldChange && (
        <div className="view-switcher__field-picker" ref={showFieldPicker === 'calendar' ? fieldPickerRef : undefined}>
          <button
            className="view-switcher__field-btn"
            onClick={() => setShowFieldPicker((p) => (p === 'calendar' ? null : 'calendar'))}
            aria-label="Select date field"
          >
            <span>Date: {dateFields.find((f) => f.id === calendarFieldId)?.name ?? 'Select field'}</span>
            <ChevronDown size={12} />
          </button>
          {showFieldPicker === 'calendar' && (
            <div className="view-switcher__field-dropdown">
              {dateFields.map((field) => (
                <button
                  key={field.id}
                  className={`view-switcher__field-option ${field.id === calendarFieldId ? 'view-switcher__field-option--active' : ''}`}
                  onClick={() => handleCalendarFieldChange(field.id)}
                >
                  {field.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add view button with dropdown */}
      <div className="view-switcher__add-wrapper" ref={showAddMenu ? addMenuRef : undefined}>
        <button
          className="view-switcher__add"
          onClick={() => setShowAddMenu((p) => !p)}
          title="Add view"
          aria-label="Add view"
        >
          <Plus size={14} />
        </button>
        {showAddMenu && (
          <div className="view-switcher__add-menu">
            {ADDABLE_VIEWS.map((type) => {
              const Icon = VIEW_ICONS[type]!
              return (
                <button
                  key={type}
                  className="view-switcher__add-option"
                  onClick={() => handleAddView(type)}
                >
                  <Icon size={14} />
                  <span>{VIEW_TYPE_LABELS[type]}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
