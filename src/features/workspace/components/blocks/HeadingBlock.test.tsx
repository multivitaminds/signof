import { render, screen } from '@testing-library/react'
import HeadingBlock from './HeadingBlock'
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
      type: 'heading1',
      content: 'Main Title',
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

describe('HeadingBlock', () => {
  it('renders heading content', () => {
    render(<HeadingBlock {...makeProps()} />)
    expect(screen.getByText('Main Title')).toBeInTheDocument()
  })

  it('renders h1 tag for heading1 type', () => {
    render(<HeadingBlock {...makeProps()} />)
    const editable = screen.getByTestId('editable-content')
    expect(editable).toHaveAttribute('data-tag', 'h1')
  })

  it('renders h2 tag for heading2 type', () => {
    render(
      <HeadingBlock
        {...makeProps({
          block: { id: 'b2', type: 'heading2', content: 'Sub Title', marks: [], children: [], properties: {} },
        })}
      />
    )
    const editable = screen.getByTestId('editable-content')
    expect(editable).toHaveAttribute('data-tag', 'h2')
  })

  it('renders h3 tag for heading3 type', () => {
    render(
      <HeadingBlock
        {...makeProps({
          block: { id: 'b3', type: 'heading3', content: 'Small Heading', marks: [], children: [], properties: {} },
        })}
      />
    )
    const editable = screen.getByTestId('editable-content')
    expect(editable).toHaveAttribute('data-tag', 'h3')
  })

  it('shows correct placeholder for heading1', () => {
    render(<HeadingBlock {...makeProps()} />)
    const editable = screen.getByTestId('editable-content')
    expect(editable).toHaveAttribute('data-placeholder', 'Heading 1')
  })

  it('shows correct placeholder for heading2', () => {
    render(
      <HeadingBlock
        {...makeProps({
          block: { id: 'b2', type: 'heading2', content: '', marks: [], children: [], properties: {} },
        })}
      />
    )
    const editable = screen.getByTestId('editable-content')
    expect(editable).toHaveAttribute('data-placeholder', 'Heading 2')
  })

  it('applies correct CSS class', () => {
    const { container } = render(<HeadingBlock {...makeProps()} />)
    expect(container.querySelector('.block-heading--h1')).toBeInTheDocument()
  })
})
