import { useCallback } from 'react'
import type { Skill } from '../../types'
import { SKILL_CATEGORY_LABELS } from '../../types'
import './SkillCard.css'

interface SkillCardProps {
  skill: Skill
  onInstall?: (id: string) => void
  onUninstall?: (id: string) => void
  onToggle?: (id: string, enabled: boolean) => void
}

export default function SkillCard({
  skill,
  onInstall,
  onUninstall,
  onToggle,
}: SkillCardProps) {
  const handleInstallAction = useCallback(() => {
    if (skill.installed) {
      onUninstall?.(skill.id)
    } else {
      onInstall?.(skill.id)
    }
  }, [skill.id, skill.installed, onInstall, onUninstall])

  const handleToggle = useCallback(() => {
    onToggle?.(skill.id, !skill.enabled)
  }, [skill.id, skill.enabled, onToggle])

  const handleCardClick = useCallback(() => {
    if (!skill.installed) {
      onInstall?.(skill.id)
    }
  }, [skill.id, skill.installed, onInstall])

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleCardClick()
      }
    },
    [handleCardClick]
  )

  return (
    <div
      className="skill-card"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      aria-label={`${skill.name} — ${skill.installed ? 'Installed' : 'Click to install'}`}
    >
      <div className="skill-card__header">
        <span className="skill-card__icon" aria-hidden="true">
          {skill.icon}
        </span>
        <div className="skill-card__title-row">
          <h3 className="skill-card__name">{skill.name}</h3>
          <span className="skill-card__version">{skill.version}</span>
        </div>
      </div>

      <p className="skill-card__author">by {skill.author}</p>

      <span className="skill-card__category">
        {SKILL_CATEGORY_LABELS[skill.category]}
      </span>

      <p className="skill-card__description">{skill.description}</p>

      <div className="skill-card__actions">
        <button
          className={`skill-card__install-btn ${skill.installed ? 'btn--danger' : 'btn--primary'}`}
          onClick={handleInstallAction}
        >
          {skill.installed ? 'Uninstall' : 'Install'}
        </button>

        {skill.installed && onToggle && (
          <label className="skill-card__toggle">
            <input
              type="checkbox"
              checked={skill.enabled}
              onChange={handleToggle}
              aria-label={`${skill.enabled ? 'Disable' : 'Enable'} ${skill.name}`}
            />
            <span className="skill-card__toggle-label">
              {skill.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        )}
      </div>
    </div>
  )
}
