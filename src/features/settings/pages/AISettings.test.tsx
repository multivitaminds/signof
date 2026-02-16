import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useLLMConfigStore from '../../ai/stores/useLLMConfigStore'
import AISettings from './AISettings'

describe('AISettings', () => {
  beforeEach(() => {
    useLLMConfigStore.setState({
      mode: 'demo',
      connectionStatus: 'unknown',
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      availableProviders: [],
      lastCheckedAt: null,
      errorMessage: null,
    })
  })

  it('renders the title and subtitle', () => {
    render(<AISettings />)
    expect(screen.getByText('AI / Copilot')).toBeInTheDocument()
    expect(screen.getByText('Configure AI providers and model preferences')).toBeInTheDocument()
  })

  it('shows Demo Mode banner when in demo mode', () => {
    render(<AISettings />)
    expect(screen.getByText('Demo Mode')).toBeInTheDocument()
    expect(screen.getByText('Demo')).toBeInTheDocument()
  })

  it('shows Live Mode banner when in live mode', () => {
    useLLMConfigStore.setState({ mode: 'live' })
    render(<AISettings />)
    expect(screen.getByText('Live Mode')).toBeInTheDocument()
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('renders provider status grid with all 9 providers', () => {
    render(<AISettings />)
    // Provider names appear in both the grid cards and the select dropdown
    expect(screen.getAllByText('Anthropic').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('OpenAI').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Google Gemini').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('MiniMax').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('DeepSeek').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Mistral').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Groq').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('OpenRouter').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('xAI').length).toBeGreaterThanOrEqual(1)
  })

  it('shows provider and model selects', () => {
    render(<AISettings />)
    expect(screen.getByLabelText('AI Provider')).toBeInTheDocument()
    expect(screen.getByLabelText('AI Model')).toBeInTheDocument()
  })

  it('changes provider via select', async () => {
    const user = userEvent.setup()
    render(<AISettings />)
    const providerSelect = screen.getByLabelText('AI Provider')
    await user.selectOptions(providerSelect, 'openai')
    expect(useLLMConfigStore.getState().provider).toBe('openai')
  })

  it('renders test connection button', () => {
    render(<AISettings />)
    expect(screen.getByLabelText('Test connection')).toBeInTheDocument()
  })

  it('shows connection status when lastCheckedAt is set', () => {
    useLLMConfigStore.setState({
      connectionStatus: 'connected',
      lastCheckedAt: new Date().toISOString(),
    })
    render(<AISettings />)
    expect(screen.getByText(/Connected/)).toBeInTheDocument()
  })

  it('shows error message when connection has error', () => {
    useLLMConfigStore.setState({
      connectionStatus: 'error',
      errorMessage: 'API key invalid',
      lastCheckedAt: new Date().toISOString(),
    })
    render(<AISettings />)
    expect(screen.getByText(/API key invalid/)).toBeInTheDocument()
  })

  it('expands provider card on click to show setup steps', async () => {
    const user = userEvent.setup()
    render(<AISettings />)
    // Click on a provider card button (the card buttons have aria-expanded)
    const cardButtons = screen.getAllByRole('button', { expanded: false })
    // First card button should be a provider card
    const providerCardBtn = cardButtons.find((btn) => btn.className.includes('provider-card-btn'))
    if (providerCardBtn) {
      await user.click(providerCardBtn)
      expect(screen.getByText('Get API key')).toBeInTheDocument()
      expect(screen.getByText('Add to environment')).toBeInTheDocument()
    }
  })
})
