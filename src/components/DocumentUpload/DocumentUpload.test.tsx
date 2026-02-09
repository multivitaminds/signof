import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentUpload from './DocumentUpload'

const noop = () => {}

function createFile(
  name: string,
  size: number,
  type: string
): File {
  const buffer = new ArrayBuffer(size)
  return new File([buffer], name, { type })
}

describe('DocumentUpload', () => {
  it('renders the drop zone', () => {
    render(<DocumentUpload onUpload={noop} />)
    expect(
      screen.getByText('Drag and drop a file here, or click to browse')
    ).toBeInTheDocument()
  })

  it('shows accepted types and max size info', () => {
    render(<DocumentUpload onUpload={noop} />)
    expect(screen.getByText(/Accepted:.*PDF, PNG, JPG/)).toBeInTheDocument()
    expect(screen.getByText(/Max size:.*10\.0 MB/)).toBeInTheDocument()
  })

  it('handles file selection via input', async () => {
    const user = userEvent.setup()
    render(<DocumentUpload onUpload={noop} />)

    const input = screen.getByLabelText('Upload document')
    const file = createFile('test.pdf', 1024, 'application/pdf')
    await user.upload(input, file)

    expect(screen.getByText('test.pdf')).toBeInTheDocument()
  })

  it('shows error for invalid file type', () => {
    render(<DocumentUpload onUpload={noop} />)

    const input = screen.getByLabelText('Upload document') as HTMLInputElement
    const file = createFile('readme.txt', 100, 'text/plain')

    // userEvent.upload filters by accept attribute, so use fireEvent directly
    fireEvent.change(input, { target: { files: [file] } })

    expect(screen.getByRole('alert')).toHaveTextContent(
      /Invalid file type/
    )
  })

  it('shows error for oversized file', async () => {
    const user = userEvent.setup()
    render(<DocumentUpload onUpload={noop} maxSize={500} />)

    const input = screen.getByLabelText('Upload document')
    const file = createFile('big.pdf', 1000, 'application/pdf')
    await user.upload(input, file)

    expect(screen.getByRole('alert')).toHaveTextContent(
      /File is too large/
    )
  })

  it('shows file info after valid selection', async () => {
    const user = userEvent.setup()
    render(<DocumentUpload onUpload={noop} />)

    const input = screen.getByLabelText('Upload document')
    const file = createFile('contract.pdf', 2048, 'application/pdf')
    await user.upload(input, file)

    expect(screen.getByText('contract.pdf')).toBeInTheDocument()
    expect(screen.getByText('2.0 KB')).toBeInTheDocument()
  })

  it('calls onUpload when Upload is clicked', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn()
    render(<DocumentUpload onUpload={onUpload} />)

    const input = screen.getByLabelText('Upload document')
    const file = createFile('doc.pdf', 512, 'application/pdf')
    await user.upload(input, file)

    await user.click(screen.getByRole('button', { name: 'Upload' }))
    expect(onUpload).toHaveBeenCalledWith(file)
  })

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<DocumentUpload onUpload={noop} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
