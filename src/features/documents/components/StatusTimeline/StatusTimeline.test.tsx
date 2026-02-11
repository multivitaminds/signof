import { render, screen } from '@testing-library/react'
import StatusTimeline from './StatusTimeline'
import { DocumentStatus } from '../../../../types'
import type { AuditEntry } from '../../../../types'

const makeAudit = (entries: Partial<AuditEntry>[]): AuditEntry[] =>
  entries.map((e, i) => ({
    action: e.action ?? 'created',
    timestamp: e.timestamp ?? `2026-02-0${i + 1}T10:00:00Z`,
    userId: e.userId ?? 'system',
    detail: e.detail,
    ...e,
  }))

describe('StatusTimeline', () => {
  it('renders audit entries as timeline items', () => {
    const audit = makeAudit([
      { action: 'created', detail: 'Document created' },
      { action: 'sent', detail: 'Sent to 2 signers' },
    ])

    render(
      <StatusTimeline
        audit={audit}
        currentStatus={DocumentStatus.Sent}
      />
    )

    expect(screen.getByText('Document Created')).toBeInTheDocument()
    expect(screen.getByText('Document Sent')).toBeInTheDocument()
  })

  it('shows details for audit entries', () => {
    const audit = makeAudit([
      { action: 'created', detail: 'Document created by user' },
    ])

    render(
      <StatusTimeline
        audit={audit}
        currentStatus={DocumentStatus.Draft}
      />
    )

    expect(screen.getByText('Document created by user')).toBeInTheDocument()
  })

  it('shows pending status for future steps', () => {
    const audit = makeAudit([
      { action: 'created' },
    ])

    render(
      <StatusTimeline
        audit={audit}
        currentStatus={DocumentStatus.Draft}
      />
    )

    // Future steps should show "Pending"
    const pendingElements = screen.getAllByText('Pending')
    expect(pendingElements.length).toBeGreaterThan(0)
  })

  it('has timeline list role with correct aria-label', () => {
    render(
      <StatusTimeline
        audit={makeAudit([{ action: 'created' }])}
        currentStatus={DocumentStatus.Draft}
      />
    )

    expect(screen.getByRole('list', { name: 'Document status timeline' })).toBeInTheDocument()
  })

  it('marks the most recent completed entry as current', () => {
    const audit = makeAudit([
      { action: 'created' },
      { action: 'sent' },
      { action: 'delivered' },
    ])

    const { container } = render(
      <StatusTimeline
        audit={audit}
        currentStatus={DocumentStatus.Delivered}
      />
    )

    const currentEntries = container.querySelectorAll('.status-timeline__entry--current')
    expect(currentEntries.length).toBe(1)
  })

  it('renders completed entries with completed class', () => {
    const audit = makeAudit([
      { action: 'created' },
      { action: 'sent' },
    ])

    const { container } = render(
      <StatusTimeline
        audit={audit}
        currentStatus={DocumentStatus.Sent}
      />
    )

    const completedEntries = container.querySelectorAll('.status-timeline__entry--completed')
    expect(completedEntries.length).toBe(2)
  })

  it('shows pulse animation for current status', () => {
    const audit = makeAudit([
      { action: 'created' },
    ])

    const { container } = render(
      <StatusTimeline
        audit={audit}
        currentStatus={DocumentStatus.Draft}
      />
    )

    const pulse = container.querySelector('.status-timeline__pulse')
    expect(pulse).toBeInTheDocument()
  })

  it('handles declined status', () => {
    const audit = makeAudit([
      { action: 'created' },
      { action: 'sent' },
      { action: 'declined', detail: 'Declined by Jane: Wrong document' },
    ])

    render(
      <StatusTimeline
        audit={audit}
        currentStatus={DocumentStatus.Declined}
      />
    )

    expect(screen.getByText('Signature Declined')).toBeInTheDocument()
    expect(screen.getByText('Declined by Jane: Wrong document')).toBeInTheDocument()
  })
})
