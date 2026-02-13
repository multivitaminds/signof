import { useCallback } from 'react'
import { X } from 'lucide-react'
import type { ConversationSettings } from '../../types'
import './SettingsPanel.css'

interface SettingsPanelProps {
  settings: ConversationSettings
  onUpdate: (settings: Partial<ConversationSettings>) => void
  onClose: () => void
}

function SettingsPanel({ settings, onUpdate, onClose }: SettingsPanelProps) {
  const handleSystemPromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate({ systemPrompt: e.target.value })
    },
    [onUpdate]
  )

  const handleTemperatureChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ temperature: parseFloat(e.target.value) })
    },
    [onUpdate]
  )

  const handleMaxTokensChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ maxTokens: parseInt(e.target.value, 10) || 0 })
    },
    [onUpdate]
  )

  const handleTopPChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ topP: parseFloat(e.target.value) })
    },
    [onUpdate]
  )

  const handleStreamingToggle = useCallback(() => {
    onUpdate({ streaming: !settings.streaming })
  }, [onUpdate, settings.streaming])

  const handleReset = useCallback(() => {
    onUpdate({
      systemPrompt: '',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1,
      streaming: true,
    })
  }, [onUpdate])

  return (
    <div className="settings-panel">
      <div className="settings-panel__header">
        <h3 className="settings-panel__title">Settings</h3>
        <button
          className="settings-panel__close"
          onClick={onClose}
          type="button"
          aria-label="Close settings"
        >
          <X size={18} />
        </button>
      </div>

      <div className="settings-panel__field">
        <label className="settings-panel__label" htmlFor="system-prompt">
          System Prompt
        </label>
        <textarea
          id="system-prompt"
          className="settings-panel__textarea"
          rows={6}
          value={settings.systemPrompt}
          onChange={handleSystemPromptChange}
          placeholder="Enter a system prompt..."
        />
      </div>

      <div className="settings-panel__field">
        <label className="settings-panel__label" htmlFor="temperature">
          Temperature
        </label>
        <div className="settings-panel__range-row">
          <input
            id="temperature"
            className="settings-panel__range"
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={settings.temperature}
            onChange={handleTemperatureChange}
          />
          <span className="settings-panel__range-value">
            {settings.temperature.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="settings-panel__field">
        <label className="settings-panel__label" htmlFor="max-tokens">
          Max Tokens
        </label>
        <input
          id="max-tokens"
          className="settings-panel__number-input"
          type="number"
          value={settings.maxTokens}
          onChange={handleMaxTokensChange}
          min={1}
        />
      </div>

      <div className="settings-panel__field">
        <label className="settings-panel__label" htmlFor="top-p">
          Top P
        </label>
        <div className="settings-panel__range-row">
          <input
            id="top-p"
            className="settings-panel__range"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.topP}
            onChange={handleTopPChange}
          />
          <span className="settings-panel__range-value">
            {settings.topP.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="settings-panel__field">
        <div className="settings-panel__toggle-row">
          <label className="settings-panel__label">Streaming</label>
          <button
            className={`settings-panel__toggle${settings.streaming ? ' settings-panel__toggle--active' : ''}`}
            onClick={handleStreamingToggle}
            type="button"
            role="switch"
            aria-checked={settings.streaming}
            aria-label="Toggle streaming"
          >
            <span className="settings-panel__toggle-knob" />
          </button>
        </div>
      </div>

      <button
        className="settings-panel__reset btn-secondary"
        onClick={handleReset}
        type="button"
      >
        Reset to Defaults
      </button>
    </div>
  )
}

export default SettingsPanel
