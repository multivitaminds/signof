import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import type { ModelId } from '../../types'
import { MODEL_CATALOG, getModelsByProvider, formatTokenCount } from '../../lib/models'
import './ModelSelector.css'

interface ModelSelectorProps {
  value: ModelId
  onChange: (id: ModelId) => void
}

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
  meta: 'Meta',
}

function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentModel = MODEL_CATALOG[value]
  const grouped = useMemo(() => getModelsByProvider(), [])

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleSelect = useCallback(
    (id: ModelId) => {
      onChange(id)
      setIsOpen(false)
    },
    [onChange]
  )

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="model-selector" ref={containerRef}>
      <button
        className="model-selector__trigger"
        onClick={handleToggle}
        type="button"
        aria-label="Select model"
        aria-expanded={isOpen}
      >
        <span
          className="model-selector__color-dot"
          style={{ backgroundColor: currentModel.color }}
        />
        <span>{currentModel.name}</span>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="model-selector__dropdown" role="listbox">
          {Object.entries(grouped).map(([provider, models]) => (
            <div key={provider}>
              <div className="model-selector__group-header">
                {PROVIDER_LABELS[provider] ?? provider}
              </div>
              {models.map((model) => (
                <button
                  key={model.id}
                  className={`model-selector__option${model.id === value ? ' model-selector__option--selected' : ''}`}
                  onClick={() => handleSelect(model.id)}
                  type="button"
                  role="option"
                  aria-selected={model.id === value}
                >
                  <span
                    className="model-selector__color-dot"
                    style={{ backgroundColor: model.color }}
                  />
                  <span>{model.name}</span>
                  <span className="model-selector__option-context">
                    {formatTokenCount(model.contextWindow)}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ModelSelector
