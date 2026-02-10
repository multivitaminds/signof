import { useState, useCallback } from 'react'
import { Filter, X, Plus, ArrowUpDown } from 'lucide-react'
import type { DbField, Filter as FilterType, Sort } from '../../types'
import { FilterOperator } from '../../types'
import './FilterBar.css'

interface FilterBarProps {
  fields: DbField[]
  filters: FilterType[]
  sorts: Sort[]
  onFiltersChange: (filters: FilterType[]) => void
  onSortsChange: (sorts: Sort[]) => void
}

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export default function FilterBar({ fields, filters, sorts, onFiltersChange, onSortsChange }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(filters.length > 0)
  const [showSorts, setShowSorts] = useState(sorts.length > 0)

  const addFilter = useCallback(() => {
    const firstField = fields[0]
    if (!firstField) return
    const newFilter: FilterType = {
      id: rid(),
      fieldId: firstField.id,
      operator: FilterOperator.Contains,
      value: '',
    }
    onFiltersChange([...filters, newFilter])
    setShowFilters(true)
  }, [fields, filters, onFiltersChange])

  const updateFilter = useCallback((id: string, updates: Partial<FilterType>) => {
    onFiltersChange(filters.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }, [filters, onFiltersChange])

  const removeFilter = useCallback((id: string) => {
    const next = filters.filter((f) => f.id !== id)
    onFiltersChange(next)
    if (next.length === 0) setShowFilters(false)
  }, [filters, onFiltersChange])

  const addSort = useCallback(() => {
    const firstField = fields[0]
    if (!firstField) return
    onSortsChange([...sorts, { fieldId: firstField.id, direction: 'asc' }])
    setShowSorts(true)
  }, [fields, sorts, onSortsChange])

  const updateSort = useCallback((idx: number, updates: Partial<Sort>) => {
    onSortsChange(sorts.map((s, i) => (i === idx ? { ...s, ...updates } : s)))
  }, [sorts, onSortsChange])

  const removeSort = useCallback((idx: number) => {
    const next = sorts.filter((_, i) => i !== idx)
    onSortsChange(next)
    if (next.length === 0) setShowSorts(false)
  }, [sorts, onSortsChange])

  return (
    <div className="filter-bar">
      <div className="filter-bar__actions">
        <button className="filter-bar__btn" onClick={addFilter}>
          <Filter size={14} /> Filter
        </button>
        <button className="filter-bar__btn" onClick={addSort}>
          <ArrowUpDown size={14} /> Sort
        </button>
      </div>

      {showFilters && filters.length > 0 && (
        <div className="filter-bar__section">
          {filters.map((filter) => (
            <div key={filter.id} className="filter-bar__row">
              <select
                className="filter-bar__select"
                value={filter.fieldId}
                onChange={(e) => updateFilter(filter.id, { fieldId: e.target.value })}
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <select
                className="filter-bar__select"
                value={filter.operator}
                onChange={(e) => updateFilter(filter.id, { operator: e.target.value as FilterOperator })}
              >
                <option value={FilterOperator.Contains}>contains</option>
                <option value={FilterOperator.Is}>is</option>
                <option value={FilterOperator.IsNot}>is not</option>
                <option value={FilterOperator.NotContains}>not contains</option>
                <option value={FilterOperator.IsEmpty}>is empty</option>
                <option value={FilterOperator.IsNotEmpty}>is not empty</option>
                <option value={FilterOperator.Gt}>greater than</option>
                <option value={FilterOperator.Lt}>less than</option>
              </select>
              {filter.operator !== FilterOperator.IsEmpty && filter.operator !== FilterOperator.IsNotEmpty && (
                <input
                  className="filter-bar__input"
                  type="text"
                  value={filter.value}
                  onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                  placeholder="Value..."
                />
              )}
              <button className="filter-bar__remove" onClick={() => removeFilter(filter.id)} title="Remove filter">
                <X size={14} />
              </button>
            </div>
          ))}
          <button className="filter-bar__add-row" onClick={addFilter}>
            <Plus size={12} /> Add filter
          </button>
        </div>
      )}

      {showSorts && sorts.length > 0 && (
        <div className="filter-bar__section">
          {sorts.map((sort, idx) => (
            <div key={idx} className="filter-bar__row">
              <select
                className="filter-bar__select"
                value={sort.fieldId}
                onChange={(e) => updateSort(idx, { fieldId: e.target.value })}
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <select
                className="filter-bar__select"
                value={sort.direction}
                onChange={(e) => updateSort(idx, { direction: e.target.value as 'asc' | 'desc' })}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
              <button className="filter-bar__remove" onClick={() => removeSort(idx)} title="Remove sort">
                <X size={14} />
              </button>
            </div>
          ))}
          <button className="filter-bar__add-row" onClick={addSort}>
            <Plus size={12} /> Add sort
          </button>
        </div>
      )}
    </div>
  )
}
