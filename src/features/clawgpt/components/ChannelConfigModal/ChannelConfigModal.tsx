import { useState, useCallback } from 'react'
import type { Channel, ChannelConfigField, ChannelConfig } from '../../types'
import { testChannelConnection } from '../../lib/channelValidator'
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
  const [testResult, setTestResult] = useState<{ valid: boolean; errors: string[] } | null>(null)

  const handleChange = useCallback((key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setTestResult(null)
  }, [])

  const handleSave = useCallback(() => {
    onSave({ ...channel.config, ...values } as ChannelConfig)
  }, [onSave, channel.config, values])

  const handleTest = useCallback(async () => {
    setTesting(true)
    setTestResult(null)
    const result = await testChannelConnection(channel.type, values)
    setTestResult(result)
    setTesting(false)
  }, [channel.type, values])

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
          {configFields.map((field) => {
            const fieldErrors = testResult?.errors.filter(
              (err) => err.toLowerCase().includes(field.label.toLowerCase()) ||
                       err.toLowerCase().includes(field.key.toLowerCase())
            ) ?? []

            return (
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
                    className={`channel-config__input${fieldErrors.length > 0 ? ' channel-config__input--error' : ''}`}
                  />
                )}
                {fieldErrors.length > 0 && (
                  <span className="channel-config__field-error">{fieldErrors[0]}</span>
                )}
              </div>
            )
          })}

          {testResult && !testResult.valid && (
            <div className="channel-config__test-errors" role="alert">
              <strong>Validation failed:</strong>
              <ul>
                {testResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {testResult?.valid && (
            <div className="channel-config__test-success" role="status">
              Connection validated successfully.
            </div>
          )}

          <div className="channel-config__actions">
            <button
              type="button"
              className="btn--outline"
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
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
