import { render, screen } from '@testing-library/react'
import MetricCard from './MetricCard'
import type { MetricSummary } from '../../types'
import { MetricType } from '../../types'

describe('MetricCard', () => {
  const mockMetric: MetricSummary = {
    type: MetricType.DocumentsSigned,
    current: 42,
    previous: 35,
    trend: 'up',
    data: [
      { date: '2026-02-10', value: 5 },
      { date: '2026-02-11', value: 8 },
      { date: '2026-02-12', value: 6 },
      { date: '2026-02-13', value: 10 },
      { date: '2026-02-14', value: 13 },
    ],
  }

  it('renders the metric label', () => {
    render(<MetricCard metric={mockMetric} />)
    expect(screen.getByText('Documents Signed')).toBeInTheDocument()
  })

  it('renders the current value', () => {
    render(<MetricCard metric={mockMetric} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('shows positive trend percentage', () => {
    render(<MetricCard metric={mockMetric} />)
    expect(screen.getByText('+20%')).toBeInTheDocument()
  })

  it('shows negative trend percentage for down trend', () => {
    const downMetric: MetricSummary = {
      ...mockMetric,
      current: 20,
      previous: 30,
      trend: 'down',
    }
    render(<MetricCard metric={downMetric} />)
    expect(screen.getByText('-33%')).toBeInTheDocument()
  })

  it('formats revenue values with dollar sign', () => {
    const revMetric: MetricSummary = {
      ...mockMetric,
      type: MetricType.RevenueTracked,
      current: 5000,
    }
    render(<MetricCard metric={revMetric} />)
    expect(screen.getByText('$5,000')).toBeInTheDocument()
  })

  it('renders a sparkline chart', () => {
    const { container } = render(<MetricCard metric={mockMetric} />)
    const sparkline = container.querySelector('.sparkline')
    expect(sparkline).toBeInTheDocument()
  })

  it('is clickable when onClick is provided', () => {
    const onClick = vi.fn()
    render(<MetricCard metric={mockMetric} onClick={onClick} />)
    const card = screen.getByRole('button')
    card.click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
