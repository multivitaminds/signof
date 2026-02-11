import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentBuilderPage from './DocumentBuilderPage'

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

beforeAll(() => {
  (globalThis as Record<string, unknown>).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
})

// Mock the document store
vi.mock('../../../stores/useDocumentStore', () => ({
  useDocumentStore: () => ({
    createDocumentFromBuilder: vi.fn(),
  }),
}))

describe('DocumentBuilderPage', () => {
  it('renders the upload step initially', () => {
    render(<DocumentBuilderPage />)

    expect(screen.getByText('Upload Document')).toBeInTheDocument()
    expect(screen.getByText(/Drag and drop a file here/)).toBeInTheDocument()
  })

  it('shows 5-step progress indicator', () => {
    render(<DocumentBuilderPage />)

    expect(screen.getByRole('navigation', { name: 'Builder progress' })).toBeInTheDocument()
    expect(screen.getByText('Upload')).toBeInTheDocument()
    expect(screen.getByText('Add Fields')).toBeInTheDocument()
    expect(screen.getByText('Signers')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('Next button is disabled when no file is selected', () => {
    render(<DocumentBuilderPage />)

    const nextBtn = screen.getByRole('button', { name: /next/i })
    expect(nextBtn).toBeDisabled()
  })

  it('shows file info after selecting a file via input', async () => {
    const user = userEvent.setup()
    render(<DocumentBuilderPage />)

    const fileInput = screen.getByLabelText('Upload document file')
    const testFile = new File(['test content'], 'test-contract.pdf', {
      type: 'application/pdf',
    })
    await user.upload(fileInput, testFile)

    expect(screen.getByText('test-contract.pdf')).toBeInTheDocument()
  })

  it('shows error for invalid file type', () => {
    render(<DocumentBuilderPage />)

    const fileInput = screen.getByLabelText('Upload document file')
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    // Use fireEvent.change to bypass the HTML accept attribute filtering
    fireEvent.change(fileInput, { target: { files: [testFile] } })

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid file type')
  })

  it('enables Next after file is selected and advances to fields step', async () => {
    const user = userEvent.setup()
    render(<DocumentBuilderPage />)

    const fileInput = screen.getByLabelText('Upload document file')
    const testFile = new File(['test content'], 'test-contract.pdf', {
      type: 'application/pdf',
    })
    await user.upload(fileInput, testFile)

    const nextBtn = screen.getByRole('button', { name: /next/i })
    expect(nextBtn).toBeEnabled()

    await user.click(nextBtn)
    expect(screen.getByText('Place Fields')).toBeInTheDocument()
  })

  it('can navigate to signers step and add a signer', async () => {
    const user = userEvent.setup()
    render(<DocumentBuilderPage />)

    // Upload file
    const fileInput = screen.getByLabelText('Upload document file')
    await user.upload(fileInput, new File(['pdf'], 'doc.pdf', { type: 'application/pdf' }))

    // Advance to fields
    await user.click(screen.getByRole('button', { name: /next/i }))
    // Advance to signers
    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText('Add Signers')).toBeInTheDocument()

    // Add a signer
    await user.type(screen.getByLabelText('Signer name'), 'Jane Smith')
    await user.type(screen.getByLabelText('Signer email'), 'jane@example.com')
    await user.click(screen.getByRole('button', { name: 'Add signer' }))

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('shows parallel/sequential toggle for signing order', async () => {
    const user = userEvent.setup()
    render(<DocumentBuilderPage />)

    // Upload file
    const fileInput = screen.getByLabelText('Upload document file')
    await user.upload(fileInput, new File(['pdf'], 'doc.pdf', { type: 'application/pdf' }))

    // Advance to fields then signers
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByRole('radio', { name: /parallel/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /sequential/i })).toBeInTheDocument()
  })

  it('back button navigates to previous step', async () => {
    const user = userEvent.setup()
    render(<DocumentBuilderPage />)

    // Upload file and advance
    const fileInput = screen.getByLabelText('Upload document file')
    await user.upload(fileInput, new File(['pdf'], 'doc.pdf', { type: 'application/pdf' }))
    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText('Place Fields')).toBeInTheDocument()

    // Go back
    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByText('Upload Document')).toBeInTheDocument()
  })

  it('can remove a selected file', async () => {
    const user = userEvent.setup()
    render(<DocumentBuilderPage />)

    const fileInput = screen.getByLabelText('Upload document file')
    await user.upload(fileInput, new File(['pdf'], 'doc.pdf', { type: 'application/pdf' }))

    expect(screen.getByText('doc.pdf')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Remove file'))
    expect(screen.queryByText('doc.pdf')).not.toBeInTheDocument()
  })
})
