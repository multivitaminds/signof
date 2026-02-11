import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentPreview from './DocumentPreview'
import { DocumentStatus, SignerStatus, FieldType, SigningOrder } from '../../../../types'
import type { Document, DocumentField } from '../../../../types'

const makeField = (overrides?: Partial<DocumentField>): DocumentField => ({
  id: 'f1',
  type: FieldType.Signature,
  recipientId: 's1',
  page: 1,
  x: 100,
  y: 200,
  width: 200,
  height: 60,
  required: true,
  label: 'Signature',
  ...overrides,
})

const makeDoc = (overrides?: Partial<Document>): Document => ({
  id: 'doc1',
  name: 'Test Agreement',
  status: DocumentStatus.Pending,
  createdAt: '2026-02-01T10:00:00Z',
  updatedAt: '2026-02-01T10:00:00Z',
  fileUrl: '',
  fileType: 'application/pdf',
  signers: [
    {
      id: 's1',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: SignerStatus.Pending,
      signedAt: null,
      order: 1,
    },
  ],
  signatures: [],
  audit: [],
  fields: [makeField()],
  folderId: null,
  templateId: null,
  expiresAt: null,
  reminderSentAt: null,
  signingOrder: SigningOrder.Parallel,
  pricingTable: null,
  notes: [],
  ...overrides,
})

describe('DocumentPreview', () => {
  it('renders document name in toolbar', () => {
    render(<DocumentPreview document={makeDoc()} />)
    expect(screen.getByText('Test Agreement')).toBeInTheDocument()
  })

  it('shows zoom controls', () => {
    render(<DocumentPreview document={makeDoc()} />)
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument()
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument()
    expect(screen.getByLabelText('Reset zoom')).toHaveTextContent('100%')
  })

  it('shows print button', () => {
    render(<DocumentPreview document={makeDoc()} />)
    expect(screen.getByLabelText('Print document')).toBeInTheDocument()
  })

  it('shows field placeholders for unsigned fields', () => {
    render(<DocumentPreview document={makeDoc()} />)
    expect(screen.getByText('Signature')).toBeInTheDocument()
  })

  it('shows signer legend', () => {
    render(<DocumentPreview document={makeDoc()} />)
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('1 field')).toBeInTheDocument()
  })

  it('zoom in button increases zoom level', async () => {
    const user = userEvent.setup()
    render(<DocumentPreview document={makeDoc()} />)

    const zoomInBtn = screen.getByLabelText('Zoom in')
    await user.click(zoomInBtn)

    expect(screen.getByLabelText('Reset zoom')).toHaveTextContent('125%')
  })

  it('zoom out button decreases zoom level', async () => {
    const user = userEvent.setup()
    render(<DocumentPreview document={makeDoc()} />)

    // First zoom in, then zoom out
    await user.click(screen.getByLabelText('Zoom in'))
    await user.click(screen.getByLabelText('Zoom out'))

    expect(screen.getByLabelText('Reset zoom')).toHaveTextContent('100%')
  })

  it('shows close button when onClose is provided', () => {
    const onClose = vi.fn()
    render(<DocumentPreview document={makeDoc()} onClose={onClose} />)
    expect(screen.getByLabelText('Close preview')).toBeInTheDocument()
  })

  it('does not show close button when no onClose', () => {
    render(<DocumentPreview document={makeDoc()} />)
    expect(screen.queryByLabelText('Close preview')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<DocumentPreview document={makeDoc()} onClose={onClose} />)

    await user.click(screen.getByLabelText('Close preview'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows signed field with signature image for signed documents', () => {
    const doc = makeDoc({
      signatures: [
        { dataUrl: 'data:image/png;base64,abc123', timestamp: '2026-02-02T10:00:00Z', signerId: 's1' },
      ],
    })

    render(<DocumentPreview document={doc} />)
    const img = screen.getByAltText('signature by Jane Smith')
    expect(img).toBeInTheDocument()
  })

  it('has correct aria region role', () => {
    render(<DocumentPreview document={makeDoc()} />)
    expect(screen.getByRole('region', { name: 'Document preview' })).toBeInTheDocument()
  })

  it('shows multiple fields with field count in legend', () => {
    const doc = makeDoc({
      fields: [
        makeField({ id: 'f1' }),
        makeField({ id: 'f2', type: FieldType.DateSigned, label: 'Date' }),
      ],
    })

    render(<DocumentPreview document={doc} />)
    expect(screen.getByText('2 fields')).toBeInTheDocument()
  })
})
