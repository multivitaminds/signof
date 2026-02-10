import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SlashMenu from './SlashMenu'

describe('SlashMenu', () => {
  const defaultProps = {
    position: { x: 100, y: 200 },
    onSelect: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders slash commands', () => {
    render(<SlashMenu {...defaultProps} />)
    expect(screen.getByText('Text')).toBeInTheDocument()
    expect(screen.getByText('Heading 1')).toBeInTheDocument()
    expect(screen.getByText('Bulleted List')).toBeInTheDocument()
    expect(screen.getByText('Code')).toBeInTheDocument()
  })

  it('filters commands on search', async () => {
    const user = userEvent.setup()
    render(<SlashMenu {...defaultProps} />)
    const input = screen.getByPlaceholderText('Filter...')
    await user.type(input, 'head')
    expect(screen.getByText('Heading 1')).toBeInTheDocument()
    expect(screen.getByText('Heading 2')).toBeInTheDocument()
    expect(screen.queryByText('Bulleted List')).not.toBeInTheDocument()
  })

  it('calls onSelect when item clicked', async () => {
    const user = userEvent.setup()
    render(<SlashMenu {...defaultProps} />)
    await user.click(screen.getByText('Heading 1'))
    expect(defaultProps.onSelect).toHaveBeenCalledWith('heading1')
  })

  it('shows empty state when no results', async () => {
    const user = userEvent.setup()
    render(<SlashMenu {...defaultProps} />)
    const input = screen.getByPlaceholderText('Filter...')
    await user.type(input, 'zzzzzzz')
    expect(screen.getByText('No results')).toBeInTheDocument()
  })
})
