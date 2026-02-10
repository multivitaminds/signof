import { useState, useCallback } from 'react'
import { Trash2, UserPlus } from 'lucide-react'
import { useSettingsStore } from '../stores/useSettingsStore'
import { MemberRole } from '../types'
import type { MemberRole as MemberRoleType } from '../types'
import './MembersSettings.css'

export default function MembersSettings() {
  const members = useSettingsStore((s) => s.members)
  const addMember = useSettingsStore((s) => s.addMember)
  const removeMember = useSettingsStore((s) => s.removeMember)
  const updateMemberRole = useSettingsStore((s) => s.updateMemberRole)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')

  const handleInvite = useCallback(() => {
    if (!inviteName.trim() || !inviteEmail.trim()) return
    addMember(inviteName.trim(), inviteEmail.trim(), MemberRole.Member)
    setInviteName('')
    setInviteEmail('')
    setShowInvite(false)
  }, [inviteName, inviteEmail, addMember])

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const roleColors: Record<string, string> = {
    [MemberRole.Owner]: '#4F46E5',
    [MemberRole.Admin]: '#059669',
    [MemberRole.Member]: '#6B7280',
    [MemberRole.Guest]: '#D97706',
  }

  return (
    <div className="members-settings">
      <div className="members-settings__header">
        <div>
          <h1 className="members-settings__title">Members</h1>
          <p className="members-settings__subtitle">{members.length} member{members.length !== 1 ? 's' : ''} in this workspace</p>
        </div>
        <button className="btn-primary" onClick={() => setShowInvite(true)}>
          <UserPlus size={16} /> Invite
        </button>
      </div>

      {showInvite && (
        <div className="members-settings__invite">
          <input
            className="members-settings__input"
            type="text"
            placeholder="Name"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />
          <input
            className="members-settings__input"
            type="email"
            placeholder="Email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleInvite() }}
          />
          <button className="btn-primary" onClick={handleInvite}>Send Invite</button>
          <button className="btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
        </div>
      )}

      <div className="members-settings__list">
        {members.map((member) => (
          <div key={member.id} className="members-settings__member">
            <div className="members-settings__avatar" style={{ backgroundColor: roleColors[member.role] }}>
              {getInitials(member.name)}
            </div>
            <div className="members-settings__info">
              <span className="members-settings__name">{member.name}</span>
              <span className="members-settings__email">{member.email}</span>
            </div>
            <select
              className="members-settings__role-select"
              value={member.role}
              onChange={(e) => updateMemberRole(member.id, e.target.value as MemberRoleType)}
              disabled={member.role === MemberRole.Owner}
            >
              <option value={MemberRole.Owner}>Owner</option>
              <option value={MemberRole.Admin}>Admin</option>
              <option value={MemberRole.Member}>Member</option>
              <option value={MemberRole.Guest}>Guest</option>
            </select>
            {member.role !== MemberRole.Owner && (
              <button
                className="members-settings__remove"
                onClick={() => removeMember(member.id)}
                title="Remove member"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
