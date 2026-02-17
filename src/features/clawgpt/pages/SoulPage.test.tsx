import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SoulPage from './SoulPage'

const mockResetToDefault = vi.fn()
const mockSwitchPreset = vi.fn()
const mockAddRule = vi.fn()
const mockRemoveRule = vi.fn()
const mockAddContext = vi.fn()
const mockRemoveContext = vi.fn()
const mockUpdateSoul = vi.fn()

const mockSoulConfig = {
  name: 'Atlas',
  personality: 'Professional, helpful, and proactive assistant',
  responseStyle: 'professional',
  greeting: 'Hello! I\'m Atlas.',
  fallbackMessage: 'I\'m not sure I understand.',
  rules: ['Always be polite'],
  context: ['Company: Orchestree'],
  contextItems: ['Company: Orchestree'],
  temperature: 0.7,
  maxTokens: 1024,
  systemPrompt: 'You are Atlas.',
  language: 'en',
  timezone: 'UTC',
}

vi.mock('../stores/useSoulStore', () => ({
  useSoulStore: vi.fn(() => ({
    soulConfig: mockSoulConfig,
    presets: [],
    activePresetId: null,
    updateSoul: mockUpdateSoul,
    resetToDefault: mockResetToDefault,
    switchPreset: mockSwitchPreset,
    addRule: mockAddRule,
    removeRule: mockRemoveRule,
    addContext: mockAddContext,
    removeContext: mockRemoveContext,
  })),
}))

vi.mock('../lib/gatewayClient', () => ({
  sendSoulUpdate: vi.fn(),
  isGatewayConnected: vi.fn(() => false),
}))

vi.mock('../components/SoulEditor/SoulEditor', () => ({
  default: ({ config }: { config: { name: string } }) => (
    <div data-testid="soul-editor">
      <span>Editing personality: {config.name}</span>
    </div>
  ),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <SoulPage />
    </MemoryRouter>
  )
}

describe('SoulPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the SoulEditor component', () => {
    renderPage()
    expect(screen.getByTestId('soul-editor')).toBeInTheDocument()
  })

  it('displays soul name in editor', () => {
    renderPage()
    expect(screen.getByText('Editing personality: Atlas')).toBeInTheDocument()
  })

  it('renders Save Configuration button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Save Configuration' })).toBeInTheDocument()
  })

  it('renders Reset to Default button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Reset to Default' })).toBeInTheDocument()
  })

  it('calls sendSoulUpdate when Save is clicked', async () => {
    const { sendSoulUpdate } = await import('../lib/gatewayClient')
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Save Configuration' }))

    expect(sendSoulUpdate).toHaveBeenCalledTimes(1)
    expect(sendSoulUpdate).toHaveBeenCalledWith(mockSoulConfig)
  })

  it('calls resetToDefault when Reset is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Reset to Default' }))

    expect(mockResetToDefault).toHaveBeenCalledTimes(1)
  })

  it('renders Test Personality section', () => {
    renderPage()
    expect(screen.getByText('Test Personality')).toBeInTheDocument()
  })

  it('renders test message input', () => {
    renderPage()
    expect(screen.getByLabelText('Test message')).toBeInTheDocument()
  })
})
