import { useState, useCallback } from 'react'
import { Plus, Copy, Check, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { Environment } from '../types'
import useDeveloperStore from '../stores/useDeveloperStore'
import './ApiKeysPage.css'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function maskKey(key: string): string {
  if (key.length <= 12) return key
  return key.slice(0, 8) + '\u2022'.repeat(20) + key.slice(-6)
}

function ApiKeysPage() {
  const {
    apiKeys,
    createApiKey,
    deleteApiKey,
    rollApiKey,
  } = useDeveloperStore()

  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyEnv, setNewKeyEnv] = useState<Environment>(Environment.Test as typeof Environment.Test)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmRollId, setConfirmRollId] = useState<string | null>(null)

  const handleCreate = useCallback(() => {
    if (!newKeyName.trim()) return
    createApiKey(newKeyName.trim(), newKeyEnv)
    setNewKeyName('')
    setNewKeyEnv(Environment.Test as typeof Environment.Test)
    setShowCreate(false)
  }, [newKeyName, newKeyEnv, createApiKey])

  const handleCopy = useCallback((id: string, key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }, [])

  const handleToggleReveal = useCallback((id: string) => {
    setRevealedKeys(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleDelete = useCallback((id: string) => {
    if (confirmDeleteId === id) {
      deleteApiKey(id)
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(id)
      setConfirmRollId(null)
      setTimeout(() => setConfirmDeleteId(null), 3000)
    }
  }, [confirmDeleteId, deleteApiKey])

  const handleRoll = useCallback((id: string) => {
    if (confirmRollId === id) {
      rollApiKey(id)
      setConfirmRollId(null)
    } else {
      setConfirmRollId(id)
      setConfirmDeleteId(null)
      setTimeout(() => setConfirmRollId(null), 3000)
    }
  }, [confirmRollId, rollApiKey])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewKeyName(e.target.value)
  }, [])

  const handleEnvChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewKeyEnv(e.target.value as Environment)
  }, [])

  return (
    <div className="api-keys-page">
      <div className="api-keys-page__header">
        <div>
          <h1 className="api-keys-page__title">API Keys</h1>
          <p className="api-keys-page__subtitle">
            Manage your API keys for authenticating requests to the SignOf API.
            Keep your keys secure and never share them in public repositories.
          </p>
        </div>
        <button
          className="btn-primary api-keys-page__create-btn"
          onClick={() => setShowCreate(!showCreate)}
          type="button"
        >
          <Plus size={16} />
          {showCreate ? 'Cancel' : 'Create Key'}
        </button>
      </div>

      {showCreate && (
        <div className="api-keys-page__create-form">
          <h3 className="api-keys-page__form-title">Create New API Key</h3>
          <div className="api-keys-page__form-fields">
            <div className="api-keys-page__field">
              <label className="api-keys-page__label" htmlFor="key-name">
                Key Name
              </label>
              <input
                id="key-name"
                type="text"
                className="api-keys-page__input"
                placeholder="e.g., Production Backend"
                value={newKeyName}
                onChange={handleNameChange}
              />
            </div>
            <div className="api-keys-page__field">
              <label className="api-keys-page__label" htmlFor="key-env">
                Environment
              </label>
              <select
                id="key-env"
                className="api-keys-page__select"
                value={newKeyEnv}
                onChange={handleEnvChange}
              >
                <option value={Environment.Test}>Test</option>
                <option value={Environment.Live}>Live</option>
              </select>
            </div>
            <button
              className="btn-primary api-keys-page__submit-btn"
              onClick={handleCreate}
              disabled={!newKeyName.trim()}
              type="button"
            >
              Create
            </button>
          </div>
        </div>
      )}

      <div className="api-keys-page__list">
        {apiKeys.length === 0 && (
          <div className="api-keys-page__empty">
            <p>No API keys yet.</p>
            <p className="api-keys-page__empty-hint">
              Create a key to start making API requests.
            </p>
          </div>
        )}

        {apiKeys.map(key => (
          <div key={key.id} className="api-keys-page__key-card">
            <div className="api-keys-page__key-header">
              <div className="api-keys-page__key-info">
                <div className="api-keys-page__key-name-row">
                  <span className="api-keys-page__key-name">{key.name}</span>
                  <span
                    className={`api-keys-page__env-badge ${
                      key.environment === Environment.Live
                        ? 'api-keys-page__env-badge--live'
                        : 'api-keys-page__env-badge--test'
                    }`}
                  >
                    {key.environment === Environment.Live ? 'Live' : 'Test'}
                  </span>
                </div>
                <div className="api-keys-page__key-value-row">
                  <code className="api-keys-page__key-value">
                    {revealedKeys.has(key.id) ? key.key : maskKey(key.key)}
                  </code>
                  <button
                    className="api-keys-page__icon-btn"
                    onClick={() => handleToggleReveal(key.id)}
                    type="button"
                    aria-label={revealedKeys.has(key.id) ? 'Hide key' : 'Reveal key'}
                  >
                    {revealedKeys.has(key.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    className="api-keys-page__icon-btn"
                    onClick={() => handleCopy(key.id, key.key)}
                    type="button"
                    aria-label="Copy key"
                  >
                    {copiedId === key.id ? <Check size={14} className="api-keys-page__copied" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="api-keys-page__key-meta">
                  <span>Created {formatDate(key.createdAt)}</span>
                  {key.lastUsedAt && (
                    <>
                      <span className="api-keys-page__separator">|</span>
                      <span>Last used {formatDate(key.lastUsedAt)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="api-keys-page__key-actions">
                <button
                  className={`api-keys-page__action-btn ${
                    confirmRollId === key.id ? 'api-keys-page__action-btn--warning' : ''
                  }`}
                  onClick={() => handleRoll(key.id)}
                  type="button"
                  title={confirmRollId === key.id ? 'Click again to confirm roll' : 'Roll key (regenerate)'}
                  aria-label="Roll key"
                >
                  <RefreshCw size={14} />
                  <span>{confirmRollId === key.id ? 'Confirm Roll?' : 'Roll'}</span>
                </button>
                <button
                  className={`api-keys-page__action-btn ${
                    confirmDeleteId === key.id ? 'api-keys-page__action-btn--danger' : ''
                  }`}
                  onClick={() => handleDelete(key.id)}
                  type="button"
                  title={confirmDeleteId === key.id ? 'Click again to confirm delete' : 'Delete key'}
                  aria-label="Delete key"
                >
                  <Trash2 size={14} />
                  <span>{confirmDeleteId === key.id ? 'Confirm?' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="api-keys-page__security">
        <h3 className="api-keys-page__security-title">Security Best Practices</h3>
        <ul className="api-keys-page__security-list">
          <li>Never expose API keys in client-side code or version control.</li>
          <li>Use environment variables to store keys in production.</li>
          <li>Use test keys (<code>sk_test_...</code>) during development.</li>
          <li>Roll keys immediately if you suspect they have been compromised.</li>
          <li>Assign descriptive names to track key usage across services.</li>
        </ul>
      </div>
    </div>
  )
}

export default ApiKeysPage
