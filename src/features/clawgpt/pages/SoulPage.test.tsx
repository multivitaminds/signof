import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SoulPage from './SoulPage'

const mockUpdateSoul = vi.fn()
const mockResetToDefault = vi.fn()

const mockSoulConfig = {
  name: 'Atlas',
  personality: 'Professional, helpful, and proactive assistant',
  responseStyle: 'professional',
  greeting: 'Hello! I\'m Atlas.',
  fallbackMessage: 'I\'m not sure I understand.',
  rules: ['Always be polite'],
  contextItems: ['Company: Orchestree'],
  temperature: 0.7,
  maxTokens: 1024,
  systemPrompt: 'You are Atlas.',
}

vi.mock('../stores/useSoulStore', () => ({
  useSoulStore: vi.fn(() => ({
    soulConfig: mockSoulConfig,
    updateSoul: mockUpdateSoul,
    resetToDefault: mockResetToDefault,
  })),
}))

vi.mock('../components/SoulEditor/SoulEditor', () => ({
  default: ({ config }: { config: { name: string }; onUpdate: (partial: Record<string, unknown>) => void }) => (
    <div data-testid="soul-editor">
      <span>Editing soul: {config.name}</span>
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
    mockUpdateSoul.mockClear()
    mockResetToDefault.mockClear()
  })

  it('renders the SoulEditor component', () => {
    renderPage()
    expect(screen.getByTestId('soul-editor')).toBeInTheDocument()
  })

  it('displays soul name in editor', () => {
    renderPage()
    expect(screen.getByText('Editing soul: Atlas')).toBeInTheDocument()
  })

  it('renders Save Configuration button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Save Configuration' })).toBeInTheDocument()
  })

  it('renders Reset to Default button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Reset to Default' })).toBeInTheDocument()
  })

  it('calls updateSoul when Save is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Save Configuration' }))

    expect(mockUpdateSoul).toHaveBeenCalledTimes(1)
  })

  it('calls resetToDefault when Reset is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Reset to Default' }))

    expect(mockResetToDefault).toHaveBeenCalledTimes(1)
  })
})
