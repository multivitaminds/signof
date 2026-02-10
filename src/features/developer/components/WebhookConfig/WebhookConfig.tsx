import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { WEBHOOK_EVENT_CATEGORIES, WEBHOOK_EVENT_LABELS } from '../../types'
import type { WebhookEvent } from '../../types'
import './WebhookConfig.css'

interface WebhookConfigProps {
  onSave: (url: string, events: WebhookEvent[]) => void
  initialUrl?: string
  initialEvents?: WebhookEvent[]
}

function WebhookConfig({ onSave, initialUrl = '', initialEvents = [] }: WebhookConfigProps) {
  const [url, setUrl] = useState(initialUrl)
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>(initialEvents)
  const [urlError, setUrlError] = useState('')

  const validateUrl = useCallback((value: string): boolean => {
    if (!value.trim()) {
      setUrlError('URL is required')
      return false
    }
    try {
      const parsed = new URL(value)
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        setUrlError('URL must start with https:// or http://')
        return false
      }
      setUrlError('')
      return true
    } catch {
      setUrlError('Invalid URL format')
      return false
    }
  }, [])

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrl(value)
    if (value) {
      validateUrl(value)
    } else {
      setUrlError('')
    }
  }, [validateUrl])

  const handleEventToggle = useCallback((event: WebhookEvent) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    )
  }, [])

  const handleCategoryToggle = useCallback((events: WebhookEvent[]) => {
    setSelectedEvents(prev => {
      const allSelected = events.every(e => prev.includes(e))
      if (allSelected) {
        return prev.filter(e => !events.includes(e))
      }
      const combined = new Set([...prev, ...events])
      return Array.from(combined)
    })
  }, [])

  const handleSave = useCallback(() => {
    if (!validateUrl(url)) return
    if (selectedEvents.length === 0) return
    onSave(url, selectedEvents)
    setUrl('')
    setSelectedEvents([])
    setUrlError('')
  }, [url, selectedEvents, onSave, validateUrl])

  const canSave = url.trim() !== '' && !urlError && selectedEvents.length > 0

  return (
    <div className="webhook-config">
      <div className="webhook-config__field">
        <label className="webhook-config__label" htmlFor="webhook-url">
          Endpoint URL
        </label>
        <input
          id="webhook-url"
          type="url"
          className={`webhook-config__input ${urlError ? 'webhook-config__input--error' : ''}`}
          placeholder="https://api.example.com/webhooks"
          value={url}
          onChange={handleUrlChange}
        />
        {urlError && (
          <span className="webhook-config__error">{urlError}</span>
        )}
      </div>

      <div className="webhook-config__field">
        <label className="webhook-config__label">Events to subscribe</label>
        <div className="webhook-config__categories">
          {Object.entries(WEBHOOK_EVENT_CATEGORIES).map(([category, events]) => {
            const allSelected = events.every(e => selectedEvents.includes(e))
            const someSelected = events.some(e => selectedEvents.includes(e))
            return (
              <div className="webhook-config__category" key={category}>
                <button
                  className="webhook-config__category-header"
                  onClick={() => handleCategoryToggle(events)}
                  type="button"
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => {
                      if (el) el.indeterminate = someSelected && !allSelected
                    }}
                    readOnly
                    tabIndex={-1}
                  />
                  <span className="webhook-config__category-name">{category}</span>
                </button>
                <div className="webhook-config__events">
                  {events.map(event => (
                    <label className="webhook-config__event" key={event}>
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event)}
                        onChange={() => handleEventToggle(event)}
                      />
                      <span className="webhook-config__event-label">
                        {WEBHOOK_EVENT_LABELS[event]}
                      </span>
                      <code className="webhook-config__event-code">{event}</code>
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button
        className="btn-primary webhook-config__save"
        onClick={handleSave}
        disabled={!canSave}
        type="button"
      >
        <Plus size={16} />
        Save Webhook
      </button>
    </div>
  )
}

export default WebhookConfig
