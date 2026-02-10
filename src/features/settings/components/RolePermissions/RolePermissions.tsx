import { useState, useCallback } from 'react'
import { Check, X, ChevronDown, ChevronUp, Shield } from 'lucide-react'
import { TeamRole, ROLE_LABELS } from '../../types/team'
import './RolePermissions.css'

interface Permission {
  key: string
  label: string
  allowed: Record<string, boolean>
}

const PERMISSIONS: Permission[] = [
  {
    key: 'manage_team',
    label: 'Manage team',
    allowed: { owner: true, admin: true, member: false, guest: false },
  },
  {
    key: 'manage_billing',
    label: 'Manage billing',
    allowed: { owner: true, admin: false, member: false, guest: false },
  },
  {
    key: 'create_content',
    label: 'Create content',
    allowed: { owner: true, admin: true, member: true, guest: false },
  },
  {
    key: 'edit_content',
    label: 'Edit content',
    allowed: { owner: true, admin: true, member: true, guest: false },
  },
  {
    key: 'view_content',
    label: 'View content',
    allowed: { owner: true, admin: true, member: true, guest: true },
  },
  {
    key: 'delete_content',
    label: 'Delete content',
    allowed: { owner: true, admin: true, member: false, guest: false },
  },
  {
    key: 'manage_integrations',
    label: 'Manage integrations',
    allowed: { owner: true, admin: true, member: false, guest: false },
  },
  {
    key: 'manage_settings',
    label: 'Manage settings',
    allowed: { owner: true, admin: true, member: false, guest: false },
  },
]

const ROLES: Array<typeof TeamRole[keyof typeof TeamRole]> = [
  TeamRole.Owner,
  TeamRole.Admin,
  TeamRole.Member,
  TeamRole.Guest,
]

export default function RolePermissions() {
  const [expanded, setExpanded] = useState(false)

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  return (
    <div className="role-permissions">
      <button
        className="role-permissions__toggle"
        onClick={toggleExpanded}
        aria-expanded={expanded}
        aria-controls="role-permissions-panel"
      >
        <div className="role-permissions__toggle-left">
          <Shield size={18} />
          <span className="role-permissions__toggle-title">Role Permissions</span>
        </div>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {expanded && (
        <div className="role-permissions__panel" id="role-permissions-panel">
          <div className="role-permissions__table" role="table" aria-label="Role permissions matrix">
            {/* Header */}
            <div className="role-permissions__header" role="row">
              <span className="role-permissions__label-col" role="columnheader">
                Permission
              </span>
              {ROLES.map((role) => (
                <span
                  key={role}
                  className="role-permissions__role-col"
                  role="columnheader"
                >
                  {ROLE_LABELS[role]}
                </span>
              ))}
            </div>

            {/* Rows */}
            {PERMISSIONS.map((perm) => (
              <div key={perm.key} className="role-permissions__row" role="row">
                <span className="role-permissions__label-col" role="cell">
                  {perm.label}
                </span>
                {ROLES.map((role) => (
                  <span
                    key={role}
                    className="role-permissions__role-col"
                    role="cell"
                    aria-label={`${perm.label} for ${ROLE_LABELS[role]}: ${perm.allowed[role] ? 'Allowed' : 'Not allowed'}`}
                  >
                    {perm.allowed[role] ? (
                      <Check size={16} className="role-permissions__icon role-permissions__icon--check" />
                    ) : (
                      <X size={16} className="role-permissions__icon role-permissions__icon--x" />
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
