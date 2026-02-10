import { useState, useCallback } from 'react'
import { DURATION_OPTIONS } from '../../types'
import './DurationSelect.css'

interface DurationSelectProps {
  value: number
  onChange: (minutes: number) => void
  options?: number[]
}

export default function DurationSelect({
  value,
  onChange,
  options = DURATION_OPTIONS,
}: DurationSelectProps) {
  const isCustom = !options.includes(value)
  const [showCustom, setShowCustom] = useState(isCustom)
  const [customValue, setCustomValue] = useState(isCustom ? String(value) : '')

  const handleOptionClick = useCallback(
    (minutes: number) => {
      setShowCustom(false)
      onChange(minutes)
    },
    [onChange]
  )

  const handleCustomToggle = useCallback(() => {
    setShowCustom(true)
  }, [])

  const handleCustomChange = useCallback(
    (val: string) => {
      setCustomValue(val)
      const num = parseInt(val, 10)
      if (num > 0) {
        onChange(num)
      }
    },
    [onChange]
  )

  return (
    <div className="duration-select">
      <div className="duration-select__options" role="group" aria-label="Duration options">
        {options.map((minutes) => (
          <button
            key={minutes}
            type="button"
            className={`duration-select__option${value === minutes && !showCustom ? ' duration-select__option--active' : ''}`}
            onClick={() => handleOptionClick(minutes)}
            aria-pressed={value === minutes && !showCustom}
          >
            {minutes} min
          </button>
        ))}
        <button
          type="button"
          className={`duration-select__option${showCustom ? ' duration-select__option--active' : ''}`}
          onClick={handleCustomToggle}
          aria-pressed={showCustom}
        >
          Custom
        </button>
      </div>

      {showCustom && (
        <div className="duration-select__custom">
          <input
            type="number"
            min={1}
            value={customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="Minutes"
            aria-label="Custom duration in minutes"
          />
          <span className="duration-select__unit">min</span>
        </div>
      )}
    </div>
  )
}
