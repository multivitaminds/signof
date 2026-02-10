import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GuidedSigningView from './GuidedSigningView'
import type { Document } from '../../../../types'
import { DocumentStatus, SignerStatus, FieldType } from '../../../../types'

function createDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: 'doc1',
    name: 'Test Agreement',
    status: DocumentStatus.Pending,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    fileUrl: '',
    fileType: 'application/pdf',
    signers: [
      { id: 's1', name: 'John Doe', email: 'john@example.com', status: SignerStatus.Pending, signedAt: null, order: 1 },
    ],
    signatures: [],
    audit: [],
    fields: [
      {
        id: 'f1',
        type: FieldType.Text,
        recipientId: 's1',
        page: 1,
        x: 100,
        y: 100,
        width: 200,
        height: 30,
        required: true,
        label: 'Full Name',
        placeholder: 'Enter your name',
      },
      {
        id: 'f2',
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
    ],
    folderId: null,
    templateId: null,
    expiresAt: null,
    reminderSentAt: null,
    ...overrides,
  }
}

describe('GuidedSigningView', () => {
  it('renders document name and signer info', () => {
    render(
      <GuidedSigningView
        document={createDocument()}
        signerId="s1"
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('Test Agreement')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('shows error state when signer not found', () => {
    render(
      <GuidedSigningView
        document={createDocument()}
        signerId="invalid"
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('Signer not found')).toBeInTheDocument()
  })

  it('shows empty state when no fields for signer', () => {
    render(
      <GuidedSigningView
        document={createDocument({ fields: [] })}
        signerId="s1"
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('No fields assigned to this signer')).toBeInTheDocument()
  })

  it('displays field list in sidebar', () => {
    render(
      <GuidedSigningView
        document={createDocument()}
        signerId="s1"
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getAllByText('Full Name').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Signature').length).toBeGreaterThan(0)
  })

  it('has navigation buttons', () => {
    render(
      <GuidedSigningView
        document={createDocument()}
        signerId="s1"
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('Previous')).toBeDisabled()
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('navigates to next field on Next click', async () => {
    const user = userEvent.setup()
    render(
      <GuidedSigningView
        document={createDocument()}
        signerId="s1"
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    await user.click(screen.getByText('Next'))
    expect(screen.getByText('Complete')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <GuidedSigningView
        document={createDocument()}
        signerId="s1"
        onComplete={vi.fn()}
        onCancel={onCancel}
      />
    )
    await user.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows progress indicator', () => {
    render(
      <GuidedSigningView
        document={createDocument()}
        signerId="s1"
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('Field 1 of 2')).toBeInTheDocument()
  })
})
