import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import UsageLimitBanner from './UsageLimitBanner'

function renderBanner(used: number, limit: number, label = 'Documents') {
  return render(
    <MemoryRouter>
      <UsageLimitBanner label={label} used={used} limit={limit} />
    </MemoryRouter>
  )
}

describe('UsageLimitBanner', () => {
  it('renders nothing when usage is below 80%', () => {
    const { container } = renderBanner(30, 50)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing for unlimited plans', () => {
    const { container } = renderBanner(500, 9999)
    expect(container.firstChild).toBeNull()
  })

  it('renders caution banner at 80-89% usage', () => {
    renderBanner(42, 50)
    expect(screen.getByRole('alert')).toHaveClass('usage-limit-banner--caution')
    expect(screen.getByText(/42 of 50 used/)).toBeInTheDocument()
  })

  it('renders warning banner at 90-99% usage', () => {
    renderBanner(46, 50)
    expect(screen.getByRole('alert')).toHaveClass('usage-limit-banner--warning')
  })

  it('renders danger banner at 100% usage', () => {
    renderBanner(50, 50)
    expect(screen.getByRole('alert')).toHaveClass('usage-limit-banner--danger')
    expect(screen.getByText(/limit reached/)).toBeInTheDocument()
  })

  it('shows upgrade link pointing to billing', () => {
    renderBanner(45, 50)
    const link = screen.getByText('Upgrade Plan')
    expect(link).toHaveAttribute('href', '/settings/billing')
  })
})
