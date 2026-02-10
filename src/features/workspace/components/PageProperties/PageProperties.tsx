import { useState, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import type { PagePropertyValue } from '../../types'
import './PageProperties.css'

interface PagePropertiesProps {
  properties: Record<string, PagePropertyValue>
  onUpdate: (properties: Record<string, PagePropertyValue>) => void
}

const PROPERTY_TYPES: Array<{ type: PagePropertyValue['type']; label: string }> = [
  { type: 'text', label: 'Text' },
  { type: 'select', label: 'Select' },
  { type: 'date', label: 'Date' },
  { type: 'url', label: 'URL' },
]

export default function PageProperties({ properties, onUpdate }: PagePropertiesProps) {
  const [addingProperty, setAddingProperty] = useState(false)
  const [newPropertyName, setNewPropertyName] = useState('')
  const [newPropertyType, setNewPropertyType] = useState<PagePropertyValue['type']>('text')

  const entries = Object.entries(properties)

  const handleValueChange = useCallback(
    (key: string, value: string) => {
      onUpdate({
        ...properties,
        [key]: { ...properties[key]!, value },
      })
    },
    [properties, onUpdate]
  )

  const handleAddProperty = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!newPropertyName.trim()) return
      onUpdate({
        ...properties,
        [newPropertyName.trim()]: { type: newPropertyType, value: '' },
      })
      setNewPropertyName('')
      setAddingProperty(false)
    },
    [newPropertyName, newPropertyType, properties, onUpdate]
  )

  const handleRemoveProperty = useCallback(
    (key: string) => {
      const updated = { ...properties }
      delete updated[key]
      onUpdate(updated)
    },
    [properties, onUpdate]
  )

  return (
    <div className="page-properties">
      {entries.length > 0 && (
        <div className="page-properties__list">
          {entries.map(([key, prop]) => (
            <div key={key} className="page-properties__row">
              <span className="page-properties__key">{key}</span>
              <div className="page-properties__value-wrapper">
                {prop.type === 'date' ? (
                  <input
                    type="date"
                    className="page-properties__input"
                    value={prop.value}
                    onChange={(e) => handleValueChange(key, e.target.value)}
                  />
                ) : prop.type === 'url' ? (
                  <input
                    type="url"
                    className="page-properties__input"
                    placeholder="https://..."
                    value={prop.value}
                    onChange={(e) => handleValueChange(key, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    className="page-properties__input"
                    placeholder="Empty"
                    value={prop.value}
                    onChange={(e) => handleValueChange(key, e.target.value)}
                  />
                )}
                <button
                  className="page-properties__remove"
                  onClick={() => handleRemoveProperty(key)}
                  aria-label={`Remove ${key}`}
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {addingProperty ? (
        <form onSubmit={handleAddProperty} className="page-properties__add-form">
          <input
            type="text"
            className="page-properties__input"
            placeholder="Property name"
            value={newPropertyName}
            onChange={(e) => setNewPropertyName(e.target.value)}
            autoFocus
          />
          <select
            className="page-properties__select"
            value={newPropertyType}
            onChange={(e) => setNewPropertyType(e.target.value as PagePropertyValue['type'])}
          >
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt.type} value={pt.type}>{pt.label}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary page-properties__add-btn">Add</button>
          <button type="button" className="page-properties__cancel" onClick={() => setAddingProperty(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button
          className="page-properties__add-trigger"
          onClick={() => setAddingProperty(true)}
        >
          <Plus size={14} />
          Add a property
        </button>
      )}
    </div>
  )
}
