import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CodeBlock from './CodeBlock'
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
      type: 'code',
      content: 'console.log("hello")',
      marks: [],
      children: [],
      properties: { language: 'javascript' },
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

describe('CodeBlock', () => {
  it('renders code content', () => {
    render(<CodeBlock {...makeProps()} />)
    expect(screen.getByText('console.log("hello")')).toBeInTheDocument()
  })

  it('passes tag="pre" to EditableContent', () => {
    render(<CodeBlock {...makeProps()} />)
    const editable = screen.getByTestId('editable-content')
    expect(editable).toHaveAttribute('data-tag', 'pre')
  })

  it('shows language label from properties', () => {
    render(<CodeBlock {...makeProps()} />)
    expect(screen.getByText('javascript')).toBeInTheDocument()
  })

  it('shows "plain text" when no language is set', () => {
    render(
      <CodeBlock
        {...makeProps({
          block: {
            id: 'b2',
            type: 'code',
            content: 'text',
            marks: [],
            children: [],
            properties: {},
          },
        })}
      />
    )
    expect(screen.getByText('plain text')).toBeInTheDocument()
  })

  it('toggles language picker on button click', async () => {
    const user = userEvent.setup()
    render(<CodeBlock {...makeProps()} />)

    // Initially no picker
    expect(screen.queryByText('typescript')).not.toBeInTheDocument()

    // Click language button to open picker
    await user.click(screen.getByTitle('Change language'))

    // Picker should show language options
    expect(screen.getByText('typescript')).toBeInTheDocument()
    expect(screen.getByText('python')).toBeInTheDocument()
  })

  it('has correct wrapper class', () => {
    const { container } = render(<CodeBlock {...makeProps()} />)
    expect(container.querySelector('.block-code')).toBeInTheDocument()
  })
})
