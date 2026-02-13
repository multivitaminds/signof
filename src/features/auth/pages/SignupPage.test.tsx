import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SignupPage from './SignupPage'

const mockNavigate = vi.fn()
const mockSignup = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../stores/useAuthStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ signup: mockSignup }),
}))

function renderSignupPage() {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>
  )
}

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders branding and signup heading', () => {
    renderSignupPage()
    expect(screen.getByText('Orchestree')).toBeInTheDocument()
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByText('Start your free Orchestree workspace')).toBeInTheDocument()
  })

  it('renders full name and work email inputs', () => {
    renderSignupPage()
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('john@company.com')).toBeInTheDocument()
  })

  it('renders social signup buttons', () => {
    renderSignupPage()
    expect(screen.getByText('Sign up with Google')).toBeInTheDocument()
    expect(screen.getByText('Sign up with GitHub')).toBeInTheDocument()
  })

  it('renders a link to the login page', () => {
    renderSignupPage()
    const loginLink = screen.getByRole('link', { name: /sign in/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('shows error when name is empty on submit', async () => {
    const user = userEvent.setup()
    renderSignupPage()

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(mockSignup).not.toHaveBeenCalled()
  })

  it('shows error when email is empty on submit', async () => {
    const user = userEvent.setup()
    renderSignupPage()

    await user.type(screen.getByPlaceholderText('John Doe'), 'Jane Smith')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(mockSignup).not.toHaveBeenCalled()
  })

  it('calls signup and navigates on valid submission', async () => {
    const user = userEvent.setup()
    renderSignupPage()

    await user.type(screen.getByPlaceholderText('John Doe'), 'Jane Smith')
    await user.type(screen.getByPlaceholderText('john@company.com'), 'jane@work.com')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(mockSignup).toHaveBeenCalledWith('jane@work.com', 'Jane Smith')
    expect(mockNavigate).toHaveBeenCalledWith('/signup/plan')
  })

  it('clears error when user types in an input', async () => {
    const user = userEvent.setup()
    renderSignupPage()

    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByText('Name is required')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('John Doe'), 'a')
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
  })
})
