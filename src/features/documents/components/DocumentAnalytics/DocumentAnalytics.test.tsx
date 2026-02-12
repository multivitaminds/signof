import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import DocumentAnalytics from './DocumentAnalytics'
import { useDocumentStore } from '../../../../stores/useDocumentStore'
import { DocumentStatus, SignerStatus, SignerRole } from '../../../../types'
import type { Document } from '../../../../types'

function makeDoc(overrides: Partial<Document> = {}): Document {
  return {
    id: 'doc-' + Math.random().toString(36).slice(2, 6),
    name: 'Test Doc',
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
    ...overrides,
  }
}

describe('DocumentAnalytics', () => {
  beforeEach(() => {
    useDocumentStore.setState({ documents: [] })
  })

  it('renders the analytics header and title', () => {
    render(<DocumentAnalytics />)

    expect(screen.getByText('Document Analytics')).toBeInTheDocument()
    expect(screen.getByText('Signing metrics across all documents')).toBeInTheDocument()
  })

  it('shows correct total document count and completion rate', () => {
    useDocumentStore.setState({
      documents: [
        makeDoc({ status: DocumentStatus.Draft }),
        makeDoc({
          status: DocumentStatus.Completed,
          audit: [
            { action: 'created', timestamp: '2026-01-10T10:00:00Z', userId: 'u1' },
            { action: 'completed', timestamp: '2026-01-11T10:00:00Z', userId: 'system' },
          ],
        }),
        makeDoc({ status: DocumentStatus.Pending }),
        makeDoc({
          status: DocumentStatus.Completed,
          audit: [
            { action: 'created', timestamp: '2026-01-12T10:00:00Z', userId: 'u1' },
            { action: 'completed', timestamp: '2026-01-13T10:00:00Z', userId: 'system' },
          ],
        }),
      ],
    })

    render(<DocumentAnalytics />)

    // Total count appears both in metric card and donut center
    expect(screen.getByText('Total Documents')).toBeInTheDocument()
    const totalElements = screen.getAllByText('4')
    expect(totalElements.length).toBeGreaterThanOrEqual(1)

    // Completion rate: 2/4 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('Completion Rate')).toBeInTheDocument()
  })

  it('shows the donut chart with status legend', () => {
    useDocumentStore.setState({
      documents: [
        makeDoc({ status: DocumentStatus.Draft }),
        makeDoc({ status: DocumentStatus.Completed }),
      ],
    })

    render(<DocumentAnalytics />)

    expect(screen.getByRole('img', { name: /donut chart/i })).toBeInTheDocument()
    expect(screen.getByText('Documents by Status')).toBeInTheDocument()
  })

  it('shows most active signers when signed documents exist', () => {
    useDocumentStore.setState({
      documents: [
        makeDoc({
          status: DocumentStatus.Completed,
          signers: [
            {
              id: 's1',
              name: 'Alice',
              email: 'alice@example.com',
              status: SignerStatus.Signed,
              signedAt: '2026-01-15T10:00:00Z',
              order: 1, role: SignerRole.Signer,
            },
          ],
        }),
      ],
    })

    render(<DocumentAnalytics />)

    expect(screen.getByText('Most Active Signers')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('1 signed')).toBeInTheDocument()
  })

  it('shows empty state when no documents exist', () => {
    useDocumentStore.setState({ documents: [] })

    render(<DocumentAnalytics />)

    // Total count 0 appears in both metric card and donut center
    const zeroElements = screen.getAllByText('0')
    expect(zeroElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('No signed documents yet')).toBeInTheDocument()
    expect(screen.getByText('No completed documents yet')).toBeInTheDocument()
  })
})
