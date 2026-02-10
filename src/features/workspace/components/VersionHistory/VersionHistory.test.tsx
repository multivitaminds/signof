import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VersionHistory from './VersionHistory'
import type { PageSnapshot } from '../../types'

const mockSnapshots: PageSnapshot[] = [
  {
    id: 'snap-1',
    pageId: 'page-1',
    title: 'Test Page',
    blockData: [
      { id: 'b1', type: 'paragraph', content: 'Hello world', properties: {} },
    ],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    editCount: 20,
  },
  {
    id: 'snap-2',
    pageId: 'page-1',
    title: 'Test Page v2',
    blockData: [
      { id: 'b2', type: 'paragraph', content: 'Updated content', properties: {} },
    ],
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    editCount: 40,
  },
]

describe('VersionHistory', () => {
  const defaultProps = {
    isOpen: true,
    pageId: 'page-1',
    snapshots: mockSnapshots,
    onCreateSnapshot: vi.fn(),
    onRestore: vi.fn(),
    onDelete: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <VersionHistory {...defaultProps} isOpen={false} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders panel when open', () => {
    render(<VersionHistory {...defaultProps} />)
    expect(screen.getByText('Version History')).toBeInTheDocument()
    expect(screen.getByLabelText('Save snapshot')).toBeInTheDocument()
    expect(screen.getByLabelText('Close version history')).toBeInTheDocument()
  })

  it('shows snapshot entries', () => {
    render(<VersionHistory {...defaultProps} />)
    expect(screen.getByText('Test Page')).toBeInTheDocument()
    expect(screen.getByText('Test Page v2')).toBeInTheDocument()
    expect(screen.getByText('20 edits')).toBeInTheDocument()
    expect(screen.getByText('40 edits')).toBeInTheDocument()
  })

  it('shows empty state when no snapshots', () => {
    render(<VersionHistory {...defaultProps} snapshots={[]} />)
    expect(screen.getByText('No snapshots yet.')).toBeInTheDocument()
    expect(
      screen.getByText('Snapshots are created automatically every 20 edits.')
    ).toBeInTheDocument()
  })

  it('save snapshot button calls onCreateSnapshot', async () => {
    const user = userEvent.setup()
    render(<VersionHistory {...defaultProps} />)
    await user.click(screen.getByLabelText('Save snapshot'))
    expect(defaultProps.onCreateSnapshot).toHaveBeenCalledTimes(1)
  })

  it('restore button calls onRestore after confirmation', async () => {
    const user = userEvent.setup()
    render(<VersionHistory {...defaultProps} />)
    // All restore buttons (there are 2 snapshots)
    const restoreButtons = screen.getAllByText('Restore')
    // Click first restore button
    const firstRestoreBtn = restoreButtons[0]
    if (!firstRestoreBtn) throw new Error('No restore button found')
    await user.click(firstRestoreBtn)
    // Should now show "Confirm" instead
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    // Click confirm
    await user.click(screen.getByText('Confirm'))
    expect(defaultProps.onRestore).toHaveBeenCalledWith('snap-1')
  })

  it('close button calls onClose', async () => {
    const user = userEvent.setup()
    render(<VersionHistory {...defaultProps} />)
    await user.click(screen.getByLabelText('Close version history'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })
})
