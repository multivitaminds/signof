import { useState, useCallback } from 'react'
import { Button } from '../../../../components/ui'
import { Input } from '../../../../components/ui'
import type { MemoryEntry, MemoryScope, MemoryCategory } from '../../types'
import { MemoryScope as MemoryScopeValues, MemoryCategory as MemoryCategoryValues } from '../../types'
import { countTokens, formatTokenCount } from '../../lib/tokenCount'
import './MemoryEntryModal.css'

interface MemoryEntryModalProps {
  entry?: MemoryEntry | null
  onSave: (title: string, content: string, category: MemoryCategory, tags: string[], scope: MemoryScope) => void
  onCancel: () => void
}

const SCOPE_OPTIONS: Array<{ value: MemoryScope; label: string }> = [
  { value: MemoryScopeValues.Workspace, label: 'Workspace' },
  { value: MemoryScopeValues.Personal, label: 'Personal' },
  { value: MemoryScopeValues.Team, label: 'Team' },
  { value: MemoryScopeValues.Project, label: 'Project' },
]

const CATEGORY_OPTIONS: Array<{ value: MemoryCategory; label: string }> = [
  { value: MemoryCategoryValues.Decisions, label: 'Decisions' },
  { value: MemoryCategoryValues.Workflows, label: 'Workflows' },
  { value: MemoryCategoryValues.Preferences, label: 'Preferences' },
  { value: MemoryCategoryValues.People, label: 'People' },
  { value: MemoryCategoryValues.Projects, label: 'Projects' },
  { value: MemoryCategoryValues.Facts, label: 'Facts' },
]

export default function MemoryEntryModal({ entry, onSave, onCancel }: MemoryEntryModalProps) {
  const isEdit = Boolean(entry)
  const [title, setTitle] = useState(entry?.title ?? '')
  const [content, setContent] = useState(entry?.content ?? '')
  const [category, setCategory] = useState<MemoryCategory>(entry?.category ?? MemoryCategoryValues.Facts)
  const [tags, setTags] = useState<string[]>(entry?.tags ?? [])
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
          <label className="memory-modal__label" htmlFor="memory-category">
            Category
          </label>
          <select
            id="memory-category"
            className="memory-modal__category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as MemoryCategory)}
            aria-label="Category"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
            placeholder="Enter the content for this memory entry..."
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
      </div>
    </div>
  )
}
