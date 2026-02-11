import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ToggleBlock from './ToggleBlock'
import type { BlockComponentProps } from './types'

vi.mock('../EditableContent/EditableContent', () => ({
  default: ({ content, placeholder }: { content: string; placeholder?: string }) => (
    <div data-testid="editable-content" data-placeholder={placeholder}>
      {content}
    </div>
  ),
}))

vi.mock('../BlockEditor/BlockEditor', () => ({
  default: () => <div data-testid="block-editor">Nested editor</div>,
}))

vi.mock('lucide-react', () => ({
  ChevronRight: ({ size }: { size: number }) => <svg data-testid="chevron-icon" data-size={size} />,
}))

function makeProps(overrides: Partial<BlockComponentProps & { pageId?: string }> = {}): BlockComponentProps & { pageId?: string } {
  return {
    block: {
      id: 'b1',
      type: 'toggle',
      content: 'Toggle heading',
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

describe('ToggleBlock', () => {
  it('renders toggle heading content', () => {
    render(<ToggleBlock {...makeProps()} />)
    expect(screen.getByText('Toggle heading')).toBeInTheDocument()
  })

  it('renders chevron button', () => {
    render(<ToggleBlock {...makeProps()} />)
    expect(screen.getByLabelText('Expand')).toBeInTheDocument()
  })

  it('starts collapsed', () => {
    render(<ToggleBlock {...makeProps()} />)
    expect(screen.queryByText('Click to add content inside toggle')).not.toBeInTheDocument()
  })

  it('expands on chevron click and shows empty message', async () => {
    const user = userEvent.setup()
    render(<ToggleBlock {...makeProps()} />)

    await user.click(screen.getByLabelText('Expand'))

    expect(screen.getByText('Click to add content inside toggle')).toBeInTheDocument()
    expect(screen.getByLabelText('Collapse')).toBeInTheDocument()
  })

  it('collapses on second chevron click', async () => {
    const user = userEvent.setup()
    render(<ToggleBlock {...makeProps()} />)

    await user.click(screen.getByLabelText('Expand'))
    expect(screen.getByText('Click to add content inside toggle')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Collapse'))
    expect(screen.queryByText('Click to add content inside toggle')).not.toBeInTheDocument()
  })

  it('renders nested BlockEditor when expanded with children', async () => {
    const user = userEvent.setup()
    render(
      <ToggleBlock
        {...makeProps({
          block: {
            id: 'b1',
            type: 'toggle',
            content: 'Toggle heading',
            marks: [],
            children: ['child-1'],
            properties: {},
          },
          pageId: 'page-1',
        })}
      />
    )

    await user.click(screen.getByLabelText('Expand'))
    expect(screen.getByTestId('block-editor')).toBeInTheDocument()
  })

  it('has correct wrapper class', () => {
    const { container } = render(<ToggleBlock {...makeProps()} />)
    expect(container.querySelector('.block-toggle')).toBeInTheDocument()
    expect(container.querySelector('.block-toggle__header')).toBeInTheDocument()
  })
})
