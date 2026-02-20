import { render, screen, fireEvent } from '@testing-library/react'
import MessageActions from './MessageActions'

describe('MessageActions', () => {
  const defaultProps = {
    messageId: 'msg-1',
    isPinned: false,
    isBookmarked: false,
    onReact: vi.fn(),
    onReply: vi.fn(),
    onPin: vi.fn(),
    onBookmark: vi.fn(),
  }

  it('renders action buttons', () => {
    render(<MessageActions {...defaultProps} />)
    expect(screen.getByLabelText('Add reaction')).toBeInTheDocument()
    expect(screen.getByLabelText('Reply in thread')).toBeInTheDocument()
    expect(screen.getByLabelText('Pin message')).toBeInTheDocument()
    expect(screen.getByLabelText('Bookmark message')).toBeInTheDocument()
    expect(screen.getByLabelText('More actions')).toBeInTheDocument()
  })

  it('calls onReply when reply button clicked', () => {
    const onReply = vi.fn()
    render(<MessageActions {...defaultProps} onReply={onReply} />)

    fireEvent.click(screen.getByLabelText('Reply in thread'))
    expect(onReply).toHaveBeenCalled()
  })

  it('calls onPin when pin button clicked', () => {
    const onPin = vi.fn()
    render(<MessageActions {...defaultProps} onPin={onPin} />)

    fireEvent.click(screen.getByLabelText('Pin message'))
    expect(onPin).toHaveBeenCalled()
  })

  it('shows unpin label when isPinned', () => {
    render(<MessageActions {...defaultProps} isPinned={true} />)
    expect(screen.getByLabelText('Unpin message')).toBeInTheDocument()
  })

  it('shows remove bookmark label when isBookmarked', () => {
    render(<MessageActions {...defaultProps} isBookmarked={true} />)
    expect(screen.getByLabelText('Remove bookmark')).toBeInTheDocument()
  })

  it('opens reaction picker on click', () => {
    render(<MessageActions {...defaultProps} />)

    fireEvent.click(screen.getByLabelText('Add reaction'))
    expect(screen.getByRole('dialog', { name: 'Pick a reaction' })).toBeInTheDocument()
  })
})
