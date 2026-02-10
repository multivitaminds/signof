import { useState, useCallback } from 'react'
import { Search, EyeOff, Eye } from 'lucide-react'
import type { DbField } from '../../types'
import './ToolbarRow.css'

interface ToolbarRowProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  fields: DbField[]
  hiddenFields: string[]
  onToggleField: (fieldId: string) => void
}

export default function ToolbarRow({ searchQuery, onSearchChange, fields, hiddenFields, onToggleField }: ToolbarRowProps) {
  const [showFieldMenu, setShowFieldMenu] = useState(false)

  const toggleFieldMenu = useCallback(() => {
    setShowFieldMenu((prev) => !prev)
  }, [])

  return (
    <div className="toolbar-row">
      <div className="toolbar-row__search">
        <Search size={14} className="toolbar-row__search-icon" />
        <input
          className="toolbar-row__search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
        />
      </div>
      <div className="toolbar-row__right">
        <div className="toolbar-row__field-toggle">
          <button className="toolbar-row__btn" onClick={toggleFieldMenu}>
            {hiddenFields.length > 0 ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>Fields</span>
            {hiddenFields.length > 0 && (
              <span className="toolbar-row__badge">{hiddenFields.length} hidden</span>
            )}
          </button>
          {showFieldMenu && (
            <div className="toolbar-row__field-menu">
              {fields.map((field) => {
                const hidden = hiddenFields.includes(field.id)
                return (
                  <button
                    key={field.id}
                    className={`toolbar-row__field-item ${hidden ? 'toolbar-row__field-item--hidden' : ''}`}
                    onClick={() => onToggleField(field.id)}
                  >
                    {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{field.name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
