import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import CodeBlock from './CodeBlock'

describe('CodeBlock', () => {
  it('renders language label', () => {
    render(<CodeBlock code="const x = 1" language="javascript" />)
    expect(screen.getByText('javascript')).toBeInTheDocument()
  })

  it('renders code content', () => {
    render(<CodeBlock code="const x = 1" language="javascript" />)
    expect(screen.getByText('const')).toBeInTheDocument()
  })

  it('renders Copy button', () => {
    render(<CodeBlock code="test" language="bash" />)
    expect(screen.getByLabelText('Copy code')).toBeInTheDocument()
  })

  it('copies code to clipboard on click', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    })
    render(<CodeBlock code="hello world" language="bash" />)
    fireEvent.click(screen.getByLabelText('Copy code'))
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('hello world')
    })
  })

  it('shows Copied text after clicking copy', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    })
    render(<CodeBlock code="test" language="bash" />)
    fireEvent.click(screen.getByLabelText('Copy code'))
    await waitFor(() => {
      expect(screen.getByText('Copied')).toBeInTheDocument()
    })
  })

  it('shows line numbers when showLineNumbers is true', () => {
    render(<CodeBlock code={"line1\nline2\nline3"} language="javascript" showLineNumbers />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not show line numbers by default', () => {
    const { container } = render(<CodeBlock code="single line" language="bash" />)
    expect(container.querySelector('.code-block__line-number')).not.toBeInTheDocument()
  })

  it('applies syntax highlighting token classes', () => {
    const { container } = render(<CodeBlock code='const name = "hello"' language="javascript" />)
    expect(container.querySelector('.code-block__token--keyword')).toBeInTheDocument()
    expect(container.querySelector('.code-block__token--string')).toBeInTheDocument()
  })

  it('highlights JSON keys as strings', () => {
    const { container } = render(<CodeBlock code='{"key": "value"}' language="json" />)
    expect(container.querySelector('.code-block__token--string')).toBeInTheDocument()
  })
})
