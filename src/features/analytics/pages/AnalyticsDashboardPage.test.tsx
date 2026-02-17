import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AnalyticsDashboardPage from './AnalyticsDashboardPage'
import { useAnalyticsStore } from '../stores/useAnalyticsStore'
import { TimeRange } from '../types'

// Wrap component in router since ModuleHeader may use router context indirectly
function renderPage() {
  return render(
    <MemoryRouter>
      <AnalyticsDashboardPage />
    </MemoryRouter>,
  )
}

describe('AnalyticsDashboardPage', () => {
  beforeEach(() => {
    useAnalyticsStore.setState({ timeRange: TimeRange.Month })
  })

  it('renders the Analytics header', () => {
    renderPage()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    renderPage()
    expect(screen.getByText('Platform-wide metrics and insights')).toBeInTheDocument()
  })

  it('renders time range selector buttons', () => {
    renderPage()
    expect(screen.getByText('7d')).toBeInTheDocument()
    expect(screen.getByText('30d')).toBeInTheDocument()
    expect(screen.getByText('90d')).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
  })

  it('renders 6 metric cards', () => {
    renderPage()
    expect(screen.getByText('Documents Signed')).toBeInTheDocument()
    expect(screen.getByText('Issues Completed')).toBeInTheDocument()
    expect(screen.getByText('Bookings Created')).toBeInTheDocument()
    expect(screen.getByText('Agent Tasks Done')).toBeInTheDocument()
    expect(screen.getByText('Pages Created')).toBeInTheDocument()
    expect(screen.getByText('Revenue Tracked')).toBeInTheDocument()
  })

  it('renders the bar chart section', () => {
    renderPage()
    expect(screen.getByText('Documents Signed Over Time')).toBeInTheDocument()
  })

  it('renders donut chart sections', () => {
    renderPage()
    expect(screen.getByText('Document Status')).toBeInTheDocument()
    expect(screen.getByText('Issue Status')).toBeInTheDocument()
  })

  it('highlights active time range button', () => {
    renderPage()
    const btn30d = screen.getByText('30d')
    expect(btn30d.className).toContain('analytics-page__time-btn--active')
  })
})
