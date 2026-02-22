import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import OnboardingPage from './OnboardingPage'

const mockNavigate = vi.fn()
const mockCompleteOnboarding = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../stores/useAuthStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      completeOnboarding: mockCompleteOnboarding,
      user: { name: 'Test User', email: 'test@example.com' },
    }),
}))

vi.mock('../stores/useOnboardingStore', () => ({
  useOnboardingStore: () => ({
    setWorkspace: vi.fn(),
    setRole: vi.fn(),
    setTeamSize: vi.fn(),
    setUseCases: vi.fn(),
    setTheme: vi.fn(),
    setAccentColor: vi.fn(),
    addInviteEmail: vi.fn(),
    completeOnboarding: vi.fn(),
  }),
}))

function renderOnboarding() {
  return render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>
  )
}

async function clickContinueAndWait() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const continueBtn = screen.getByRole('button', { name: /continue/i })
  await user.click(continueBtn)
  await act(async () => {
    vi.advanceTimersByTime(400)
  })
}

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the welcome step with personalized greeting', () => {
    renderOnboarding()
    expect(screen.getByText(/Welcome to OriginA/)).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 8')).toBeInTheDocument()
    expect(screen.getByLabelText('What should we call you?')).toBeInTheDocument()
  })

  it('pre-fills the display name from the user', () => {
    renderOnboarding()
    const input = screen.getByLabelText('What should we call you?')
    expect(input).toHaveValue('Test User')
  })

  it('disables Continue button when display name is empty', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderOnboarding()

    const input = screen.getByLabelText('What should we call you?')
    await user.clear(input)

    const continueBtn = screen.getByRole('button', { name: /continue/i })
    expect(continueBtn).toBeDisabled()
  })

  it('advances to workspace step with preview card', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderOnboarding()

    await clickContinueAndWait()

    expect(screen.getByText('Step 2 of 8')).toBeInTheDocument()
    expect(screen.getByText('Name your workspace')).toBeInTheDocument()

    // Type a workspace name and verify preview appears
    const wsInput = screen.getByLabelText('Workspace name')
    await user.type(wsInput, 'Acme Inc')
    expect(screen.getByText('Acme Inc')).toBeInTheDocument()
  })

  it('shows the Back button from step 2 onward', async () => {
    renderOnboarding()

    expect(screen.queryByLabelText('Go back')).not.toBeInTheDocument()

    await clickContinueAndWait()

    expect(screen.getByLabelText('Go back')).toBeInTheDocument()
  })

  it('navigates through role selection on step 3', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderOnboarding()

    await clickContinueAndWait()

    const wsInput = screen.getByLabelText('Workspace name')
    await user.type(wsInput, 'Acme Inc')
    await clickContinueAndWait()

    expect(screen.getByText('What is your role?')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()

    await user.click(screen.getByText('Engineering'))
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled()
  })

  it('shows skip button on optional steps (invite and appearance)', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderOnboarding()

    // Step 1 -> 2
    await clickContinueAndWait()

    // Step 2 -> 3: workspace name
    const wsInput = screen.getByLabelText('Workspace name')
    await user.type(wsInput, 'Acme Inc')
    await clickContinueAndWait()

    // Step 3 -> 4: select role
    await user.click(screen.getByText('Engineering'))
    await clickContinueAndWait()

    // Step 4 -> 5: select team size
    await user.click(screen.getByText('2-5'))
    await clickContinueAndWait()

    // Step 5 -> 6: select use case
    await user.click(screen.getByText('Scheduling'))
    await clickContinueAndWait()

    // Step 6 (invite): should have Skip
    expect(screen.getByText('Invite your team')).toBeInTheDocument()
    expect(screen.getByText('Skip')).toBeInTheDocument()
  })

  it('renders segment indicators for progress', () => {
    renderOnboarding()
    const segments = document.querySelectorAll('.onboarding__segment')
    expect(segments.length).toBe(8)

    const filledSegments = document.querySelectorAll('.onboarding__segment--filled')
    expect(filledSegments.length).toBe(1)
  })
})
