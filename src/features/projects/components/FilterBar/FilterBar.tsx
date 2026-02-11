import { useState, useCallback, useRef } from 'react'
import { X, Save, Filter } from 'lucide-react'
import type { IssueFilters, IssueStatus, IssuePriority, Member, Label, SavedView } from '../../types'
import { STATUS_CONFIG, PRIORITY_CONFIG, BOARD_STATUSES, PRIORITY_ORDER } from '../../types'
import './FilterBar.css'

interface FilterBarProps {
  filters: IssueFilters
  onFiltersChange: (filters: IssueFilters) => void
  members: Member[]
  labels: Label[]
  savedViews: SavedView[]
  onSaveView: (name: string) => void
  onDeleteSavedView: (viewId: string) => void
  onLoadSavedView: (view: SavedView) => void
  activeViewId?: string | null
}

function MultiSelect<T extends string>({
  label,
  options,
  selected,
  onChange,
  getLabel,
  getColor,
}: {
  label: string
  options: T[]
  selected: T[]
  onChange: (values: T[]) => void
  getLabel: (val: T) => string
  getColor?: (val: T) => string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleToggle = useCallback(
    (val: T) => {
      if (selected.includes(val)) {
        onChange(selected.filter((s) => s !== val))
      } else {
        onChange([...selected, val])
      }
    },
    [selected, onChange]
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange([])
    },
    [onChange]
  )

  return (
    <div className="filter-bar__multi-select" ref={ref}>
      <button
        className={`filter-bar__trigger${selected.length > 0 ? ' filter-bar__trigger--active' : ''}`}
        onClick={() => setOpen(!open)}
        type="button"
        aria-expanded={open}
        aria-label={`Filter by ${label}`}
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="filter-bar__count">{selected.length}</span>
        )}
        {selected.length > 0 && (
          <span
            className="filter-bar__clear"
            onClick={handleClear}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange([]) } }}
            aria-label={`Clear ${label} filter`}
          >
            <X size={12} />
          </span>
        )}
      </button>
      {open && (
        <div className="filter-bar__dropdown">
          {options.map((opt) => {
            const isSelected = selected.includes(opt)
            const color = getColor?.(opt)
            return (
              <label key={opt} className="filter-bar__option">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(opt)}
                  className="filter-bar__checkbox"
                />
                {color && (
                  <span
                    className="filter-bar__option-dot"
                    style={{ backgroundColor: color }}
                  />
                )}
                <span className="filter-bar__option-label">{getLabel(opt)}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function FilterBar({
  filters,
  onFiltersChange,
  members,
  labels,
  savedViews,
  onSaveView,
  onDeleteSavedView,
  onLoadSavedView,
  activeViewId,
}: FilterBarProps) {
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [viewName, setViewName] = useState('')

  const handleStatusChange = useCallback(
    (values: IssueStatus[]) => {
      onFiltersChange({ ...filters, status: values.length > 0 ? values : undefined })
    },
    [filters, onFiltersChange]
  )

  const handlePriorityChange = useCallback(
    (values: IssuePriority[]) => {
      onFiltersChange({ ...filters, priority: values.length > 0 ? values : undefined })
    },
    [filters, onFiltersChange]
  )

  const handleAssigneeChange = useCallback(
    (values: string[]) => {
      onFiltersChange({ ...filters, assigneeId: values.length > 0 ? values : undefined })
    },
    [filters, onFiltersChange]
  )

  const handleLabelChange = useCallback(
    (values: string[]) => {
      onFiltersChange({ ...filters, labelIds: values.length > 0 ? values : undefined })
    },
    [filters, onFiltersChange]
  )

  const handleSaveView = useCallback(() => {
    if (viewName.trim()) {
      onSaveView(viewName.trim())
      setViewName('')
      setShowSaveInput(false)
    }
  }, [viewName, onSaveView])

  const handleClearAll = useCallback(() => {
    onFiltersChange({})
  }, [onFiltersChange])

  const hasFilters = (filters.status?.length ?? 0) > 0 ||
    (filters.priority?.length ?? 0) > 0 ||
    (filters.assigneeId?.length ?? 0) > 0 ||
    (filters.labelIds?.length ?? 0) > 0

  return (
    <div className="filter-bar">
      {/* Saved view tabs */}
      {savedViews.length > 0 && (
        <div className="filter-bar__saved-views" role="tablist" aria-label="Saved views">
          {savedViews.map((view) => (
            <div
              key={view.id}
              className={`filter-bar__saved-tab${activeViewId === view.id ? ' filter-bar__saved-tab--active' : ''}`}
            >
              <button
                className="filter-bar__saved-tab-btn"
                onClick={() => onLoadSavedView(view)}
                role="tab"
                aria-selected={activeViewId === view.id}
              >
                {view.name}
              </button>
              <button
                className="filter-bar__saved-tab-close"
                onClick={() => onDeleteSavedView(view.id)}
                aria-label={`Delete view ${view.name}`}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filter dropdowns */}
      <div className="filter-bar__filters">
        <Filter size={14} className="filter-bar__icon" />

        <MultiSelect
          label="Status"
          options={[...BOARD_STATUSES, 'cancelled' as IssueStatus]}
          selected={filters.status ?? []}
          onChange={handleStatusChange}
          getLabel={(s) => STATUS_CONFIG[s]?.label ?? s}
          getColor={(s) => STATUS_CONFIG[s]?.color}
        />

        <MultiSelect
          label="Priority"
          options={PRIORITY_ORDER}
          selected={filters.priority ?? []}
          onChange={handlePriorityChange}
          getLabel={(p) => PRIORITY_CONFIG[p]?.label ?? p}
          getColor={(p) => PRIORITY_CONFIG[p]?.color}
        />

        <MultiSelect
          label="Assignee"
          options={members.map((m) => m.id)}
          selected={filters.assigneeId ?? []}
          onChange={handleAssigneeChange}
          getLabel={(id) => members.find((m) => m.id === id)?.name ?? id}
        />

        <MultiSelect
          label="Label"
          options={labels.map((l) => l.id)}
          selected={filters.labelIds ?? []}
          onChange={handleLabelChange}
          getLabel={(id) => labels.find((l) => l.id === id)?.name ?? id}
          getColor={(id) => labels.find((l) => l.id === id)?.color ?? '#888'}
        />

        {hasFilters && (
          <>
            <button
              className="filter-bar__clear-all"
              onClick={handleClearAll}
            >
              Clear all
            </button>

            {showSaveInput ? (
              <div className="filter-bar__save-form">
                <input
                  className="filter-bar__save-input"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveView() }}
                  placeholder="View name..."
                  autoFocus
                />
                <button
                  className="filter-bar__save-btn"
                  onClick={handleSaveView}
                  disabled={!viewName.trim()}
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                className="filter-bar__save-trigger"
                onClick={() => setShowSaveInput(true)}
                aria-label="Save current view"
              >
                <Save size={14} />
                <span>Save View</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
