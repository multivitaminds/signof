import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExportDialog from './ExportDialog'

// Mock exportData to prevent actual downloads
vi.mock('../../../lib/exportUtils', () => ({
  exportData: vi.fn(),
  exportToCSV: vi.fn(),
  exportToJSON: vi.fn(),
  exportToMarkdown: vi.fn(),
}))

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onExport: vi.fn(),
  defaultFilename: 'documents',
  data: [
    { name: 'Doc A', status: 'draft' },
    { name: 'Doc B', status: 'completed' },
  ] as Record<string, unknown>[],
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
  ],
}

describe('ExportDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ExportDialog {...defaultProps} isOpen={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders dialog with title when open', () => {
    render(<ExportDialog {...defaultProps} />)
    expect(screen.getByText('Export Data')).toBeInTheDocument()
  })

  it('shows the default filename in the input', () => {
    render(<ExportDialog {...defaultProps} />)
    const input = screen.getByLabelText('Filename') as HTMLInputElement
    expect(input.value).toBe('documents')
  })

  it('shows all three format options', () => {
    render(<ExportDialog {...defaultProps} />)
    expect(screen.getByText('CSV')).toBeInTheDocument()
    expect(screen.getByText('JSON')).toBeInTheDocument()
    expect(screen.getByText('Markdown')).toBeInTheDocument()
  })

  it('shows row count summary', () => {
    render(<ExportDialog {...defaultProps} />)
    expect(screen.getByText('2 rows will be exported')).toBeInTheDocument()
  })

  it('shows singular row count for 1 item', () => {
    render(<ExportDialog {...defaultProps} data={[{ a: 1 }]} />)
    expect(screen.getByText('1 row will be exported')).toBeInTheDocument()
  })

  it('allows changing format selection', async () => {
    const user = userEvent.setup()
    render(<ExportDialog {...defaultProps} />)

    const jsonRadio = screen.getByRole('radio', { name: /JSON/i })
    await user.click(jsonRadio)
    expect(jsonRadio).toBeChecked()
  })

  it('calls onExport and onClose when Export button is clicked', async () => {
    const user = userEvent.setup()
    const onExport = vi.fn()
    const onClose = vi.fn()
    render(<ExportDialog {...defaultProps} onExport={onExport} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /export/i }))
    expect(onExport).toHaveBeenCalledWith('csv', 'documents')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ExportDialog {...defaultProps} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ExportDialog {...defaultProps} onClose={onClose} />)

    // The dialog role element is the overlay itself
    const overlay = screen.getByRole('dialog')
    // Click directly on the overlay, not on the inner modal content
    await user.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('disables Export button when filename is empty', async () => {
    const user = userEvent.setup()
    render(<ExportDialog {...defaultProps} />)

    const input = screen.getByLabelText('Filename')
    await user.clear(input)

    const exportBtn = screen.getByRole('button', { name: /export/i })
    expect(exportBtn).toBeDisabled()
  })

  it('allows editing the filename', async () => {
    const user = userEvent.setup()
    const onExport = vi.fn()
    render(<ExportDialog {...defaultProps} onExport={onExport} />)

    const input = screen.getByLabelText('Filename')
    await user.clear(input)
    await user.type(input, 'my-export')

    await user.click(screen.getByRole('button', { name: /export/i }))
    expect(onExport).toHaveBeenCalledWith('csv', 'my-export')
  })
})
