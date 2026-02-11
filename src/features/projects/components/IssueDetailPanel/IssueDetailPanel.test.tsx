import { render, screen } from '@testing-library/react'
import IssueDetailPanel from './IssueDetailPanel'
import { IssueStatus, IssuePriority } from '../../types'

vi.mock('../../stores/useProjectStore', () => ({
  useProjectStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      issues: {
        'issue-1': {
          id: 'issue-1',
          projectId: 'proj-1',
          identifier: 'SO-1',
          title: 'Test Issue Title',
          description: 'Issue description',
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
        },
      },
      projects: {
        'proj-1': {
          id: 'proj-1',
          name: 'Test Project',
          prefix: 'SO',
          labels: [],
        },
      },
      members: [],
      activities: [],
      relations: [],
      subTasks: [],
      timeTracking: {},
      updateIssueWithActivity: vi.fn(),
      updateIssue: vi.fn(),
      addRelation: vi.fn(),
      removeRelation: vi.fn(),
      addSubTask: vi.fn(),
      toggleSubTask: vi.fn(),
      removeSubTask: vi.fn(),
      setTimeEstimate: vi.fn(),
      logTime: vi.fn(),
    }),
}))

describe('IssueDetailPanel', () => {
  it('renders nothing when issueId is null', () => {
    const { container } = render(
      <IssueDetailPanel issueId={null} onClose={vi.fn()} />
    )
    expect(container.querySelector('.issue-detail--open')).not.toBeInTheDocument()
  })

  it('renders issue details when issueId is provided', () => {
    render(
      <IssueDetailPanel issueId="issue-1" onClose={vi.fn()} />
    )
    expect(screen.getByText('Test Issue Title')).toBeInTheDocument()
    expect(screen.getByText('SO-1')).toBeInTheDocument()
  })

  it('renders description textarea', () => {
    render(
      <IssueDetailPanel issueId="issue-1" onClose={vi.fn()} />
    )
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('renders property labels', () => {
    render(
      <IssueDetailPanel issueId="issue-1" onClose={vi.fn()} />
    )
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Priority')).toBeInTheDocument()
    expect(screen.getByText('Assignee')).toBeInTheDocument()
    expect(screen.getByText('Labels')).toBeInTheDocument()
    expect(screen.getByText('Due date')).toBeInTheDocument()
  })

  it('renders close button with aria label', () => {
    render(
      <IssueDetailPanel issueId="issue-1" onClose={vi.fn()} />
    )
    expect(screen.getByLabelText('Close issue detail')).toBeInTheDocument()
  })

  it('renders time tracking section', () => {
    render(
      <IssueDetailPanel issueId="issue-1" onClose={vi.fn()} />
    )
    expect(screen.getByText('Time Tracking')).toBeInTheDocument()
    expect(screen.getByText('Estimated:')).toBeInTheDocument()
    expect(screen.getByText('Logged:')).toBeInTheDocument()
  })

  it('renders sub-tasks section', () => {
    render(
      <IssueDetailPanel issueId="issue-1" onClose={vi.fn()} />
    )
    expect(screen.getByText('Sub-tasks (0/0)')).toBeInTheDocument()
    expect(screen.getByLabelText('Add sub-task')).toBeInTheDocument()
  })

  it('renders relationships section', () => {
    render(
      <IssueDetailPanel issueId="issue-1" onClose={vi.fn()} />
    )
    expect(screen.getByText('Relationships')).toBeInTheDocument()
    expect(screen.getByLabelText('Add relation')).toBeInTheDocument()
  })

  it('renders activity log section', () => {
    render(
      <IssueDetailPanel issueId="issue-1" onClose={vi.fn()} />
    )
    expect(screen.getByText('Activity (0)')).toBeInTheDocument()
    expect(screen.getByText('No activity yet')).toBeInTheDocument()
  })
})
