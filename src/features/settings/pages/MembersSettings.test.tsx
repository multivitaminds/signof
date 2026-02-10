import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MembersSettings from './MembersSettings'

const mockAddMember = vi.fn()
const mockRemoveMember = vi.fn()
const mockUpdateMemberRole = vi.fn()

const sampleMembers = [
  { id: 'member-1', name: 'Alex Johnson', email: 'alex@signof.com', role: 'owner', avatarUrl: null, joinedAt: '2024-01-15T00:00:00Z' },
  { id: 'member-2', name: 'Sarah Chen', email: 'sarah@signof.com', role: 'admin', avatarUrl: null, joinedAt: '2024-02-20T00:00:00Z' },
  { id: 'member-3', name: 'Mike Rivera', email: 'mike@signof.com', role: 'member', avatarUrl: null, joinedAt: '2024-03-10T00:00:00Z' },
]

vi.mock('../stores/useSettingsStore', () => ({
  useSettingsStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      members: sampleMembers,
      addMember: mockAddMember,
      removeMember: mockRemoveMember,
      updateMemberRole: mockUpdateMemberRole,
    }),
}))

describe('MembersSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the title with member count', () => {
    render(<MembersSettings />)
    expect(screen.getByText('Members')).toBeInTheDocument()
    expect(screen.getByText('3 members in this workspace')).toBeInTheDocument()
  })

  it('renders all member names and emails', () => {
    render(<MembersSettings />)
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument()
    expect(screen.getByText('alex@signof.com')).toBeInTheDocument()
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    expect(screen.getByText('Mike Rivera')).toBeInTheDocument()
  })

  it('shows the invite button', () => {
    render(<MembersSettings />)
    expect(screen.getByText('Invite')).toBeInTheDocument()
  })

  it('shows invite form when Invite button is clicked', async () => {
    const user = userEvent.setup()
    render(<MembersSettings />)

    await user.click(screen.getByText('Invite'))

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByText('Send Invite')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('does not show remove button for the owner', () => {
    render(<MembersSettings />)
    // Owner (Alex Johnson) should not have a remove button.
    // There should be 2 remove buttons (for Sarah and Mike), not 3
    const removeButtons = screen.getAllByTitle('Remove member')
    expect(removeButtons).toHaveLength(2)
  })

  it('disables role select for the owner', () => {
    render(<MembersSettings />)
    const selects = screen.getAllByRole('combobox')
    // The first select belongs to the owner - should be disabled
    expect(selects[0]).toBeDisabled()
    // Non-owners should be enabled
    expect(selects[1]).toBeEnabled()
  })

  it('hides invite form when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<MembersSettings />)

    await user.click(screen.getByText('Invite'))
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()

    await user.click(screen.getByText('Cancel'))
    expect(screen.queryByPlaceholderText('Name')).not.toBeInTheDocument()
  })
})
