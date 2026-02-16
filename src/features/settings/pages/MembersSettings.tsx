import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  UserPlus,
  Search,
  MoreHorizontal,
  Trash2,
  UserX,
  UserCheck,
  Send,
  X,
  Mail,
  Clock,
} from 'lucide-react'
import { useTeamStore } from '../stores/useTeamStore'
import { TeamRole, ROLE_LABELS, MemberStatus, InviteStatus } from '../types/team'
import type { TeamRole as TeamRoleType, TeamMember } from '../types/team'
import Avatar from '../../../components/ui/Avatar'
import Input from '../../../components/ui/Input'
import './MembersSettings.css'

const ROLE_BADGE_CLASSES: Record<TeamRoleType, string> = {
  owner: 'members-settings__role-badge--owner',
  admin: 'members-settings__role-badge--admin',
  member: 'members-settings__role-badge--member',
  guest: 'members-settings__role-badge--guest',
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getRelativeTime(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return formatDate(isoString)
}

export default function MembersSettings() {
  const team = useTeamStore((s) => s.team)
  const updateMemberRole = useTeamStore((s) => s.updateMemberRole)
  const removeMember = useTeamStore((s) => s.removeMember)
  const deactivateMember = useTeamStore((s) => s.deactivateMember)
  const reactivateMember = useTeamStore((s) => s.reactivateMember)
  const inviteMember = useTeamStore((s) => s.inviteMember)
  const cancelInvite = useTeamStore((s) => s.cancelInvite)
  const resendInvite = useTeamStore((s) => s.resendInvite)

  const [searchQuery, setSearchQuery] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamRoleType>(TeamRole.Member)
  const [inviteError, setInviteError] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const activeMembers = useMemo(
    () => team.members.filter((m) => m.status !== MemberStatus.Deactivated),
    [team.members],
  )

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return team.members
    const q = searchQuery.toLowerCase()
    return team.members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q),
    )
  }, [team.members, searchQuery])

  const pendingInvites = useMemo(
    () => team.invites.filter((i) => i.status === InviteStatus.Pending),
    [team.invites],
  )

  // Close action menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenuId])

  const handleSendInvites = useCallback(() => {
    const emails = inviteEmails
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)

    if (emails.length === 0) {
      setInviteError('Please enter at least one email address')
      return
    }

    const invalid = emails.filter((e) => !isValidEmail(e))
    if (invalid.length > 0) {
      setInviteError(`Invalid email(s): ${invalid.join(', ')}`)
      return
    }

    emails.forEach((email) => inviteMember(email, inviteRole))
    setInviteEmails('')
    setInviteRole(TeamRole.Member)
    setInviteError('')
    setShowInviteModal(false)
  }, [inviteEmails, inviteRole, inviteMember])

  const handleRoleChange = useCallback(
    (memberId: string, role: TeamRoleType) => {
      updateMemberRole(memberId, role)
    },
    [updateMemberRole],
  )

  const handleRemove = useCallback(
    (memberId: string) => {
      removeMember(memberId)
      setOpenMenuId(null)
    },
    [removeMember],
  )

  const handleDeactivate = useCallback(
    (memberId: string) => {
      deactivateMember(memberId)
      setOpenMenuId(null)
    },
    [deactivateMember],
  )

  const handleReactivate = useCallback(
    (memberId: string) => {
      reactivateMember(memberId)
      setOpenMenuId(null)
    },
    [reactivateMember],
  )

  const renderStatusBadge = (member: TeamMember) => {
    if (member.status === MemberStatus.Deactivated) {
      return <span className="members-settings__status-badge members-settings__status-badge--deactivated">Deactivated</span>
    }
    if (member.status === MemberStatus.Invited) {
      return <span className="members-settings__status-badge members-settings__status-badge--invited">Invited</span>
    }
    return null
  }

  return (
    <div className="members-settings">
      {/* Header */}
      <div className="members-settings__header">
        <div>
          <h1 className="members-settings__title">Team Members</h1>
          <p className="members-settings__subtitle">
            {activeMembers.length} active member{activeMembers.length !== 1 ? 's' : ''} in{' '}
            {team.name}
          </p>
        </div>
        <button
          className="btn-primary members-settings__invite-btn"
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus size={16} /> Invite
        </button>
      </div>

      {/* Search */}
      <div className="members-settings__search">
        <Input
          leftIcon={<Search size={16} />}
          placeholder="Search members by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search members"
          fullWidth
          size="md"
        />
      </div>

      {/* Members Table */}
      <div className="members-settings__table">
        <div className="members-settings__table-header">
          <span className="members-settings__col-member">Member</span>
          <span className="members-settings__col-role">Role</span>
          <span className="members-settings__col-status">Status</span>
          <span className="members-settings__col-active">Last Active</span>
          <span className="members-settings__col-actions" />
        </div>
        <div className="members-settings__table-body">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`members-settings__row ${
                member.status === MemberStatus.Deactivated
                  ? 'members-settings__row--deactivated'
                  : ''
              }`}
            >
              {/* Avatar + Info */}
              <div className="members-settings__col-member">
                <Avatar name={member.name} size="sm" className="members-settings__avatar" />
                <div className="members-settings__info">
                  <span className="members-settings__name">{member.name}</span>
                  <span className="members-settings__email">{member.email}</span>
                </div>
              </div>

              {/* Role */}
              <div className="members-settings__col-role">
                {member.role === TeamRole.Owner ? (
                  <span className={`members-settings__role-badge ${ROLE_BADGE_CLASSES[member.role]}`}>
                    {ROLE_LABELS[member.role]}
                  </span>
                ) : (
                  <select
                    className="members-settings__role-select"
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRoleType)}
                    aria-label={`Role for ${member.name}`}
                  >
                    <option value={TeamRole.Admin}>{ROLE_LABELS[TeamRole.Admin]}</option>
                    <option value={TeamRole.Member}>{ROLE_LABELS[TeamRole.Member]}</option>
                    <option value={TeamRole.Guest}>{ROLE_LABELS[TeamRole.Guest]}</option>
                  </select>
                )}
              </div>

              {/* Status */}
              <div className="members-settings__col-status">
                {renderStatusBadge(member)}
              </div>

              {/* Last Active */}
              <div className="members-settings__col-active">
                <span className="members-settings__last-active">
                  {getRelativeTime(member.lastActiveAt)}
                </span>
              </div>

              {/* Actions */}
              <div className="members-settings__col-actions">
                {member.role !== TeamRole.Owner && (
                  <div className="members-settings__actions-wrapper" ref={openMenuId === member.id ? menuRef : null}>
                    <button
                      className="members-settings__actions-trigger"
                      onClick={() =>
                        setOpenMenuId(openMenuId === member.id ? null : member.id)
                      }
                      aria-label={`Actions for ${member.name}`}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenuId === member.id && (
                      <div className="members-settings__actions-menu" role="menu">
                        {member.status === MemberStatus.Active ? (
                          <button
                            className="members-settings__action-item"
                            onClick={() => handleDeactivate(member.id)}
                            role="menuitem"
                          >
                            <UserX size={14} /> Deactivate
                          </button>
                        ) : (
                          <button
                            className="members-settings__action-item"
                            onClick={() => handleReactivate(member.id)}
                            role="menuitem"
                          >
                            <UserCheck size={14} /> Reactivate
                          </button>
                        )}
                        <button
                          className="members-settings__action-item members-settings__action-item--danger"
                          onClick={() => handleRemove(member.id)}
                          role="menuitem"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="members-settings__empty">
              No members match your search.
            </div>
          )}
        </div>
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="members-settings__invites-section">
          <h2 className="members-settings__section-title">
            <Mail size={18} /> Pending Invites ({pendingInvites.length})
          </h2>
          <div className="members-settings__invites-list">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="members-settings__invite-row">
                <div className="members-settings__invite-info">
                  <span className="members-settings__invite-email">{invite.email}</span>
                  <span className={`members-settings__role-badge ${ROLE_BADGE_CLASSES[invite.role]}`}>
                    {ROLE_LABELS[invite.role]}
                  </span>
                </div>
                <div className="members-settings__invite-meta">
                  <span className="members-settings__invite-date">
                    <Clock size={12} /> Sent {formatDate(invite.invitedAt)}
                  </span>
                  <span className="members-settings__invite-expiry">
                    Expires {formatDate(invite.expiresAt)}
                  </span>
                </div>
                <div className="members-settings__invite-actions">
                  <button
                    className="btn-ghost members-settings__invite-action"
                    onClick={() => resendInvite(invite.id)}
                    title="Resend invite"
                  >
                    <Send size={14} /> Resend
                  </button>
                  <button
                    className="btn-ghost members-settings__invite-action members-settings__invite-action--danger"
                    onClick={() => cancelInvite(invite.id)}
                    title="Cancel invite"
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInviteModal(false)
          }}
        >
          <div className="modal-content members-settings__modal">
            <div className="modal-header">
              <h2>Invite Team Members</h2>
              <button
                className="modal-close"
                onClick={() => setShowInviteModal(false)}
                aria-label="Close invite modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="members-settings__modal-body">
              <label className="members-settings__field-label">
                Email addresses
                <span className="members-settings__field-hint">
                  Separate multiple emails with commas
                </span>
              </label>
              <textarea
                className="members-settings__email-input"
                placeholder="colleague@company.com, another@company.com"
                value={inviteEmails}
                onChange={(e) => {
                  setInviteEmails(e.target.value)
                  setInviteError('')
                }}
                rows={3}
                aria-label="Invite emails"
              />
              {inviteError && (
                <p className="members-settings__error" role="alert">
                  {inviteError}
                </p>
              )}

              <label className="members-settings__field-label members-settings__role-label">
                Role
              </label>
              <div className="members-settings__role-options" role="radiogroup" aria-label="Select role">
                {[TeamRole.Admin, TeamRole.Member, TeamRole.Guest].map((role) => (
                  <label
                    key={role}
                    className={`members-settings__role-option ${
                      inviteRole === role ? 'members-settings__role-option--selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="invite-role"
                      value={role}
                      checked={inviteRole === role}
                      onChange={() => setInviteRole(role)}
                      className="members-settings__role-radio"
                    />
                    <span
                      className={`members-settings__role-badge ${ROLE_BADGE_CLASSES[role]}`}
                    >
                      {ROLE_LABELS[role]}
                    </span>
                  </label>
                ))}
              </div>

              <div className="members-settings__modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSendInvites}>
                  <Send size={16} /> Send Invite{inviteEmails.includes(',') ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
