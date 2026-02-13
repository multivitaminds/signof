import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MembersSettings from './MembersSettings'
import { useTeamStore } from '../stores/useTeamStore'
import { TeamRole, MemberStatus, InviteStatus } from '../types/team'
import type { Team } from '../types/team'

const sampleTeam: Team = {
  id: 'team-1',
  name: 'Test Workspace',
  members: [
    { id: 'member-1', name: 'Alex Johnson', email: 'alex@orchestree.com', role: TeamRole.Owner, joinedAt: '2024-01-15T00:00:00Z', lastActiveAt: '2025-01-10T09:30:00Z', status: MemberStatus.Active },
    { id: 'member-2', name: 'Sarah Chen', email: 'sarah@orchestree.com', role: TeamRole.Admin, joinedAt: '2024-02-20T00:00:00Z', lastActiveAt: '2025-01-09T14:22:00Z', status: MemberStatus.Active },
    { id: 'member-3', name: 'Mike Rivera', email: 'mike@orchestree.com', role: TeamRole.Member, joinedAt: '2024-03-10T00:00:00Z', lastActiveAt: '2025-01-08T11:45:00Z', status: MemberStatus.Active },
    { id: 'member-4', name: 'Emma Davis', email: 'emma@orchestree.com', role: TeamRole.Member, joinedAt: '2024-04-05T00:00:00Z', lastActiveAt: '2025-01-07T16:10:00Z', status: MemberStatus.Deactivated },
  ],
  invites: [
    { id: 'inv-1', email: 'chris@external.com', role: TeamRole.Guest, invitedBy: 'Alex Johnson', invitedAt: '2025-01-05T10:00:00Z', expiresAt: '2025-01-19T10:00:00Z', status: InviteStatus.Pending },
  ],
  activities: [],
  createdAt: '2024-01-01T00:00:00Z',
}

describe('MembersSettings', () => {
  beforeEach(() => {
    useTeamStore.setState({ team: { ...sampleTeam, members: [...sampleTeam.members], invites: [...sampleTeam.invites], activities: [] } })
  })

  it('renders the title and active member count', () => {
    render(<MembersSettings />)
    expect(screen.getByText('Team Members')).toBeInTheDocument()
    // 3 active members (Emma is deactivated)
    expect(screen.getByText(/3 active members? in Test Workspace/)).toBeInTheDocument()
  })

  it('renders all member names and emails', () => {
    render(<MembersSettings />)
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument()
    expect(screen.getByText('alex@orchestree.com')).toBeInTheDocument()
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    expect(screen.getByText('Mike Rivera')).toBeInTheDocument()
    expect(screen.getByText('Emma Davis')).toBeInTheDocument()
  })

  it('shows Owner role as a badge, not a dropdown', () => {
    render(<MembersSettings />)
    // Owner should have a badge, not a select
    expect(screen.getByText('Owner')).toBeInTheDocument()
    // Non-owners should have role selects
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBe(3) // Sarah, Mike, Emma
  })

  it('does not show actions menu trigger for owner', () => {
    render(<MembersSettings />)
    // 3 non-owner members should have action buttons
    const actionButtons = screen.getAllByLabelText(/Actions for/)
    expect(actionButtons).toHaveLength(3)
    // No "Actions for Alex Johnson"
    expect(screen.queryByLabelText('Actions for Alex Johnson')).not.toBeInTheDocument()
  })

  it('filters members by search query', async () => {
    const user = userEvent.setup()
    render(<MembersSettings />)

    const searchInput = screen.getByLabelText('Search members')
    await user.type(searchInput, 'sarah')

    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    expect(screen.queryByText('Alex Johnson')).not.toBeInTheDocument()
    expect(screen.queryByText('Mike Rivera')).not.toBeInTheDocument()
  })

  it('shows pending invites section', () => {
    render(<MembersSettings />)
    expect(screen.getByText(/Pending Invites/)).toBeInTheDocument()
    expect(screen.getByText('chris@external.com')).toBeInTheDocument()
    // The invite has a Guest role badge - use getAllByText since "Guest" also appears in role selects
    const guestElements = screen.getAllByText('Guest')
    expect(guestElements.length).toBeGreaterThanOrEqual(1)
  })

  it('opens invite modal and validates empty emails', async () => {
    const user = userEvent.setup()
    render(<MembersSettings />)

    await user.click(screen.getByText('Invite'))
    expect(screen.getByText('Invite Team Members')).toBeInTheDocument()
    expect(screen.getByLabelText('Invite emails')).toBeInTheDocument()

    // Click Send without entering emails
    await user.click(screen.getByText('Send Invite'))
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter at least one email address')
  })

  it('shows error for invalid email in invite modal', async () => {
    const user = userEvent.setup()
    render(<MembersSettings />)

    await user.click(screen.getByText('Invite'))
    const textarea = screen.getByLabelText('Invite emails')
    await user.type(textarea, 'not-an-email')
    await user.click(screen.getByText('Send Invite'))

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email')
  })
})
