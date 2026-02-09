import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewTeamWizard from './NewTeamWizard'

describe('NewTeamWizard', () => {
  const defaultProps = {
    onComplete: vi.fn(),
    onCancel: vi.fn(),
  }

  it('renders step 1 with name input', () => {
    render(<NewTeamWizard {...defaultProps} />)

    expect(screen.getByText('Name your team')).toBeInTheDocument()
    expect(screen.getByLabelText('Team name')).toBeInTheDocument()
  })

  it('disables Next when team name is empty', () => {
    render(<NewTeamWizard {...defaultProps} />)

    expect(screen.getByText('Next')).toBeDisabled()
  })

  it('navigates to step 2 after entering a name', async () => {
    const user = userEvent.setup()
    render(<NewTeamWizard {...defaultProps} />)

    await user.type(screen.getByLabelText('Team name'), 'My Team')
    await user.click(screen.getByText('Next'))

    expect(screen.getByText('Select agents')).toBeInTheDocument()
  })

  it('shows all 8 agent type cards in step 2', async () => {
    const user = userEvent.setup()
    render(<NewTeamWizard {...defaultProps} />)

    await user.type(screen.getByLabelText('Team name'), 'My Team')
    await user.click(screen.getByText('Next'))

    expect(screen.getByText('Planner')).toBeInTheDocument()
    expect(screen.getByText('Researcher')).toBeInTheDocument()
    expect(screen.getByText('Writer')).toBeInTheDocument()
    expect(screen.getByText('Analyst')).toBeInTheDocument()
    expect(screen.getByText('Designer')).toBeInTheDocument()
    expect(screen.getByText('Developer')).toBeInTheDocument()
    expect(screen.getByText('Reviewer')).toBeInTheDocument()
    expect(screen.getByText('Coordinator')).toBeInTheDocument()
  })

  it('can select agents and proceed to step 3', async () => {
    const user = userEvent.setup()
    render(<NewTeamWizard {...defaultProps} />)

    // Step 1: name
    await user.type(screen.getByLabelText('Team name'), 'My Team')
    await user.click(screen.getByText('Next'))

    // Step 2: select Planner
    await user.click(screen.getByText('Planner'))
    expect(screen.getByText(/Selected: 1/)).toBeInTheDocument()

    await user.click(screen.getByText('Next'))

    // Step 3: configure
    expect(screen.getByText('Configure agents')).toBeInTheDocument()
  })

  it('navigates back from step 2 to step 1', async () => {
    const user = userEvent.setup()
    render(<NewTeamWizard {...defaultProps} />)

    await user.type(screen.getByLabelText('Team name'), 'My Team')
    await user.click(screen.getByText('Next'))

    expect(screen.getByText('Select agents')).toBeInTheDocument()

    await user.click(screen.getByText('Back'))
    expect(screen.getByText('Name your team')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked on step 1', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<NewTeamWizard {...defaultProps} onCancel={onCancel} />)

    await user.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows step indicators', () => {
    render(<NewTeamWizard {...defaultProps} />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Select Agents')).toBeInTheDocument()
    expect(screen.getByText('Configure')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })
})
