import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PaymentPage from './PaymentPage'

const mockNavigate = vi.fn()
const mockSetRegistrationStep = vi.fn()
const mockSetPaymentMethod = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../stores/useAuthStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ setRegistrationStep: mockSetRegistrationStep }),
}))

vi.mock('../../settings/stores/useBillingStore', () => ({
  useBillingStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      currentPlan: 'pro',
      billingCycle: 'monthly',
      setPaymentMethod: mockSetPaymentMethod,
    }),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <PaymentPage />
    </MemoryRouter>
  )
}

describe('PaymentPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockSetRegistrationStep.mockClear()
    mockSetPaymentMethod.mockClear()
  })

  it('renders payment form with title', () => {
    renderPage()
    expect(screen.getByText(/payment details/i)).toBeInTheDocument()
  })

  it('renders card number input', () => {
    renderPage()
    expect(screen.getByLabelText(/card number/i)).toBeInTheDocument()
  })

  it('renders expiry and CVC inputs', () => {
    renderPage()
    expect(screen.getByLabelText(/expiry date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cvc/i)).toBeInTheDocument()
  })

  it('renders cardholder name input', () => {
    renderPage()
    expect(screen.getByLabelText(/cardholder name/i)).toBeInTheDocument()
  })

  it('renders plan summary', () => {
    renderPage()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Monthly')).toBeInTheDocument()
  })

  it('navigates back to plan selection', async () => {
    const user = userEvent.setup()
    renderPage()
    const backBtn = screen.getByRole('button', { name: /back/i })
    await user.click(backBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/signup/plan')
  })

  it('shows error when cardholder name is empty', async () => {
    const user = userEvent.setup()
    renderPage()
    const submitBtn = screen.getByRole('button', { name: /start subscription/i })
    await user.click(submitBtn)
    expect(screen.getByText('Cardholder name is required')).toBeInTheDocument()
  })

  it('shows error when card number is incomplete', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/cardholder name/i), 'John Doe')
    await user.type(screen.getByLabelText(/card number/i), '1234')

    const submitBtn = screen.getByRole('button', { name: /start subscription/i })
    await user.click(submitBtn)
    expect(screen.getByText('Card number must be 16 digits')).toBeInTheDocument()
  })

  it('submits valid payment and navigates to onboarding', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/cardholder name/i), 'John Doe')
    await user.type(screen.getByLabelText(/card number/i), '4242424242424242')
    await user.type(screen.getByLabelText(/expiry date/i), '1227')
    await user.type(screen.getByLabelText(/cvc/i), '123')

    const submitBtn = screen.getByRole('button', { name: /start subscription/i })
    await user.click(submitBtn)

    expect(mockSetPaymentMethod).toHaveBeenCalledWith({
      brand: 'Visa',
      last4: '4242',
      expiry: '12/27',
    })
    expect(mockSetRegistrationStep).toHaveBeenCalledWith('onboarding')
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding')
  })
})
