import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BulkActionBar from './BulkActionBar'
import type { Member } from '../../types'
import { IssueStatus, IssuePriority } from '../../types'
import { useProjectStore } from '../../stores/useProjectStore'

const mockMembers: Member[] = [
  { id: 'member-1', name: 'Alice', email: 'alice@example.com', avatarUrl: '' },
]

describe('BulkActionBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the store before each test
    useProjectStore.setState({
      selectedIssueIds: new Set<string>(),
    })
  })

  it('renders nothing when no issues are selected', () => {
    const { container } = render(<BulkActionBar members={mockMembers} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders when issues are selected', () => {
    useProjectStore.setState({
      selectedIssueIds: new Set(['issue-1', 'issue-2']),
    })
    render(<BulkActionBar members={mockMembers} />)
    expect(screen.getByText('2 selected')).toBeInTheDocument()
  })

  it('has toolbar role and label', () => {
    useProjectStore.setState({
      selectedIssueIds: new Set(['issue-1']),
    })
    render(<BulkActionBar members={mockMembers} />)
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-label', 'Bulk actions')
  })

  it('shows action buttons', () => {
    useProjectStore.setState({
      selectedIssueIds: new Set(['issue-1']),
    })
    render(<BulkActionBar members={mockMembers} />)
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Priority')).toBeInTheDocument()
    expect(screen.getByText('Assignee')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('opens status menu and shows options', async () => {
    const user = userEvent.setup()
    useProjectStore.setState({
      selectedIssueIds: new Set(['issue-1']),
    })
    render(<BulkActionBar members={mockMembers} />)

    await user.click(screen.getByText('Status'))
    expect(screen.getByText('Backlog')).toBeInTheDocument()
    expect(screen.getByText('Todo')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('calls bulkUpdateIssues with status when a status option is clicked', async () => {
    const user = userEvent.setup()
    const issue = {
      id: 'issue-1',
      projectId: 'proj-1',
      identifier: 'SO-1',
      title: 'Test',
      description: '',
      status: IssueStatus.Todo,
      priority: IssuePriority.Medium,
      assigneeId: null,
      labelIds: [],
      estimate: null,
      dueDate: null,
      parentIssueId: null,
      cycleId: null,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    }
    useProjectStore.setState({
      selectedIssueIds: new Set(['issue-1']),
      issues: { 'issue-1': issue },
    })
    render(<BulkActionBar members={mockMembers} />)

    await user.click(screen.getByText('Status'))
    await user.click(screen.getByText('Done'))

    const state = useProjectStore.getState()
    // After bulk update, selection should be cleared
    expect(state.selectedIssueIds.size).toBe(0)
    // Issue should be updated
    expect(state.issues['issue-1']?.status).toBe(IssueStatus.Done)
  })

  it('opens priority menu and shows options', async () => {
    const user = userEvent.setup()
    useProjectStore.setState({
      selectedIssueIds: new Set(['issue-1']),
    })
    render(<BulkActionBar members={mockMembers} />)

    await user.click(screen.getByText('Priority'))
    expect(screen.getByText('Urgent')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('opens assignee menu and shows members', async () => {
    const user = userEvent.setup()
    useProjectStore.setState({
      selectedIssueIds: new Set(['issue-1']),
    })
    render(<BulkActionBar members={mockMembers} />)

    await user.click(screen.getByText('Assignee'))
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Unassigned')).toBeInTheDocument()
  })

  it('clears selection when close button is clicked', async () => {
    const user = userEvent.setup()
    useProjectStore.setState({
      selectedIssueIds: new Set(['issue-1']),
    })
    render(<BulkActionBar members={mockMembers} />)

    await user.click(screen.getByLabelText('Clear selection'))
    const state = useProjectStore.getState()
    expect(state.selectedIssueIds.size).toBe(0)
  })

  it('deletes selected issues', async () => {
    const user = userEvent.setup()
    const issue1 = {
      id: 'issue-1',
      projectId: 'proj-1',
      identifier: 'SO-1',
      title: 'To delete',
      description: '',
      status: IssueStatus.Todo,
      priority: IssuePriority.Medium,
      assigneeId: null,
      labelIds: [],
      estimate: null,
      dueDate: null,
      parentIssueId: null,
      cycleId: null,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    }
    useProjectStore.setState({
      selectedIssueIds: new Set(['issue-1']),
      issues: { 'issue-1': issue1 },
    })
    render(<BulkActionBar members={mockMembers} />)

    await user.click(screen.getByLabelText('Delete selected issues'))

    const state = useProjectStore.getState()
    expect(state.issues['issue-1']).toBeUndefined()
    expect(state.selectedIssueIds.size).toBe(0)
  })
})
