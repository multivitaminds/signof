import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommentIndicator from './CommentIndicator'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'

describe('CommentIndicator', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      comments: {
        'page-1': [
          {
            id: 'c1',
            blockId: 'block-1',
            pageId: 'page-1',
            content: 'Fix this',
            authorName: 'Alice',
            authorId: 'user-1',
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
            resolved: false,
            replies: [],
          },
          {
            id: 'c2',
            blockId: 'block-1',
            pageId: 'page-1',
            content: 'Looks good',
            authorName: 'Bob',
            authorId: 'user-2',
            createdAt: '2026-01-02T00:00:00Z',
            updatedAt: '2026-01-02T00:00:00Z',
            resolved: true,
            replies: [],
          },
          {
            id: 'c3',
            blockId: 'block-2',
            pageId: 'page-1',
            content: 'Other block comment',
            authorName: 'Charlie',
            authorId: 'user-3',
            createdAt: '2026-01-03T00:00:00Z',
            updatedAt: '2026-01-03T00:00:00Z',
            resolved: false,
            replies: [],
          },
        ],
      },
    })
  })

  it('renders when block has comments', () => {
    render(<CommentIndicator pageId="page-1" blockId="block-1" onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders nothing when block has no comments', () => {
    const { container } = render(
      <CommentIndicator pageId="page-1" blockId="no-comments" onClick={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when page has no comments', () => {
    const { container } = render(
      <CommentIndicator pageId="no-page" blockId="block-1" onClick={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('shows unresolved count', () => {
    render(<CommentIndicator pageId="page-1" blockId="block-1" onClick={vi.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('has correct aria-label with unresolved count', () => {
    render(<CommentIndicator pageId="page-1" blockId="block-1" onClick={vi.fn()} />)
    expect(screen.getByLabelText('1 unresolved comment')).toBeInTheDocument()
  })

  it('applies resolved class when all comments are resolved', () => {
    useWorkspaceStore.setState({
      comments: {
        'page-1': [
          {
            id: 'c1',
            blockId: 'block-1',
            pageId: 'page-1',
            content: 'Done',
            authorName: 'Alice',
            authorId: 'user-1',
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
            resolved: true,
            replies: [],
          },
        ],
      },
    })
    const { container } = render(
      <CommentIndicator pageId="page-1" blockId="block-1" onClick={vi.fn()} />
    )
    expect(container.querySelector('.comment-indicator--resolved')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<CommentIndicator pageId="page-1" blockId="block-1" onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })

  it('does not show count when all resolved', () => {
    useWorkspaceStore.setState({
      comments: {
        'page-1': [
          {
            id: 'c1',
            blockId: 'block-1',
            pageId: 'page-1',
            content: 'Done',
            authorName: 'Alice',
            authorId: 'user-1',
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
            resolved: true,
            replies: [],
          },
        ],
      },
    })
    render(<CommentIndicator pageId="page-1" blockId="block-1" onClick={vi.fn()} />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
    // The count element should not be there when all resolved
    const { container } = render(
      <CommentIndicator pageId="page-1" blockId="block-1" onClick={vi.fn()} />
    )
    expect(container.querySelector('.comment-indicator__count')).not.toBeInTheDocument()
  })
})
