import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TeamRole, InviteStatus, MemberStatus, ActivityAction } from '../types/team'
import type { Team, TeamMember, TeamInvite, TeamActivity } from '../types/team'

function rid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function addActivity(
  team: Team,
  action: ActivityAction,
  description: string,
  actorName?: string,
): TeamActivity[] {
  const entry: TeamActivity = {
    id: rid(),
    action,
    description,
    timestamp: new Date().toISOString(),
    actorName,
  }
  const updated = [entry, ...team.activities]
  return updated.slice(0, 20)
}

const SAMPLE_TEAM: Team = {
  id: 'team-1',
  name: 'SignOf Workspace',
  members: [
    {
      id: 'member-1',
      name: 'Alex Johnson',
      email: 'alex@signof.com',
      role: TeamRole.Owner,
      joinedAt: '2024-01-15T00:00:00Z',
      lastActiveAt: '2025-01-10T09:30:00Z',
      status: MemberStatus.Active,
    },
    {
      id: 'member-2',
      name: 'Sarah Chen',
      email: 'sarah@signof.com',
      role: TeamRole.Admin,
      joinedAt: '2024-02-20T00:00:00Z',
      lastActiveAt: '2025-01-09T14:22:00Z',
      status: MemberStatus.Active,
    },
    {
      id: 'member-3',
      name: 'Mike Rivera',
      email: 'mike@signof.com',
      role: TeamRole.Member,
      joinedAt: '2024-03-10T00:00:00Z',
      lastActiveAt: '2025-01-08T11:45:00Z',
      status: MemberStatus.Active,
    },
    {
      id: 'member-4',
      name: 'Emma Davis',
      email: 'emma@signof.com',
      role: TeamRole.Member,
      joinedAt: '2024-04-05T00:00:00Z',
      lastActiveAt: '2025-01-07T16:10:00Z',
      status: MemberStatus.Active,
    },
  ],
  invites: [
    {
      id: 'invite-1',
      email: 'chris@external.com',
      role: TeamRole.Guest,
      invitedBy: 'Alex Johnson',
      invitedAt: '2025-01-05T10:00:00Z',
      expiresAt: '2025-01-19T10:00:00Z',
      status: InviteStatus.Pending,
    },
  ],
  activities: [
    {
      id: 'act-1',
      action: ActivityAction.InviteSent,
      description: 'Invite sent to chris@external.com as Guest',
      timestamp: '2025-01-05T10:00:00Z',
      actorName: 'Alex Johnson',
    },
    {
      id: 'act-2',
      action: ActivityAction.MemberJoined,
      description: 'Emma Davis joined as Member',
      timestamp: '2024-04-05T00:00:00Z',
      actorName: 'Emma Davis',
    },
    {
      id: 'act-3',
      action: ActivityAction.MemberJoined,
      description: 'Mike Rivera joined as Member',
      timestamp: '2024-03-10T00:00:00Z',
      actorName: 'Mike Rivera',
    },
  ],
  createdAt: '2024-01-15T00:00:00Z',
}

interface TeamState {
  team: Team

  addMember: (name: string, email: string, role: TeamRole) => void
  updateMemberRole: (memberId: string, role: TeamRole) => void
  removeMember: (memberId: string) => void
  deactivateMember: (memberId: string) => void
  reactivateMember: (memberId: string) => void
  inviteMember: (email: string, role: TeamRole) => void
  cancelInvite: (inviteId: string) => void
  resendInvite: (inviteId: string) => void
  getMemberById: (id: string) => TeamMember | undefined
  getMembersByRole: (role: TeamRole) => TeamMember[]
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      team: SAMPLE_TEAM,

      addMember: (name, email, role) => {
        const member: TeamMember = {
          id: rid(),
          name,
          email,
          role,
          joinedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          status: MemberStatus.Active,
        }
        set((s) => ({
          team: {
            ...s.team,
            members: [...s.team.members, member],
            activities: addActivity(s.team, ActivityAction.MemberJoined, `${name} joined as ${role}`),
          },
        }))
      },

      updateMemberRole: (memberId, role) => {
        const state = get()
        const member = state.team.members.find((m) => m.id === memberId)
        if (!member || member.role === TeamRole.Owner) return

        set((s) => ({
          team: {
            ...s.team,
            members: s.team.members.map((m) =>
              m.id === memberId ? { ...m, role } : m
            ),
            activities: addActivity(
              s.team,
              ActivityAction.RoleChanged,
              `${member.name} role changed from ${member.role} to ${role}`,
            ),
          },
        }))
      },

      removeMember: (memberId) => {
        const state = get()
        const member = state.team.members.find((m) => m.id === memberId)
        if (!member || member.role === TeamRole.Owner) return

        set((s) => ({
          team: {
            ...s.team,
            members: s.team.members.filter((m) => m.id !== memberId),
            activities: addActivity(
              s.team,
              ActivityAction.MemberRemoved,
              `${member.name} was removed from the team`,
            ),
          },
        }))
      },

      deactivateMember: (memberId) => {
        const state = get()
        const member = state.team.members.find((m) => m.id === memberId)
        if (!member || member.role === TeamRole.Owner) return

        set((s) => ({
          team: {
            ...s.team,
            members: s.team.members.map((m) =>
              m.id === memberId ? { ...m, status: MemberStatus.Deactivated } : m
            ),
            activities: addActivity(
              s.team,
              ActivityAction.MemberDeactivated,
              `${member.name} was deactivated`,
            ),
          },
        }))
      },

      reactivateMember: (memberId) => {
        const state = get()
        const member = state.team.members.find((m) => m.id === memberId)
        if (!member) return

        set((s) => ({
          team: {
            ...s.team,
            members: s.team.members.map((m) =>
              m.id === memberId ? { ...m, status: MemberStatus.Active } : m
            ),
            activities: addActivity(
              s.team,
              ActivityAction.MemberReactivated,
              `${member.name} was reactivated`,
            ),
          },
        }))
      },

      inviteMember: (email, role) => {
        const invite: TeamInvite = {
          id: rid(),
          email,
          role,
          invitedBy: 'Current User',
          invitedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: InviteStatus.Pending,
        }
        set((s) => ({
          team: {
            ...s.team,
            invites: [...s.team.invites, invite],
            activities: addActivity(
              s.team,
              ActivityAction.InviteSent,
              `Invite sent to ${email} as ${role}`,
            ),
          },
        }))
      },

      cancelInvite: (inviteId) => {
        const state = get()
        const invite = state.team.invites.find((i) => i.id === inviteId)
        if (!invite) return

        set((s) => ({
          team: {
            ...s.team,
            invites: s.team.invites.filter((i) => i.id !== inviteId),
            activities: addActivity(
              s.team,
              ActivityAction.InviteCancelled,
              `Invite to ${invite.email} was cancelled`,
            ),
          },
        }))
      },

      resendInvite: (inviteId) => {
        const state = get()
        const invite = state.team.invites.find((i) => i.id === inviteId)
        if (!invite) return

        set((s) => ({
          team: {
            ...s.team,
            invites: s.team.invites.map((i) =>
              i.id === inviteId
                ? {
                    ...i,
                    invitedAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                  }
                : i
            ),
            activities: addActivity(
              s.team,
              ActivityAction.InviteResent,
              `Invite to ${invite.email} was resent`,
            ),
          },
        }))
      },

      getMemberById: (id) => {
        return get().team.members.find((m) => m.id === id)
      },

      getMembersByRole: (role) => {
        return get().team.members.filter((m) => m.role === role)
      },
    }),
    { name: 'signof-team-storage' }
  )
)
