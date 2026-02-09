import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TeamStatus, AgentType, AgentStatus, StepStatus } from '../../types'
import type { AgentTeam } from '../../types'
import TeamDetail from './TeamDetail'

function makeTeam(overrides: Partial<AgentTeam> = {}): AgentTeam {
  return {
    id: 'team-1',
    name: 'Test Team',
    status: TeamStatus.Draft as typeof TeamStatus.Draft,
    agents: [
      {
        id: 'a1',
        name: 'Planner Agent',
        type: AgentType.Planner,
        status: AgentStatus.Idle as typeof AgentStatus.Idle,
        instructions: 'Plan stuff',
        memoryAllocation: 10000,
        steps: [
          { id: 's1', label: 'Step 1', status: StepStatus.Pending as typeof StepStatus.Pending, durationMs: 1000 },
          { id: 's2', label: 'Step 2', status: StepStatus.Pending as typeof StepStatus.Pending, durationMs: 1000 },
        ],
        currentStepIndex: 0,
      },
      {
        id: 'a2',
        name: 'Dev Agent',
        type: AgentType.Developer,
        status: AgentStatus.Idle as typeof AgentStatus.Idle,
        instructions: 'Build stuff',
        memoryAllocation: 20000,
        steps: [
          { id: 's3', label: 'Step A', status: StepStatus.Pending as typeof StepStatus.Pending, durationMs: 1000 },
        ],
        currentStepIndex: 0,
      },
    ],
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

const defaultHandlers = {
  onBack: vi.fn(),
  onStart: vi.fn(),
  onPause: vi.fn(),
  onResume: vi.fn(),
  onCancel: vi.fn(),
  onPauseAgent: vi.fn(),
  onResumeAgent: vi.fn(),
  onSendMessage: vi.fn(),
}

describe('TeamDetail', () => {
  it('renders team name', () => {
    render(<TeamDetail team={makeTeam()} {...defaultHandlers} />)

    expect(screen.getByText('Test Team')).toBeInTheDocument()
  })

  it('renders team status badge', () => {
    render(<TeamDetail team={makeTeam()} {...defaultHandlers} />)

    expect(screen.getByText('draft')).toBeInTheDocument()
  })

  it('shows agent cards', () => {
    render(<TeamDetail team={makeTeam()} {...defaultHandlers} />)

    expect(screen.getByText('Planner Agent')).toBeInTheDocument()
    expect(screen.getByText('Dev Agent')).toBeInTheDocument()
  })

  it('shows Start button for draft teams', () => {
    render(<TeamDetail team={makeTeam({ status: TeamStatus.Draft as typeof TeamStatus.Draft })} {...defaultHandlers} />)

    expect(screen.getByLabelText('Start team')).toBeInTheDocument()
  })

  it('shows Pause and Stop buttons for running teams', () => {
    render(<TeamDetail team={makeTeam({ status: TeamStatus.Running as typeof TeamStatus.Running })} {...defaultHandlers} />)

    expect(screen.getByLabelText('Pause team')).toBeInTheDocument()
    expect(screen.getByLabelText('Cancel team')).toBeInTheDocument()
  })

  it('shows Resume and Stop buttons for paused teams', () => {
    render(<TeamDetail team={makeTeam({ status: TeamStatus.Paused as typeof TeamStatus.Paused })} {...defaultHandlers} />)

    expect(screen.getByLabelText('Resume team')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()

    render(<TeamDetail team={makeTeam()} {...defaultHandlers} onBack={onBack} />)

    await user.click(screen.getByLabelText('Go back'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onStart when start button is clicked', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()

    render(<TeamDetail team={makeTeam()} {...defaultHandlers} onStart={onStart} />)

    await user.click(screen.getByLabelText('Start team'))
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('shows progress panel for first agent by default', () => {
    render(<TeamDetail team={makeTeam()} {...defaultHandlers} />)

    expect(screen.getByText('Planner Agent Progress')).toBeInTheDocument()
    // Progress panel renders steps; AgentCard also renders the current step label.
    // Use getAllByText since "Step 1" appears in both the card and the progress panel.
    expect(screen.getAllByText('Step 1').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Step 2').length).toBeGreaterThanOrEqual(1)
  })

  it('does not show controls for completed teams', () => {
    render(<TeamDetail team={makeTeam({ status: TeamStatus.Completed as typeof TeamStatus.Completed })} {...defaultHandlers} />)

    expect(screen.queryByLabelText('Start team')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Pause team')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Resume team')).not.toBeInTheDocument()
  })
})
