import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SigningCeremony from './SigningCeremony'
import { DocumentStatus, SignerStatus } from '../../types'
import type { Document, Signer } from '../../types'

// Mock SignaturePad to avoid canvas/ResizeObserver issues in tests
vi.mock('../SignaturePad/SignaturePad', () => ({
  default: ({ onSave, onCancel }: { onSave: (dataUrl: string) => void; onCancel?: () => void }) => (
    <div data-testid="mock-signature-pad">
      <span>Sign here</span>
      <button type="button" onClick={() => onSave('data:image/png;base64,test-sig')}>
        Save
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </div>
  ),
}))

const makeSigner = (): Signer => ({
  id: 's1',
  name: 'Jane Smith',
  email: 'jane@example.com',
  status: SignerStatus.Pending,
  signedAt: null,
  order: 1,
})

const makeDoc = (): Document => ({
  id: 'doc1',
  name: 'Test Agreement',
  status: DocumentStatus.Pending,
  createdAt: '2026-02-01T10:00:00Z',
  updatedAt: '2026-02-01T10:00:00Z',
  fileUrl: '',
  fileType: 'application/pdf',
  signers: [makeSigner()],
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
})

describe('SigningCeremony', () => {
  it('shows identity step with signer name and document name', () => {
    render(
      <SigningCeremony
        document={makeDoc()}
        signer={makeSigner()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText('Verify Your Identity')).toBeInTheDocument()
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument()
    expect(screen.getByText(/jane@example\.com/)).toBeInTheDocument()
    expect(screen.getByText(/Test Agreement/)).toBeInTheDocument()
  })

  it('Continue advances to agreement step', async () => {
    const user = userEvent.setup()

    render(
      <SigningCeremony
        document={makeDoc()}
        signer={makeSigner()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(screen.getByText('Electronic Signature Agreement')).toBeInTheDocument()
    expect(
      screen.getByLabelText(/I agree to use electronic signatures/),
    ).toBeInTheDocument()
  })

  it('agreement checkbox must be checked to proceed', async () => {
    const user = userEvent.setup()

    render(
      <SigningCeremony
        document={makeDoc()}
        signer={makeSigner()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    // Advance to agreement step
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    // Continue button is disabled when unchecked
    const continueBtn = screen.getByRole('button', { name: 'Continue' })
    expect(continueBtn).toBeDisabled()

    // Check the checkbox
    await user.click(screen.getByLabelText(/I agree to use electronic signatures/))

    // Now Continue is enabled
    expect(continueBtn).toBeEnabled()
  })

  it('after agreement, signature step appears with SignaturePad', async () => {
    const user = userEvent.setup()

    render(
      <SigningCeremony
        document={makeDoc()}
        signer={makeSigner()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    // Advance through identity
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    // Check agreement and continue
    await user.click(screen.getByLabelText(/I agree to use electronic signatures/))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    // Should show the Sign step with mocked SignaturePad
    expect(screen.getByText('Sign the Document')).toBeInTheDocument()
    expect(screen.getByTestId('mock-signature-pad')).toBeInTheDocument()
  })

  it('confirmation step shows success message after signing', async () => {
    const user = userEvent.setup()

    render(
      <SigningCeremony
        document={makeDoc()}
        signer={makeSigner()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    // Navigate to signature step
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByLabelText(/I agree to use electronic signatures/))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    // Click Save in the mocked SignaturePad to trigger onSave
    await user.click(screen.getByRole('button', { name: 'Save' }))

    // Should show confirmation step
    expect(screen.getByText('Document signed successfully!')).toBeInTheDocument()
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
  })

  it('onCancel called when cancel clicked on identity step', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
      <SigningCeremony
        document={makeDoc()}
        signer={makeSigner()}
        onComplete={vi.fn()}
        onCancel={onCancel}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('onCancel called when cancel clicked on agreement step', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
      <SigningCeremony
        document={makeDoc()}
        signer={makeSigner()}
        onComplete={vi.fn()}
        onCancel={onCancel}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('Done button on confirmation calls onComplete with dataUrl', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()

    render(
      <SigningCeremony
        document={makeDoc()}
        signer={makeSigner()}
        onComplete={onComplete}
        onCancel={vi.fn()}
      />,
    )

    // Navigate through all steps
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByLabelText(/I agree to use electronic signatures/))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    // Click Done on confirmation step
    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(onComplete).toHaveBeenCalledWith('data:image/png;base64,test-sig')
  })

  it('shows step indicator with 4 steps', () => {
    render(
      <SigningCeremony
        document={makeDoc()}
        signer={makeSigner()}
        onComplete={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText('Identity')).toBeInTheDocument()
    expect(screen.getByText('Agreement')).toBeInTheDocument()
    expect(screen.getByText('Sign')).toBeInTheDocument()
    expect(screen.getByText('Confirmation')).toBeInTheDocument()
  })
})
