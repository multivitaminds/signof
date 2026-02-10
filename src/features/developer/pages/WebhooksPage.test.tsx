import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WebhooksPage from './WebhooksPage'
import useDeveloperStore from '../stores/useDeveloperStore'
import { WebhookEvent } from '../types'

function resetStore() {
  useDeveloperStore.setState({
    apiKeys: [],
    webhooks: [
      {
        id: 'wh_test_1',
        url: 'https://api.example.com/webhooks',
        description: 'Test production webhook',
        events: [
          WebhookEvent.DocumentCreated as typeof WebhookEvent.DocumentCreated,
          WebhookEvent.DocumentCompleted as typeof WebhookEvent.DocumentCompleted,
        ],
        secret: 'whsec_testsecret123',
        status: 'active',
        createdAt: '2025-11-20T08:00:00Z',
        lastDeliveryAt: '2026-02-08T10:00:00Z',
        failureCount: 2,
      },
      {
        id: 'wh_test_2',
        url: 'https://hooks.slack.com/services/xxx',
        description: 'Slack integration',
        events: [
          WebhookEvent.BookingCreated as typeof WebhookEvent.BookingCreated,
        ],
        secret: 'whsec_slacksecret456',
        status: 'disabled',
        createdAt: '2026-01-05T12:00:00Z',
        lastDeliveryAt: null,
        failureCount: 0,
      },
    ],
    deliveries: [
      {
        id: 'del_test_1',
        webhookId: 'wh_test_1',
        event: WebhookEvent.DocumentCreated as typeof WebhookEvent.DocumentCreated,
        payload: '{"event":"document.created","data":{"id":"doc_test"}}',
        statusCode: 200,
        responseBody: '{"received":true}',
        deliveredAt: '2026-02-08T10:00:00Z',
        success: true,
      },
    ],
  })
}

describe('WebhooksPage', () => {
  beforeEach(() => {
    resetStore()
  })

  it('renders webhooks title and endpoints', () => {
    render(<WebhooksPage />)

    expect(screen.getByText('Webhooks')).toBeInTheDocument()
    expect(screen.getByText('https://api.example.com/webhooks')).toBeInTheDocument()
    expect(screen.getByText('https://hooks.slack.com/services/xxx')).toBeInTheDocument()
  })

  it('shows webhook descriptions', () => {
    render(<WebhooksPage />)

    expect(screen.getByText('Test production webhook')).toBeInTheDocument()
    expect(screen.getByText('Slack integration')).toBeInTheDocument()
  })

  it('shows failure count warning', () => {
    render(<WebhooksPage />)

    expect(screen.getByText('2 failures')).toBeInTheDocument()
  })

  it('opens create form when clicking Add Endpoint', async () => {
    const user = userEvent.setup()
    render(<WebhooksPage />)

    await user.click(screen.getByText('Add Endpoint'))
    expect(screen.getByText('New Webhook Endpoint')).toBeInTheDocument()
    expect(screen.getByLabelText('Endpoint URL')).toBeInTheDocument()
  })

  it('expands webhook details on toggle click', async () => {
    const user = userEvent.setup()
    render(<WebhooksPage />)

    const toggleBtns = screen.getAllByLabelText('Toggle webhook details')
    const firstToggle = toggleBtns[0]
    expect(firstToggle).toBeDefined()
    await user.click(firstToggle!)

    expect(screen.getByText('Signing Secret')).toBeInTheDocument()
    expect(screen.getByText('Subscribed Events')).toBeInTheDocument()
    expect(screen.getByText('Document Created')).toBeInTheDocument()
    expect(screen.getByText('Document Completed')).toBeInTheDocument()
  })

  it('shows deliveries table when expanded', async () => {
    const user = userEvent.setup()
    render(<WebhooksPage />)

    const toggleBtns = screen.getAllByLabelText('Toggle webhook details')
    const firstToggle = toggleBtns[0]
    expect(firstToggle).toBeDefined()
    await user.click(firstToggle!)

    expect(screen.getByText('Recent Deliveries (1)')).toBeInTheDocument()
    expect(screen.getByText('Send Test')).toBeInTheDocument()
  })
})
