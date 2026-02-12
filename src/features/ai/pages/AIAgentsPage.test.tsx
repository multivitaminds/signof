import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useAIAgentStore from '../stores/useAIAgentStore'
import usePipelineStore from '../stores/usePipelineStore'
import { AgentType, StepStatus } from '../types'
import AIAgentsPage from './AIAgentsPage'

describe('AIAgentsPage', () => {
  beforeEach(() => {
    useAIAgentStore.setState({ runs: [], lastRunByAgent: {}, favorites: [] })
    usePipelineStore.setState({ pipelines: [] })
  })

  it('renders the Agent Marketplace title', () => {
    render(<AIAgentsPage />)
    expect(screen.getByText('Agent Marketplace')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<AIAgentsPage />)
    expect(screen.getByText('20 specialized AI agents, pipelines, and workflow templates')).toBeInTheDocument()
  })

  it('renders all 20 agent type cards', () => {
    render(<AIAgentsPage />)
    // Core agents
    expect(screen.getByText('Planner Agent')).toBeInTheDocument()
    expect(screen.getByText('Researcher Agent')).toBeInTheDocument()
    expect(screen.getByText('Analyst Agent')).toBeInTheDocument()
    expect(screen.getByText('Reviewer Agent')).toBeInTheDocument()
    expect(screen.getByText('Coordinator Agent')).toBeInTheDocument()
    // Creative agents
    expect(screen.getByText('Writer Agent')).toBeInTheDocument()
    expect(screen.getByText('Designer Agent')).toBeInTheDocument()
    expect(screen.getByText('Translation Agent')).toBeInTheDocument()
    expect(screen.getByText('SEO Agent')).toBeInTheDocument()
    expect(screen.getByText('Social Media Agent')).toBeInTheDocument()
    // Technical agents
    expect(screen.getByText('Developer Agent')).toBeInTheDocument()
    expect(screen.getByText('Security Agent')).toBeInTheDocument()
    expect(screen.getByText('DevOps Agent')).toBeInTheDocument()
    // Business agents
    expect(screen.getByText('Sales Agent')).toBeInTheDocument()
    expect(screen.getByText('Marketing Agent')).toBeInTheDocument()
    expect(screen.getByText('Finance Agent')).toBeInTheDocument()
    // Legal agents
    expect(screen.getByText('Legal Agent')).toBeInTheDocument()
    expect(screen.getByText('Compliance Agent')).toBeInTheDocument()
    // People agents
    expect(screen.getByText('HR Agent')).toBeInTheDocument()
    expect(screen.getByText('Customer Success Agent')).toBeInTheDocument()
  })

  it('renders Run button for each agent', () => {
    render(<AIAgentsPage />)
    const runButtons = screen.getAllByRole('button', { name: /^Run /i })
    expect(runButtons).toHaveLength(20)
  })

  it('renders task input for each agent', () => {
    render(<AIAgentsPage />)
    const inputs = screen.getAllByPlaceholderText('Describe the task...')
    expect(inputs).toHaveLength(20)
  })

  it('renders stats bar with 4 stat cards', () => {
    render(<AIAgentsPage />)
    expect(screen.getByText('Total Agents')).toBeInTheDocument()
    expect(screen.getByText('Total Runs')).toBeInTheDocument()
    expect(screen.getByText('Active Pipelines')).toBeInTheDocument()
    expect(screen.getByText('Success Rate')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('renders view tabs for Agents, Pipelines, Templates', () => {
    render(<AIAgentsPage />)
    expect(screen.getByRole('tab', { name: /Agents/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Pipelines/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Templates/ })).toBeInTheDocument()
  })

  it('renders category filter pills', () => {
    render(<AIAgentsPage />)
    expect(screen.getByRole('tab', { name: /All/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Business/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Creative/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Technical/ })).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<AIAgentsPage />)
    expect(screen.getByLabelText('Search agents')).toBeInTheDocument()
  })

  it('filters agents by category', async () => {
    const user = userEvent.setup()
    render(<AIAgentsPage />)

    // Click Business category
    await user.click(screen.getByRole('tab', { name: /Business/ }))

    // Should show business agents
    expect(screen.getByText('Sales Agent')).toBeInTheDocument()
    expect(screen.getByText('Marketing Agent')).toBeInTheDocument()
    expect(screen.getByText('Finance Agent')).toBeInTheDocument()

    // Should not show core agents
    expect(screen.queryByText('Planner Agent')).not.toBeInTheDocument()
  })

  it('filters agents by search query', async () => {
    const user = userEvent.setup()
    render(<AIAgentsPage />)

    await user.type(screen.getByLabelText('Search agents'), 'security')

    expect(screen.getByText('Security Agent')).toBeInTheDocument()
    expect(screen.queryByText('Planner Agent')).not.toBeInTheDocument()
  })

  it('shows empty message when no agents match search', async () => {
    const user = userEvent.setup()
    render(<AIAgentsPage />)

    await user.type(screen.getByLabelText('Search agents'), 'xyznonexistent')

    expect(screen.getByText('No agents match your search.')).toBeInTheDocument()
  })

  it('starts an agent run when Run button is clicked', async () => {
    const user = userEvent.setup()
    render(<AIAgentsPage />)

    const researchInput = screen.getByLabelText('Task for Researcher Agent')
    await user.type(researchInput, 'Find market trends')
    await user.click(screen.getByRole('button', { name: 'Run Researcher Agent' }))

    // Active runs section should appear
    expect(screen.getByText('Active Runs')).toBeInTheDocument()
    expect(screen.getByText('Find market trends')).toBeInTheDocument()
  })

  it('clears task input after starting a run', async () => {
    const user = userEvent.setup()
    render(<AIAgentsPage />)

    const researchInput = screen.getByLabelText('Task for Researcher Agent')
    await user.type(researchInput, 'Search for data')
    await user.click(screen.getByRole('button', { name: 'Run Researcher Agent' }))

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

  // ─── Step output display ──────────────────────────────────────

  it('displays step output text when step has output', () => {
    const run = useAIAgentStore.getState().startAgent(AgentType.Researcher, 'Research task')
    useAIAgentStore.getState().updateRunStep(run.id, 0, StepStatus.Completed, 'Found 12 data sources')

    render(<AIAgentsPage />)

    expect(screen.getByText('Found 12 data sources')).toBeInTheDocument()
  })

  // ─── View Results button ──────────────────────────────────────

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

  // ─── History table has Actions column ─────────────────────────

  it('shows Actions column in history table', async () => {
    const user = userEvent.setup()
    const run = useAIAgentStore.getState().startAgent(AgentType.Analyst, 'Analyze data')
    useAIAgentStore.getState().completeRun(run.id)

    render(<AIAgentsPage />)

    await user.click(screen.getByRole('button', { name: /Run History/ }))

    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  // ─── Tabs switching ───────────────────────────────────────────

  it('switches to Templates tab and shows workflow templates', async () => {
    const user = userEvent.setup()
    render(<AIAgentsPage />)

    await user.click(screen.getByRole('tab', { name: /Templates/ }))

    expect(screen.getByText('Workflow Templates')).toBeInTheDocument()
    expect(screen.getByText('Blog Post Pipeline')).toBeInTheDocument()
    expect(screen.getByText('Security Audit')).toBeInTheDocument()
  })

  it('switches to Pipelines tab', async () => {
    const user = userEvent.setup()
    render(<AIAgentsPage />)

    await user.click(screen.getByRole('tab', { name: /Pipelines/ }))

    expect(screen.getByText('Pipelines')).toBeInTheDocument()
    expect(screen.getByText('No pipelines yet. Create one or use a template to get started.')).toBeInTheDocument()
  })

  // ─── Favorites ────────────────────────────────────────────────

  it('toggles favorite on agent card', async () => {
    const user = userEvent.setup()
    render(<AIAgentsPage />)

    const favBtn = screen.getByLabelText('Favorite Planner')
    await user.click(favBtn)

    // Should now show unfavorite label
    expect(screen.getByLabelText('Unfavorite Planner')).toBeInTheDocument()
  })
})
