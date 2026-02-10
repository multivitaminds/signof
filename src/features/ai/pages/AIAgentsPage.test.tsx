import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AIAgentsPage from './AIAgentsPage'

describe('AIAgentsPage', () => {
  it('renders the Agent Teams title', () => {
    render(<AIAgentsPage />)
    expect(screen.getByText('Agent Teams')).toBeInTheDocument()
  })

  it('renders the New Team button', () => {
    render(<AIAgentsPage />)
    expect(screen.getByRole('button', { name: 'New Team' })).toBeInTheDocument()
  })

  it('renders the empty state when no teams exist', () => {
    render(<AIAgentsPage />)
    expect(screen.getByText('No agent teams yet')).toBeInTheDocument()
  })

  it('shows Create Your First Team button in empty state', () => {
    render(<AIAgentsPage />)
    expect(screen.getByText('Create Your First Team')).toBeInTheDocument()
  })

  it('shows new team wizard when New Team is clicked', async () => {
    const user = userEvent.setup()
    render(<AIAgentsPage />)
    await user.click(screen.getByRole('button', { name: 'New Team' }))
    // Wizard should now be visible
    expect(screen.getByText('Name your team')).toBeInTheDocument()
  })
})
