import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIAgentsPage from './AIAgentsPage'

describe('AIAgentsPage', () => {
  it('renders team grid by default', () => {
    render(<AIAgentsPage />)
    expect(screen.getByTestId('team-grid-placeholder')).toBeInTheDocument()
    expect(screen.queryByTestId('team-detail-placeholder')).not.toBeInTheDocument()
  })

  it('renders the New Team button', () => {
    render(<AIAgentsPage />)
    expect(screen.getByRole('button', { name: 'New Team' })).toBeInTheDocument()
  })

  it('shows new team wizard when New Team is clicked', async () => {
    const user = userEvent.setup()
    render(<AIAgentsPage />)
    await user.click(screen.getByRole('button', { name: 'New Team' }))
    expect(screen.getByTestId('new-team-wizard-placeholder')).toBeInTheDocument()
  })

  it('closes wizard when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<AIAgentsPage />)
    await user.click(screen.getByRole('button', { name: 'New Team' }))
    expect(screen.getByTestId('new-team-wizard-placeholder')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByTestId('new-team-wizard-placeholder')).not.toBeInTheDocument()
  })
})
