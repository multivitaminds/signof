import { render, screen } from '@testing-library/react'
import BulletListBlock from './BulletListBlock'
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
      type: 'bullet_list',
      content: 'Buy groceries',
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

describe('BulletListBlock', () => {
  it('renders block content', () => {
    render(<BulletListBlock {...makeProps()} />)
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
  })

  it('renders bullet marker', () => {
    const { container } = render(<BulletListBlock {...makeProps()} />)
    const marker = container.querySelector('.block-bullet-list__marker')
    expect(marker).toBeInTheDocument()
    expect(marker).toHaveAttribute('aria-hidden', 'true')
  })

  it('has correct wrapper class', () => {
    const { container } = render(<BulletListBlock {...makeProps()} />)
    expect(container.querySelector('.block-bullet-list')).toBeInTheDocument()
  })

  it('shows List item placeholder', () => {
    render(<BulletListBlock {...makeProps()} />)
    const editable = screen.getByTestId('editable-content')
    expect(editable).toHaveAttribute('data-placeholder', 'List item')
  })
})
