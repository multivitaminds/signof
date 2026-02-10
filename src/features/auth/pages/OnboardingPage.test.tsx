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

  it('renders the welcome step (step 1 of 8)', () => {
    renderOnboarding()
    expect(screen.getByText('Welcome to SignOf')).toBeInTheDocument()
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

  it('advances to step 2 (workspace) when Continue is clicked', async () => {
    renderOnboarding()

    await clickContinueAndWait()

    expect(screen.getByText('Step 2 of 8')).toBeInTheDocument()
    expect(screen.getByText('Name your workspace')).toBeInTheDocument()
  })

  it('shows the Back button from step 2 onward', async () => {
    renderOnboarding()

    // No back button on step 1
    expect(screen.queryByLabelText('Go back')).not.toBeInTheDocument()

    // Advance to step 2
    await clickContinueAndWait()

    expect(screen.getByLabelText('Go back')).toBeInTheDocument()
  })

  it('navigates through role selection on step 3', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderOnboarding()

    // Step 1 -> 2: display name (pre-filled)
    await clickContinueAndWait()

    // Step 2 -> 3: workspace name
    const wsInput = screen.getByLabelText('Workspace name')
    await user.type(wsInput, 'Acme Inc')
    await clickContinueAndWait()

    // Step 3: role selection
    expect(screen.getByText('What is your role?')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Design')).toBeInTheDocument()

    // Continue should be disabled until a role is selected
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()

    // Select a role
    await user.click(screen.getByText('Engineering'))
    expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled()
  })

  it('renders the step progress counter', () => {
    renderOnboarding()
    expect(screen.getByText('Step 1 of 8')).toBeInTheDocument()
  })

  it('renders the Continue button on step 1', () => {
    renderOnboarding()
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })
})
