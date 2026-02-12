import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useBillingStore } from '../../settings/stores/useBillingStore'
import AccountingPricingPage from './AccountingPricingPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <AccountingPricingPage />
    </MemoryRouter>
  )
}

describe('AccountingPricingPage', () => {
  beforeEach(() => {
    useBillingStore.setState({ accountingPlan: 'acct_free' })
  })

  it('renders heading', () => {
    renderPage()
    expect(screen.getByText('Accounting Plans')).toBeInTheDocument()
  })

  it('shows all plan cards', () => {
    renderPage()
    expect(screen.getByText('Accounting Free')).toBeInTheDocument()
    expect(screen.getByText('Accounting Plus')).toBeInTheDocument()
    expect(screen.getByText('Accounting Premium')).toBeInTheDocument()
    expect(screen.getByText('Accounting Advanced')).toBeInTheDocument()
  })

  it('marks current plan', () => {
    renderPage()
    expect(screen.getByText('Current Plan')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('shows plan prices', () => {
    renderPage()
    expect(screen.getByText('$0')).toBeInTheDocument()
    expect(screen.getByText('$15')).toBeInTheDocument()
    expect(screen.getByText('$30')).toBeInTheDocument()
    expect(screen.getByText('$50')).toBeInTheDocument()
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
    expect(screen.getByText('Confirm Accounting Plan Change')).toBeInTheDocument()
  })

  it('changes plan on confirm', async () => {
    const user = userEvent.setup()
    renderPage()
    const upgradeButtons = screen.getAllByText('Upgrade')
    await user.click(upgradeButtons[0]!)
    await user.click(screen.getByText('Confirm Change'))
    expect(useBillingStore.getState().accountingPlan).toBe('acct_plus')
  })

  it('cancels modal without changing plan', async () => {
    const user = userEvent.setup()
    renderPage()
    const upgradeButtons = screen.getAllByText('Upgrade')
    await user.click(upgradeButtons[0]!)
    await user.click(screen.getByText('Cancel'))
    expect(useBillingStore.getState().accountingPlan).toBe('acct_free')
  })
})
