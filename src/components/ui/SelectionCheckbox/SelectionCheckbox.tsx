import { useRef, useEffect } from 'react'
import './SelectionCheckbox.css'

interface SelectionCheckboxProps {
  checked: boolean
  indeterminate?: boolean
  onChange: (checked: boolean) => void
  ariaLabel: string
}

function SelectionCheckbox({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
}: SelectionCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <label className="selection-checkbox">
      <input
        ref={ref}
        type="checkbox"
        className="selection-checkbox__input"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        aria-label={ariaLabel}
      />
      <span className="selection-checkbox__indicator" aria-hidden="true">
        {checked && !indeterminate && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {indeterminate && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <line x1="3" y1="6" x2="9" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </span>
    </label>
  )
}

export default SelectionCheckbox
