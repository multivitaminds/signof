import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BoardView from './BoardView'
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

describe('BoardView', () => {
  const defaultProps = {
    issues: [] as Issue[],
    members: mockMembers,
    labels: mockLabels,
    projectId: 'proj-1',
    onIssueClick: vi.fn(),
    onStatusChange: vi.fn(),
    onQuickCreate: vi.fn(),
  }

  it('renders columns for each board status', () => {
    render(<BoardView {...defaultProps} />)
    expect(screen.getByText('Backlog')).toBeInTheDocument()
    expect(screen.getByText('Todo')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('In Review')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('does not render Cancelled column', () => {
    render(<BoardView {...defaultProps} />)
    expect(screen.queryByText('Cancelled')).not.toBeInTheDocument()
  })

  it('shows issues in correct columns', () => {
    const issues = [
      createIssue({ id: '1', identifier: 'SO-1', title: 'Backlog item', status: IssueStatus.Backlog }),
      createIssue({ id: '2', identifier: 'SO-2', title: 'Todo item', status: IssueStatus.Todo }),
      createIssue({ id: '3', identifier: 'SO-3', title: 'In progress item', status: IssueStatus.InProgress }),
    ]
    render(<BoardView {...defaultProps} issues={issues} />)

    expect(screen.getByText('Backlog item')).toBeInTheDocument()
    expect(screen.getByText('Todo item')).toBeInTheDocument()
    expect(screen.getByText('In progress item')).toBeInTheDocument()
  })

  it('shows correct count in column headers', () => {
    const issues = [
      createIssue({ id: '1', status: IssueStatus.Todo, title: 'A' }),
      createIssue({ id: '2', status: IssueStatus.Todo, title: 'B' }),
      createIssue({ id: '3', status: IssueStatus.Done, title: 'C' }),
    ]
    render(<BoardView {...defaultProps} issues={issues} />)

    // Find count badges — they appear next to the column titles
    const counts = screen.getAllByText(/^\d+$/)
    // Backlog=0, Todo=2, InProgress=0, InReview=0, Done=1
    const countTexts = counts.map((el) => el.textContent)
    expect(countTexts).toContain('2')
    expect(countTexts).toContain('1')
  })

  it('shows "No issues" for empty columns', () => {
    render(<BoardView {...defaultProps} issues={[]} />)
    const empties = screen.getAllByText('No issues')
    expect(empties).toHaveLength(5) // all 5 board columns empty
  })

  it('calls onIssueClick when an issue card is clicked', async () => {
    const user = userEvent.setup()
    const onIssueClick = vi.fn()
    const issues = [createIssue({ id: 'click-me', status: IssueStatus.Todo, title: 'Clickable' })]
    render(<BoardView {...defaultProps} issues={issues} onIssueClick={onIssueClick} />)

    await user.click(screen.getByText('Clickable'))
    expect(onIssueClick).toHaveBeenCalledWith('click-me')
  })

  it('calls onStatusChange on drop with correct args', () => {
    const onStatusChange = vi.fn()
    const issues = [createIssue({ id: 'drag-me', status: IssueStatus.Backlog, title: 'Draggable' })]
    render(<BoardView {...defaultProps} issues={issues} onStatusChange={onStatusChange} />)

    // Find the "Done" column by its header text, then target its parent column element
    const doneTitle = screen.getByText('Done')
    const doneColumn = doneTitle.closest('.board-view__column')!

    // Simulate drag over + drop
    fireEvent.dragOver(doneColumn, {
      dataTransfer: { dropEffect: 'move' },
    })

    fireEvent.drop(doneColumn, {
      dataTransfer: {
        getData: () => 'drag-me',
      },
    })

    expect(onStatusChange).toHaveBeenCalledWith('drag-me', IssueStatus.Done)
  })

  it('applies selected state to the correct issue', () => {
    const issues = [
      createIssue({ id: 'sel-1', identifier: 'SO-1', status: IssueStatus.Todo, title: 'Selected' }),
      createIssue({ id: 'sel-2', identifier: 'SO-2', status: IssueStatus.Todo, title: 'Not selected' }),
    ]
    render(<BoardView {...defaultProps} issues={issues} selectedIssueId="sel-1" />)

    const selectedCard = screen.getByText('Selected').closest('.issue-card')
    const otherCard = screen.getByText('Not selected').closest('.issue-card')
    expect(selectedCard).toHaveClass('issue-card--selected')
    expect(otherCard).not.toHaveClass('issue-card--selected')
  })
})
