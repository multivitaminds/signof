import { render, screen } from '@testing-library/react'
import QuoteBlock from './QuoteBlock'
import type { BlockComponentProps } from './types'

vi.mock('../EditableContent/EditableContent', () => ({
  default: ({ content, tag, placeholder }: { content: string; tag?: string; placeholder?: string }) => (
    <div data-testid="editable-content" data-tag={tag} data-placeholder={placeholder}>
      {content}
    </div>
  ),
}))

function makeProps(overrides: Partial<BlockComponentProps> = {}): BlockComponentProps {
  return {
    block: {
      id: 'b1',
      type: 'quote',
      content: 'To be or not to be',
      marks: [],
      children: [],
      properties: {},
    },
    onContentChange: vi.fn(),
    onMarksChange: vi.fn(),
    onEnter: vi.fn(),
    onBackspace: vi.fn(),
    onArrowUp: vi.fn(),
    onArrowDown: vi.fn(),
    onSlash: vi.fn(),
    onSelectionChange: vi.fn(),
    onFormatShortcut: vi.fn(),
    ...overrides,
  }
}

describe('QuoteBlock', () => {
  it('renders quote content', () => {
    render(<QuoteBlock {...makeProps()} />)
    expect(screen.getByText('To be or not to be')).toBeInTheDocument()
  })

  it('passes tag="blockquote" to EditableContent', () => {
    render(<QuoteBlock {...makeProps()} />)
    const editable = screen.getByTestId('editable-content')
    expect(editable).toHaveAttribute('data-tag', 'blockquote')
  })

  it('has correct wrapper class', () => {
    const { container } = render(<QuoteBlock {...makeProps()} />)
    expect(container.querySelector('.block-quote')).toBeInTheDocument()
  })

  it('shows Quote placeholder', () => {
    render(<QuoteBlock {...makeProps()} />)
    const editable = screen.getByTestId('editable-content')
    expect(editable).toHaveAttribute('data-placeholder', 'Quote')
  })
})
