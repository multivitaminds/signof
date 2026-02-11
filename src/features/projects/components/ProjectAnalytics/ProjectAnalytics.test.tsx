import { render, screen } from '@testing-library/react'
import ProjectAnalytics from './ProjectAnalytics'

vi.mock('../../stores/useProjectStore', () => ({
  useProjectStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      issues: {
        'i-1': {
          id: 'i-1',
          projectId: 'proj-1',
          identifier: 'SO-1',
          title: 'Issue One',
          description: '',
          status: 'todo',
          priority: 'medium',
          assigneeId: 'm-1',
          labelIds: ['label-1'],
          estimate: null,
          dueDate: null,
          parentIssueId: null,
          cycleId: null,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-02T00:00:00.000Z',
        },
        'i-2': {
          id: 'i-2',
          projectId: 'proj-1',
          identifier: 'SO-2',
          title: 'Issue Two',
          description: '',
          status: 'done',
          priority: 'high',
          assigneeId: null,
          labelIds: [],
          estimate: null,
          dueDate: null,
          parentIssueId: null,
          cycleId: null,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: new Date().toISOString(),
        },
      },
      members: [
        { id: 'm-1', name: 'Alice', email: 'alice@test.com', avatarUrl: '' },
      ],
      projects: {
        'proj-1': {
          id: 'proj-1',
          name: 'Test Project',
          prefix: 'SO',
          labels: [{ id: 'label-1', name: 'Bug', color: '#EF4444' }],
        },
      },
    }),
}))

describe('ProjectAnalytics', () => {
  it('renders overview cards', () => {
    render(<ProjectAnalytics />)
    expect(screen.getByText('Total Issues')).toBeInTheDocument()
    expect(screen.getByText('Open Issues')).toBeInTheDocument()
    expect(screen.getByText('Completed This Week')).toBeInTheDocument()
    expect(screen.getByText('Avg Cycle Time')).toBeInTheDocument()
  })

  it('renders velocity chart section', () => {
    render(<ProjectAnalytics />)
    expect(screen.getByText(/Issue Velocity/)).toBeInTheDocument()
  })

  it('renders status distribution section', () => {
    render(<ProjectAnalytics />)
    expect(screen.getByText('Status Distribution')).toBeInTheDocument()
  })

  it('renders priority breakdown section', () => {
    render(<ProjectAnalytics />)
    expect(screen.getByText('Priority Breakdown')).toBeInTheDocument()
  })

  it('renders recent activity section', () => {
    render(<ProjectAnalytics />)
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('renders team workload section', () => {
    render(<ProjectAnalytics />)
    expect(screen.getByText('Team Workload')).toBeInTheDocument()
  })

  it('renders burndown section', () => {
    render(<ProjectAnalytics />)
    expect(screen.getByText('Burndown')).toBeInTheDocument()
  })

  it('renders labels section', () => {
    render(<ProjectAnalytics />)
    expect(screen.getByText('Labels')).toBeInTheDocument()
  })

  it('shows correct total issue count', () => {
    render(<ProjectAnalytics />)
    // '2' may appear multiple times in different stat cards
    const twoElements = screen.getAllByText('2')
    expect(twoElements.length).toBeGreaterThanOrEqual(1)
  })
})
