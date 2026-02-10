import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentComparison from './DocumentComparison'
import { useDocumentStore } from '../../../../stores/useDocumentStore'
import { DocumentStatus, FieldType } from '../../../../types'
import type { Document } from '../../../../types'

function makeDocWithFields(): Document {
  return {
    id: 'doc-compare-1',
    name: 'Comparison Test Doc',
    status: DocumentStatus.Sent,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-02-05T14:00:00Z',
    fileUrl: '',
    fileType: 'application/pdf',
    signers: [
      { id: 's1', name: 'Jane Doe', email: 'jane@example.com', status: 'pending' as const, signedAt: null, order: 1 },
    ],
    signatures: [],
    audit: [
      { action: 'created', timestamp: '2026-01-10T10:00:00Z', userId: 'u1' },
      { action: 'sent', timestamp: '2026-01-15T08:00:00Z', userId: 'u1', detail: 'Sent to 1 signer' },
    ],
    fields: [
      {
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
      },
      {
        id: 'f2',
        type: FieldType.DateSigned,
        recipientId: 's1',
        page: 1,
        x: 100,
        y: 300,
        width: 150,
        height: 30,
        required: true,
        label: 'Date',
      },
    ],
    folderId: null,
    templateId: null,
    expiresAt: null,
    reminderSentAt: null,
    signingOrder: 'parallel' as const,
    pricingTable: null,
    notes: [],
  }
}

function makeDocNoFields(): Document {
  return {
    id: 'doc-compare-2',
    name: 'No Fields Doc',
    status: DocumentStatus.Draft,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
    fileUrl: '',
    fileType: 'application/pdf',
    signers: [],
    signatures: [],
    audit: [
      { action: 'created', timestamp: '2026-01-10T10:00:00Z', userId: 'u1' },
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

describe('DocumentComparison', () => {
  beforeEach(() => {
    // Reset the store before each test
    useDocumentStore.setState({ documents: [] })
  })

  it('renders the comparison header and title', () => {
    useDocumentStore.setState({ documents: [makeDocWithFields()] })

    render(<DocumentComparison documentId="doc-compare-1" onClose={vi.fn()} />)

    expect(screen.getByText('Compare Versions')).toBeInTheDocument()
  })

  it('shows summary stats for field changes', () => {
    useDocumentStore.setState({ documents: [makeDocWithFields()] })

    render(<DocumentComparison documentId="doc-compare-1" onClose={vi.fn()} />)

    // Should show the summary section with added/modified/removed counts
    const statusEl = screen.getByRole('status')
    expect(statusEl).toBeInTheDocument()
    // At minimum it should contain "added", "modified", "removed" text
    expect(statusEl.textContent).toContain('added')
    expect(statusEl.textContent).toContain('modified')
    expect(statusEl.textContent).toContain('removed')
  })

  it('shows "Document not found" for an invalid document ID', () => {
    useDocumentStore.setState({ documents: [] })

    render(<DocumentComparison documentId="nonexistent" onClose={vi.fn()} />)

    expect(screen.getByText('Document not found.')).toBeInTheDocument()
  })

  it('shows version selectors for left and right sides', () => {
    useDocumentStore.setState({ documents: [makeDocWithFields()] })

    render(<DocumentComparison documentId="doc-compare-1" onClose={vi.fn()} />)

    expect(screen.getByLabelText('Left version selector')).toBeInTheDocument()
    expect(screen.getByLabelText('Right version selector')).toBeInTheDocument()
  })

  it('calls onClose when close button or Close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    useDocumentStore.setState({ documents: [makeDocNoFields()] })

    render(<DocumentComparison documentId="doc-compare-2" onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Close comparison' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
