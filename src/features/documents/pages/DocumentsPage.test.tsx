import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import DocumentsHubPage from './DocumentsPage'
import { DocumentStatus, SignerStatus, SignerRole, SigningOrder } from '../../../types'
import type { Document } from '../../../types'

const MOCK_DOCS: Document[] = [
  {
    id: '1',
    name: 'Employment Agreement',
    status: DocumentStatus.Pending,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    fileUrl: '',
    fileType: 'application/pdf',
    signers: [
      { id: 's1', name: 'Jane Smith', email: 'jane@test.com', status: SignerStatus.Pending, signedAt: null, order: 1, role: SignerRole.Signer },
      { id: 's2', name: 'John Doe', email: 'john@test.com', status: SignerStatus.Signed, signedAt: '2026-02-01T12:00:00Z', order: 2, role: SignerRole.Signer },
    ],
    signatures: [],
    audit: [],
    fields: [],
    folderId: null,
    templateId: null,
    expiresAt: null,
    reminderSentAt: null,
    signingOrder: SigningOrder.Parallel,
    pricingTable: null,
    notes: [],
  },
  {
    id: '2',
    name: 'NDA Agreement',
    status: DocumentStatus.Completed,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-20T08:00:00Z',
    fileUrl: '',
    fileType: 'application/pdf',
    signers: [
      { id: 's3', name: 'Alice Brown', email: 'alice@test.com', status: SignerStatus.Signed, signedAt: '2026-01-20T08:00:00Z', order: 1, role: SignerRole.Signer },
    ],
    signatures: [],
    audit: [],
    fields: [],
    folderId: null,
    templateId: null,
    expiresAt: null,
    reminderSentAt: null,
    signingOrder: SigningOrder.Parallel,
    pricingTable: null,
    notes: [],
  },
  {
    id: '3',
    name: 'Lease Contract',
    status: DocumentStatus.Draft,
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-10T09:00:00Z',
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
    signingOrder: SigningOrder.Parallel,
    pricingTable: null,
    notes: [],
  },
]

const mockDeleteDocument = vi.fn()
const mockSendDocument = vi.fn()

vi.mock('../../../stores/useDocumentStore', () => ({
  useDocumentStore: () => ({
    documents: MOCK_DOCS,
    deleteDocument: mockDeleteDocument,
    sendDocument: mockSendDocument,
  }),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <DocumentsHubPage />
    </MemoryRouter>
  )
}

describe('DocumentsHubPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title and New Document button', () => {
    renderPage()
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('New Document')).toBeInTheDocument()
  })

  it('renders stat cards with correct counts', () => {
    renderPage()
    // Stat labels are within .docs-hub__stat-label elements
    const statLabels = document.querySelectorAll('.docs-hub__stat-label')
    const labelTexts = Array.from(statLabels).map(el => el.textContent)
    expect(labelTexts).toContain('Total')
    expect(labelTexts).toContain('Pending')
    expect(labelTexts).toContain('Completed')
    expect(labelTexts).toContain('Expiring Soon')

    // Stat values
    const statValues = document.querySelectorAll('.docs-hub__stat-value')
    const values = Array.from(statValues).map(el => el.textContent)
    expect(values).toEqual(['3', '1', '1', '0'])
  })

  it('filters documents by status chip click', async () => {
    const user = userEvent.setup()
    renderPage()

    // Click "Draft" filter
    const draftChip = screen.getByRole('button', { name: /draft/i })
    await user.click(draftChip)

    // Only "Lease Contract" should be visible
    expect(screen.getByText('Lease Contract')).toBeInTheDocument()
    expect(screen.queryByText('Employment Agreement')).not.toBeInTheDocument()
    expect(screen.queryByText('NDA Agreement')).not.toBeInTheDocument()
  })

  it('searches documents by name', async () => {
    const user = userEvent.setup()
    renderPage()

    const searchInput = screen.getByPlaceholderText('Search documents...')
    await user.type(searchInput, 'NDA')

    expect(screen.getByText('NDA Agreement')).toBeInTheDocument()
    expect(screen.queryByText('Employment Agreement')).not.toBeInTheDocument()
    expect(screen.queryByText('Lease Contract')).not.toBeInTheDocument()
  })

  it('toggles between grid and list view', async () => {
    const user = userEvent.setup()
    renderPage()

    const listBtn = screen.getByLabelText('List view')
    await user.click(listBtn)

    const grid = document.querySelector('.docs-hub__grid')
    expect(grid?.classList.contains('docs-hub__grid--list')).toBe(true)

    const gridBtn = screen.getByLabelText('Grid view')
    await user.click(gridBtn)
    expect(grid?.classList.contains('docs-hub__grid--list')).toBe(false)
  })

  it('shows empty state when no documents match filter', async () => {
    const user = userEvent.setup()
    renderPage()

    const searchInput = screen.getByPlaceholderText('Search documents...')
    await user.type(searchInput, 'zzzznonexistent')

    expect(screen.getByText('No documents found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters or search query.')).toBeInTheDocument()
  })

  it('shows bulk action bar when documents are selected', async () => {
    const user = userEvent.setup()
    renderPage()

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0]!)

    expect(screen.getByText('1 item selected')).toBeInTheDocument()
    const bulkBar = screen.getByRole('toolbar', { name: 'Bulk actions' })
    expect(bulkBar).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Selected' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send Selected' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export Selected' })).toBeInTheDocument()
  })

  it('sorts documents by selected option', async () => {
    const user = userEvent.setup()
    renderPage()

    const sortSelect = screen.getByLabelText('Sort documents')
    await user.selectOptions(sortSelect, 'name-asc')

    const cards = screen.getAllByRole('heading', { level: 3 })
    const names = cards.map(c => c.textContent)
    // Name A-Z: Employment Agreement, Lease Contract, NDA Agreement
    expect(names[0]).toBe('Employment Agreement')
    expect(names[1]).toBe('Lease Contract')
    expect(names[2]).toBe('NDA Agreement')
  })
})
