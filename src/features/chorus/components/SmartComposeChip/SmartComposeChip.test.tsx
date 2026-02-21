import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SmartComposeChip from './SmartComposeChip'

describe('SmartComposeChip', () => {
  const defaultProps = {
    suggestion: 'thanks for the update!',
    onAccept: vi.fn(),
    onDismiss: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders suggestion text', () => {
    render(<SmartComposeChip {...defaultProps} />)
    expect(screen.getByText('thanks for the update!')).toBeInTheDocument()
  })

  it('shows Tab and Esc keyboard hints', () => {
    render(<SmartComposeChip {...defaultProps} />)
    expect(screen.getByText('Tab')).toBeInTheDocument()
    expect(screen.getByText('Esc')).toBeInTheDocument()
  })

  it('calls onAccept when Accept button clicked', async () => {
    const user = userEvent.setup()
    render(<SmartComposeChip {...defaultProps} />)

    await user.click(screen.getByLabelText('Accept suggestion'))
    expect(defaultProps.onAccept).toHaveBeenCalledOnce()
  })

  it('calls onDismiss when dismiss button clicked', async () => {
    const user = userEvent.setup()
    render(<SmartComposeChip {...defaultProps} />)

    await user.click(screen.getByLabelText('Dismiss suggestion'))
    expect(defaultProps.onDismiss).toHaveBeenCalledOnce()
  })

  it('has accessible role and label', () => {
    render(<SmartComposeChip {...defaultProps} />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Smart compose suggestion')
  })
})
