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
    useBillingStore.setState({ taxPlan: 'tax_free' })
  })

  it('renders all 4 tax tier cards', () => {
    renderPage()
    expect(screen.getByText('Tax Free')).toBeInTheDocument()
    expect(screen.getByText('Tax Plus')).toBeInTheDocument()
    expect(screen.getByText('Tax Premium')).toBeInTheDocument()
    expect(screen.getByText('Tax Business')).toBeInTheDocument()
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
    expect(useBillingStore.getState().taxPlan).toBe('tax_plus')
  })

  it('cancels modal without changing plan', async () => {
    const user = userEvent.setup()
    renderPage()
    const upgradeButtons = screen.getAllByText('Upgrade')
    await user.click(upgradeButtons[0]!)
    await user.click(screen.getByText('Cancel'))
    expect(useBillingStore.getState().taxPlan).toBe('tax_free')
  })
})
