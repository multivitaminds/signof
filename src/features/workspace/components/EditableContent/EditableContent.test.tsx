import { render } from '@testing-library/react'
import EditableContent from './EditableContent'

describe('EditableContent', () => {
  const baseProps = {
    content: 'Hello world',
    marks: [] as never[],
    onContentChange: vi.fn(),
    onEnter: vi.fn(),
    onBackspace: vi.fn(),
    onArrowUp: vi.fn(),
    onArrowDown: vi.fn(),
  }

  it('renders contentEditable div by default', () => {
    const { container } = render(<EditableContent {...baseProps} />)
    const editable = container.querySelector('[contenteditable="true"]')
    expect(editable).toBeInTheDocument()
  })

  it('renders with div tag by default', () => {
    const { container } = render(<EditableContent {...baseProps} />)
    const editable = container.querySelector('div.editable-content')
    expect(editable).toBeInTheDocument()
  })

  it('renders with p tag when specified', () => {
    const { container } = render(<EditableContent {...baseProps} tag="p" />)
    const editable = container.querySelector('p.editable-content')
    expect(editable).toBeInTheDocument()
  })

  it('renders with h1 tag when specified', () => {
    const { container } = render(<EditableContent {...baseProps} tag="h1" />)
    const editable = container.querySelector('h1.editable-content')
    expect(editable).toBeInTheDocument()
  })

  it('renders with pre tag when specified', () => {
    const { container } = render(<EditableContent {...baseProps} tag="pre" />)
    const editable = container.querySelector('pre.editable-content')
    expect(editable).toBeInTheDocument()
  })

  it('renders with blockquote tag when specified', () => {
    const { container } = render(<EditableContent {...baseProps} tag="blockquote" />)
    const editable = container.querySelector('blockquote.editable-content')
    expect(editable).toBeInTheDocument()
  })

  it('sets data-placeholder attribute', () => {
    const { container } = render(
      <EditableContent {...baseProps} placeholder="Type here..." />
    )
    const editable = container.querySelector('[contenteditable]')
    expect(editable).toHaveAttribute('data-placeholder', 'Type here...')
  })

  it('uses default placeholder when none specified', () => {
    const { container } = render(<EditableContent {...baseProps} />)
    const editable = container.querySelector('[contenteditable]')
    expect(editable).toHaveAttribute('data-placeholder', "Type '/' for commands...")
  })

  it('has spellCheck enabled', () => {
    const { container } = render(<EditableContent {...baseProps} />)
    const editable = container.querySelector('[contenteditable]')
    expect(editable).toHaveAttribute('spellcheck', 'true')
  })

  it('has editable-content class', () => {
    const { container } = render(<EditableContent {...baseProps} />)
    expect(container.querySelector('.editable-content')).toBeInTheDocument()
  })
})
