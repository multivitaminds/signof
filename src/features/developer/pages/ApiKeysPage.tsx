import { useState, useCallback } from 'react'
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Key,
  AlertTriangle,
  Shield,
  XCircle,
} from 'lucide-react'
import { ApiKeyPermission } from '../types'
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

const PERMISSION_LABELS: Record<string, string> = {
  [ApiKeyPermission.Read]: 'Read',
  [ApiKeyPermission.Write]: 'Write',
  [ApiKeyPermission.Admin]: 'Admin',
}

const EXPIRY_OPTIONS = [
  { label: 'Never', value: '' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
  { label: '1 year', value: '365' },
] as const

function ApiKeysPage() {
  const {
    apiKeys,
    createApiKey,
    revokeApiKey,
    deleteApiKey,
  } = useDeveloperStore()

  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyPermissions, setNewKeyPermissions] = useState<Set<string>>(new Set([ApiKeyPermission.Read]))
  const [newKeyExpiry, setNewKeyExpiry] = useState('')
  const [createdKeyValue, setCreatedKeyValue] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleCreate = useCallback(() => {
    if (!newKeyName.trim()) return
    if (newKeyPermissions.size === 0) return

    const permissions = Array.from(newKeyPermissions) as ApiKeyPermission[]

    let expiresAt: string | null = null
    if (newKeyExpiry) {
      const days = parseInt(newKeyExpiry, 10)
      const date = new Date()
      date.setDate(date.getDate() + days)
      expiresAt = date.toISOString()
    }

    const fullKey = createApiKey(newKeyName.trim(), permissions, expiresAt)
    setCreatedKeyValue(fullKey)
    setNewKeyName('')
    setNewKeyPermissions(new Set([ApiKeyPermission.Read]))
    setNewKeyExpiry('')
    setShowCreate(false)
  }, [newKeyName, newKeyPermissions, newKeyExpiry, createApiKey])

  const handleCopyKey = useCallback((value: string, id: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }).catch(() => { /* clipboard unavailable */ })
  }, [])

  const handleTogglePermission = useCallback((perm: string) => {
    setNewKeyPermissions(prev => {
      const next = new Set(prev)
      if (next.has(perm)) {
        next.delete(perm)
      } else {
        next.add(perm)
      }
      return next
    })
  }, [])

  const handleRevoke = useCallback((id: string) => {
    if (revokeConfirmId === id) {
      revokeApiKey(id)
      setRevokeConfirmId(null)
    } else {
      setRevokeConfirmId(id)
      setDeleteConfirmId(null)
      setTimeout(() => setRevokeConfirmId(null), 3000)
    }
  }, [revokeConfirmId, revokeApiKey])

  const handleDelete = useCallback((id: string) => {
    if (deleteConfirmId === id) {
      deleteApiKey(id)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
      setRevokeConfirmId(null)
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }, [deleteConfirmId, deleteApiKey])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewKeyName(e.target.value)
  }, [])

  const handleExpiryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewKeyExpiry(e.target.value)
  }, [])

  const handleDismissCreated = useCallback(() => {
    setCreatedKeyValue(null)
  }, [])

  const isExpired = (expiresAt: string | null): boolean => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <div className="api-keys-page">
      <div className="api-keys-page__header">
        <div>
          <h1 className="api-keys-page__title">API Keys</h1>
          <p className="api-keys-page__subtitle">
            Manage your API keys for authenticating requests to the Orchestree API.
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

      {/* Created key modal overlay */}
      {createdKeyValue && (
        <div className="modal-overlay" onClick={handleDismissCreated}>
          <div
            className="modal-content api-keys-page__created-modal"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="API key created"
          >
            <div className="modal-header">
              <h3>API Key Created</h3>
              <button
                className="api-keys-page__close-btn"
                onClick={handleDismissCreated}
                type="button"
                aria-label="Close"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="api-keys-page__created-body">
              <div className="api-keys-page__created-warning">
                <AlertTriangle size={16} />
                <span>This key will not be shown again. Copy it now and store it securely.</span>
              </div>
              <div className="api-keys-page__created-key-row">
                <code className="api-keys-page__created-key-value">{createdKeyValue}</code>
                <button
                  className="btn-primary api-keys-page__copy-btn"
                  onClick={() => handleCopyKey(createdKeyValue, 'created')}
                  type="button"
                  aria-label="Copy API key"
                >
                  {copiedId === 'created' ? (
                    <><Check size={14} /> Copied</>
                  ) : (
                    <><Copy size={14} /> Copy</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create key form */}
      {showCreate && (
        <div className="api-keys-page__create-form">
          <h3 className="api-keys-page__form-title">Create New API Key</h3>

          <div className="api-keys-page__form-grid">
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
              <label className="api-keys-page__label" htmlFor="key-expiry">
                Expiration
              </label>
              <select
                id="key-expiry"
                className="api-keys-page__select"
                value={newKeyExpiry}
                onChange={handleExpiryChange}
              >
                {EXPIRY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="api-keys-page__field api-keys-page__field--full">
              <label className="api-keys-page__label">
                Permissions
              </label>
              <div className="api-keys-page__permissions">
                {Object.values(ApiKeyPermission).map(perm => (
                  <label className="api-keys-page__permission" key={perm}>
                    <input
                      type="checkbox"
                      checked={newKeyPermissions.has(perm)}
                      onChange={() => handleTogglePermission(perm)}
                    />
                    <span className="api-keys-page__permission-label">
                      {PERMISSION_LABELS[perm]}
                    </span>
                    <span className="api-keys-page__permission-desc">
                      {perm === ApiKeyPermission.Read && 'Read-only access to resources'}
                      {perm === ApiKeyPermission.Write && 'Create and update resources'}
                      {perm === ApiKeyPermission.Admin && 'Full administrative access'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            className="btn-primary api-keys-page__submit-btn"
            onClick={handleCreate}
            disabled={!newKeyName.trim() || newKeyPermissions.size === 0}
            type="button"
          >
            <Key size={16} />
            Create API Key
          </button>
        </div>
      )}

      {/* Key list table */}
      <div className="api-keys-page__table-wrapper">
        <table className="api-keys-page__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Key</th>
              <th>Permissions</th>
              <th>Created</th>
              <th>Last Used</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.length === 0 && (
              <tr>
                <td colSpan={7} className="api-keys-page__empty">
                  No API keys yet. Create a key to start making API requests.
                </td>
              </tr>
            )}
            {apiKeys.map(key => (
              <tr
                key={key.id}
                className={key.status === 'revoked' ? 'api-keys-page__row--revoked' : ''}
              >
                <td>
                  <span className="api-keys-page__key-name">{key.name}</span>
                </td>
                <td>
                  <code className="api-keys-page__key-value">
                    {key.keyPrefix}{'\u2022'.repeat(6)}
                  </code>
                </td>
                <td>
                  <div className="api-keys-page__perm-badges">
                    {key.permissions.map(p => (
                      <span
                        key={p}
                        className={`api-keys-page__perm-badge api-keys-page__perm-badge--${p}`}
                      >
                        {PERMISSION_LABELS[p]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="api-keys-page__date-cell">
                  {formatDate(key.createdAt)}
                </td>
                <td className="api-keys-page__date-cell">
                  {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}
                </td>
                <td>
                  {key.status === 'active' ? (
                    <span className="api-keys-page__status-badge api-keys-page__status-badge--active">
                      Active
                    </span>
                  ) : (
                    <span className="api-keys-page__status-badge api-keys-page__status-badge--revoked">
                      Revoked
                    </span>
                  )}
                  {isExpired(key.expiresAt) && key.status === 'active' && (
                    <span className="api-keys-page__status-badge api-keys-page__status-badge--expired">
                      Expired
                    </span>
                  )}
                </td>
                <td>
                  <div className="api-keys-page__key-actions">
                    {key.status === 'active' && (
                      <button
                        className={`api-keys-page__action-btn ${
                          revokeConfirmId === key.id ? 'api-keys-page__action-btn--warning' : ''
                        }`}
                        onClick={() => handleRevoke(key.id)}
                        type="button"
                        title={revokeConfirmId === key.id ? 'Click again to confirm' : 'Revoke key'}
                        aria-label="Revoke key"
                      >
                        <Shield size={14} />
                        <span>{revokeConfirmId === key.id ? 'Confirm?' : 'Revoke'}</span>
                      </button>
                    )}
                    <button
                      className={`api-keys-page__action-btn ${
                        deleteConfirmId === key.id ? 'api-keys-page__action-btn--danger' : ''
                      }`}
                      onClick={() => handleDelete(key.id)}
                      type="button"
                      title={deleteConfirmId === key.id ? 'Click again to confirm' : 'Delete key'}
                      aria-label="Delete key"
                    >
                      <Trash2 size={14} />
                      <span>{deleteConfirmId === key.id ? 'Confirm?' : 'Delete'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="api-keys-page__security">
        <h3 className="api-keys-page__security-title">
          <Shield size={16} />
          Security Best Practices
        </h3>
        <ul className="api-keys-page__security-list">
          <li>Never expose API keys in client-side code or version control.</li>
          <li>Use environment variables to store keys in production.</li>
          <li>Use the minimum permissions needed for each integration.</li>
          <li>Set expiration dates on keys used for temporary access.</li>
          <li>Revoke keys immediately if you suspect they have been compromised.</li>
        </ul>
      </div>
    </div>
  )
}

export default ApiKeysPage
