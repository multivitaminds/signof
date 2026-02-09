import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TeamStatus, AgentType, AgentStatus } from '../../types'
import type { AgentTeam } from '../../types'
import TeamGrid from './TeamGrid'

function makeTeam(overrides: Partial<AgentTeam> = {}): AgentTeam {
  return {
    id: 'team-1',
    name: 'Test Team',
    status: TeamStatus.Draft as typeof TeamStatus.Draft,
    agents: [
      {
        id: 'a1',
        name: 'Agent 1',
        type: AgentType.Planner,
        status: AgentStatus.Idle as typeof AgentStatus.Idle,
        instructions: '',
        memoryAllocation: 10000,
        steps: [],
        currentStepIndex: 0,
      },
    ],
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('TeamGrid', () => {
  it('renders team cards', () => {
    const teams = [
      makeTeam({ id: 't1', name: 'Alpha Team' }),
      makeTeam({ id: 't2', name: 'Beta Team' }),
    ]

    render(
      <TeamGrid teams={teams} onSelectTeam={vi.fn()} onNewTeam={vi.fn()} />
    )

    expect(screen.getByText('Alpha Team')).toBeInTheDocument()
    expect(screen.getByText('Beta Team')).toBeInTheDocument()
  })

  it('shows agent count on each card', () => {
    const teams = [makeTeam({ id: 't1', name: 'Team A' })]

    render(
      <TeamGrid teams={teams} onSelectTeam={vi.fn()} onNewTeam={vi.fn()} />
    )

    expect(screen.getByText('1 agent')).toBeInTheDocument()
  })

  it('renders create new team card', () => {
    const teams = [makeTeam()]

    render(
      <TeamGrid teams={teams} onSelectTeam={vi.fn()} onNewTeam={vi.fn()} />
    )

    expect(screen.getByLabelText('Create new team')).toBeInTheDocument()
    expect(screen.getByText('Create New Team')).toBeInTheDocument()
  })

  it('calls onSelectTeam when team card is clicked', async () => {
    const user = userEvent.setup()
    const onSelectTeam = vi.fn()
    const teams = [makeTeam({ id: 'team-42', name: 'Clickable Team' })]

    render(
      <TeamGrid teams={teams} onSelectTeam={onSelectTeam} onNewTeam={vi.fn()} />
    )

    await user.click(screen.getByText('Clickable Team'))
    expect(onSelectTeam).toHaveBeenCalledWith('team-42')
  })

  it('calls onNewTeam when new team card is clicked', async () => {
    const user = userEvent.setup()
    const onNewTeam = vi.fn()
    const teams = [makeTeam()]

    render(
      <TeamGrid teams={teams} onSelectTeam={vi.fn()} onNewTeam={onNewTeam} />
    )

    await user.click(screen.getByLabelText('Create new team'))
    expect(onNewTeam).toHaveBeenCalledTimes(1)
  })

  it('shows empty state when no teams exist', () => {
    render(
      <TeamGrid teams={[]} onSelectTeam={vi.fn()} onNewTeam={vi.fn()} />
    )

    expect(screen.getByText('No agent teams yet')).toBeInTheDocument()
    expect(screen.getByText('Create Your First Team')).toBeInTheDocument()
  })

  it('calls onNewTeam from empty state button', async () => {
    const user = userEvent.setup()
    const onNewTeam = vi.fn()

    render(
      <TeamGrid teams={[]} onSelectTeam={vi.fn()} onNewTeam={onNewTeam} />
    )

    await user.click(screen.getByText('Create Your First Team'))
    expect(onNewTeam).toHaveBeenCalledTimes(1)
  })
})
