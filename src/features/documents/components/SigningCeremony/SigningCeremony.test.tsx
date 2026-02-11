import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SigningCeremony from './SigningCeremony'
import { DocumentStatus, SignerStatus, FieldType } from '../../../../types'
import type { Document, Signer, DocumentField } from '../../../../types'

// Mock ResizeObserver for canvas tests
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

beforeAll(() => {
  (globalThis as Record<string, unknown>).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

  // Mock canvas context
  const mockCtx = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
  }

  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCtx)
  HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,test-sig')
})

const makeSigner = (overrides?: Partial<Signer>): Signer => ({
  id: 's1',
  name: 'Jane Smith',
  email: 'jane@example.com',
  status: SignerStatus.Pending,
  signedAt: null,
  order: 1,
  ...overrides,
})

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
  signers: [makeSigner()],
  signatures: [],
  audit: [],
  fields: [makeField()],
  folderId: null,
  templateId: null,
  expiresAt: null,
  reminderSentAt: null,
  signingOrder: 'parallel' as const,
  pricingTable: null,
  notes: [],
  ...overrides,
})

/** Helper to advance from review to sign step */
async function advanceToSignStep(user: ReturnType<typeof userEvent.setup>) {
  // Check both the review checkbox and the terms checkbox
  const checkboxes = screen.getAllByRole('checkbox')
  for (const cb of checkboxes) {
    if (!(cb as HTMLInputElement).checked) {
      await user.click(cb)
    }
  }
  await user.click(screen.getByRole('button', { name: /next/i }))
}

/** Helper to complete entire flow with typed signature */
async function completeFullFlow(user: ReturnType<typeof userEvent.setup>) {
  await advanceToSignStep(user)
  await user.click(screen.getByRole('tab', { name: /type/i }))
  await user.type(screen.getByLabelText('Type your signature'), 'Jane Smith')
  await user.click(screen.getByRole('button', { name: /finish signing/i }))
}

describe('SigningCeremony', () => {
  describe('Step 1 - Review', () => {
    it('renders review step initially with document name', () => {
      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByText('Review Document')).toBeInTheDocument()
      // Document name appears in top bar and doc info, so use getAllByText
      const nameElements = screen.getAllByText('Test Agreement')
      expect(nameElements.length).toBeGreaterThanOrEqual(1)
    })

    it('shows signer name in document info', () => {
      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('shows fields to complete listing', () => {
      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByText(/Fields to complete/)).toBeInTheDocument()
    })

    it('Next button is disabled until both review and terms checkboxes are checked', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      const nextBtn = screen.getByRole('button', { name: /next/i })
      expect(nextBtn).toBeDisabled()

      // Check review checkbox only
      await user.click(
        screen.getByLabelText(/I have reviewed this document/i)
      )
      // Still disabled since terms not accepted
      expect(nextBtn).toBeDisabled()

      // Check terms checkbox
      await user.click(
        screen.getByLabelText(/I agree to use electronic signatures/i)
      )
      // Now enabled
      expect(nextBtn).toBeEnabled()
    })

    it('shows 3-step progress indicator', () => {
      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByText('Review')).toBeInTheDocument()
      // "Sign" may appear in multiple contexts; check step indicator via navigation role
      expect(
        screen.getByRole('navigation', { name: 'Signing progress' })
      ).toBeInTheDocument()
      expect(screen.getByText('Complete')).toBeInTheDocument()
    })
  })

  describe('Step 2 - Sign', () => {
    it('advances to sign step after reviewing', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)

      expect(screen.getByText('Sign Document')).toBeInTheDocument()
    })

    it('shows draw and type tabs for signature fields', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)

      expect(screen.getByRole('tab', { name: /draw/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /type/i })).toBeInTheDocument()
    })

    it('can switch to type signature mode', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)
      await user.click(screen.getByRole('tab', { name: /type/i }))

      const typeInput = screen.getByLabelText('Type your signature')
      expect(typeInput).toBeInTheDocument()
    })

    it('shows typed text in preview', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)
      await user.click(screen.getByRole('tab', { name: /type/i }))

      const typeInput = screen.getByLabelText('Type your signature')
      await user.type(typeInput, 'Jane Smith')

      expect(screen.getByLabelText('Signature preview')).toHaveTextContent('Jane Smith')
    })

    it('shows initials input for initial-type fields', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc({
            fields: [
              makeField({ type: FieldType.Initial, label: 'Initials', id: 'f-init' }),
            ],
          })}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)

      expect(screen.getByLabelText('Type your initials')).toBeInTheDocument()
    })

    it('auto-fills date for date_signed fields', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc({
            fields: [
              makeField({
                type: FieldType.DateSigned,
                label: 'Date Signed',
                id: 'f-date',
              }),
            ],
          })}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)

      expect(screen.getByText(/auto-filled/i)).toBeInTheDocument()
    })

    it('shows field counter for multi-field documents', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc({
            fields: [
              makeField({ id: 'f1', type: FieldType.Signature }),
              makeField({
                id: 'f2',
                type: FieldType.DateSigned,
                label: 'Date',
              }),
            ],
          })}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)

      // The field counter shows "Field 1 of 2"
      const counter = screen.getByText((_content, element) =>
        element?.className === 'signing-ceremony-v2__field-counter' &&
        element?.textContent?.includes('of 2') === true
      )
      expect(counter).toBeInTheDocument()
    })
  })

  describe('Step 3 - Complete', () => {
    it('shows success state after completing all fields with typed signature', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await completeFullFlow(user)

      expect(screen.getByText('Document Signed Successfully')).toBeInTheDocument()
      expect(screen.getByText(/Completed in/)).toBeInTheDocument()
    })

    it('shows download button on complete step', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await completeFullFlow(user)

      expect(
        screen.getByRole('button', { name: /download signed document/i })
      ).toBeInTheDocument()
    })

    it('Back to Documents button calls onComplete', async () => {
      const user = userEvent.setup()
      const onComplete = vi.fn()

      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={onComplete}
          onCancel={vi.fn()}
        />
      )

      await completeFullFlow(user)
      await user.click(screen.getByRole('button', { name: /back to documents/i }))

      expect(onComplete).toHaveBeenCalledOnce()
    })

    it('shows signing details with signer info', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await completeFullFlow(user)

      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('Signed by')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('Back button goes from sign step back to review', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)
      expect(screen.getByText('Sign Document')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /back/i }))
      expect(screen.getByText('Review Document')).toBeInTheDocument()
    })

    it('cancel button calls onCancel on review step', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()

      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={onCancel}
        />
      )

      await user.click(
        screen.getByRole('button', { name: /close signing ceremony/i })
      )

      expect(onCancel).toHaveBeenCalledOnce()
    })
  })

  describe('Timer', () => {
    it('shows a timer in the top bar', () => {
      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByLabelText('Time elapsed')).toBeInTheDocument()
      expect(screen.getByLabelText('Time elapsed')).toHaveTextContent('00:00')
    })
  })

  describe('Virtual field for signers without assigned fields', () => {
    it('creates a virtual signature field when no fields match signer', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc({ fields: [] })}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByText(/Fields to complete/)).toBeInTheDocument()

      await advanceToSignStep(user)

      expect(screen.getByText('Sign Document')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has dialog role and aria-modal', () => {
      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('step indicator has navigation role', () => {
      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(
        screen.getByRole('navigation', { name: 'Signing progress' })
      ).toBeInTheDocument()
    })
  })

  describe('Completion Progress', () => {
    it('shows completion progress on sign step', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc({
            fields: [
              makeField({ id: 'f1', type: FieldType.Signature }),
              makeField({ id: 'f2', type: FieldType.DateSigned, label: 'Date' }),
            ],
          })}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)

      // Date field is auto-filled, so 1 of 2 should be completed
      expect(screen.getByTestId('completion-progress')).toBeInTheDocument()
      expect(screen.getByText(/of 2 fields completed/)).toBeInTheDocument()
    })
  })

  describe('Terms Acceptance', () => {
    it('shows terms checkbox on review step', () => {
      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByLabelText(/I agree to use electronic signatures/i)).toBeInTheDocument()
    })
  })

  describe('Decline', () => {
    it('shows decline button when onDecline is provided', () => {
      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
          onDecline={vi.fn()}
        />
      )

      expect(screen.getByLabelText('Decline to sign')).toBeInTheDocument()
    })

    it('does not show decline button when onDecline is not provided', () => {
      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.queryByLabelText('Decline to sign')).not.toBeInTheDocument()
    })

    it('opens decline modal when decline button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
          onDecline={vi.fn()}
        />
      )

      await user.click(screen.getByLabelText('Decline to sign'))
      expect(screen.getByText('Decline to Sign')).toBeInTheDocument()
      expect(screen.getByLabelText('Decline reason')).toBeInTheDocument()
    })

    it('calls onDecline with reason when submitted', async () => {
      const user = userEvent.setup()
      const onDecline = vi.fn()

      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
          onDecline={onDecline}
        />
      )

      await user.click(screen.getByLabelText('Decline to sign'))
      await user.type(screen.getByLabelText('Decline reason'), 'Wrong document version')
      await user.click(screen.getByRole('button', { name: /decline signing/i }))

      expect(onDecline).toHaveBeenCalledWith('Wrong document version')
    })

    it('decline submit button is disabled when reason is empty', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc()}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
          onDecline={vi.fn()}
        />
      )

      await user.click(screen.getByLabelText('Decline to sign'))
      expect(screen.getByRole('button', { name: /decline signing/i })).toBeDisabled()
    })
  })

  describe('FieldChecklist Sidebar', () => {
    it('shows FieldChecklist sidebar on sign step with multi-field documents', async () => {
      const user = userEvent.setup()

      const { container } = render(
        <SigningCeremony
          document={makeDoc({
            fields: [
              makeField({ id: 'f1', type: FieldType.Signature }),
              makeField({ id: 'f2', type: FieldType.DateSigned, label: 'Date' }),
            ],
          })}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)

      expect(container.querySelector('.field-checklist')).toBeInTheDocument()
    })

    it('hides FieldChecklist sidebar on sign step with single-field documents', async () => {
      const user = userEvent.setup()

      const { container } = render(
        <SigningCeremony
          document={makeDoc({
            fields: [makeField({ id: 'f1', type: FieldType.Signature })],
          })}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)

      expect(container.querySelector('.field-checklist')).not.toBeInTheDocument()
    })
  })

  describe('Validation Messages', () => {
    it('shows validation message when trying to advance without completing required field', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc({
            fields: [
              makeField({ id: 'f1', type: FieldType.Text, label: 'Full Name', required: true }),
              makeField({ id: 'f2', type: FieldType.DateSigned, label: 'Date' }),
            ],
          })}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)

      // Click the primary "Next Field" button in the footer (not the chevron nav button)
      const nextFieldButtons = screen.getAllByRole('button', { name: /next field/i })
      const primaryNextBtn = nextFieldButtons.find(
        (btn) => btn.classList.contains('signing-ceremony-v2__btn-primary')
      )
      if (!primaryNextBtn) throw new Error('Expected primary Next Field button')
      await user.click(primaryNextBtn)

      expect(screen.getByRole('alert')).toHaveTextContent('This field is required')
    })
  })

  describe('Skip Button', () => {
    it('shows skip button for optional fields', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc({
            fields: [
              makeField({ id: 'f1', type: FieldType.Text, label: 'Optional Note', required: false }),
              makeField({ id: 'f2', type: FieldType.Signature, required: true }),
            ],
          })}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)

      expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument()
    })

    it('does not show skip button for required fields', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc({
            fields: [
              makeField({ id: 'f1', type: FieldType.Signature, required: true }),
              makeField({ id: 'f2', type: FieldType.DateSigned, label: 'Date' }),
            ],
          })}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)

      expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument()
    })
  })

  describe('Keyboard Hint', () => {
    it('shows keyboard hint text on sign step with multi-field documents', async () => {
      const user = userEvent.setup()

      render(
        <SigningCeremony
          document={makeDoc({
            fields: [
              makeField({ id: 'f1', type: FieldType.Signature }),
              makeField({ id: 'f2', type: FieldType.DateSigned, label: 'Date' }),
            ],
          })}
          signer={makeSigner()}
          onComplete={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      await advanceToSignStep(user)

      expect(screen.getByText(/Press Tab to advance/)).toBeInTheDocument()
    })
  })
})
