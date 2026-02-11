import { render, screen } from '@testing-library/react'
import ParagraphBlock from './ParagraphBlock'
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
      type: 'paragraph',
      content: 'Hello world',
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

describe('ParagraphBlock', () => {
  it('renders block content', () => {
    render(<ParagraphBlock {...makeProps()} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('passes tag="p" to EditableContent', () => {
    render(<ParagraphBlock {...makeProps()} />)
    const editable = screen.getByTestId('editable-content')
    expect(editable).toHaveAttribute('data-tag', 'p')
  })

  it('renders with empty content', () => {
    render(
      <ParagraphBlock
        {...makeProps({
          block: { id: 'b2', type: 'paragraph', content: '', marks: [], children: [], properties: {} },
        })}
      />
    )
    expect(screen.getByTestId('editable-content')).toBeInTheDocument()
  })

  it('renders with custom content', () => {
    render(
      <ParagraphBlock
        {...makeProps({
          block: { id: 'b3', type: 'paragraph', content: 'Custom text here', marks: [], children: [], properties: {} },
        })}
      />
    )
    expect(screen.getByText('Custom text here')).toBeInTheDocument()
  })
})
