import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CoverPicker from './CoverPicker'

describe('CoverPicker', () => {
  const baseProps = {
    onSelect: vi.fn(),
    onRemove: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders cover picker with title', () => {
    render(<CoverPicker {...baseProps} />)
    expect(screen.getByText('Cover image')).toBeInTheDocument()
  })

  it('renders preset cover buttons', () => {
    render(<CoverPicker {...baseProps} />)
    expect(screen.getByLabelText('Blue cover')).toBeInTheDocument()
    expect(screen.getByLabelText('Green cover')).toBeInTheDocument()
    expect(screen.getByLabelText('Orange cover')).toBeInTheDocument()
    expect(screen.getByLabelText('Purple cover')).toBeInTheDocument()
    expect(screen.getByLabelText('Red cover')).toBeInTheDocument()
    expect(screen.getByLabelText('Teal cover')).toBeInTheDocument()
    expect(screen.getByLabelText('Dark cover')).toBeInTheDocument()
    expect(screen.getByLabelText('Warm cover')).toBeInTheDocument()
  })

  it('calls onSelect when a preset is clicked', async () => {
    const user = userEvent.setup()
    render(<CoverPicker {...baseProps} />)
    await user.click(screen.getByLabelText('Blue cover'))
    expect(baseProps.onSelect).toHaveBeenCalledWith(
      expect.stringContaining('gradient:')
    )
  })

  it('renders URL input form', () => {
    render(<CoverPicker {...baseProps} />)
    expect(screen.getByPlaceholderText('Paste image URL...')).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('disables Add button when URL input is empty', () => {
    render(<CoverPicker {...baseProps} />)
    expect(screen.getByText('Add')).toBeDisabled()
  })

  it('enables Add button when URL input has value', async () => {
    const user = userEvent.setup()
    render(<CoverPicker {...baseProps} />)
    await user.type(screen.getByPlaceholderText('Paste image URL...'), 'https://example.com/img.jpg')
    expect(screen.getByText('Add')).not.toBeDisabled()
  })

  it('calls onSelect with URL on form submit', async () => {
    const user = userEvent.setup()
    render(<CoverPicker {...baseProps} />)
    await user.type(screen.getByPlaceholderText('Paste image URL...'), 'https://example.com/img.jpg')
    await user.click(screen.getByText('Add'))
    expect(baseProps.onSelect).toHaveBeenCalledWith('https://example.com/img.jpg')
  })

  it('does not show Remove cover button when no current cover', () => {
    render(<CoverPicker {...baseProps} />)
    expect(screen.queryByText('Remove cover')).not.toBeInTheDocument()
  })

  it('shows Remove cover button when current cover exists', () => {
    render(<CoverPicker {...baseProps} currentCover="https://example.com/cover.jpg" />)
    expect(screen.getByText('Remove cover')).toBeInTheDocument()
  })

  it('calls onRemove when Remove cover is clicked', async () => {
    const user = userEvent.setup()
    render(<CoverPicker {...baseProps} currentCover="some-cover" />)
    await user.click(screen.getByText('Remove cover'))
    expect(baseProps.onRemove).toHaveBeenCalled()
  })
})
