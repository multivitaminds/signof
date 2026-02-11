import { render, screen } from '@testing-library/react'
import ListView from './ListView'
import type { Issue, Member, Label } from '../../types'
import { IssueStatus, IssuePriority } from '../../types'

const mockMembers: Member[] = [
  { id: 'member-1', name: 'Alice Johnson', email: 'alice@example.com', avatarUrl: '' },
]

const mockLabels: Label[] = [
  { id: 'label-1', name: 'Bug', color: '#EF4444' },
]

function createIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: 'issue-1',
    projectId: 'proj-1',
    identifier: 'SO-1',
    title: 'Test issue',
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
    ...overrides,
  }
}

describe('ListView', () => {
  const defaultProps = {
    issues: [] as Issue[],
    members: mockMembers,
    labels: mockLabels,
    projectId: 'proj-1',
    onIssueClick: vi.fn(),
    onIssueUpdate: vi.fn(),
    onQuickCreate: vi.fn(),
  }

  it('renders column headers', () => {
    const issues = [createIssue()]
    render(<ListView {...defaultProps} issues={issues} />)
    expect(screen.getByText('Title')).toBeInTheDocument()
    // "Status" and "Priority" may appear both as column headers and in issue rows
    const statusElements = screen.getAllByText('Status')
    expect(statusElements.length).toBeGreaterThanOrEqual(1)
    const priorityElements = screen.getAllByText('Priority')
    expect(priorityElements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders issue rows', () => {
    const issues = [
      createIssue({ id: '1', identifier: 'SO-1', title: 'First issue' }),
      createIssue({ id: '2', identifier: 'SO-2', title: 'Second issue' }),
    ]
    render(<ListView {...defaultProps} issues={issues} />)
    expect(screen.getByText('First issue')).toBeInTheDocument()
    expect(screen.getByText('Second issue')).toBeInTheDocument()
  })

  it('shows empty state when no issues match filters', () => {
    render(<ListView {...defaultProps} issues={[]} />)
    expect(screen.getByText('No issues match the current filters.')).toBeInTheDocument()
  })

  it('renders group-by selector', () => {
    const issues = [createIssue()]
    render(<ListView {...defaultProps} issues={issues} />)
    expect(screen.getByText('Group by:')).toBeInTheDocument()
    expect(screen.getByDisplayValue('None')).toBeInTheDocument()
  })

  it('renders select-all checkbox when onSelectAll is provided', () => {
    const issues = [createIssue()]
    render(
      <ListView
        {...defaultProps}
        issues={issues}
        selectedIssueIds={new Set<string>()}
        onSelectAll={vi.fn()}
        onClearSelection={vi.fn()}
        onToggleSelection={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Select all issues')).toBeInTheDocument()
  })

  it('shows sortable column indicators', () => {
    const issues = [createIssue()]
    render(<ListView {...defaultProps} issues={issues} />)
    // Title, Status, Priority, Updated are sortable
    const sortableHeaders = screen.getAllByRole('button')
    expect(sortableHeaders.length).toBeGreaterThan(0)
  })
})
