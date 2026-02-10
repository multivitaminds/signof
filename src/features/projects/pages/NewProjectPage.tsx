import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useProjectStore } from '../stores/useProjectStore'
import { PROJECT_TEMPLATES } from '../lib/projectTemplates'
import type { ProjectTemplate } from '../lib/projectTemplates'
import './NewProjectPage.css'

const PRESET_COLORS = [
  '#4F46E5',
  '#059669',
  '#DC2626',
  '#F59E0B',
  '#8B5CF6',
  '#3B82F6',
  '#EC4899',
  '#14B8A6',
]

function derivePrefix(name: string): string {
  const cleaned = name.trim().replace(/[^a-zA-Z\s]/g, '')
  if (cleaned.length === 0) return ''
  const words = cleaned.split(/\s+/).filter(Boolean)
  if (words.length >= 3) {
    return words
      .slice(0, 3)
      .map((w) => w[0] ?? '')
      .join('')
      .toUpperCase()
  }
  if (words.length === 2) {
    return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase()
  }
  return cleaned.slice(0, 3).toUpperCase()
}

function generateLabelId(): string {
  return 'lbl-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export default function NewProjectPage() {
  const navigate = useNavigate()
  const createProject = useProjectStore((s) => s.createProject)
  const updateProject = useProjectStore((s) => s.updateProject)

  const [step, setStep] = useState<'template' | 'form'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [prefix, setPrefix] = useState('')
  const [prefixTouched, setPrefixTouched] = useState(false)
  const [color, setColor] = useState(PRESET_COLORS[0] ?? '#4F46E5')

  const autoPrefix = useMemo(() => derivePrefix(name), [name])
  const effectivePrefix = prefixTouched ? prefix : autoPrefix

  const handleTemplateSelect = useCallback((template: ProjectTemplate) => {
    setSelectedTemplate(template)
    setStep('form')
  }, [])

  const handleSkipTemplate = useCallback(() => {
    setSelectedTemplate(null)
    setStep('form')
  }, [])

  const handleBackToTemplates = useCallback(() => {
    setStep('template')
  }, [])

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value)
    },
    []
  )

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value)
    },
    []
  )

  const handlePrefixChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPrefixTouched(true)
      setPrefix(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5))
    },
    []
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmedName = name.trim()
      if (!trimmedName) return

      const id = createProject({
        name: trimmedName,
        description: description.trim(),
        prefix: effectivePrefix || derivePrefix(trimmedName),
        color,
      })

      // Apply template labels if a template was selected
      if (selectedTemplate) {
        const labels = selectedTemplate.labels.map((l) => ({
          ...l,
          id: generateLabelId(),
        }))
        updateProject(id, { labels })
      }

      navigate(`/projects/${id}`)
    },
    [name, description, effectivePrefix, color, createProject, navigate, selectedTemplate, updateProject]
  )

  const handleCancel = useCallback(() => {
    navigate('/projects')
  }, [navigate])

  if (step === 'template') {
    return (
      <div className="new-project">
        <h2>New Project</h2>
        <p className="new-project__subtitle">Choose a template to get started, or start from scratch.</p>

        <div className="new-project__templates" role="list" aria-label="Project templates">
          {PROJECT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              className="new-project__template-card"
              onClick={() => handleTemplateSelect(template)}
              role="listitem"
              aria-label={`Template: ${template.name}`}
            >
              <span className="new-project__template-icon">{template.icon}</span>
              <div className="new-project__template-info">
                <span className="new-project__template-name">{template.name}</span>
                <span className="new-project__template-desc">{template.description}</span>
              </div>
              <div className="new-project__template-statuses">
                {template.statuses.map((s) => (
                  <span
                    key={s.key}
                    className="new-project__template-status"
                    style={{ backgroundColor: `${s.color}20`, color: s.color }}
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="new-project__template-actions">
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSkipTemplate}>
            Start from Scratch
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="new-project">
      <div className="new-project__header-row">
        <button
          type="button"
          className="new-project__back-btn"
          onClick={handleBackToTemplates}
          aria-label="Back to templates"
        >
          <ArrowLeft size={16} />
        </button>
        <h2>New Project</h2>
        {selectedTemplate && (
          <span className="new-project__template-badge">
            {selectedTemplate.icon} {selectedTemplate.name}
          </span>
        )}
      </div>

      <form className="new-project__form" onSubmit={handleSubmit}>
        <div className="new-project__field">
          <label className="new-project__label" htmlFor="project-name">
            Name
          </label>
          <input
            id="project-name"
            className="new-project__input"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Project name"
            required
            autoFocus
          />
        </div>

        <div className="new-project__field">
          <label className="new-project__label" htmlFor="project-description">
            Description
          </label>
          <textarea
            id="project-description"
            className="new-project__input new-project__input--textarea"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="What is this project about?"
            rows={3}
          />
        </div>

        <div className="new-project__field">
          <label className="new-project__label" htmlFor="project-prefix">
            Prefix
          </label>
          <input
            id="project-prefix"
            className="new-project__input new-project__input--short"
            type="text"
            value={effectivePrefix}
            onChange={handlePrefixChange}
            placeholder="PRJ"
            maxLength={5}
          />
        </div>

        <div className="new-project__field">
          <span className="new-project__label">Color</span>
          <div className="new-project__colors" role="radiogroup" aria-label="Project color">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`new-project__color${c === color ? ' new-project__color--selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                role="radio"
                aria-checked={c === color}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        {selectedTemplate && (
          <div className="new-project__field">
            <span className="new-project__label">Template Statuses</span>
            <div className="new-project__template-preview-statuses">
              {selectedTemplate.statuses.map((s) => (
                <span
                  key={s.key}
                  className="new-project__template-status"
                  style={{ backgroundColor: `${s.color}20`, color: s.color }}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedTemplate && (
          <div className="new-project__field">
            <span className="new-project__label">Template Labels</span>
            <div className="new-project__template-preview-labels">
              {selectedTemplate.labels.map((l) => (
                <span
                  key={l.id}
                  className="new-project__template-label-pill"
                  style={{ backgroundColor: `${l.color}20`, color: l.color, borderColor: `${l.color}40` }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="new-project__actions">
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={!name.trim()}>
            Create Project
          </button>
        </div>
      </form>
    </div>
  )
}
