import { useCallback } from 'react'
import { ViewType } from '../../types'
import './ViewToggle.css'

interface ViewToggleProps {
  value: ViewType
  onChange: (view: ViewType) => void
}

const VIEW_OPTIONS: { value: ViewType; label: string }[] = [
  { value: ViewType.Board, label: 'Board' },
  { value: ViewType.List, label: 'List' },
]

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  const handleClick = useCallback((view: ViewType) => {
    onChange(view)
  }, [onChange])

  return (
    <div className="view-toggle" role="radiogroup" aria-label="View type">
      {VIEW_OPTIONS.map(option => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={`view-toggle__option${option.value === value ? ' view-toggle__option--active' : ''}`}
          onClick={() => handleClick(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
