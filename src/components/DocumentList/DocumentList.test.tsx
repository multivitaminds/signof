import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentList from './DocumentList'
import { DocumentStatus, SignerStatus, SignerRole } from '../../types'
import type { Document, Signer } from '../../types'

vi.mock('../StatusProgress/StatusProgress', () => ({
  default: ({ currentStatus }: { currentStatus: string }) => (
    <div data-testid="status-progress">{currentStatus}</div>
  ),
}))

const makeSigner = (overrides: Partial<Signer> = {}): Signer => ({
  id: 's1',
  name: 'Alice',
  email: 'alice@example.com',
  status: SignerStatus.Pending,
  signedAt: null,
  order: 1, role: SignerRole.Signer,
  ...overrides,
})

const makeDoc = (overrides: Partial<Document> = {}): Document => ({
  id: 'doc-1',
  name: 'Test Document',
  status: DocumentStatus.Pending,
  createdAt: '2026-02-01T10:00:00Z',
  updatedAt: '2026-02-01T10:00:00Z',
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
  signingOrder: 'parallel' as const,
  pricingTable: null,
  notes: [],
  ...overrides,
})

const noop = () => {}

describe('DocumentList', () => {
  it('renders empty state when there are no documents', () => {
    render(<DocumentList documents={[]} onSign={noop} onDelete={noop} onView={noop} />)
    expect(screen.getByText('No documents yet. Upload one to get started.')).toBeInTheDocument()
  })

  it('renders document cards', () => {
    const docs = [makeDoc({ id: '1', name: 'Alpha' }), makeDoc({ id: '2', name: 'Beta' })]
    render(<DocumentList documents={docs} onSign={noop} onDelete={noop} onView={noop} />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('shows status badges with correct text', () => {
    const docs = [
      makeDoc({ id: '1', status: DocumentStatus.Draft, name: 'Draft Doc' }),
      makeDoc({ id: '2', status: DocumentStatus.Pending, name: 'Pending Doc' }),
      makeDoc({ id: '3', status: DocumentStatus.Completed, name: 'Completed Doc' }),
    ]
    render(<DocumentList documents={docs} onSign={noop} onDelete={noop} onView={noop} />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('shows signers', () => {
    const doc = makeDoc({
      signers: [
        makeSigner({ id: 's1', name: 'Alice' }),
        makeSigner({ id: 's2', name: 'Bob', status: SignerStatus.Signed }),
      ],
    })
    render(<DocumentList documents={[doc]} onSign={noop} onDelete={noop} onView={noop} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows Sign button for all active statuses', () => {
    const docs = [
      makeDoc({ id: '1', status: DocumentStatus.Pending }),
      makeDoc({ id: '2', status: DocumentStatus.Sent }),
      makeDoc({ id: '3', status: DocumentStatus.Delivered }),
      makeDoc({ id: '4', status: DocumentStatus.Viewed }),
      makeDoc({ id: '5', status: DocumentStatus.Draft }),
      makeDoc({ id: '6', status: DocumentStatus.Completed }),
    ]
    render(<DocumentList documents={docs} onSign={noop} onDelete={noop} onView={noop} />)
    expect(screen.getAllByRole('button', { name: 'Sign' })).toHaveLength(4)
  })

  it('calls onSign with the correct docId', async () => {
    const user = userEvent.setup()
    const onSign = vi.fn()
    const doc = makeDoc({ id: 'abc', status: DocumentStatus.Pending })
    render(<DocumentList documents={[doc]} onSign={onSign} onDelete={noop} onView={noop} />)
    await user.click(screen.getByRole('button', { name: 'Sign' }))
    expect(onSign).toHaveBeenCalledWith('abc')
  })

  it('calls onView with the correct docId', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    const doc = makeDoc({ id: 'view-1' })
    render(<DocumentList documents={[doc]} onSign={noop} onDelete={noop} onView={onView} />)
    await user.click(screen.getByRole('button', { name: 'View' }))
    expect(onView).toHaveBeenCalledWith('view-1')
  })

  it('calls onDelete with the correct docId', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const doc = makeDoc({ id: 'del-1' })
    render(<DocumentList documents={[doc]} onSign={noop} onDelete={onDelete} onView={noop} />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith('del-1')
  })

  it('shows Send button for draft docs with signers', () => {
    const doc = makeDoc({
      id: 'draft-send',
      status: DocumentStatus.Draft,
      signers: [makeSigner()],
    })
    const onSend = vi.fn()
    render(<DocumentList documents={[doc]} onSign={noop} onDelete={noop} onView={noop} onSend={onSend} />)
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('does not show Send button for draft docs without signers', () => {
    const doc = makeDoc({
      id: 'draft-no-send',
      status: DocumentStatus.Draft,
      signers: [],
    })
    const onSend = vi.fn()
    render(<DocumentList documents={[doc]} onSign={noop} onDelete={noop} onView={noop} onSend={onSend} />)
    expect(screen.queryByRole('button', { name: 'Send' })).not.toBeInTheDocument()
  })

  it('calls onSend with the correct docId', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    const doc = makeDoc({
      id: 'send-1',
      status: DocumentStatus.Draft,
      signers: [makeSigner()],
    })
    render(<DocumentList documents={[doc]} onSign={noop} onDelete={noop} onView={noop} onSend={onSend} />)
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(onSend).toHaveBeenCalledWith('send-1')
  })

  it('shows Certificate button for completed docs', () => {
    const doc = makeDoc({
      id: 'cert-1',
      status: DocumentStatus.Completed,
    })
    const onCertificate = vi.fn()
    render(<DocumentList documents={[doc]} onSign={noop} onDelete={noop} onView={noop} onCertificate={onCertificate} />)
    expect(screen.getByRole('button', { name: 'Certificate' })).toBeInTheDocument()
  })

  it('calls onCertificate with the correct docId', async () => {
    const user = userEvent.setup()
    const onCertificate = vi.fn()
    const doc = makeDoc({
      id: 'cert-2',
      status: DocumentStatus.Completed,
    })
    render(<DocumentList documents={[doc]} onSign={noop} onDelete={noop} onView={noop} onCertificate={onCertificate} />)
    await user.click(screen.getByRole('button', { name: 'Certificate' }))
    expect(onCertificate).toHaveBeenCalledWith('cert-2')
  })

  it('renders StatusProgress for each document', () => {
    const docs = [makeDoc({ id: '1' }), makeDoc({ id: '2' })]
    render(<DocumentList documents={docs} onSign={noop} onDelete={noop} onView={noop} />)
    expect(screen.getAllByTestId('status-progress')).toHaveLength(2)
  })
})
