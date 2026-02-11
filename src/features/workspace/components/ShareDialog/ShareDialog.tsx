import { useState, useCallback } from 'react'
import { X, Copy, Check, Link2, Globe, Lock, Trash2 } from 'lucide-react'
import './ShareDialog.css'

// ─── Types ──────────────────────────────────────────────────────────

export const Permission = {
  View: 'view',
  Edit: 'edit',
  FullAccess: 'full_access',
} as const

export type Permission = (typeof Permission)[keyof typeof Permission]

export interface SharedUser {
  id: string
  email: string
  name: string
  permission: Permission
}

interface ShareDialogProps {
  isOpen: boolean
  pageTitle: string
  onClose: () => void
}

// ─── Helper ─────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const PERMISSION_LABELS: Record<Permission, string> = {
  view: 'Can view',
  edit: 'Can edit',
  full_access: 'Full access',
}

// ─── Component ──────────────────────────────────────────────────────

export default function ShareDialog({ isOpen, pageTitle, onClose }: ShareDialogProps) {
  const [email, setEmail] = useState('')
  const [selectedPermission, setSelectedPermission] = useState<Permission>(Permission.View)
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([
    { id: 'u1', email: 'alex@example.com', name: 'Alex Kim', permission: Permission.Edit },
    { id: 'u2', email: 'maya@example.com', name: 'Maya Chen', permission: Permission.View },
  ])
  const [linkAccess, setLinkAccess] = useState<'restricted' | 'anyone'>('restricted')
  const [linkPermission, setLinkPermission] = useState<Permission>(Permission.View)
  const [copied, setCopied] = useState(false)

  const handleInvite = useCallback(() => {
    if (!email.trim()) return

    const newUser: SharedUser = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      email: email.trim(),
      name: email.split('@')[0] ?? email,
      permission: selectedPermission,
    }

    setSharedUsers((prev) => [...prev, newUser])
    setEmail('')
  }, [email, selectedPermission])

  const handleRemoveUser = useCallback((userId: string) => {
    setSharedUsers((prev) => prev.filter((u) => u.id !== userId))
  }, [])

  const handleChangePermission = useCallback((userId: string, permission: Permission) => {
    setSharedUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, permission } : u))
    )
  }, [])

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}`
    navigator.clipboard.writeText(url).catch(() => {
      // Fallback: do nothing, the visual feedback is enough
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleInvite()
      }
    },
    [handleInvite]
  )

  if (!isOpen) return null

  return (
    <div className="share-dialog__overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Share ${pageTitle}`}>
      <div className="share-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="share-dialog__header">
          <h3 className="share-dialog__title">Share &ldquo;{pageTitle}&rdquo;</h3>
          <button
            className="share-dialog__close"
            onClick={onClose}
            aria-label="Close share dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Invite section */}
        <div className="share-dialog__invite">
          <div className="share-dialog__invite-row">
            <input
              type="email"
              className="share-dialog__input"
              placeholder="Add people by email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <select
              className="share-dialog__permission-select"
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value as Permission)}
              aria-label="Permission level"
            >
              <option value={Permission.View}>Can view</option>
              <option value={Permission.Edit}>Can edit</option>
              <option value={Permission.FullAccess}>Full access</option>
            </select>
            <button
              className="share-dialog__invite-btn btn-primary"
              onClick={handleInvite}
              disabled={!email.trim()}
            >
              Invite
            </button>
          </div>
        </div>

        {/* Shared users list */}
        <div className="share-dialog__users">
          <div className="share-dialog__users-header">
            <span className="share-dialog__users-label">People with access</span>
            <span className="share-dialog__users-count">{sharedUsers.length}</span>
          </div>

          {/* Current user (owner) */}
          <div className="share-dialog__user">
            <div className="share-dialog__user-avatar share-dialog__user-avatar--owner">
              Y
            </div>
            <div className="share-dialog__user-info">
              <span className="share-dialog__user-name">You (Owner)</span>
              <span className="share-dialog__user-email">you@signof.app</span>
            </div>
            <span className="share-dialog__user-permission-label">Owner</span>
          </div>

          {sharedUsers.map((user) => (
            <div key={user.id} className="share-dialog__user">
              <div className="share-dialog__user-avatar">
                {getInitials(user.name)}
              </div>
              <div className="share-dialog__user-info">
                <span className="share-dialog__user-name">{user.name}</span>
                <span className="share-dialog__user-email">{user.email}</span>
              </div>
              <select
                className="share-dialog__user-permission"
                value={user.permission}
                onChange={(e) => handleChangePermission(user.id, e.target.value as Permission)}
                aria-label={`Change permission for ${user.name}`}
              >
                <option value={Permission.View}>Can view</option>
                <option value={Permission.Edit}>Can edit</option>
                <option value={Permission.FullAccess}>Full access</option>
              </select>
              <button
                className="share-dialog__user-remove"
                onClick={() => handleRemoveUser(user.id)}
                aria-label={`Remove ${user.name}`}
                title="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Link access section */}
        <div className="share-dialog__link-section">
          <div className="share-dialog__link-toggle">
            <div className="share-dialog__link-icon">
              {linkAccess === 'anyone' ? <Globe size={16} /> : <Lock size={16} />}
            </div>
            <div className="share-dialog__link-info">
              <span className="share-dialog__link-label">
                {linkAccess === 'anyone' ? 'Anyone with the link' : 'Restricted'}
              </span>
              <span className="share-dialog__link-description">
                {linkAccess === 'anyone'
                  ? `Anyone with the link can ${linkPermission === 'edit' ? 'edit' : 'view'}`
                  : 'Only people with access can open'}
              </span>
            </div>
            <div className="share-dialog__link-controls">
              {linkAccess === 'anyone' && (
                <select
                  className="share-dialog__user-permission"
                  value={linkPermission}
                  onChange={(e) => setLinkPermission(e.target.value as Permission)}
                  aria-label="Link permission"
                >
                  <option value={Permission.View}>Can view</option>
                  <option value={Permission.Edit}>Can edit</option>
                </select>
              )}
              <button
                className={`share-dialog__link-access-btn ${linkAccess === 'anyone' ? 'share-dialog__link-access-btn--active' : ''}`}
                onClick={() => setLinkAccess((prev) => (prev === 'anyone' ? 'restricted' : 'anyone'))}
                aria-label={linkAccess === 'anyone' ? 'Restrict link access' : 'Allow anyone with link'}
              >
                {linkAccess === 'anyone' ? 'Restrict' : 'Enable'}
              </button>
            </div>
          </div>
        </div>

        {/* Copy link button */}
        <div className="share-dialog__footer">
          <button
            className="share-dialog__copy-btn"
            onClick={handleCopyLink}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <div className="share-dialog__link-preview">
            <Link2 size={12} />
            <span>{window.location.origin}/pages/...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export the permission labels for tests
export { PERMISSION_LABELS }
