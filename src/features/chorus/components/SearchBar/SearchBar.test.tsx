import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from './SearchBar'

describe('SearchBar', () => {
  it('renders with placeholder text', () => {
    render(<SearchBar onSearch={vi.fn()} />)
    expect(screen.getByPlaceholderText('Search messages...')).toBeInTheDocument()
  })

  it('auto-focuses the input on mount', () => {
    render(<SearchBar onSearch={vi.fn()} />)
    expect(screen.getByLabelText('Search messages')).toHaveFocus()
  })

  it('calls onSearch when Enter is pressed', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    const input = screen.getByLabelText('Search messages')
    await user.type(input, 'hello world{Enter}')
    expect(onSearch).toHaveBeenCalledWith('hello world')
  })

  it('parses filter prefixes into chips on Enter', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    const input = screen.getByLabelText('Search messages')
    await user.type(input, 'from:sarah database{Enter}')
    expect(screen.getByText('sarah')).toBeInTheDocument()
    expect(onSearch).toHaveBeenCalledWith('from:sarah database')
  })

  it('renders initial query with chips', () => {
    render(<SearchBar onSearch={vi.fn()} initialQuery="from:alex in:general test" />)
    expect(screen.getByText('alex')).toBeInTheDocument()
    expect(screen.getByText('general')).toBeInTheDocument()
  })

  it('removes chip when chip remove button is clicked', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} initialQuery="from:alex hello" />)

    const removeBtn = screen.getByLabelText('Remove from:alex filter')
    await user.click(removeBtn)
    expect(screen.queryByText('alex')).not.toBeInTheDocument()
    expect(onSearch).toHaveBeenCalledWith('hello')
  })

  it('shows clear button when input has content', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={vi.fn()} />)

    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()

    const input = screen.getByLabelText('Search messages')
    await user.type(input, 'test')
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
  })

  it('clears everything when clear button is clicked', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} initialQuery="from:alex hello" />)

    const clearBtn = screen.getByLabelText('Clear search')
    await user.click(clearBtn)
    expect(screen.queryByText('alex')).not.toBeInTheDocument()
    expect(onSearch).toHaveBeenCalledWith('')
  })

  it('removes last chip on Backspace when input is empty', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={vi.fn()} initialQuery="from:alex in:general" />)

    expect(screen.getByText('general')).toBeInTheDocument()
    const input = screen.getByLabelText('Search messages')
    await user.click(input)
    await user.keyboard('{Backspace}')
    expect(screen.queryByText('general')).not.toBeInTheDocument()
  })
})
