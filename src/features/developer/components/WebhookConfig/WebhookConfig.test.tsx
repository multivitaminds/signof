import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WebhookConfig from './WebhookConfig'

describe('WebhookConfig', () => {
  const defaultProps = {
    onSave: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onSave.mockClear()
  })

  it('renders URL input', () => {
    render(<WebhookConfig {...defaultProps} />)
    expect(screen.getByLabelText('Endpoint URL')).toBeInTheDocument()
  })

  it('renders Description textarea', () => {
    render(<WebhookConfig {...defaultProps} />)
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('renders Events to subscribe label', () => {
    render(<WebhookConfig {...defaultProps} />)
    expect(screen.getByText('Events to subscribe')).toBeInTheDocument()
  })

  it('renders category headers', () => {
    render(<WebhookConfig {...defaultProps} />)
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Issues')).toBeInTheDocument()
    expect(screen.getByText('Bookings')).toBeInTheDocument()
    expect(screen.getByText('Pages')).toBeInTheDocument()
    expect(screen.getByText('Team')).toBeInTheDocument()
  })

  it('renders individual event labels', () => {
    render(<WebhookConfig {...defaultProps} />)
    expect(screen.getByText('Document Created')).toBeInTheDocument()
    expect(screen.getByText('Booking Created')).toBeInTheDocument()
  })

  it('Save button is disabled by default', () => {
    render(<WebhookConfig {...defaultProps} />)
    expect(screen.getByText('Save Webhook')).toBeDisabled()
  })

  it('shows error for non-HTTPS URL', async () => {
    const user = userEvent.setup()
    render(<WebhookConfig {...defaultProps} />)
    await user.type(screen.getByLabelText('Endpoint URL'), 'http://example.com')
    expect(screen.getByText('URL must start with https://')).toBeInTheDocument()
  })

  it('shows error for invalid URL', async () => {
    const user = userEvent.setup()
    render(<WebhookConfig {...defaultProps} />)
    await user.type(screen.getByLabelText('Endpoint URL'), 'not-a-url')
    expect(screen.getByText('Invalid URL format')).toBeInTheDocument()
  })

  it('clears error for valid HTTPS URL', async () => {
    const user = userEvent.setup()
    render(<WebhookConfig {...defaultProps} />)
    await user.type(screen.getByLabelText('Endpoint URL'), 'https://api.example.com/webhooks')
    expect(screen.queryByText('URL must start with https://')).not.toBeInTheDocument()
    expect(screen.queryByText('Invalid URL format')).not.toBeInTheDocument()
  })

  it('enables Save when valid URL and events selected', async () => {
    const user = userEvent.setup()
    render(<WebhookConfig {...defaultProps} />)
    await user.type(screen.getByLabelText('Endpoint URL'), 'https://api.example.com/webhooks')
    await user.click(screen.getByText('Document Created'))
    expect(screen.getByText('Save Webhook')).toBeEnabled()
  })

  it('calls onSave with correct data', async () => {
    const user = userEvent.setup()
    render(<WebhookConfig {...defaultProps} />)
    await user.type(screen.getByLabelText('Endpoint URL'), 'https://api.example.com/webhooks')
    await user.type(screen.getByLabelText('Description'), 'Test webhook')
    await user.click(screen.getByText('Document Created'))
    await user.click(screen.getByText('Save Webhook'))
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      'https://api.example.com/webhooks',
      'Test webhook',
      ['document.created']
    )
  })

  it('toggles all events in a category', async () => {
    const user = userEvent.setup()
    render(<WebhookConfig {...defaultProps} />)
    await user.type(screen.getByLabelText('Endpoint URL'), 'https://api.example.com/webhooks')
    // Click the Documents category header button
    await user.click(screen.getByText('Documents'))
    expect(screen.getByText('Save Webhook')).toBeEnabled()
  })

  it('resets form after saving', async () => {
    const user = userEvent.setup()
    render(<WebhookConfig {...defaultProps} />)
    await user.type(screen.getByLabelText('Endpoint URL'), 'https://api.example.com/webhooks')
    await user.click(screen.getByText('Document Created'))
    await user.click(screen.getByText('Save Webhook'))
    expect(screen.getByLabelText('Endpoint URL')).toHaveValue('')
  })
})
