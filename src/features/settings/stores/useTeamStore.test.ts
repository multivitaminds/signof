import { useTeamStore } from './useTeamStore'
import { TeamRole, MemberStatus, InviteStatus } from '../types/team'

function resetStore() {
  useTeamStore.setState({
    team: {
      id: 'team-test',
      name: 'Test Workspace',
      members: [
        {
          id: 'owner-1',
          name: 'Owner User',
          email: 'owner@test.com',
          role: TeamRole.Owner,
          joinedAt: '2024-01-01T00:00:00Z',
          lastActiveAt: '2025-01-01T00:00:00Z',
          status: MemberStatus.Active,
        },
        {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@test.com',
          role: TeamRole.Admin,
          joinedAt: '2024-02-01T00:00:00Z',
          lastActiveAt: '2025-01-01T00:00:00Z',
          status: MemberStatus.Active,
        },
        {
          id: 'member-1',
          name: 'Regular User',
          email: 'regular@test.com',
          role: TeamRole.Member,
          joinedAt: '2024-03-01T00:00:00Z',
          lastActiveAt: '2025-01-01T00:00:00Z',
          status: MemberStatus.Active,
        },
      ],
      invites: [
        {
          id: 'inv-1',
          email: 'pending@test.com',
          role: TeamRole.Member,
          invitedBy: 'Owner User',
          invitedAt: '2025-01-01T00:00:00Z',
          expiresAt: '2025-01-15T00:00:00Z',
          status: InviteStatus.Pending,
        },
      ],
      activities: [],
      createdAt: '2024-01-01T00:00:00Z',
    },
  })
}

describe('useTeamStore', () => {
  beforeEach(() => {
    resetStore()
  })

  it('initializes with members and invites', () => {
    const state = useTeamStore.getState()
    expect(state.team.members).toHaveLength(3)
    expect(state.team.invites).toHaveLength(1)
  })

  it('adds a new member and logs activity', () => {
    const { addMember } = useTeamStore.getState()
    addMember('New Person', 'new@test.com', TeamRole.Member)

    const state = useTeamStore.getState()
    expect(state.team.members).toHaveLength(4)
    const added = state.team.members.find((m) => m.email === 'new@test.com')
    expect(added).toBeDefined()
    expect(added!.name).toBe('New Person')
    expect(added!.role).toBe(TeamRole.Member)
    expect(added!.status).toBe(MemberStatus.Active)
    expect(state.team.activities).toHaveLength(1)
    expect(state.team.activities[0]!.description).toContain('New Person')
  })

  it('updates member role but prevents changing owner role', () => {
    const { updateMemberRole } = useTeamStore.getState()

    updateMemberRole('admin-1', TeamRole.Member)
    let state = useTeamStore.getState()
    const admin = state.team.members.find((m) => m.id === 'admin-1')
    expect(admin!.role).toBe(TeamRole.Member)

    updateMemberRole('owner-1', TeamRole.Admin)
    state = useTeamStore.getState()
    const owner = state.team.members.find((m) => m.id === 'owner-1')
    expect(owner!.role).toBe(TeamRole.Owner)
  })

  it('removes a member but prevents removing owner', () => {
    const { removeMember } = useTeamStore.getState()

    removeMember('member-1')
    let state = useTeamStore.getState()
    expect(state.team.members).toHaveLength(2)
    expect(state.team.members.find((m) => m.id === 'member-1')).toBeUndefined()

    removeMember('owner-1')
    state = useTeamStore.getState()
    expect(state.team.members).toHaveLength(2)
    expect(state.team.members.find((m) => m.id === 'owner-1')).toBeDefined()
  })

  it('deactivates a member and prevents deactivating owner', () => {
    const { deactivateMember } = useTeamStore.getState()

    deactivateMember('member-1')
    let state = useTeamStore.getState()
    const member = state.team.members.find((m) => m.id === 'member-1')
    expect(member!.status).toBe(MemberStatus.Deactivated)

    deactivateMember('owner-1')
    state = useTeamStore.getState()
    const owner = state.team.members.find((m) => m.id === 'owner-1')
    expect(owner!.status).toBe(MemberStatus.Active)
  })

  it('reactivates a deactivated member', () => {
    const { deactivateMember, reactivateMember } = useTeamStore.getState()
    deactivateMember('admin-1')

    let state = useTeamStore.getState()
    expect(state.team.members.find((m) => m.id === 'admin-1')!.status).toBe(MemberStatus.Deactivated)

    reactivateMember('admin-1')
    state = useTeamStore.getState()
    expect(state.team.members.find((m) => m.id === 'admin-1')!.status).toBe(MemberStatus.Active)
  })

  it('creates a pending invite and logs activity', () => {
    const { inviteMember } = useTeamStore.getState()
    inviteMember('invitee@test.com', TeamRole.Guest)

    const state = useTeamStore.getState()
    expect(state.team.invites).toHaveLength(2)
    const invite = state.team.invites.find((i) => i.email === 'invitee@test.com')
    expect(invite).toBeDefined()
    expect(invite!.role).toBe(TeamRole.Guest)
    expect(invite!.status).toBe(InviteStatus.Pending)
    expect(state.team.activities.length).toBeGreaterThan(0)
  })

  it('cancels an invite', () => {
    const { cancelInvite } = useTeamStore.getState()
    cancelInvite('inv-1')

    const state = useTeamStore.getState()
    expect(state.team.invites).toHaveLength(0)
    expect(state.team.activities[0]!.description).toContain('pending@test.com')
  })

  it('resends an invite with updated timestamps', () => {
    const { resendInvite } = useTeamStore.getState()
    const originalInvite = useTeamStore.getState().team.invites[0]!
    const originalInvitedAt = originalInvite.invitedAt

    resendInvite('inv-1')

    const state = useTeamStore.getState()
    const updated = state.team.invites.find((i) => i.id === 'inv-1')
    expect(updated).toBeDefined()
    expect(updated!.invitedAt).not.toBe(originalInvitedAt)
  })

  it('returns member by id via getMemberById', () => {
    const { getMemberById } = useTeamStore.getState()
    const member = getMemberById('admin-1')
    expect(member).toBeDefined()
    expect(member!.name).toBe('Admin User')

    const missing = getMemberById('nonexistent')
    expect(missing).toBeUndefined()
  })

  it('returns members by role via getMembersByRole', () => {
    const store = useTeamStore.getState()
    store.addMember('Another Member', 'another@test.com', TeamRole.Member)

    const { getMembersByRole } = useTeamStore.getState()
    const members = getMembersByRole(TeamRole.Member)
    expect(members.length).toBeGreaterThanOrEqual(2)
    expect(members.every((m) => m.role === TeamRole.Member)).toBe(true)

    const owners = getMembersByRole(TeamRole.Owner)
    expect(owners).toHaveLength(1)
  })
})
