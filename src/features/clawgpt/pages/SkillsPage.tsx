import { useState, useCallback, useMemo } from 'react'
import { useSkillStore } from '../stores/useSkillStore'
import SkillCard from '../components/SkillCard/SkillCard'
import SkillInstaller from '../components/SkillInstaller/SkillInstaller'
import { SKILL_CATEGORY_LABELS } from '../types'
import type { Skill } from '../types'
import './SkillsPage.css'

type SkillTab = 'all' | 'installed' | 'available'

export default function SkillsPage() {
  const { skills, installSkill, uninstallSkill, enableSkill, disableSkill, configureSkill } = useSkillStore()
  const [activeTab, setActiveTab] = useState<SkillTab>('all')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [installerSkill, setInstallerSkill] = useState<Skill | null>(null)

  const categories = useMemo(() => {
    const cats = new Set(skills.map((sk) => sk.category))
    return Array.from(cats).sort()
  }, [skills])

  const filteredSkills = useMemo(() => {
    let result = skills

    if (activeTab === 'installed') {
      result = result.filter((sk) => sk.installed)
    } else if (activeTab === 'available') {
      result = result.filter((sk) => !sk.installed)
    }

    if (categoryFilter) {
      result = result.filter((sk) => sk.category === categoryFilter)
    }

    if (search.trim()) {
      const lower = search.toLowerCase()
      result = result.filter(
        (sk) =>
          sk.name.toLowerCase().includes(lower) ||
          sk.description.toLowerCase().includes(lower)
      )
    }

    return result
  }, [skills, activeTab, categoryFilter, search])

  const handleInstall = useCallback(
    (id: string) => {
      installSkill(id)
    },
    [installSkill]
  )

  const handleUninstall = useCallback(
    (id: string) => {
      uninstallSkill(id)
    },
    [uninstallSkill]
  )

  const handleToggle = useCallback(
    (id: string, enabled: boolean) => {
      if (enabled) {
        enableSkill(id)
      } else {
        disableSkill(id)
      }
    },
    [enableSkill, disableSkill]
  )

  const handleSaveConfig = useCallback(
    (config: Record<string, unknown>) => {
      if (installerSkill) {
        configureSkill(installerSkill.id, config)
      }
      setInstallerSkill(null)
    },
    [installerSkill, configureSkill]
  )

  const handleCloseInstaller = useCallback(() => {
    setInstallerSkill(null)
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }, [])

  const handleCategoryClick = useCallback((category: string) => {
    setCategoryFilter((prev) => (prev === category ? null : category))
  }, [])

  return (
    <div className="skills-page">
      <div className="skills-page__toolbar">
        <div className="skills-page__tabs" role="tablist" aria-label="Skill filters">
          <button
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`skills-page__tab${activeTab === 'all' ? ' skills-page__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'installed'}
            className={`skills-page__tab${activeTab === 'installed' ? ' skills-page__tab--active' : ''}`}
            onClick={() => setActiveTab('installed')}
          >
            Installed
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'available'}
            className={`skills-page__tab${activeTab === 'available' ? ' skills-page__tab--active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available
          </button>
        </div>

        <div className="skills-page__categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`skills-page__category-pill${categoryFilter === cat ? ' skills-page__category-pill--active' : ''}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {SKILL_CATEGORY_LABELS[cat as keyof typeof SKILL_CATEGORY_LABELS] ?? cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          className="skills-page__search"
          placeholder="Search skills..."
          value={search}
          onChange={handleSearchChange}
          aria-label="Search skills"
        />
      </div>

      <div className="skills-page__grid">
        {filteredSkills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onInstall={handleInstall}
            onUninstall={handleUninstall}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <p className="skills-page__empty">No skills match your filters.</p>
      )}

      {installerSkill && (
        <SkillInstaller
          skill={installerSkill}
          onSave={handleSaveConfig}
          onCancel={handleCloseInstaller}
        />
      )}
    </div>
  )
}
