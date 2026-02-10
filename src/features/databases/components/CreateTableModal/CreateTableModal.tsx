import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import './CreateTableModal.css'

const PRESET_ICONS = ['\uD83D\uDCCB', '\uD83D\uDCCA', '\uD83D\uDCC1', '\uD83D\uDCDD', '\uD83D\uDCCC', '\uD83D\uDDC2\uFE0F', '\uD83D\uDCCE', '\uD83D\uDCD1']

interface CreateTableModalProps {
  databaseId: string
  existingTableNames: string[]
  onCreateTable: (name: string, icon: string) => void
  onClose: () => void
}

export default function CreateTableModal({
  databaseId,
  existingTableNames,
  onCreateTable,
  onClose,
}: CreateTableModalProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(PRESET_ICONS[0] ?? '\uD83D\uDCCB')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Suppress unused variable lint — databaseId is part of the public API
  void databaseId
  void description

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  const trimmedName = name.trim()
  const isDuplicate = existingTableNames.some(
    (n) => n.trim().toLowerCase() === trimmedName.toLowerCase()
  )
  const isDisabled = trimmedName === '' || isDuplicate

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    setError('')
  }, [])

  const handleCreate = useCallback(() => {
    if (trimmedName === '') return
    if (isDuplicate) {
      setError('A table with this name already exists')
      return
    }
    onCreateTable(trimmedName, icon)
  }, [trimmedName, isDuplicate, icon, onCreateTable])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isDisabled) {
      handleCreate()
    }
  }, [handleCreate, isDisabled])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Create Table">
      <div className="modal-content create-table-modal">
        <div className="modal-header">
          <h2>Create New Table</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="create-table-modal__body">
          <div className="create-table-modal__field">
            <label className="create-table-modal__label" htmlFor="table-name">
              Table Name <span className="create-table-modal__required">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="table-name"
              className={`create-table-modal__input ${isDuplicate ? 'create-table-modal__input--error' : ''}`}
              type="text"
              value={name}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Contacts, Products, Tasks..."
              aria-invalid={isDuplicate}
              aria-describedby={isDuplicate || error ? 'table-name-error' : undefined}
            />
            {(isDuplicate || error) && (
              <p id="table-name-error" className="create-table-modal__error" role="alert">
                {error || 'A table with this name already exists'}
              </p>
            )}
          </div>

          <div className="create-table-modal__field">
            <label className="create-table-modal__label">Icon</label>
            <div className="create-table-modal__icons" role="radiogroup" aria-label="Table icon">
              {PRESET_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  className={`create-table-modal__icon-btn ${icon === emoji ? 'create-table-modal__icon-btn--active' : ''}`}
                  onClick={() => setIcon(emoji)}
                  type="button"
                  role="radio"
                  aria-checked={icon === emoji}
                  aria-label={`Icon ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="create-table-modal__field">
            <label className="create-table-modal__label" htmlFor="table-description">
              Description <span className="create-table-modal__optional">(optional)</span>
            </label>
            <textarea
              id="table-description"
              className="create-table-modal__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will this table be used for?"
              rows={2}
            />
          </div>
        </div>

        <div className="create-table-modal__actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={isDisabled}
          >
            <Plus size={14} />
            Create Table
          </button>
        </div>
      </div>
    </div>
  )
}
