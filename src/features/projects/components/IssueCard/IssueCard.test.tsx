import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IssueCard from './IssueCard'
import type { Issue, Member, Label } from '../../types'
import { IssueStatus, IssuePriority } from '../../types'

const mockIssue: Issue = {
  id: 'issue-1',
  projectId: 'proj-1',
  identifier: 'SO-142',
  title: 'Fix authentication bug in login flow',
  description: '',
  status: IssueStatus.InProgress,
  priority: IssuePriority.High,
  assigneeId: 'member-1',
  labelIds: ['label-1', 'label-2'],
  estimate: null,
  dueDate: null,
  parentIssueId: null,
  cycleId: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

const mockMembers: Member[] = [
  { id: 'member-1', name: 'Alice Johnson', email: 'alice@example.com', avatarUrl: '' },
  { id: 'member-2', name: 'Bob Smith', email: 'bob@example.com', avatarUrl: '' },
]

const mockLabels: Label[] = [
  { id: 'label-1', name: 'Bug', color: '#EF4444' },
  { id: 'label-2', name: 'Frontend', color: '#3B82F6' },
  { id: 'label-3', name: 'Backend', color: '#22C55E' },
]

describe('IssueCard', () => {
  const defaultProps = {
    issue: mockIssue,
    members: mockMembers,
    labels: mockLabels,
    onClick: vi.fn(),
  }

  it('renders identifier and title', () => {
    render(<IssueCard {...defaultProps} />)
    expect(screen.getByText('SO-142')).toBeInTheDocument()
    expect(screen.getByText('Fix authentication bug in login flow')).toBeInTheDocument()
  })

  it('renders priority indicator for high priority', () => {
    render(<IssueCard {...defaultProps} />)
    expect(screen.getByTitle('High')).toBeInTheDocument()
    expect(screen.getByTitle('High').textContent).toBe('\u2191\u2191')
  })

  it('does not render priority symbol for none priority', () => {
    const noPriorityIssue = { ...mockIssue, priority: IssuePriority.None }
    render(<IssueCard {...defaultProps} issue={noPriorityIssue} />)
    expect(screen.queryByTitle('No priority')).not.toBeInTheDocument()
  })

  it('renders label dots', () => {
    render(<IssueCard {...defaultProps} />)
    expect(screen.getByTitle('Bug')).toBeInTheDocument()
    expect(screen.getByTitle('Frontend')).toBeInTheDocument()
  })

  it('renders assignee initials', () => {
    render(<IssueCard {...defaultProps} />)
    expect(screen.getByTitle('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByTitle('Alice Johnson').textContent).toBe('AJ')
  })

  it('does not render assignee when assigneeId is null', () => {
    const unassigned = { ...mockIssue, assigneeId: null }
    render(<IssueCard {...defaultProps} issue={unassigned} />)
    expect(screen.queryByTitle('Alice Johnson')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<IssueCard {...defaultProps} onClick={onClick} />)

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has draggable attribute', () => {
    render(<IssueCard {...defaultProps} />)
    expect(screen.getByRole('button')).toHaveAttribute('draggable', 'true')
  })

  it('applies selected class when selected', () => {
    render(<IssueCard {...defaultProps} selected />)
    expect(screen.getByRole('button')).toHaveClass('issue-card--selected')
  })

  it('applies focused class when focused', () => {
    render(<IssueCard {...defaultProps} focused />)
    expect(screen.getByRole('button')).toHaveClass('issue-card--focused')
  })

  it('limits label dots to 3', () => {
    const manyLabels = {
      ...mockIssue,
      labelIds: ['label-1', 'label-2', 'label-3', 'label-extra'],
    }
    const extraLabels: Label[] = [
      ...mockLabels,
      { id: 'label-extra', name: 'Extra', color: '#000000' },
    ]
    render(<IssueCard {...defaultProps} issue={manyLabels} labels={extraLabels} />)
    expect(screen.getByTitle('Bug')).toBeInTheDocument()
    expect(screen.getByTitle('Frontend')).toBeInTheDocument()
    expect(screen.getByTitle('Backend')).toBeInTheDocument()
    expect(screen.queryByTitle('Extra')).not.toBeInTheDocument()
  })
})
