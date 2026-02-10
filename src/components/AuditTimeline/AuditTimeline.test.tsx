import { render, screen } from '@testing-library/react'
import AuditTimeline from './AuditTimeline'
import type { AuditEntry } from '../../types'

const makeEntry = (overrides: Partial<AuditEntry> = {}): AuditEntry => ({
  action: 'created',
  timestamp: '2026-02-01T10:00:00Z',
  userId: 'user-1',
  ...overrides,
})

describe('AuditTimeline', () => {
  it('renders entries with correct action text', () => {
    const entries = [
      makeEntry({ action: 'created' }),
      makeEntry({ action: 'sent', timestamp: '2026-02-02T10:00:00Z' }),
    ]
    render(<AuditTimeline entries={entries} />)
    expect(screen.getByText('Document Created')).toBeInTheDocument()
    expect(screen.getByText('Document Sent')).toBeInTheDocument()
  })

  it('shows detail text when present', () => {
    const entries = [
      makeEntry({ detail: 'Sent to alice@example.com' }),
    ]
    render(<AuditTimeline entries={entries} />)
    expect(screen.getByText('Sent to alice@example.com')).toBeInTheDocument()
  })

  it('shows formatted timestamps', () => {
    const entries = [
      makeEntry({ timestamp: '2026-06-15T14:30:00Z' }),
    ]
    render(<AuditTimeline entries={entries} />)
    // toLocaleString with en-US will produce something like "Jun 15, 2026, 2:30 PM"
    // but the exact format depends on timezone, so we check for the date parts
    const timeElement = screen.getByRole('listitem').querySelector('time')
    expect(timeElement).toBeInTheDocument()
    expect(timeElement?.textContent).toMatch(/Jun/)
    expect(timeElement?.textContent).toMatch(/2026/)
  })

  it('renders empty state as empty container', () => {
    render(<AuditTimeline entries={[]} />)
    const timeline = screen.getByRole('list', { name: 'Audit timeline' })
    expect(timeline).toBeInTheDocument()
    expect(timeline.children).toHaveLength(0)
  })

  it('renders correct number of entries', () => {
    const entries = [
      makeEntry({ action: 'created', timestamp: '2026-02-01T10:00:00Z' }),
      makeEntry({ action: 'sent', timestamp: '2026-02-02T10:00:00Z' }),
      makeEntry({ action: 'viewed', timestamp: '2026-02-03T10:00:00Z' }),
    ]
    render(<AuditTimeline entries={entries} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('capitalizes unknown action types', () => {
    const entries = [
      makeEntry({ action: 'customaction' }),
    ]
    render(<AuditTimeline entries={entries} />)
    expect(screen.getByText('Customaction')).toBeInTheDocument()
  })
})
