import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BulkSendModal from './BulkSendModal'
import { DocumentStatus, SigningOrder } from '../../../../types'
import type { Document } from '../../../../types'

function makeDoc(): Document {
  return {
    id: 'doc-1',
    name: 'Service Agreement',
    status: DocumentStatus.Draft,
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
    signingOrder: SigningOrder.Parallel,
    pricingTable: null,
    notes: [],
  }
}

describe('BulkSendModal', () => {
  it('renders the modal with title and document name', () => {
    render(
      <BulkSendModal document={makeDoc()} onSend={vi.fn()} onCancel={vi.fn()} />
    )
    expect(screen.getByText('Bulk Send')).toBeInTheDocument()
    expect(screen.getByText('Service Agreement')).toBeInTheDocument()
  })

  it('has dialog role and aria attributes', () => {
    render(
      <BulkSendModal document={makeDoc()} onSend={vi.fn()} onCancel={vi.fn()} />
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('starts with one empty recipient row', () => {
    render(
      <BulkSendModal document={makeDoc()} onSend={vi.fn()} onCancel={vi.fn()} />
    )
    expect(screen.getByLabelText('Recipient 1 name')).toBeInTheDocument()
    expect(screen.getByLabelText('Recipient 1 email')).toBeInTheDocument()
    expect(screen.getByText('1 added')).toBeInTheDocument()
  })

  it('adds a new recipient row when Add Recipient is clicked', async () => {
    const user = userEvent.setup()
    render(
      <BulkSendModal document={makeDoc()} onSend={vi.fn()} onCancel={vi.fn()} />
    )

    await user.click(screen.getByText('Add Recipient'))
    expect(screen.getByLabelText('Recipient 2 name')).toBeInTheDocument()
    expect(screen.getByText('2 added')).toBeInTheDocument()
  })

  it('removes a recipient row when remove button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <BulkSendModal document={makeDoc()} onSend={vi.fn()} onCancel={vi.fn()} />
    )

    await user.click(screen.getByText('Add Recipient'))
    expect(screen.getByLabelText('Recipient 2 name')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Remove recipient 2'))
    expect(screen.queryByLabelText('Recipient 2 name')).not.toBeInTheDocument()
  })

  it('shows preview count of valid recipients', async () => {
    const user = userEvent.setup()
    render(
      <BulkSendModal document={makeDoc()} onSend={vi.fn()} onCancel={vi.fn()} />
    )

    expect(screen.getByText('Will send to 0 recipients')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Recipient 1 name'), 'Alice')
    await user.type(screen.getByLabelText('Recipient 1 email'), 'alice@example.com')

    expect(screen.getByText('Will send to 1 recipient')).toBeInTheDocument()
  })

  it('Send All button is disabled when no valid recipients', () => {
    render(
      <BulkSendModal document={makeDoc()} onSend={vi.fn()} onCancel={vi.fn()} />
    )
    expect(screen.getByText('Send All').closest('button')).toBeDisabled()
  })

  it('calls onSend with valid recipients when Send All is clicked', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(
      <BulkSendModal document={makeDoc()} onSend={onSend} onCancel={vi.fn()} />
    )

    await user.type(screen.getByLabelText('Recipient 1 name'), 'Alice')
    await user.type(screen.getByLabelText('Recipient 1 email'), 'alice@example.com')

    await user.click(screen.getByText('Add Recipient'))
    await user.type(screen.getByLabelText('Recipient 2 name'), 'Bob')
    await user.type(screen.getByLabelText('Recipient 2 email'), 'bob@example.com')

    await user.click(screen.getByText('Send All'))

    expect(onSend).toHaveBeenCalledWith([
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ])
  })

  it('shows error for invalid email', async () => {
    const user = userEvent.setup()
    render(
      <BulkSendModal document={makeDoc()} onSend={vi.fn()} onCancel={vi.fn()} />
    )

    await user.type(screen.getByLabelText('Recipient 1 name'), 'Alice')
    await user.type(screen.getByLabelText('Recipient 1 email'), 'invalid-email')

    // The count shows 0 because email is invalid
    expect(screen.getByText('Will send to 0 recipients')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <BulkSendModal document={makeDoc()} onSend={vi.fn()} onCancel={onCancel} />
    )

    await user.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onCancel when Close button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <BulkSendModal document={makeDoc()} onSend={vi.fn()} onCancel={onCancel} />
    )

    await user.click(screen.getByLabelText('Close'))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
