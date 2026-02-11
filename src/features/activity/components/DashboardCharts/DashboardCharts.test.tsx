import { render, screen } from '@testing-library/react'
import DashboardCharts from './DashboardCharts'

const now = Date.now()

vi.mock('../../stores/useActivityStore', () => ({
  useActivityStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      activities: [
        {
          id: 'a1',
          type: 'document',
          action: 'created',
          title: 'Created contract',
          description: 'Created a new contract',
          entityId: 'doc-1',
          entityPath: '/documents/doc-1',
          timestamp: new Date(now - 86400000).toISOString(),
          userId: 'user-1',
          userName: 'John',
          icon: 'file',
        },
        {
          id: 'a2',
          type: 'page',
          action: 'updated',
          title: 'Updated wiki page',
          description: 'Updated a wiki page',
          entityId: 'page-1',
          entityPath: '/workspace/page-1',
          timestamp: new Date(now - 172800000).toISOString(),
          userId: 'user-1',
          userName: 'John',
          icon: 'file-text',
        },
        {
          id: 'a3',
          type: 'issue',
          action: 'created',
          title: 'Created issue',
          description: 'Created a new issue',
          entityId: 'issue-1',
          entityPath: '/projects/issue-1',
          timestamp: new Date(now).toISOString(),
          userId: 'user-2',
          userName: 'Jane',
          icon: 'layout',
        },
      ],
    }),
}))

describe('DashboardCharts', () => {
  it('renders Activity sparkline card', () => {
    render(<DashboardCharts />)
    expect(screen.getByText('Activity (7 days)')).toBeInTheDocument()
  })

  it('renders 7-day activity bar chart SVG', () => {
    render(<DashboardCharts />)
    expect(
      screen.getByRole('img', { name: '7-day activity bar chart' })
    ).toBeInTheDocument()
  })

  it('renders Module Usage donut chart', () => {
    render(<DashboardCharts />)
    expect(screen.getByText('Module Usage')).toBeInTheDocument()
  })

  it('renders donut chart SVG', () => {
    render(<DashboardCharts />)
    expect(
      screen.getByRole('img', { name: 'Module usage donut chart' })
    ).toBeInTheDocument()
  })

  it('renders Weekly Trend card', () => {
    render(<DashboardCharts />)
    expect(screen.getByText('Weekly Trend')).toBeInTheDocument()
  })

  it('renders weekly trend line SVG', () => {
    render(<DashboardCharts />)
    expect(
      screen.getByRole('img', { name: 'Weekly activity trend line' })
    ).toBeInTheDocument()
  })

  it('renders donut total count', () => {
    render(<DashboardCharts />)
    // 3 activities total
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('total')).toBeInTheDocument()
  })
})
