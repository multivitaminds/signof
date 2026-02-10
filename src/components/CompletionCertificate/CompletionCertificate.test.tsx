import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CompletionCertificate from './CompletionCertificate'
import { DocumentStatus, SignerStatus } from '../../types'
import type { Document } from '../../types'

const makeCompletedDoc = (): Document => ({
  id: 'doc1',
  name: 'Service Agreement 2026',
  status: DocumentStatus.Completed,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-02-01T14:30:00Z',
  fileUrl: '',
  fileType: 'application/pdf',
  signers: [
    {
      id: 's1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      status: SignerStatus.Signed,
      signedAt: '2026-01-20T09:00:00Z',
      order: 1,
    },
    {
      id: 's2',
      name: 'Bob Williams',
      email: 'bob@example.com',
      status: SignerStatus.Signed,
      signedAt: '2026-01-21T11:00:00Z',
      order: 2,
    },
  ],
  signatures: [
    { dataUrl: 'data:image/png;base64,alice-sig', timestamp: '2026-01-20T09:00:00Z', signerId: 's1' },
    { dataUrl: 'data:image/png;base64,bob-sig', timestamp: '2026-01-21T11:00:00Z', signerId: 's2' },
  ],
  audit: [
    { action: 'created', timestamp: '2026-01-15T10:00:00Z', userId: 'u1' },
    { action: 'signed', timestamp: '2026-01-20T09:00:00Z', userId: 's1' },
    { action: 'signed', timestamp: '2026-01-21T11:00:00Z', userId: 's2' },
    { action: 'completed', timestamp: '2026-01-21T11:05:00Z', userId: 'system' },
  ],
  fields: [],
  folderId: null,
  templateId: null,
  expiresAt: null,
  reminderSentAt: null,
  signingOrder: 'parallel' as const,
  pricingTable: null,
  notes: [],
})

describe('CompletionCertificate', () => {
  it('shows Certificate of Completion heading', () => {
    render(<CompletionCertificate document={makeCompletedDoc()} onClose={vi.fn()} />)

    expect(screen.getByText('Certificate of Completion')).toBeInTheDocument()
  })

  it('shows SignOf brand text', () => {
    render(<CompletionCertificate document={makeCompletedDoc()} onClose={vi.fn()} />)

    expect(screen.getByText('SignOf')).toBeInTheDocument()
  })

  it('shows document name', () => {
    render(<CompletionCertificate document={makeCompletedDoc()} onClose={vi.fn()} />)

    expect(screen.getByText('Service Agreement 2026')).toBeInTheDocument()
  })

  it('shows signer names and emails', () => {
    render(<CompletionCertificate document={makeCompletedDoc()} onClose={vi.fn()} />)

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('Bob Williams')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('shows signature thumbnails for signers with signatures', () => {
    render(<CompletionCertificate document={makeCompletedDoc()} onClose={vi.fn()} />)

    const aliceSig = screen.getByAltText('Signature of Alice Johnson')
    expect(aliceSig).toBeInTheDocument()
    expect(aliceSig).toHaveAttribute('src', 'data:image/png;base64,alice-sig')

    const bobSig = screen.getByAltText('Signature of Bob Williams')
    expect(bobSig).toBeInTheDocument()
    expect(bobSig).toHaveAttribute('src', 'data:image/png;base64,bob-sig')
  })

  it('shows completion date from audit trail', () => {
    render(<CompletionCertificate document={makeCompletedDoc()} onClose={vi.fn()} />)

    // The completed audit entry is 2026-01-21, shown in the "Completed on" line
    expect(screen.getByText(/Completed on\s+January 21, 2026/)).toBeInTheDocument()
  })

  it('falls back to updatedAt when no completed audit entry', () => {
    const doc = makeCompletedDoc()
    doc.audit = [{ action: 'created', timestamp: '2026-01-15T10:00:00Z', userId: 'u1' }]

    render(<CompletionCertificate document={doc} onClose={vi.fn()} />)

    // Falls back to updatedAt: 2026-02-01
    expect(screen.getByText(/February 1, 2026/)).toBeInTheDocument()
  })

  it('Print button calls window.print', async () => {
    const user = userEvent.setup()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})

    render(<CompletionCertificate document={makeCompletedDoc()} onClose={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Print / Download' }))
    expect(printSpy).toHaveBeenCalledOnce()

    printSpy.mockRestore()
  })

  it('Close button calls onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<CompletionCertificate document={makeCompletedDoc()} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
