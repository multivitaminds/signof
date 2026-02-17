import { useState, useCallback } from 'react'
import type { SoulConfig, SoulPreset } from '../../types'
import { ResponseStyle, RESPONSE_STYLE_LABELS } from '../../types'
import './SoulEditor.css'

interface SoulEditorProps {
  config: SoulConfig
  presets: SoulPreset[]
  activePresetId: string | null
  onUpdate: (partial: Partial<SoulConfig>) => void
  onSwitchPreset: (id: string) => void
  onReset: () => void
  onAddRule: (rule: string) => void
  onRemoveRule: (index: number) => void
  onAddContext: (ctx: string) => void
  onRemoveContext: (index: number) => void
}

const RESPONSE_STYLES = Object.values(ResponseStyle)

export default function SoulEditor({
  config,
  presets,
  activePresetId,
  onUpdate,
  onSwitchPreset,
  onReset,
  onAddRule,
  onRemoveRule,
  onAddContext,
  onRemoveContext,
}: SoulEditorProps) {
  const [newRule, setNewRule] = useState('')
  const [newContext, setNewContext] = useState('')

  const handleAddRule = useCallback(() => {
    const trimmed = newRule.trim()
    if (!trimmed) return
    onAddRule(trimmed)
    setNewRule('')
  }, [newRule, onAddRule])

  const handleAddContext = useCallback(() => {
    const trimmed = newContext.trim()
    if (!trimmed) return
    onAddContext(trimmed)
    setNewContext('')
  }, [newContext, onAddContext])

  const handlePresetChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSwitchPreset(e.target.value)
    },
    [onSwitchPreset]
  )

  return (
    <div className="soul-editor">
      <div className="soul-editor__presets">
        <label className="soul-editor__field-label" htmlFor="soul-preset">
          Preset
        </label>
        <div className="soul-editor__preset-row">
          <select
            id="soul-preset"
            className="soul-editor__select"
            value={activePresetId ?? ''}
            onChange={handlePresetChange}
          >
            <option value="">Custom</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button className="btn--ghost" onClick={onReset} aria-label="Reset configuration">
            Reset
          </button>
        </div>
      </div>

      <div className="soul-editor__field">
        <label className="soul-editor__field-label" htmlFor="soul-name">
          Name
        </label>
        <input
          id="soul-name"
          type="text"
          className="soul-editor__input"
          value={config.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
      </div>

      <div className="soul-editor__field">
        <label className="soul-editor__field-label" htmlFor="soul-personality">
          Personality
        </label>
        <textarea
          id="soul-personality"
          className="soul-editor__textarea"
          value={config.personality}
          onChange={(e) => onUpdate({ personality: e.target.value })}
          rows={3}
        />
      </div>

      <div className="soul-editor__field">
        <label className="soul-editor__field-label" htmlFor="soul-prompt">
          System Prompt
        </label>
        <textarea
          id="soul-prompt"
          className="soul-editor__prompt"
          value={config.systemPrompt}
          onChange={(e) => onUpdate({ systemPrompt: e.target.value })}
          rows={8}
        />
      </div>

      <div className="soul-editor__field">
        <label className="soul-editor__field-label">Response Style</label>
        <div className="soul-editor__styles" role="radiogroup" aria-label="Response style">
          {RESPONSE_STYLES.map((style) => (
            <label key={style} className="soul-editor__style-option">
              <input
                type="radio"
                name="responseStyle"
                value={style}
                checked={config.responseStyle === style}
                onChange={() => onUpdate({ responseStyle: style })}
              />
              {RESPONSE_STYLE_LABELS[style]}
            </label>
          ))}
        </div>
      </div>

      <div className="soul-editor__field">
        <label className="soul-editor__field-label">Rules</label>
        <ul className="soul-editor__rules" role="list">
          {config.rules.map((rule, i) => (
            <li key={i} className="soul-editor__rule-item">
              <span>{rule}</span>
              <button
                className="soul-editor__remove-btn"
                onClick={() => onRemoveRule(i)}
                aria-label={`Remove rule: ${rule}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="soul-editor__add-row">
          <input
            type="text"
            className="soul-editor__input"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            placeholder="Add a rule..."
            aria-label="New rule"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddRule()
              }
            }}
          />
          <button className="btn--ghost" onClick={handleAddRule}>
            Add
          </button>
        </div>
      </div>

      <div className="soul-editor__field">
        <label className="soul-editor__field-label">Context</label>
        <ul className="soul-editor__rules" role="list">
          {config.context.map((ctx, i) => (
            <li key={i} className="soul-editor__rule-item">
              <span>{ctx}</span>
              <button
                className="soul-editor__remove-btn"
                onClick={() => onRemoveContext(i)}
                aria-label={`Remove context: ${ctx}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="soul-editor__add-row">
          <input
            type="text"
            className="soul-editor__input"
            value={newContext}
            onChange={(e) => setNewContext(e.target.value)}
            placeholder="Add context..."
            aria-label="New context"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddContext()
              }
            }}
          />
          <button className="btn--ghost" onClick={handleAddContext}>
            Add
          </button>
        </div>
      </div>

      <div className="soul-editor__row">
        <div className="soul-editor__field soul-editor__field--half">
          <label className="soul-editor__field-label" htmlFor="soul-language">
            Language
          </label>
          <input
            id="soul-language"
            type="text"
            className="soul-editor__input"
            value={config.language}
            onChange={(e) => onUpdate({ language: e.target.value })}
          />
        </div>
        <div className="soul-editor__field soul-editor__field--half">
          <label className="soul-editor__field-label" htmlFor="soul-timezone">
            Timezone
          </label>
          <input
            id="soul-timezone"
            type="text"
            className="soul-editor__input"
            value={config.timezone}
            onChange={(e) => onUpdate({ timezone: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
