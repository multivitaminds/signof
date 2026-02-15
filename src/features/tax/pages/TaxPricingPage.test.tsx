import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useBillingStore } from '../../settings/stores/useBillingStore'
import TaxPricingPage from './TaxPricingPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <TaxPricingPage />
    </MemoryRouter>
  )
}

describe('TaxPricingPage', () => {
  beforeEach(() => {
    useBillingStore.setState({ taxPlan: 'individual_basic' })
  })

  it('renders Individual tab plans by default', () => {
    renderPage()
    expect(screen.getByText('Basic')).toBeInTheDocument()
    expect(screen.getByText('Plus')).toBeInTheDocument()
    expect(screen.getByText('Self-Employed')).toBeInTheDocument()
    expect(screen.getByText('CPA Assisted')).toBeInTheDocument()
  })

  it('renders 3 category tabs', () => {
    renderPage()
    expect(screen.getByRole('tab', { name: 'Individual' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Business' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'API' })).toBeInTheDocument()
  })

  it('highlights current plan', () => {
    renderPage()
    expect(screen.getByText('Current Plan')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('shows upgrade buttons for non-current plans', () => {
    renderPage()
    const upgradeButtons = screen.getAllByText('Upgrade')
    expect(upgradeButtons.length).toBe(3)
  })

  it('opens confirmation modal on plan click', async () => {
    const user = userEvent.setup()
    renderPage()
    const upgradeButtons = screen.getAllByText('Upgrade')
    await user.click(upgradeButtons[0]!)
    expect(screen.getByText('Confirm Tax Plan Change')).toBeInTheDocument()
  })

  it('changes plan on confirm', async () => {
    const user = userEvent.setup()
    renderPage()
    const upgradeButtons = screen.getAllByText('Upgrade')
    await user.click(upgradeButtons[0]!)
    await user.click(screen.getByText('Confirm Change'))
    expect(useBillingStore.getState().taxPlan).toBe('individual_plus')
  })

  it('cancels modal without changing plan', async () => {
    const user = userEvent.setup()
    renderPage()
    const upgradeButtons = screen.getAllByText('Upgrade')
    await user.click(upgradeButtons[0]!)
    await user.click(screen.getByText('Cancel'))
    expect(useBillingStore.getState().taxPlan).toBe('individual_basic')
  })

  it('switches to Business tab', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: 'Business' }))
    expect(screen.getByText('Business Starter')).toBeInTheDocument()
    expect(screen.getByText('Business Pro')).toBeInTheDocument()
    expect(screen.getAllByText('Enterprise').length).toBeGreaterThanOrEqual(1)
  })

  it('switches to API tab', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: 'API' }))
    expect(screen.getByText('API Free')).toBeInTheDocument()
    expect(screen.getByText('API Pay-as-you-go')).toBeInTheDocument()
    expect(screen.getByText('API Pro')).toBeInTheDocument()
    expect(screen.getByText('API Enterprise')).toBeInTheDocument()
  })

  it('shows competitor prices with strikethrough', () => {
    renderPage()
    expect(screen.getByText('$89')).toBeInTheDocument()
    expect(screen.getByText('$169')).toBeInTheDocument()
  })

  it('shows popular badge on Plus plan', () => {
    renderPage()
    expect(screen.getByText('Popular')).toBeInTheDocument()
  })
})
