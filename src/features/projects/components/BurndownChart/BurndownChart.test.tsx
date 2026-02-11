import { render, screen } from '@testing-library/react'
import BurndownChart from './BurndownChart'
import type { Cycle, Issue } from '../../types'
import { IssueStatus, IssuePriority } from '../../types'

function createCycle(overrides: Partial<Cycle> = {}): Cycle {
  return {
    id: 'cycle-1',
    projectId: 'proj-1',
    name: 'Sprint 1',
    startDate: '2025-01-01',
    endDate: '2025-01-14',
    status: 'active',
    ...overrides,
  }
}

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
    cycleId: 'cycle-1',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('BurndownChart', () => {
  it('renders with title "Sprint Burndown"', () => {
    const cycle = createCycle()
    const issues = [createIssue()]
    render(<BurndownChart cycle={cycle} issues={issues} />)
    expect(screen.getByText('Sprint Burndown')).toBeInTheDocument()
  })

  it('renders SVG with accessible label', () => {
    const cycle = createCycle({ name: 'Sprint 1' })
    const issues = [createIssue(), createIssue({ id: 'issue-2', identifier: 'SO-2' })]
    render(<BurndownChart cycle={cycle} issues={issues} />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveAttribute('aria-label', 'Burndown chart for Sprint 1: 2 issues total')
  })

  it('shows total, remaining, and done stats', () => {
    const cycle = createCycle()
    const issues = [
      createIssue({ id: '1', status: IssueStatus.Todo }),
      createIssue({ id: '2', status: IssueStatus.InProgress }),
      createIssue({
        id: '3',
        status: IssueStatus.Done,
        updatedAt: '2025-01-05T00:00:00.000Z',
      }),
    ]
    render(<BurndownChart cycle={cycle} issues={issues} />)

    expect(screen.getByText('Total:')).toBeInTheDocument()
    expect(screen.getByText('Remaining:')).toBeInTheDocument()
    expect(screen.getByText('Done:')).toBeInTheDocument()
  })

  it('renders legend with Ideal and Actual labels', () => {
    const cycle = createCycle()
    const issues = [createIssue()]
    render(<BurndownChart cycle={cycle} issues={issues} />)

    expect(screen.getByText('Ideal')).toBeInTheDocument()
    expect(screen.getByText('Actual')).toBeInTheDocument()
  })

  it('handles zero issues gracefully', () => {
    const cycle = createCycle()
    render(<BurndownChart cycle={cycle} issues={[]} />)

    expect(screen.getByText('Sprint Burndown')).toBeInTheDocument()
    // Total should be 0
    const totals = screen.getAllByText('0')
    expect(totals.length).toBeGreaterThan(0)
  })

  it('renders date labels from cycle range', () => {
    const cycle = createCycle({
      startDate: '2025-03-01',
      endDate: '2025-03-14',
    })
    const issues = [createIssue()]
    render(<BurndownChart cycle={cycle} issues={issues} />)

    // Should show formatted dates from the cycle range
    expect(screen.getByText('Mar 1')).toBeInTheDocument()
    expect(screen.getByText('Mar 14')).toBeInTheDocument()
  })
})
