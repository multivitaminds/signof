import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommentsSidebar from './CommentsSidebar'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'

const mockComments = [
  {
    id: 'c1',
    blockId: 'block-1',
    pageId: 'page-1',
    content: 'This needs revision',
    authorName: 'Alice',
    authorId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolved: false,
    replies: [
      {
        id: 'r1',
        content: 'I agree',
        authorName: 'Bob',
        authorId: 'user-2',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'c2',
    blockId: 'block-2',
    pageId: 'page-1',
    content: 'Fixed the typo',
    authorName: 'Carol',
    authorId: 'user-3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolved: true,
    replies: [],
  },
]

describe('CommentsSidebar', () => {
  const defaultProps = {
    isOpen: true,
    pageId: 'page-1',
    onClose: vi.fn(),
    onCommentClick: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useWorkspaceStore.setState({
      comments: { 'page-1': mockComments },
      blocks: {
        'block-1': { id: 'block-1', type: 'paragraph' as const, content: 'Block one text content here', marks: [], properties: {}, children: [] },
        'block-2': { id: 'block-2', type: 'paragraph' as const, content: 'Block two text content here', marks: [], properties: {}, children: [] },
      },
    })
  })

  it('renders nothing when closed', () => {
    const { container } = render(
      <CommentsSidebar {...defaultProps} isOpen={false} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders all comments by default', () => {
    render(<CommentsSidebar {...defaultProps} />)
    expect(screen.getByText('Comments')).toBeInTheDocument()
    expect(screen.getByText('This needs revision')).toBeInTheDocument()
    expect(screen.getByText('Fixed the typo')).toBeInTheDocument()
    expect(screen.getByText('1 reply')).toBeInTheDocument()
  })

  it('filters to show only open comments', async () => {
    const user = userEvent.setup()
    render(<CommentsSidebar {...defaultProps} />)

    await user.click(screen.getByText('Open'))
    expect(screen.getByText('This needs revision')).toBeInTheDocument()
    expect(screen.queryByText('Fixed the typo')).not.toBeInTheDocument()
  })

  it('filters to show only resolved comments', async () => {
    const user = userEvent.setup()
    render(<CommentsSidebar {...defaultProps} />)

    await user.click(screen.getByText('Resolved'))
    expect(screen.queryByText('This needs revision')).not.toBeInTheDocument()
    expect(screen.getByText('Fixed the typo')).toBeInTheDocument()
  })

  it('calls onCommentClick when a comment is clicked', async () => {
    const user = userEvent.setup()
    render(<CommentsSidebar {...defaultProps} />)

    await user.click(screen.getByText('This needs revision'))
    expect(defaultProps.onCommentClick).toHaveBeenCalledWith('block-1')
  })
})
