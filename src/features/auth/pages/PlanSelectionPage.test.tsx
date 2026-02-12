import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PlanSelectionPage from './PlanSelectionPage'

const mockNavigate = vi.fn()
const mockSetRegistrationStep = vi.fn()
const mockSetPlan = vi.fn()
const mockSetBillingCycle = vi.fn()
const mockSetTaxPlan = vi.fn()

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
      setPlan: mockSetPlan,
      setBillingCycle: mockSetBillingCycle,
      setTaxPlan: mockSetTaxPlan,
    }),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <PlanSelectionPage />
    </MemoryRouter>
  )
}

describe('PlanSelectionPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockSetRegistrationStep.mockClear()
    mockSetPlan.mockClear()
    mockSetBillingCycle.mockClear()
    mockSetTaxPlan.mockClear()
  })

  it('renders all 4 plan cards', () => {
    renderPage()
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Business')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('shows monthly/yearly toggle', () => {
    renderPage()
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('Yearly')).toBeInTheDocument()
  })

  it('shows Most Popular badge on Pro plan', () => {
    renderPage()
    expect(screen.getByText('Most Popular')).toBeInTheDocument()
  })

  it('navigates to onboarding for Starter plan', async () => {
    const user = userEvent.setup()
    renderPage()
    const starterBtn = screen.getByRole('button', { name: /get started free/i })
    await user.click(starterBtn)
    expect(mockSetPlan).toHaveBeenCalledWith('starter')
    expect(mockSetRegistrationStep).toHaveBeenCalledWith('onboarding')
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding')
  })

  it('navigates to payment for Pro plan', async () => {
    const user = userEvent.setup()
    renderPage()
    const proBtn = screen.getByRole('button', { name: /choose pro/i })
    await user.click(proBtn)
    expect(mockSetPlan).toHaveBeenCalledWith('pro')
    expect(mockSetRegistrationStep).toHaveBeenCalledWith('payment')
    expect(mockNavigate).toHaveBeenCalledWith('/signup/payment')
  })

  it('navigates to payment for Business plan', async () => {
    const user = userEvent.setup()
    renderPage()
    const bizBtn = screen.getByRole('button', { name: /choose business/i })
    await user.click(bizBtn)
    expect(mockSetPlan).toHaveBeenCalledWith('business')
    expect(mockSetRegistrationStep).toHaveBeenCalledWith('payment')
    expect(mockNavigate).toHaveBeenCalledWith('/signup/payment')
  })

  it('disables Enterprise Contact Sales button', () => {
    renderPage()
    const enterpriseBtn = screen.getByRole('button', { name: /contact sales/i })
    expect(enterpriseBtn).toBeDisabled()
  })

  it('shows Save 20% badge when yearly is selected', async () => {
    const user = userEvent.setup()
    renderPage()
    expect(screen.queryByText('Save 20%')).not.toBeInTheDocument()

    const toggle = screen.getByRole('switch', { name: /switch to yearly billing/i })
    await user.click(toggle)

    expect(screen.getByText('Save 20%')).toBeInTheDocument()
  })

  it('renders tax add-on section', () => {
    renderPage()
    expect(screen.getByText('Add Tax Filing')).toBeInTheDocument()
  })

  it('shows tax plan cards when toggle is activated', async () => {
    const user = userEvent.setup()
    renderPage()

    const taxToggle = screen.getByRole('switch', { name: /toggle tax add-on/i })
    await user.click(taxToggle)

    expect(screen.getByText('Tax Free')).toBeInTheDocument()
    expect(screen.getByText('Tax Plus')).toBeInTheDocument()
    expect(screen.getByText('Tax Premium')).toBeInTheDocument()
    expect(screen.getByText('Tax Business')).toBeInTheDocument()
  })
})
