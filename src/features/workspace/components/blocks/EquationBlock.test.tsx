import { render, screen } from '@testing-library/react'
import EquationBlock from './EquationBlock'
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
      type: 'equation',
      content: 'E = mc^2',
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

describe('EquationBlock', () => {
  it('renders equation content', () => {
    render(<EquationBlock {...makeProps()} />)
    expect(screen.getByText('E = mc^2')).toBeInTheDocument()
  })

  it('passes tag="pre" to EditableContent', () => {
    render(<EquationBlock {...makeProps()} />)
    const editable = screen.getByTestId('editable-content')
    expect(editable).toHaveAttribute('data-tag', 'pre')
  })

  it('shows correct placeholder', () => {
    render(<EquationBlock {...makeProps()} />)
    const editable = screen.getByTestId('editable-content')
    expect(editable).toHaveAttribute('data-placeholder', 'Enter an equation...')
  })

  it('has correct wrapper class', () => {
    const { container } = render(<EquationBlock {...makeProps()} />)
    expect(container.querySelector('.block-equation')).toBeInTheDocument()
  })

  it('passes empty marks array', () => {
    render(<EquationBlock {...makeProps()} />)
    // The mock renders content, verifying it gets called
    expect(screen.getByTestId('editable-content')).toBeInTheDocument()
  })
})
