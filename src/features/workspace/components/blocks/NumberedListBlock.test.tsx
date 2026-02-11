import { render, screen } from '@testing-library/react'
import NumberedListBlock from './NumberedListBlock'
import type { BlockComponentProps } from './types'

vi.mock('../EditableContent/EditableContent', () => ({
  default: ({ content, placeholder }: { content: string; placeholder?: string }) => (
    <div data-testid="editable-content" data-placeholder={placeholder}>
      {content}
    </div>
  ),
}))

function makeProps(overrides: Partial<BlockComponentProps> = {}): BlockComponentProps {
  return {
    block: {
      id: 'b1',
      type: 'numbered_list',
      content: 'First item',
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

describe('NumberedListBlock', () => {
  it('renders block content', () => {
    render(<NumberedListBlock {...makeProps()} />)
    expect(screen.getByText('First item')).toBeInTheDocument()
  })

  it('renders default number 1', () => {
    render(<NumberedListBlock {...makeProps()} />)
    expect(screen.getByText('1.')).toBeInTheDocument()
  })

  it('renders custom index number', () => {
    render(<NumberedListBlock {...makeProps()} index={5} />)
    expect(screen.getByText('5.')).toBeInTheDocument()
  })

  it('has correct wrapper class', () => {
    const { container } = render(<NumberedListBlock {...makeProps()} />)
    expect(container.querySelector('.block-numbered-list')).toBeInTheDocument()
  })

  it('marks number as aria-hidden', () => {
    const { container } = render(<NumberedListBlock {...makeProps()} />)
    const number = container.querySelector('.block-numbered-list__number')
    expect(number).toHaveAttribute('aria-hidden', 'true')
  })

  it('shows List item placeholder', () => {
    render(<NumberedListBlock {...makeProps()} />)
    const editable = screen.getByTestId('editable-content')
    expect(editable).toHaveAttribute('data-placeholder', 'List item')
  })
})
