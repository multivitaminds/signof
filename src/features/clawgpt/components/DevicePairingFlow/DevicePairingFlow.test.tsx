import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DevicePairingFlow from './DevicePairingFlow'

describe('DevicePairingFlow', () => {
  const defaultProps = {
    pairingCode: null as string | null,
    pairingExpiry: null as string | null,
    onGenerate: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows Pair New Device button when no code', () => {
    render(<DevicePairingFlow {...defaultProps} />)
    expect(screen.getByText('Pair New Device')).toBeInTheDocument()
  })

  it('calls onGenerate when button is clicked', async () => {
    const user = userEvent.setup()
    render(<DevicePairingFlow {...defaultProps} />)
    await user.click(screen.getByText('Pair New Device'))
    expect(defaultProps.onGenerate).toHaveBeenCalledOnce()
  })

  it('displays pairing code as individual digits', () => {
    render(
      <DevicePairingFlow
        {...defaultProps}
        pairingCode="123456"
        pairingExpiry={new Date(Date.now() + 300000).toISOString()}
      />
    )
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('shows instructions when code is displayed', () => {
    render(
      <DevicePairingFlow
        {...defaultProps}
        pairingCode="123456"
        pairingExpiry={new Date(Date.now() + 300000).toISOString()}
      />
    )
    expect(
      screen.getByText('Enter this code on your device to complete pairing.')
    ).toBeInTheDocument()
  })

  it('shows countdown timer', () => {
    render(
      <DevicePairingFlow
        {...defaultProps}
        pairingCode="123456"
        pairingExpiry={new Date(Date.now() + 300000).toISOString()}
      />
    )
    expect(screen.getByLabelText('Time remaining')).toBeInTheDocument()
  })

  it('shows cancel button when code is displayed', () => {
    render(
      <DevicePairingFlow
        {...defaultProps}
        pairingCode="123456"
        pairingExpiry={new Date(Date.now() + 300000).toISOString()}
      />
    )
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(
      <DevicePairingFlow
        {...defaultProps}
        pairingCode="123456"
        pairingExpiry={new Date(Date.now() + 300000).toISOString()}
      />
    )
    await user.click(screen.getByText('Cancel'))
    expect(defaultProps.onCancel).toHaveBeenCalledOnce()
  })

  it('does not show Pair New Device button when code is present', () => {
    render(
      <DevicePairingFlow
        {...defaultProps}
        pairingCode="123456"
        pairingExpiry={new Date(Date.now() + 300000).toISOString()}
      />
    )
    expect(screen.queryByText('Pair New Device')).not.toBeInTheDocument()
  })
})
