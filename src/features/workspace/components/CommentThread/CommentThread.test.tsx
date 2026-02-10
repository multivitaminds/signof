import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommentThread from './CommentThread'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'

describe('CommentThread', () => {
  const defaultProps = {
    pageId: 'page-1',
    blockId: 'block-1',
    position: { top: 100, right: 20 },
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useWorkspaceStore.setState({
      comments: {},
    })
  })

  it('renders empty state when no comments exist', () => {
    render(<CommentThread {...defaultProps} />)
    expect(screen.getByText('No comments yet')).toBeInTheDocument()
    expect(screen.getByText('Comments')).toBeInTheDocument()
  })

  it('adds a new comment when submitted', async () => {
    const user = userEvent.setup()
    render(<CommentThread {...defaultProps} />)

    const input = screen.getByPlaceholderText('Add a comment...')
    await user.type(input, 'Test comment')
    await user.click(screen.getByLabelText('Add comment'))

    expect(screen.getByText('Test comment')).toBeInTheDocument()
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('renders existing comments with author and content', () => {
    useWorkspaceStore.setState({
      comments: {
        'page-1': [
          {
            id: 'c1',
            blockId: 'block-1',
            pageId: 'page-1',
            content: 'Existing comment',
            authorName: 'Alice',
            authorId: 'user-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resolved: false,
            replies: [],
          },
        ],
      },
    })

    render(<CommentThread {...defaultProps} />)
    expect(screen.getByText('Existing comment')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument() // initials (single name)
  })

  it('resolves and unresolves a comment', async () => {
    const user = userEvent.setup()
    useWorkspaceStore.setState({
      comments: {
        'page-1': [
          {
            id: 'c1',
            blockId: 'block-1',
            pageId: 'page-1',
            content: 'To resolve',
            authorName: 'Bob',
            authorId: 'user-2',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resolved: false,
            replies: [],
          },
        ],
      },
    })

    render(<CommentThread {...defaultProps} />)

    // Resolve
    await user.click(screen.getByLabelText('Resolve comment'))
    expect(screen.getByText('Resolved')).toBeInTheDocument()

    // Unresolve
    await user.click(screen.getByLabelText('Unresolve comment'))
    expect(screen.queryByText('Resolved')).not.toBeInTheDocument()
  })

  it('deletes a comment', async () => {
    const user = userEvent.setup()
    useWorkspaceStore.setState({
      comments: {
        'page-1': [
          {
            id: 'c1',
            blockId: 'block-1',
            pageId: 'page-1',
            content: 'Delete me',
            authorName: 'Carol',
            authorId: 'user-3',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resolved: false,
            replies: [],
          },
        ],
      },
    })

    render(<CommentThread {...defaultProps} />)
    expect(screen.getByText('Delete me')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Delete comment'))
    expect(screen.queryByText('Delete me')).not.toBeInTheDocument()
  })

  it('closes when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<CommentThread {...defaultProps} />)

    await user.click(screen.getByLabelText('Close comments'))
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })
})
