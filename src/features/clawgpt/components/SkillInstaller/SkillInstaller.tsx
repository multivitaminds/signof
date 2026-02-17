import { useState, useCallback } from 'react'
import type { Skill } from '../../types'
import { SKILL_CATEGORY_LABELS } from '../../types'
import './SkillInstaller.css'

interface SkillInstallerProps {
  skill: Skill
  onSave: (config: Record<string, unknown>) => void
  onCancel: () => void
}

export default function SkillInstaller({
  skill,
  onSave,
  onCancel,
}: SkillInstallerProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => ({
    ...skill.config,
  }))

  const configKeys = Object.keys(skill.config)

  const handleChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSave = useCallback(() => {
    onSave(values)
  }, [onSave, values])

  return (
    <div className="skill-installer">
      <div className="skill-installer__header">
        <span className="skill-installer__icon" aria-hidden="true">
          {skill.icon}
        </span>
        <div>
          <h3 className="skill-installer__name">{skill.name}</h3>
          <span className="skill-installer__meta">
            {skill.version} &middot; {SKILL_CATEGORY_LABELS[skill.category]}
          </span>
        </div>
      </div>

      <p className="skill-installer__description">{skill.description}</p>

      {configKeys.length > 0 && (
        <div className="skill-installer__config">
          <h4 className="skill-installer__config-title">Configuration</h4>
          {configKeys.map((key) => (
            <div key={key} className="skill-installer__field">
              <label
                className="skill-installer__field-label"
                htmlFor={`skill-cfg-${key}`}
              >
                {key}
              </label>
              <input
                id={`skill-cfg-${key}`}
                type="text"
                value={String(values[key] ?? '')}
                onChange={(e) => handleChange(key, e.target.value)}
                className="skill-installer__input"
              />
            </div>
          ))}
        </div>
      )}

      <div className="skill-installer__actions">
        <button className="btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn--primary" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  )
}
