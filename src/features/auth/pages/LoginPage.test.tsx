import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

const mockNavigate = vi.fn()
const mockLogin = vi.fn()
const mockLoginFromApi = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../stores/useAuthStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ login: mockLogin, loginFromApi: mockLoginFromApi }),
}))

vi.mock('../lib/authService', () => ({
  default: {
    login: vi.fn(),
  },
}))

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Orchestree branding and welcome text', () => {
    renderLoginPage()
    expect(screen.getByText('Orchestree')).toBeInTheDocument()
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your workspace')).toBeInTheDocument()
  })

  it('renders name and email input fields in demo mode', () => {
    renderLoginPage()
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
  })

  it('renders social login buttons', () => {
    renderLoginPage()
    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
    expect(screen.getByText('Continue with GitHub')).toBeInTheDocument()
  })

  it('renders a link to the signup page', () => {
    renderLoginPage()
    const signupLink = screen.getByRole('link', { name: /sign up/i })
    expect(signupLink).toBeInTheDocument()
    expect(signupLink).toHaveAttribute('href', '/signup')
  })

  it('shows error when submitting with empty email', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const nameInput = screen.getByPlaceholderText('Your name')
    await user.type(nameInput, 'John Doe')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('shows error when submitting with empty name', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    // Fill email but leave name empty
    await user.type(screen.getByPlaceholderText('you@company.com'), 'test@test.com')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('calls login and navigates on valid submission', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByPlaceholderText('Your name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('you@company.com'), 'john@test.com')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(mockLogin).toHaveBeenCalledWith('john@test.com', 'John Doe')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('clears error when user types in an input', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    // Trigger error by submitting with both fields empty
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    // Email is checked first so error is "Email is required"
    expect(screen.getByText('Email is required')).toBeInTheDocument()

    // Type in the email field to clear error
    await user.type(screen.getByPlaceholderText('you@company.com'), 'a')
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
  })
})
