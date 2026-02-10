import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from './Dashboard'
import { DocumentStatus, SignerStatus } from '../../types'
import type { Document } from '../../types'

const noop = () => {}

const SAMPLE_DOCS: Document[] = [
  {
    id: '1',
    name: 'Pending Doc',
    status: DocumentStatus.Pending,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    fileUrl: '',
    fileType: 'application/pdf',
    signers: [
      { id: 's1', name: 'Jane', email: 'jane@example.com', status: SignerStatus.Pending, signedAt: null, order: 1 },
    ],
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
  },
  {
    id: '2',
    name: 'Completed Doc',
    status: DocumentStatus.Completed,
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-01-21T11:00:00Z',
    fileUrl: '',
    fileType: 'application/pdf',
    signers: [
      { id: 's2', name: 'Bob', email: 'bob@example.com', status: SignerStatus.Signed, signedAt: '2026-01-21T11:00:00Z', order: 1 },
    ],
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
  },
  {
    id: '3',
    name: 'Draft Doc',
    status: DocumentStatus.Draft,
    createdAt: '2026-02-07T16:30:00Z',
    updatedAt: '2026-02-07T16:30:00Z',
    fileUrl: '',
    fileType: 'image/png',
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
  },
]

describe('Dashboard', () => {
  it('renders stat cards with correct counts', () => {
    render(
      <Dashboard documents={SAMPLE_DOCS} onNewDocument={noop} onSign={noop} onDelete={noop} onView={noop} />
    )
    expect(screen.getByText('Total Documents')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    const completedElements = screen.getAllByText('Completed')
    expect(completedElements.length).toBeGreaterThanOrEqual(1)
    const statNumbers = screen.getAllByText(/^[0-3]$/)
    const values = statNumbers.map((el) => el.textContent)
    expect(values).toContain('3')
    expect(values).toContain('1')
  })

  it('renders the "New Document" button', () => {
    render(
      <Dashboard documents={[]} onNewDocument={noop} onSign={noop} onDelete={noop} onView={noop} />
    )
    expect(screen.getByRole('button', { name: /new document/i })).toBeInTheDocument()
  })

  it('calls onNewDocument when the button is clicked', async () => {
    const user = userEvent.setup()
    const onNewDocument = vi.fn()
    render(
      <Dashboard documents={[]} onNewDocument={onNewDocument} onSign={noop} onDelete={noop} onView={noop} />
    )
    await user.click(screen.getByRole('button', { name: /new document/i }))
    expect(onNewDocument).toHaveBeenCalledOnce()
  })

  it('passes props through to DocumentList', () => {
    render(
      <Dashboard documents={SAMPLE_DOCS} onNewDocument={noop} onSign={noop} onDelete={noop} onView={noop} />
    )
    expect(screen.getByText('Pending Doc')).toBeInTheDocument()
    expect(screen.getByText('Completed Doc')).toBeInTheDocument()
    expect(screen.getByText('Draft Doc')).toBeInTheDocument()
  })
})
