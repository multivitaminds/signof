import { useState, useCallback } from 'react'
import { Button } from '../../../../components/ui'
import { Input } from '../../../../components/ui'
import type { MemoryEntry, MemoryScope, MemoryCategory } from '../../types'
import { MemoryScope as MemoryScopeValues, MemoryCategory as MemoryCategoryValues } from '../../types'
import { countTokens, formatTokenCount } from '../../lib/tokenCount'
import { CATEGORY_META, MEMORY_TEMPLATES } from '../../lib/memoryTemplates'
import './MemoryEntryModal.css'

interface MemoryEntryModalProps {
  entry?: MemoryEntry | null
  onSave: (title: string, content: string, category: MemoryCategory, tags: string[], scope: MemoryScope) => void
  onCancel: () => void
  existingTags?: string[]
  initialFromTemplate?: { title: string; content: string; category: MemoryCategory; tags: string[] }
}

const SCOPE_OPTIONS: Array<{ value: MemoryScope; label: string }> = [
  { value: MemoryScopeValues.Workspace, label: 'Workspace' },
  { value: MemoryScopeValues.Personal, label: 'Personal' },
  { value: MemoryScopeValues.Team, label: 'Team' },
  { value: MemoryScopeValues.Project, label: 'Project' },
]

export default function MemoryEntryModal({ entry, onSave, onCancel, existingTags = [], initialFromTemplate }: MemoryEntryModalProps) {
  const isEdit = Boolean(entry)
  const [activeModalTab, setActiveModalTab] = useState<'write' | 'template'>(
    initialFromTemplate ? 'write' : 'write',
  )
  const [title, setTitle] = useState(entry?.title ?? initialFromTemplate?.title ?? '')
  const [content, setContent] = useState(entry?.content ?? initialFromTemplate?.content ?? '')
  const [category, setCategory] = useState<MemoryCategory>(
    entry?.category ?? initialFromTemplate?.category ?? MemoryCategoryValues.Facts,
  )
  const [tags, setTags] = useState<string[]>(entry?.tags ?? initialFromTemplate?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [scope, setScope] = useState<MemoryScope>(entry?.scope ?? MemoryScopeValues.Workspace)

  const tokenCount = countTokens(content)
  const canSave = title.trim().length > 0 && content.trim().length > 0

  const handleSave = useCallback(() => {
    if (!canSave) return
    onSave(title.trim(), content.trim(), category, tags, scope)
  }, [canSave, title, content, category, tags, scope, onSave])

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        const tag = tagInput.trim()
        if (tag && !tags.includes(tag)) {
          setTags((prev) => [...prev, tag])
        }
        setTagInput('')
      }
    },
    [tagInput, tags],
  )

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const addSuggestedTag = useCallback((tag: string) => {
    if (!tags.includes(tag)) {
      setTags((prev) => [...prev, tag])
    }
  }, [tags])

  const handleTemplateSelect = useCallback((template: typeof MEMORY_TEMPLATES[number]) => {
    setTitle(template.title)
    setContent(template.placeholder)
    setCategory(template.category)
    setTags(template.tags)
    setActiveModalTab('write')
  }, [])

  const suggestedTags = existingTags.filter((t) => !tags.includes(t))

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content memory-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={isEdit ? 'Edit memory entry' : 'Add memory entry'}
      >
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Entry' : 'Add Entry'}</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">
            &times;
          </button>
        </div>

        {!isEdit && (
          <div className="memory-modal__tabs" role="tablist">
            <button
              className={`memory-modal__tab${activeModalTab === 'write' ? ' memory-modal__tab--active' : ''}`}
              onClick={() => setActiveModalTab('write')}
              role="tab"
              aria-selected={activeModalTab === 'write'}
            >
              Write
            </button>
            <button
              className={`memory-modal__tab${activeModalTab === 'template' ? ' memory-modal__tab--active' : ''}`}
              onClick={() => setActiveModalTab('template')}
              role="tab"
              aria-selected={activeModalTab === 'template'}
            >
              From Template
            </button>
          </div>
        )}

        {activeModalTab === 'template' ? (
          <div className="memory-modal__template-grid">
            {MEMORY_TEMPLATES.map((template) => (
              <button
                key={template.id}
                className="memory-modal__template-card"
                onClick={() => handleTemplateSelect(template)}
              >
                <span className="memory-modal__template-title">{template.title}</span>
                <span className="memory-modal__template-desc">{template.description}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="memory-modal__field">
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Memory entry title"
                fullWidth
              />
            </div>

            <div className="memory-modal__field">
              <label className="memory-modal__label">Category</label>
              <div className="memory-modal__category-pills" role="radiogroup" aria-label="Category">
                {CATEGORY_META.map((meta) => (
                  <button
                    key={meta.key}
                    className={`memory-modal__category-pill${category === meta.key ? ' memory-modal__category-pill--active' : ''}`}
                    onClick={() => setCategory(meta.key)}
                    style={{
                      '--pill-color': meta.color,
                    } as React.CSSProperties}
                    role="radio"
                    aria-checked={category === meta.key}
                    aria-label={meta.label}
                  >
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="memory-modal__field">
              <label className="memory-modal__label" htmlFor="memory-content">
                Content
              </label>
              <textarea
                id="memory-content"
                className="memory-modal__textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the content for this memory entry... (supports markdown)"
                rows={6}
              />
              <span className="memory-modal__token-count">
                {formatTokenCount(tokenCount)} tokens
              </span>
            </div>

            <div className="memory-modal__field">
              <label className="memory-modal__label" htmlFor="memory-tags">
                Tags
              </label>
              <input
                id="memory-tags"
                className="memory-modal__tag-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter"
              />
              {tags.length > 0 && (
                <div className="memory-modal__tags">
                  {tags.map((tag) => (
                    <span key={tag} className="memory-modal__tag-chip">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                        className="memory-modal__tag-remove"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {suggestedTags.length > 0 && (
                <div className="memory-modal__tag-suggestions">
                  <span className="memory-modal__tag-suggestions-label">Suggested:</span>
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      className="memory-modal__tag-suggestion"
                      onClick={() => addSuggestedTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <fieldset className="memory-modal__field memory-modal__scope-group">
              <legend className="memory-modal__label">Scope</legend>
              <div className="memory-modal__scope-options">
                {SCOPE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="memory-modal__scope-option">
                    <input
                      type="radio"
                      name="memory-scope"
                      value={opt.value}
                      checked={scope === opt.value}
                      onChange={() => setScope(opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="memory-modal__footer">
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={!canSave}>
                {isEdit ? 'Save Changes' : 'Add Entry'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
