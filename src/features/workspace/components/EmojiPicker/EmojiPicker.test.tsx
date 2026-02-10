import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmojiPicker from './EmojiPicker'

describe('EmojiPicker', () => {
  it('renders emoji grid', () => {
    render(<EmojiPicker onSelect={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('📄')).toBeInTheDocument()
  })

  it('calls onSelect when emoji clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<EmojiPicker onSelect={onSelect} onClose={vi.fn()} />)
    await user.click(screen.getByText('Objects'))
    await user.click(screen.getByText('🚀'))
    expect(onSelect).toHaveBeenCalledWith('🚀')
  })

  it('has category tabs', () => {
    render(<EmojiPicker onSelect={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Objects')).toBeInTheDocument()
    expect(screen.getByText('Nature')).toBeInTheDocument()
  })

  it('has remove button', () => {
    render(<EmojiPicker onSelect={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Remove icon')).toBeInTheDocument()
  })
})
