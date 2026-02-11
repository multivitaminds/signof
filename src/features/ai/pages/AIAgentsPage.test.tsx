import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useAIAgentStore from '../stores/useAIAgentStore'
import { AgentType, StepStatus } from '../types'
import AIAgentsPage from './AIAgentsPage'

describe('AIAgentsPage', () => {
  beforeEach(() => {
    useAIAgentStore.setState({ runs: [], lastRunByAgent: {} })
  })

  it('renders the Agent Teams title', () => {
    render(<AIAgentsPage />)
    expect(screen.getByText('Agent Teams')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<AIAgentsPage />)
    expect(screen.getByText('Run specialized AI agents on any task')).toBeInTheDocument()
  })

  it('renders all 8 agent type cards', () => {
    render(<AIAgentsPage />)
    expect(screen.getByText('Research Agent')).toBeInTheDocument()
    expect(screen.getByText('Writing Agent')).toBeInTheDocument()
    expect(screen.getByText('Code Agent')).toBeInTheDocument()
    expect(screen.getByText('Design Agent')).toBeInTheDocument()
    expect(screen.getByText('Data Agent')).toBeInTheDocument()
    expect(screen.getByText('Planning Agent')).toBeInTheDocument()
    expect(screen.getByText('Communication Agent')).toBeInTheDocument()
    expect(screen.getByText('Operations Agent')).toBeInTheDocument()
  })

  it('renders agent descriptions', () => {
    render(<AIAgentsPage />)
    expect(screen.getByText('Gathers information, analyzes data, produces reports')).toBeInTheDocument()
    expect(screen.getByText('Drafts documents, emails, proposals, blog posts')).toBeInTheDocument()
  })

  it('renders Run button for each agent', () => {
    render(<AIAgentsPage />)
    const runButtons = screen.getAllByRole('button', { name: /^Run /i })
    expect(runButtons).toHaveLength(8)
  })

  it('renders task input for each agent', () => {
    render(<AIAgentsPage />)
    const inputs = screen.getAllByPlaceholderText('Describe the task...')
    expect(inputs).toHaveLength(8)
  })

  it('starts an agent run when Run button is clicked', async () => {
    const user = userEvent.setup()
    render(<AIAgentsPage />)

    const researchInput = screen.getByLabelText('Task for Research Agent')
    await user.type(researchInput, 'Find market trends')
    await user.click(screen.getByRole('button', { name: 'Run Research Agent' }))

    // Active runs section should appear
    expect(screen.getByText('Active Runs')).toBeInTheDocument()
    expect(screen.getByText('Find market trends')).toBeInTheDocument()
  })

  it('clears task input after starting a run', async () => {
    const user = userEvent.setup()
    render(<AIAgentsPage />)

    const researchInput = screen.getByLabelText('Task for Research Agent')
    await user.type(researchInput, 'Search for data')
    await user.click(screen.getByRole('button', { name: 'Run Research Agent' }))

    expect(researchInput).toHaveValue('')
  })

  it('shows active run with progress bar', async () => {
    // Pre-populate store with a running run
    useAIAgentStore.getState().startAgent(AgentType.Planner, 'Create project plan')

    render(<AIAgentsPage />)

    expect(screen.getByText('Active Runs')).toBeInTheDocument()
    expect(screen.getByText('Create project plan')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Run progress' })).toBeInTheDocument()
  })

  it('shows run steps in active runs panel', () => {
    useAIAgentStore.getState().startAgent(AgentType.Researcher, 'Research topic')

    render(<AIAgentsPage />)

    const stepsList = screen.getByRole('list', { name: 'Run steps' })
    expect(stepsList).toBeInTheDocument()
    // Steps are rendered as list items
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBeGreaterThan(0)
  })

  it('shows Pause and Cancel buttons for running runs', () => {
    useAIAgentStore.getState().startAgent(AgentType.Writer, 'Draft document')

    render(<AIAgentsPage />)

    expect(screen.getByRole('button', { name: 'Pause run' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel run' })).toBeInTheDocument()
  })

  it('shows Resume button for paused runs', () => {
    const run = useAIAgentStore.getState().startAgent(AgentType.Writer, 'Draft document')
    useAIAgentStore.getState().pauseRun(run.id)

    render(<AIAgentsPage />)

    expect(screen.getByRole('button', { name: 'Resume run' })).toBeInTheDocument()
  })

  it('shows Chat button for active runs', () => {
    useAIAgentStore.getState().startAgent(AgentType.Developer, 'Write code')

    render(<AIAgentsPage />)

    expect(screen.getByRole('button', { name: 'Chat with agent' })).toBeInTheDocument()
  })

  it('does not show active runs section when no runs are active', () => {
    render(<AIAgentsPage />)
    expect(screen.queryByText('Active Runs')).not.toBeInTheDocument()
  })

  it('shows run history section for completed runs', () => {
    const run = useAIAgentStore.getState().startAgent(AgentType.Analyst, 'Analyze data')
    useAIAgentStore.getState().completeRun(run.id)

    render(<AIAgentsPage />)

    expect(screen.getByText(/Run History/)).toBeInTheDocument()
  })

  it('toggles run history table visibility', async () => {
    const user = userEvent.setup()
    const run = useAIAgentStore.getState().startAgent(AgentType.Analyst, 'Analyze data')
    useAIAgentStore.getState().completeRun(run.id)

    render(<AIAgentsPage />)

    // History table should be collapsed by default
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    // Click toggle to expand
    const toggle = screen.getByRole('button', { name: /Run History/ })
    await user.click(toggle)

    // Table should now be visible
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Analyze data')).toBeInTheDocument()
  })

  it('does not show run history section when no completed runs', () => {
    render(<AIAgentsPage />)
    expect(screen.queryByText(/Run History/)).not.toBeInTheDocument()
  })

  // ─── New: Step output display ──────────────────────────────────────

  it('displays step output text when step has output', () => {
    const run = useAIAgentStore.getState().startAgent(AgentType.Researcher, 'Research task')
    useAIAgentStore.getState().updateRunStep(run.id, 0, StepStatus.Completed, 'Found 12 data sources')

    render(<AIAgentsPage />)

    expect(screen.getByText('Found 12 data sources')).toBeInTheDocument()
  })

  // ─── New: View Results button ──────────────────────────────────────

  it('shows View Results button for completed runs with results', async () => {
    const user = userEvent.setup()
    const run = useAIAgentStore.getState().startAgent(AgentType.Analyst, 'Analysis')
    useAIAgentStore.getState().setRunResult(run.id, 'Analysis complete.')
    useAIAgentStore.getState().completeRun(run.id)

    render(<AIAgentsPage />)

    // Expand history
    await user.click(screen.getByRole('button', { name: /Run History/ }))

    expect(screen.getByRole('button', { name: /view results/i })).toBeInTheDocument()
  })

  it('shows results modal when View Results is clicked', async () => {
    const user = userEvent.setup()
    const run = useAIAgentStore.getState().startAgent(AgentType.Analyst, 'Data analysis')
    useAIAgentStore.getState().setRunResult(run.id, 'Here are the results of the analysis.')
    useAIAgentStore.getState().completeRun(run.id)

    render(<AIAgentsPage />)

    await user.click(screen.getByRole('button', { name: /Run History/ }))
    await user.click(screen.getByRole('button', { name: /view results/i }))

    expect(screen.getByRole('dialog', { name: /run results/i })).toBeInTheDocument()
    expect(screen.getByText('Run Results')).toBeInTheDocument()
    expect(screen.getByText('Here are the results of the analysis.')).toBeInTheDocument()
  })

  it('closes results modal when close button is clicked', async () => {
    const user = userEvent.setup()
    const run = useAIAgentStore.getState().startAgent(AgentType.Analyst, 'Data analysis')
    useAIAgentStore.getState().setRunResult(run.id, 'Results here.')
    useAIAgentStore.getState().completeRun(run.id)

    render(<AIAgentsPage />)

    await user.click(screen.getByRole('button', { name: /Run History/ }))
    await user.click(screen.getByRole('button', { name: /view results/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close results/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // ─── New: History table has Actions column ─────────────────────────

  it('shows Actions column in history table', async () => {
    const user = userEvent.setup()
    const run = useAIAgentStore.getState().startAgent(AgentType.Analyst, 'Analyze data')
    useAIAgentStore.getState().completeRun(run.id)

    render(<AIAgentsPage />)

    await user.click(screen.getByRole('button', { name: /Run History/ }))

    expect(screen.getByText('Actions')).toBeInTheDocument()
  })
})
