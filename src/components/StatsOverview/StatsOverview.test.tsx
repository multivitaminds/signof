import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StatsOverview from './StatsOverview'
import { useDocumentStore } from '../../stores/useDocumentStore'
import { useWorkspaceStore } from '../../features/workspace/stores/useWorkspaceStore'
import { useProjectStore } from '../../features/projects/stores/useProjectStore'
import { useSchedulingStore } from '../../features/scheduling/stores/useSchedulingStore'
import { DocumentStatus, SigningOrder } from '../../types'
import type { Document } from '../../types'

function renderStatsOverview() {
  return render(
    <MemoryRouter>
      <StatsOverview />
    </MemoryRouter>
  )
}

describe('StatsOverview', () => {
  beforeEach(() => {
    // Reset all stores to empty/default state
    useDocumentStore.setState({ documents: [] })
    useWorkspaceStore.setState({ pages: {} })
    useProjectStore.setState({ issues: {}, members: [] })
    useSchedulingStore.setState({ bookings: [], eventTypes: [] })
  })

  it('renders the stats overview section', () => {
    renderStatsOverview()
    expect(screen.getByLabelText('Statistics overview')).toBeInTheDocument()
  })

  it('renders all five stat cards', () => {
    renderStatsOverview()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Pages')).toBeInTheDocument()
    expect(screen.getByText('Issues')).toBeInTheDocument()
    expect(screen.getByText('Bookings')).toBeInTheDocument()
    expect(screen.getByText('Team')).toBeInTheDocument()
  })

  it('shows zero values when stores are empty', () => {
    renderStatsOverview()
    // All five stat values should be 0
    const values = screen.getAllByText('0')
    expect(values.length).toBeGreaterThanOrEqual(5)
  })

  it('renders stat cards as links', () => {
    renderStatsOverview()
    const links = screen.getAllByRole('link')
    expect(links.length).toBe(5)
  })

  it('links to correct paths', () => {
    renderStatsOverview()
    const docLink = screen.getByText('Documents').closest('a')
    expect(docLink).toHaveAttribute('href', '/documents')
    const pagesLink = screen.getByText('Pages').closest('a')
    expect(pagesLink).toHaveAttribute('href', '/pages')
    const issuesLink = screen.getByText('Issues').closest('a')
    expect(issuesLink).toHaveAttribute('href', '/projects')
    const bookingsLink = screen.getByText('Bookings').closest('a')
    expect(bookingsLink).toHaveAttribute('href', '/calendar/bookings')
    const teamLink = screen.getByText('Team').closest('a')
    expect(teamLink).toHaveAttribute('href', '/settings/members')
  })

  it('displays document count from store', () => {
    const makeDoc = (id: string, status: DocumentStatus): Document => ({
      id,
      name: `Doc ${id}`,
      status,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      fileUrl: '',
      fileType: 'application/pdf',
      signers: [],
      signatures: [],
      audit: [],
      fields: [],
      folderId: null,
      templateId: null,
      expiresAt: null,
      reminderSentAt: null,
      signingOrder: SigningOrder.Parallel,
      pricingTable: null,
      notes: [],
    })

    useDocumentStore.setState({
      documents: [makeDoc('d1', DocumentStatus.Draft), makeDoc('d2', DocumentStatus.Completed)],
    })

    renderStatsOverview()
    // Documents stat value should be 2
    const docLink = screen.getByText('Documents').closest('a')
    expect(docLink).toHaveTextContent('2')
  })

  it('renders stats grid container', () => {
    const { container } = renderStatsOverview()
    expect(container.querySelector('.stats-overview__grid')).toBeInTheDocument()
  })

  it('renders trend indicators', () => {
    const { container } = renderStatsOverview()
    const trends = container.querySelectorAll('[class*="stats-overview__trend"]')
    expect(trends.length).toBe(5)
  })
})
