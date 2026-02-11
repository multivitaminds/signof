import { render, screen } from '@testing-library/react'
import CalloutBlock from './CalloutBlock'
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
      type: 'callout',
      content: 'Important note',
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

describe('CalloutBlock', () => {
  it('renders callout content', () => {
    render(<CalloutBlock {...makeProps()} />)
    expect(screen.getByText('Important note')).toBeInTheDocument()
  })

  it('renders default icon when no calloutIcon is set', () => {
    render(<CalloutBlock {...makeProps()} />)
    expect(screen.getByText('💡')).toBeInTheDocument()
  })

  it('renders custom calloutIcon from properties', () => {
    render(
      <CalloutBlock
        {...makeProps({
          block: {
            id: 'b2',
            type: 'callout',
            content: 'Warning',
            marks: [],
            children: [],
            properties: { calloutIcon: '⚠️' },
          },
        })}
      />
    )
    expect(screen.getByText('⚠️')).toBeInTheDocument()
  })

  it('applies default color class when no color is set', () => {
    const { container } = render(<CalloutBlock {...makeProps()} />)
    expect(container.querySelector('.block-callout--default')).toBeInTheDocument()
  })

  it('applies custom color class from properties', () => {
    const { container } = render(
      <CalloutBlock
        {...makeProps({
          block: {
            id: 'b3',
            type: 'callout',
            content: 'Info',
            marks: [],
            children: [],
            properties: { color: 'blue' },
          },
        })}
      />
    )
    expect(container.querySelector('.block-callout--blue')).toBeInTheDocument()
  })

  it('marks icon as aria-hidden', () => {
    const { container } = render(<CalloutBlock {...makeProps()} />)
    const icon = container.querySelector('.block-callout__icon')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })
})
