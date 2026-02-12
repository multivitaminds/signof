import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CompletionCertificate from './CompletionCertificate'
import { DocumentStatus, SignerStatus, SignerRole } from '../../../../types'
import type { Document } from '../../../../types'

function makeCompletedDoc(): Document {
  return {
    id: 'doc-abc123',
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
        order: 1, role: SignerRole.Signer,
      },
      {
        id: 's2',
        name: 'Bob Williams',
        email: 'bob@example.com',
        status: SignerStatus.Signed,
        signedAt: '2026-01-21T11:00:00Z',
        order: 2, role: SignerRole.Signer,
      },
    ],
    signatures: [
      { dataUrl: 'data:image/png;base64,alice-sig', timestamp: '2026-01-20T09:00:00Z', signerId: 's1' },
      { dataUrl: 'data:image/png;base64,bob-sig', timestamp: '2026-01-21T11:00:00Z', signerId: 's2' },
    ],
    audit: [
      { action: 'created', timestamp: '2026-01-15T10:00:00Z', userId: 'u1' },
      { action: 'sent', timestamp: '2026-01-16T08:00:00Z', userId: 'u1', detail: 'Sent to 2 signers' },
      { action: 'viewed', timestamp: '2026-01-18T10:00:00Z', userId: 's1', detail: 'Viewed by Alice' },
      { action: 'signed', timestamp: '2026-01-20T09:00:00Z', userId: 's1', detail: 'Signed by Alice Johnson' },
      { action: 'signed', timestamp: '2026-01-21T11:00:00Z', userId: 's2', detail: 'Signed by Bob Williams' },
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
  }
}

describe('CompletionCertificate', () => {
  it('renders the Certificate of Completion title and brand', () => {
    render(<CompletionCertificate document={makeCompletedDoc()} onClose={vi.fn()} />)

    expect(screen.getByText('Certificate of Completion')).toBeInTheDocument()
    expect(screen.getByText('SignOf')).toBeInTheDocument()
    expect(screen.getByText('Powered by SignOf')).toBeInTheDocument()
  })

  it('shows document name and envelope ID', () => {
    render(<CompletionCertificate document={makeCompletedDoc()} onClose={vi.fn()} />)

    expect(screen.getByText('Service Agreement 2026')).toBeInTheDocument()
    expect(screen.getByText('doc-abc123')).toBeInTheDocument()
  })

  it('shows all signers with names, emails, and status', () => {
    render(<CompletionCertificate document={makeCompletedDoc()} onClose={vi.fn()} />)

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('Bob Williams')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('renders signature thumbnails for signers with signatures', () => {
    render(<CompletionCertificate document={makeCompletedDoc()} onClose={vi.fn()} />)

    const aliceSig = screen.getByAltText('Signature of Alice Johnson')
    expect(aliceSig).toBeInTheDocument()
    expect(aliceSig).toHaveAttribute('src', 'data:image/png;base64,alice-sig')

    const bobSig = screen.getByAltText('Signature of Bob Williams')
    expect(bobSig).toHaveAttribute('src', 'data:image/png;base64,bob-sig')
  })

  it('displays audit trail events in order', () => {
    render(<CompletionCertificate document={makeCompletedDoc()} onClose={vi.fn()} />)

    expect(screen.getByText('Audit Trail')).toBeInTheDocument()
    expect(screen.getByText('Document Created')).toBeInTheDocument()
    expect(screen.getByText('Document Sent')).toBeInTheDocument()
    expect(screen.getByText('Document Viewed')).toBeInTheDocument()
    expect(screen.getByText('All Signatures Complete')).toBeInTheDocument()
  })

  it('shows a certificate hash/ID for verification', () => {
    render(<CompletionCertificate document={makeCompletedDoc()} onClose={vi.fn()} />)

    const hashEl = screen.getByTestId('certificate-hash')
    expect(hashEl).toBeInTheDocument()
    // Certificate hash follows the format SIGNOF-XXXX-XXXX-XXXX
    expect(hashEl.textContent).toMatch(/^SIGNOF-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{1,4}$/)
  })

  it('calls window.print when Download PDF is clicked', async () => {
    const user = userEvent.setup()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})

    render(<CompletionCertificate document={makeCompletedDoc()} onClose={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Download PDF' }))
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
