import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BookmarkBlock from './BookmarkBlock'

describe('BookmarkBlock', () => {
  it('renders URL input form when block has no content', () => {
    render(
      <BookmarkBlock
        block={{ id: 'b1', type: 'bookmark', content: '', marks: [], children: [], properties: {} }}
        onContentChange={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Bookmark URL')).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('renders bookmark card when block has URL content', () => {
    render(
      <BookmarkBlock
        block={{ id: 'b1', type: 'bookmark', content: 'https://example.com', marks: [], children: [], properties: {} }}
        onContentChange={vi.fn()}
      />
    )
    expect(screen.getByText('https://example.com')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('renders Open link with correct href and target', () => {
    render(
      <BookmarkBlock
        block={{ id: 'b1', type: 'bookmark', content: 'https://example.com', marks: [], children: [], properties: {} }}
        onContentChange={vi.fn()}
      />
    )
    const link = screen.getByText('Open')
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('disables Add button when input is empty', () => {
    render(
      <BookmarkBlock
        block={{ id: 'b1', type: 'bookmark', content: '', marks: [], children: [], properties: {} }}
        onContentChange={vi.fn()}
      />
    )
    expect(screen.getByText('Add')).toBeDisabled()
  })

  it('enables Add button when input has value', async () => {
    const user = userEvent.setup()
    render(
      <BookmarkBlock
        block={{ id: 'b1', type: 'bookmark', content: '', marks: [], children: [], properties: {} }}
        onContentChange={vi.fn()}
      />
    )
    await user.type(screen.getByLabelText('Bookmark URL'), 'https://test.com')
    expect(screen.getByText('Add')).not.toBeDisabled()
  })

  it('calls onContentChange on form submit', async () => {
    const user = userEvent.setup()
    const onContentChange = vi.fn()
    render(
      <BookmarkBlock
        block={{ id: 'b1', type: 'bookmark', content: '', marks: [], children: [], properties: {} }}
        onContentChange={onContentChange}
      />
    )
    await user.type(screen.getByLabelText('Bookmark URL'), 'https://test.com')
    await user.click(screen.getByText('Add'))
    expect(onContentChange).toHaveBeenCalledWith('https://test.com')
  })

  it('has correct aria-label on Open link', () => {
    render(
      <BookmarkBlock
        block={{ id: 'b1', type: 'bookmark', content: 'https://example.com', marks: [], children: [], properties: {} }}
        onContentChange={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Open https://example.com in new tab')).toBeInTheDocument()
  })
})
