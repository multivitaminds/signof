import { useState, useCallback } from 'react'
import type { Channel, ChannelConfigField, ChannelConfig } from '../../types'
import './ChannelConfigModal.css'

interface ChannelConfigModalProps {
  channel: Channel
  configFields: ChannelConfigField[]
  onSave: (config: ChannelConfig) => void
  onCancel: () => void
  onTest?: () => void
}

export default function ChannelConfigModal({
  channel,
  configFields,
  onSave,
  onCancel,
  onTest,
}: ChannelConfigModalProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {}
    for (const field of configFields) {
      initial[field.key] =
        (channel.config[field.key] as string | boolean | undefined) ??
        (field.type === 'checkbox' ? false : '')
    }
    return initial
  })
  const [testing, setTesting] = useState(false)

  const handleChange = useCallback((key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSave = useCallback(() => {
    onSave({ ...channel.config, ...values } as ChannelConfig)
  }, [onSave, channel.config, values])

  const handleTest = useCallback(() => {
    if (!onTest) return
    setTesting(true)
    onTest()
    setTimeout(() => setTesting(false), 1500)
  }, [onTest])

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-label={`Configure ${channel.name}`}>
      <div className="modal-content channel-config" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Configure {channel.name}</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">
            &times;
          </button>
        </div>

        <form
          className="channel-config__form"
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
        >
          {configFields.map((field) => (
            <div key={field.key} className="channel-config__field">
              <label className="channel-config__field-label" htmlFor={`cfg-${field.key}`}>
                {field.label}
                {field.required && <span aria-hidden="true"> *</span>}
              </label>
              {field.type === 'checkbox' ? (
                <input
                  id={`cfg-${field.key}`}
                  type="checkbox"
                  checked={Boolean(values[field.key])}
                  onChange={(e) => handleChange(field.key, e.target.checked)}
                />
              ) : (
                <input
                  id={`cfg-${field.key}`}
                  type={field.type}
                  value={String(values[field.key] ?? '')}
                  placeholder={field.placeholder}
                  required={field.required}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="channel-config__input"
                />
              )}
            </div>
          ))}

          <div className="channel-config__actions">
            {onTest && (
              <button
                type="button"
                className="btn--outline"
                onClick={handleTest}
                disabled={testing}
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            )}
            <button type="button" className="btn--ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn--primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
