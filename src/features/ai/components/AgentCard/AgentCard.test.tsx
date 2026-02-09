import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentStatus, AgentType, StepStatus } from '../../types'
import type { AgentInstance } from '../../types'
import AgentCard from './AgentCard'

function makeAgent(overrides: Partial<AgentInstance> = {}): AgentInstance {
  return {
    id: 'agent-1',
    name: 'Test Planner',
    type: AgentType.Planner,
    status: AgentStatus.Running as typeof AgentStatus.Running,
    instructions: 'Plan things',
    memoryAllocation: 10000,
    steps: [
      { id: 's1', label: 'Step 1', status: StepStatus.Completed as typeof StepStatus.Completed, durationMs: 1000, output: 'Done' },
      { id: 's2', label: 'Step 2', status: StepStatus.Running as typeof StepStatus.Running, durationMs: 1000 },
      { id: 's3', label: 'Step 3', status: StepStatus.Pending as typeof StepStatus.Pending, durationMs: 1000 },
    ],
    currentStepIndex: 1,
    ...overrides,
  }
}

describe('AgentCard', () => {
  it('renders agent name and type', () => {
    const agent = makeAgent()

    render(
      <AgentCard
        agent={agent}
        color="#4F46E5"
        icon="ClipboardList"
        onChat={vi.fn()}
      />
    )

    expect(screen.getByText('Test Planner')).toBeInTheDocument()
    expect(screen.getByText('planner')).toBeInTheDocument()
  })

  it('shows correct status badge', () => {
    const agent = makeAgent({ status: AgentStatus.Running as typeof AgentStatus.Running })

    render(
      <AgentCard
        agent={agent}
        color="#4F46E5"
        icon="ClipboardList"
        onChat={vi.fn()}
      />
    )

    expect(screen.getByText('running')).toBeInTheDocument()
  })

  it('shows step progress', () => {
    const agent = makeAgent()

    render(
      <AgentCard
        agent={agent}
        color="#4F46E5"
        icon="ClipboardList"
        onChat={vi.fn()}
      />
    )

    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
    expect(screen.getByText('Step 2')).toBeInTheDocument()
  })

  it('calls onChat when chat button is clicked', async () => {
    const user = userEvent.setup()
    const onChat = vi.fn()
    const agent = makeAgent()

    render(
      <AgentCard
        agent={agent}
        color="#4F46E5"
        icon="ClipboardList"
        onChat={onChat}
      />
    )

    await user.click(screen.getByTitle('Chat'))
    expect(onChat).toHaveBeenCalledWith('agent-1')
  })

  it('shows pause button when agent is running', () => {
    const agent = makeAgent({ status: AgentStatus.Running as typeof AgentStatus.Running })

    render(
      <AgentCard
        agent={agent}
        color="#4F46E5"
        icon="ClipboardList"
        onChat={vi.fn()}
        onPause={vi.fn()}
      />
    )

    expect(screen.getByTitle('Pause')).toBeInTheDocument()
  })

  it('shows resume button when agent is paused', () => {
    const agent = makeAgent({ status: AgentStatus.Paused as typeof AgentStatus.Paused })

    render(
      <AgentCard
        agent={agent}
        color="#4F46E5"
        icon="ClipboardList"
        onChat={vi.fn()}
        onResume={vi.fn()}
      />
    )

    expect(screen.getByTitle('Resume')).toBeInTheDocument()
  })

  it('applies selected class when selected', () => {
    const agent = makeAgent()

    const { container } = render(
      <AgentCard
        agent={agent}
        color="#4F46E5"
        icon="ClipboardList"
        onChat={vi.fn()}
        selected
      />
    )

    expect(container.querySelector('.agent-card--selected')).toBeInTheDocument()
  })
})
