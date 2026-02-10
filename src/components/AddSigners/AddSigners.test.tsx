import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddSigners from './AddSigners'
import { DocumentStatus, SignerStatus } from '../../types'
import type { Document, Signer } from '../../types'

const makeSigner = (overrides: Partial<Signer> = {}): Signer => ({
  id: 's1',
  name: 'Alice',
  email: 'alice@example.com',
  status: SignerStatus.Pending,
  signedAt: null,
  order: 1,
  ...overrides,
})

const makeDoc = (overrides: Partial<Document> = {}): Document => ({
  id: 'doc-1',
  name: 'Test Contract',
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
  ...overrides,
})

const noop = () => {}

describe('AddSigners', () => {
  it('renders document name', () => {
    render(
      <AddSigners
        document={makeDoc({ name: 'Sales Agreement' })}
        onSend={noop}
        onSaveDraft={noop}
        onAddSigner={noop}
        onRemoveSigner={noop}
      />
    )
    expect(screen.getByText('Sales Agreement')).toBeInTheDocument()
  })

  it('renders name and email inputs', () => {
    render(
      <AddSigners
        document={makeDoc()}
        onSend={noop}
        onSaveDraft={noop}
        onAddSigner={noop}
        onRemoveSigner={noop}
      />
    )
    expect(screen.getByPlaceholderText('Signer name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Signer email')).toBeInTheDocument()
  })

  it('calls onAddSigner with name and email values', async () => {
    const user = userEvent.setup()
    const onAddSigner = vi.fn()
    render(
      <AddSigners
        document={makeDoc()}
        onSend={noop}
        onSaveDraft={noop}
        onAddSigner={onAddSigner}
        onRemoveSigner={noop}
      />
    )

    await user.type(screen.getByPlaceholderText('Signer name'), 'Bob')
    await user.type(screen.getByPlaceholderText('Signer email'), 'bob@test.com')
    await user.click(screen.getByRole('button', { name: 'Add Signer' }))

    expect(onAddSigner).toHaveBeenCalledWith('Bob', 'bob@test.com')
  })

  it('clears inputs after successful add', async () => {
    const user = userEvent.setup()
    render(
      <AddSigners
        document={makeDoc()}
        onSend={noop}
        onSaveDraft={noop}
        onAddSigner={noop}
        onRemoveSigner={noop}
      />
    )

    const nameInput = screen.getByPlaceholderText('Signer name')
    const emailInput = screen.getByPlaceholderText('Signer email')

    await user.type(nameInput, 'Bob')
    await user.type(emailInput, 'bob@test.com')
    await user.click(screen.getByRole('button', { name: 'Add Signer' }))

    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
  })

  it('shows validation error for empty name', async () => {
    const user = userEvent.setup()
    render(
      <AddSigners
        document={makeDoc()}
        onSend={noop}
        onSaveDraft={noop}
        onAddSigner={noop}
        onRemoveSigner={noop}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Add Signer' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required')
  })

  it('shows validation error for email without @', async () => {
    const user = userEvent.setup()
    render(
      <AddSigners
        document={makeDoc()}
        onSend={noop}
        onSaveDraft={noop}
        onAddSigner={noop}
        onRemoveSigner={noop}
      />
    )

    await user.type(screen.getByPlaceholderText('Signer name'), 'Bob')
    await user.type(screen.getByPlaceholderText('Signer email'), 'invalid-email')
    await user.click(screen.getByRole('button', { name: 'Add Signer' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address')
  })

  it('Send button disabled when no signers', () => {
    render(
      <AddSigners
        document={makeDoc({ signers: [] })}
        onSend={noop}
        onSaveDraft={noop}
        onAddSigner={noop}
        onRemoveSigner={noop}
      />
    )
    expect(screen.getByRole('button', { name: 'Send Document' })).toBeDisabled()
  })

  it('Send button enabled and calls onSend when signers exist', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(
      <AddSigners
        document={makeDoc({ signers: [makeSigner()] })}
        onSend={onSend}
        onSaveDraft={noop}
        onAddSigner={noop}
        onRemoveSigner={noop}
      />
    )

    const sendBtn = screen.getByRole('button', { name: 'Send Document' })
    expect(sendBtn).toBeEnabled()
    await user.click(sendBtn)
    expect(onSend).toHaveBeenCalledOnce()
  })

  it('Save as Draft calls onSaveDraft', async () => {
    const user = userEvent.setup()
    const onSaveDraft = vi.fn()
    render(
      <AddSigners
        document={makeDoc()}
        onSend={noop}
        onSaveDraft={onSaveDraft}
        onAddSigner={noop}
        onRemoveSigner={noop}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Save as Draft' }))
    expect(onSaveDraft).toHaveBeenCalledOnce()
  })

  it('Remove button calls onRemoveSigner with signer id', async () => {
    const user = userEvent.setup()
    const onRemoveSigner = vi.fn()
    render(
      <AddSigners
        document={makeDoc({
          signers: [makeSigner({ id: 'signer-42', name: 'Carol' })],
        })}
        onSend={noop}
        onSaveDraft={noop}
        onAddSigner={noop}
        onRemoveSigner={onRemoveSigner}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Remove Carol' }))
    expect(onRemoveSigner).toHaveBeenCalledWith('signer-42')
  })
})
