import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaxBanditSettings from './TaxBanditSettings'

const defaultConfig = {
  clientId: '',
  clientSecret: '',
  userToken: '',
  useSandbox: false,
}

describe('TaxBanditSettings', () => {
  const defaultProps = {
    config: defaultConfig,
    isConnected: false,
    onConfigChange: vi.fn(),
    onTestConnection: vi.fn().mockResolvedValue(true),
  }

  beforeEach(() => {
    defaultProps.onConfigChange.mockClear()
    defaultProps.onTestConnection.mockClear().mockResolvedValue(true)
  })

  it('renders toggle button with title', () => {
    render(<TaxBanditSettings {...defaultProps} />)
    expect(screen.getByText('TaxBandit API')).toBeInTheDocument()
  })

  it('shows Not Connected badge when disconnected', () => {
    render(<TaxBanditSettings {...defaultProps} isConnected={false} />)
    expect(screen.getByText('Not Connected')).toBeInTheDocument()
  })

  it('shows Connected badge when connected', () => {
    render(<TaxBanditSettings {...defaultProps} isConnected={true} />)
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('is collapsed by default', () => {
    render(<TaxBanditSettings {...defaultProps} />)
    expect(screen.queryByLabelText('Client ID')).not.toBeInTheDocument()
  })

  it('expands on toggle click', async () => {
    const user = userEvent.setup()
    render(<TaxBanditSettings {...defaultProps} />)
    await user.click(screen.getByRole('button', { expanded: false }))
    expect(screen.getByLabelText('Client ID')).toBeInTheDocument()
    expect(screen.getByLabelText('Client Secret')).toBeInTheDocument()
    expect(screen.getByLabelText('User Token')).toBeInTheDocument()
  })

  it('calls onConfigChange when typing in Client ID', async () => {
    const user = userEvent.setup()
    render(<TaxBanditSettings {...defaultProps} />)
    await user.click(screen.getByRole('button', { expanded: false }))
    await user.type(screen.getByLabelText('Client ID'), 'a')
    expect(defaultProps.onConfigChange).toHaveBeenCalledWith({ clientId: 'a' })
  })

  it('disables Test Connection when no credentials', async () => {
    const user = userEvent.setup()
    render(<TaxBanditSettings {...defaultProps} />)
    await user.click(screen.getByRole('button', { expanded: false }))
    expect(screen.getByText('Test Connection')).toBeDisabled()
  })

  it('enables Test Connection when credentials filled', async () => {
    const user = userEvent.setup()
    const filledConfig = { clientId: 'id', clientSecret: 'secret', userToken: 'token', useSandbox: false }
    render(<TaxBanditSettings {...defaultProps} config={filledConfig} />)
    await user.click(screen.getByRole('button', { expanded: false }))
    expect(screen.getByText('Test Connection')).toBeEnabled()
  })

  it('shows success message after successful test', async () => {
    const user = userEvent.setup()
    const filledConfig = { clientId: 'id', clientSecret: 'secret', userToken: 'token', useSandbox: false }
    render(<TaxBanditSettings {...defaultProps} config={filledConfig} />)
    await user.click(screen.getByRole('button', { expanded: false }))
    await user.click(screen.getByText('Test Connection'))
    await waitFor(() => {
      expect(screen.getByText(/Connection successful/)).toBeInTheDocument()
    })
  })

  it('shows error message after failed test', async () => {
    const user = userEvent.setup()
    defaultProps.onTestConnection.mockResolvedValue(false)
    const filledConfig = { clientId: 'id', clientSecret: 'secret', userToken: 'token', useSandbox: false }
    render(<TaxBanditSettings {...defaultProps} config={filledConfig} />)
    await user.click(screen.getByRole('button', { expanded: false }))
    await user.click(screen.getByText('Test Connection'))
    await waitFor(() => {
      expect(screen.getByText(/Connection failed/)).toBeInTheDocument()
    })
  })

  it('toggles to demo mode via segmented control', async () => {
    const user = userEvent.setup()
    render(<TaxBanditSettings {...defaultProps} />)
    await user.click(screen.getByRole('button', { expanded: false }))
    await user.click(screen.getByText('Demo'))
    expect(defaultProps.onConfigChange).toHaveBeenCalledWith({ useSandbox: true })
  })
})
