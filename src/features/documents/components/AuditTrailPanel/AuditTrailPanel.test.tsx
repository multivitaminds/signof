import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuditTrailPanel from './AuditTrailPanel'
import { DocumentStatus, SignerStatus, SigningOrder, type Document } from '../../../../types'

function createDoc(overrides: Partial<Document> = {}): Document {
  return {
    id: 'doc-1',
    name: 'Test Document',
    status: DocumentStatus.Sent,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-02T14:00:00Z',
    fileUrl: '',
    fileType: 'application/pdf',
    signers: [
      { id: 's1', name: 'Alice', email: 'alice@test.com', status: SignerStatus.Pending, signedAt: null, order: 1 },
    ],
    signatures: [],
    audit: [
      { action: 'created', timestamp: '2026-02-01T10:00:00Z', userId: 'you' },
      { action: 'sent', timestamp: '2026-02-02T14:00:00Z', userId: 'you', detail: 'Sent to 1 signer' },
    ],
    fields: [],
    folderId: null,
    templateId: null,
    expiresAt: null,
    reminderSentAt: null,
    signingOrder: SigningOrder.Parallel,
    pricingTable: null,
    notes: [],
    ...overrides,
  }
}

describe('AuditTrailPanel', () => {
  it('renders document name and status', () => {
    render(<AuditTrailPanel document={createDoc()} onClose={vi.fn()} />)
    expect(screen.getByText('Test Document')).toBeInTheDocument()
    expect(screen.getByText('Sent')).toBeInTheDocument()
  })

  it('renders audit entries count', () => {
    render(<AuditTrailPanel document={createDoc()} onClose={vi.fn()} />)
    expect(screen.getByText('2 events recorded')).toBeInTheDocument()
  })

  it('renders all audit entries', () => {
    render(<AuditTrailPanel document={createDoc()} onClose={vi.fn()} />)
    // Each action appears twice: once as filter chip, once as entry action label
    expect(screen.getAllByText('Document Created')).toHaveLength(2)
    expect(screen.getAllByText('Document Sent')).toHaveLength(2)
  })

  it('shows filter chips for available action types', () => {
    render(<AuditTrailPanel document={createDoc()} onClose={vi.fn()} />)
    const filterGroup = screen.getByRole('group', { name: 'Filter by action type' })
    expect(filterGroup).toBeInTheDocument()
    const chips = filterGroup.querySelectorAll('button')
    const chipLabels = Array.from(chips).map((c) => c.textContent)
    expect(chipLabels).toContain('Document Created')
    expect(chipLabels).toContain('Document Sent')
  })

  it('filters entries when a chip is clicked', async () => {
    const user = userEvent.setup()
    render(<AuditTrailPanel document={createDoc()} onClose={vi.fn()} />)

    // Both entries visible initially
    expect(screen.getAllByRole('listitem')).toHaveLength(2)

    // Click "Document Created" filter chip
    await user.click(screen.getByRole('button', { name: 'Document Created' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    // After filtering, "Document Created" appears in chip + 1 entry
    expect(screen.getAllByText('Document Created')).toHaveLength(2)
  })

  it('resolves signer userId to name', () => {
    const doc = createDoc({
      audit: [
        { action: 'signed', timestamp: '2026-02-03T10:00:00Z', userId: 's1', detail: 'Signed by Alice' },
      ],
    })
    render(<AuditTrailPanel document={doc} onClose={vi.fn()} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('shows empty state for documents with no audit entries', () => {
    const doc = createDoc({ audit: [] })
    render(<AuditTrailPanel document={doc} onClose={vi.fn()} />)
    expect(screen.getByText('No audit entries yet.')).toBeInTheDocument()
  })

  it('shows detail text when present', () => {
    render(<AuditTrailPanel document={createDoc()} onClose={vi.fn()} />)
    expect(screen.getByText('Sent to 1 signer')).toBeInTheDocument()
  })

  it('shows IP when present', () => {
    const doc = createDoc({
      audit: [
        { action: 'viewed', timestamp: '2026-02-03T10:00:00Z', userId: 'system', ip: '192.168.1.1' },
      ],
    })
    render(<AuditTrailPanel document={doc} onClose={vi.fn()} />)
    expect(screen.getByText('IP: 192.168.1.1')).toBeInTheDocument()
  })

  it('calls onClose when Close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<AuditTrailPanel document={createDoc()} onClose={onClose} />)
    await user.click(screen.getByText('Close'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('has a Copy Audit Trail button', () => {
    render(<AuditTrailPanel document={createDoc()} onClose={vi.fn()} />)
    expect(screen.getByText('Copy Audit Trail')).toBeInTheDocument()
  })

  it('renders singular event text for single entry', () => {
    const doc = createDoc({
      audit: [{ action: 'created', timestamp: '2026-02-01T10:00:00Z', userId: 'you' }],
    })
    render(<AuditTrailPanel document={doc} onClose={vi.fn()} />)
    expect(screen.getByText('1 event recorded')).toBeInTheDocument()
  })
})
