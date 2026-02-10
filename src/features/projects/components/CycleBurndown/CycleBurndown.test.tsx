import { render, screen } from '@testing-library/react'
import type { Cycle, Issue } from '../../types'
import CycleBurndown from './CycleBurndown'

const testCycle: Cycle = {
  id: 'cycle-1',
  projectId: 'proj-1',
  name: 'Sprint 1',
  startDate: '2026-02-03',
  endDate: '2026-02-07',
  status: 'active',
}

const testIssues: Issue[] = [
  {
    id: 'i-1',
    projectId: 'proj-1',
    identifier: 'P-1',
    title: 'Issue 1',
    description: '',
    status: 'done',
    priority: 'high',
    assigneeId: null,
    labelIds: [],
    estimate: null,
    dueDate: null,
    parentIssueId: null,
    cycleId: 'cycle-1',
    createdAt: '2026-02-03T10:00:00Z',
    updatedAt: '2026-02-04T16:00:00Z',
  },
  {
    id: 'i-2',
    projectId: 'proj-1',
    identifier: 'P-2',
    title: 'Issue 2',
    description: '',
    status: 'done',
    priority: 'medium',
    assigneeId: null,
    labelIds: [],
    estimate: null,
    dueDate: null,
    parentIssueId: null,
    cycleId: 'cycle-1',
    createdAt: '2026-02-03T10:00:00Z',
    updatedAt: '2026-02-06T10:00:00Z',
  },
  {
    id: 'i-3',
    projectId: 'proj-1',
    identifier: 'P-3',
    title: 'Issue 3',
    description: '',
    status: 'in_progress',
    priority: 'low',
    assigneeId: null,
    labelIds: [],
    estimate: null,
    dueDate: null,
    parentIssueId: null,
    cycleId: 'cycle-1',
    createdAt: '2026-02-03T10:00:00Z',
    updatedAt: '2026-02-07T10:00:00Z',
  },
]

describe('CycleBurndown', () => {
  it('renders an SVG element', () => {
    render(<CycleBurndown cycle={testCycle} issues={testIssues} />)

    const svg = screen.getByRole('img', { name: /burndown chart for sprint 1/i })
    expect(svg).toBeInTheDocument()
    expect(svg.tagName.toLowerCase()).toBe('svg')
  })

  it('contains the ideal line (dashed)', () => {
    const { container } = render(<CycleBurndown cycle={testCycle} issues={testIssues} />)

    const idealLines = container.querySelectorAll('.cycle-burndown__line--ideal')
    expect(idealLines.length).toBeGreaterThan(0)

    // At least one should be a line element in the chart area (not just the legend)
    const chartIdealLine = Array.from(idealLines).find(
      (el) => el.tagName.toLowerCase() === 'line',
    )
    expect(chartIdealLine).toBeDefined()
  })

  it('contains the actual line', () => {
    const { container } = render(<CycleBurndown cycle={testCycle} issues={testIssues} />)

    const actualLines = container.querySelectorAll('.cycle-burndown__line--actual')
    expect(actualLines.length).toBeGreaterThan(0)

    const polyline = Array.from(actualLines).find(
      (el) => el.tagName.toLowerCase() === 'polyline',
    )
    expect(polyline).toBeDefined()
    expect(polyline!.getAttribute('points')).toBeTruthy()
  })

  it('shows axis labels', () => {
    render(<CycleBurndown cycle={testCycle} issues={testIssues} />)

    // Y axis: should show total (3) and 0
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()

    // X axis: should show formatted dates
    expect(screen.getByText('Feb 3')).toBeInTheDocument()
    expect(screen.getByText('Feb 7')).toBeInTheDocument()
  })

  it('shows legend with Ideal and Actual labels', () => {
    render(<CycleBurndown cycle={testCycle} issues={testIssues} />)

    expect(screen.getByText('Ideal')).toBeInTheDocument()
    expect(screen.getByText('Actual')).toBeInTheDocument()
  })

  it('handles single-day cycle', () => {
    const singleDayCycle: Cycle = {
      id: 'c-single',
      projectId: 'proj-1',
      name: 'One Day',
      startDate: '2026-02-03',
      endDate: '2026-02-03',
      status: 'active',
    }

    render(<CycleBurndown cycle={singleDayCycle} issues={[testIssues[0]!]} />)

    const svg = screen.getByRole('img', { name: /burndown chart/i })
    expect(svg).toBeInTheDocument()
  })

  it('handles empty issues list', () => {
    render(<CycleBurndown cycle={testCycle} issues={[]} />)

    const svg = screen.getByRole('img', { name: /burndown chart/i })
    expect(svg).toBeInTheDocument()
    // Y axis should show 0 for empty
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
  })
})
