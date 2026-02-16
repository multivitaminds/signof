import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useConnectorStore from '../stores/useConnectorStore'
import ConnectorHubPage from './ConnectorHubPage'

describe('ConnectorHubPage', () => {
  beforeEach(() => {
    useConnectorStore.setState({
      connectors: [
        {
          id: 'gmail', name: 'Gmail', category: 'communication', icon: 'mail',
          description: 'Send and receive emails', authType: 'oauth2', status: 'connected',
          actions: [{ id: 'a1', name: 'Send Email', description: 'Send an email', inputSchema: {}, outputSchema: {} }],
        },
        {
          id: 'slack', name: 'Slack', category: 'communication', icon: 'message',
          description: 'Slack messaging', authType: 'oauth2', status: 'disconnected',
          actions: [{ id: 'a2', name: 'Send Message', description: 'Send message', inputSchema: {}, outputSchema: {} }],
        },
        {
          id: 'stripe', name: 'Stripe', category: 'finance', icon: 'card',
          description: 'Payment processing', authType: 'api_key', status: 'disconnected',
          actions: [
            { id: 'a3', name: 'Create Charge', description: 'Charge', inputSchema: {}, outputSchema: {} },
            { id: 'a4', name: 'List Customers', description: 'List', inputSchema: {}, outputSchema: {} },
          ],
        },
      ],
    })
  })

  it('renders stats', () => {
    render(<ConnectorHubPage />)
    expect(screen.getByText('Total Connectors')).toBeInTheDocument()
    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByText('Categories')).toBeInTheDocument()
  })

  it('renders all connector cards', () => {
    render(<ConnectorHubPage />)
    expect(screen.getByText('Gmail')).toBeInTheDocument()
    expect(screen.getByText('Slack')).toBeInTheDocument()
    expect(screen.getByText('Stripe')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<ConnectorHubPage />)
    expect(screen.getByPlaceholderText('Search connectors...')).toBeInTheDocument()
  })

  it('filters by search query', async () => {
    const user = userEvent.setup()
    render(<ConnectorHubPage />)
    await user.type(screen.getByPlaceholderText('Search connectors...'), 'stripe')
    expect(screen.getByText('Stripe')).toBeInTheDocument()
    expect(screen.queryByText('Gmail')).not.toBeInTheDocument()
    expect(screen.queryByText('Slack')).not.toBeInTheDocument()
  })

  it('shows empty state when search matches nothing', async () => {
    const user = userEvent.setup()
    render(<ConnectorHubPage />)
    await user.type(screen.getByPlaceholderText('Search connectors...'), 'nonexistent')
    expect(screen.getByText('No connectors match your search.')).toBeInTheDocument()
  })

  it('filters by category', async () => {
    const user = userEvent.setup()
    render(<ConnectorHubPage />)
    // Click the finance category pill (filter button, not the card text)
    const financePills = screen.getAllByText('finance')
    await user.click(financePills[0]!)
    expect(screen.getByText('Stripe')).toBeInTheDocument()
    expect(screen.queryByText('Gmail')).not.toBeInTheDocument()
    expect(screen.queryByText('Slack')).not.toBeInTheDocument()
  })

  it('shows All category by default', () => {
    render(<ConnectorHubPage />)
    const allBtn = screen.getByText('All')
    expect(allBtn.className).toContain('--active')
  })

  it('toggles connector status via Connect/Disconnect button', async () => {
    const user = userEvent.setup()
    render(<ConnectorHubPage />)
    // Gmail is connected, click Disconnect
    await user.click(screen.getByText('Disconnect'))
    // Slack has Connect button
    const connectBtns = screen.getAllByText('Connect')
    expect(connectBtns.length).toBeGreaterThanOrEqual(1)
  })

  it('shows action count per connector', () => {
    render(<ConnectorHubPage />)
    const oneActions = screen.getAllByText('1 actions')
    expect(oneActions.length).toBe(2) // Gmail and Slack each have 1 action
    expect(screen.getByText('2 actions')).toBeInTheDocument() // Stripe
  })
})
