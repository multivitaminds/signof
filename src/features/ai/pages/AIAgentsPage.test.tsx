import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import useAIAgentStore from '../stores/useAIAgentStore'
import usePipelineStore from '../stores/usePipelineStore'
import useCanvasStore from '../stores/useCanvasStore'
import { AgentType, StepStatus } from '../types'
import { AGENT_DEFINITIONS } from '../lib/agentDefinitions'
import { MARKETPLACE_DOMAINS, TOTAL_MARKETPLACE_AGENTS } from '../data/marketplaceAgents'
import AIAgentsPage from './AIAgentsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <AIAgentsPage />
    </MemoryRouter>
  )
}

describe('AIAgentsPage', () => {
  beforeEach(() => {
    useAIAgentStore.setState({ runs: [], lastRunByAgent: {}, favorites: [] })
    usePipelineStore.setState({ pipelines: [] })
    useCanvasStore.setState({
      nodes: [],
      connections: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedNodeId: null,
      connectingFromId: null,
      workflowName: 'Untitled Workflow',
    })
  })

  it('renders the Agent Marketplace title', () => {
    renderPage()
    expect(screen.getByText('Agent Marketplace')).toBeInTheDocument()
  })

  it('renders the subtitle with total agent count', () => {
    renderPage()
    const totalCount = AGENT_DEFINITIONS.length + TOTAL_MARKETPLACE_AGENTS
    expect(screen.getByText(`${totalCount}+ specialized agents across ${MARKETPLACE_DOMAINS.length} domains`)).toBeInTheDocument()
  })

  it('renders stats bar with 4 stat cards', () => {
    renderPage()
    expect(screen.getByText('Total Agents')).toBeInTheDocument()
    expect(screen.getByText('Total Runs')).toBeInTheDocument()
    expect(screen.getByText('Active Pipelines')).toBeInTheDocument()
    expect(screen.getByText('Success Rate')).toBeInTheDocument()
    const totalCount = AGENT_DEFINITIONS.length + TOTAL_MARKETPLACE_AGENTS
    expect(screen.getByText(String(totalCount))).toBeInTheDocument()
  })

  it('renders view tabs including Canvas', () => {
    renderPage()
    expect(screen.getByRole('tab', { name: /Canvas/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Agents/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Pipelines/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Templates/ })).toBeInTheDocument()
  })

  it('shows canvas view by default', () => {
    renderPage()
    expect(screen.getByRole('tab', { name: /Canvas/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('workflow-canvas')).toBeInTheDocument()
  })

  it('shows canvas empty state when no nodes', () => {
    renderPage()
    expect(screen.getByText('Build your workflow')).toBeInTheDocument()
  })

  it('shows Add Node button in canvas view', () => {
    renderPage()
    expect(screen.getByLabelText('Add node')).toBeInTheDocument()
  })

  it('shows canvas top bar with workflow name', () => {
    renderPage()
    expect(screen.getByText('Untitled Workflow')).toBeInTheDocument()
  })

  it('shows Execute Workflow button', () => {
    renderPage()
    expect(screen.getByLabelText('Execute workflow')).toBeInTheDocument()
  })

  it('shows zoom controls', () => {
    renderPage()
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument()
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument()
    const zoomLabels = screen.getAllByText('100%')
    expect(zoomLabels.length).toBeGreaterThanOrEqual(1)
  })

  // ─── Agents Tab ────────────────────────────────────────────

  it('switches to agents tab and shows all 20 agent cards', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: /Agents/ }))

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

  it('renders Run button for each agent', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: /Agents/ }))
    const runButtons = screen.getAllByRole('button', { name: /^Run /i })
    expect(runButtons).toHaveLength(20)
  })

  it('renders task input for each agent', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: /Agents/ }))
    const inputs = screen.getAllByPlaceholderText('Describe the task...')
    expect(inputs).toHaveLength(20)
  })

  it('renders category filter pills', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: /Agents/ }))
    expect(screen.getByRole('tab', { name: /All/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Business/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Creative/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Technical/ })).toBeInTheDocument()
  })

  it('renders search input in agents tab', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: /Agents/ }))
    expect(screen.getByLabelText('Search agents')).toBeInTheDocument()
  })

  it('filters agents by category', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: /Agents/ }))
    await user.click(screen.getByRole('tab', { name: /Business/ }))

    expect(screen.getByText('Sales Agent')).toBeInTheDocument()
    expect(screen.getByText('Marketing Agent')).toBeInTheDocument()
    expect(screen.getByText('Finance Agent')).toBeInTheDocument()
    expect(screen.queryByText('Planner Agent')).not.toBeInTheDocument()
  })

  it('filters agents by search query', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: /Agents/ }))
    await user.type(screen.getByLabelText('Search agents'), 'security')

    expect(screen.getByText('Security Agent')).toBeInTheDocument()
    expect(screen.queryByText('Planner Agent')).not.toBeInTheDocument()
  })

  it('shows empty message when no agents match search', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: /Agents/ }))
    await user.type(screen.getByLabelText('Search agents'), 'xyznonexistent')

    expect(screen.getByText('No agents found')).toBeInTheDocument()
    expect(screen.getByText('Try a different search term or browse all categories.')).toBeInTheDocument()
  })

  it('starts an agent run when Run button is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: /Agents/ }))
    const researchInput = screen.getByLabelText('Task for Researcher Agent')
    await user.type(researchInput, 'Find market trends')
    await user.click(screen.getByRole('button', { name: 'Run Researcher Agent' }))

    expect(screen.getByText('Active Runs')).toBeInTheDocument()
    expect(screen.getByText('Find market trends')).toBeInTheDocument()
  })

  it('clears task input after starting a run', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: /Agents/ }))
    const researchInput = screen.getByLabelText('Task for Researcher Agent')
    await user.type(researchInput, 'Search for data')
    await user.click(screen.getByRole('button', { name: 'Run Researcher Agent' }))

    expect(researchInput).toHaveValue('')
  })

  it('shows active run with progress bar', async () => {
    useAIAgentStore.getState().startAgent(AgentType.Planner, 'Create project plan')

    renderPage()

    expect(screen.getByText('Active Runs')).toBeInTheDocument()
    expect(screen.getByText('Create project plan')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Run progress' })).toBeInTheDocument()
  })

  it('shows run steps in active runs panel', () => {
    useAIAgentStore.getState().startAgent(AgentType.Researcher, 'Research topic')

    renderPage()

    const stepsList = screen.getByRole('list', { name: 'Run steps' })
    expect(stepsList).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBeGreaterThan(0)
  })

  it('shows Pause and Cancel buttons for running runs', () => {
    useAIAgentStore.getState().startAgent(AgentType.Writer, 'Draft document')

    renderPage()

    expect(screen.getByRole('button', { name: 'Pause run' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel run' })).toBeInTheDocument()
  })

  it('shows Resume button for paused runs', () => {
    const run = useAIAgentStore.getState().startAgent(AgentType.Writer, 'Draft document')
    useAIAgentStore.getState().pauseRun(run.id)

    renderPage()

    expect(screen.getByRole('button', { name: 'Resume run' })).toBeInTheDocument()
  })

  it('shows Chat button for active runs', () => {
    useAIAgentStore.getState().startAgent(AgentType.Developer, 'Write code')

    renderPage()

    expect(screen.getByRole('button', { name: 'Chat with agent' })).toBeInTheDocument()
  })

  it('does not show active runs section when no runs are active', () => {
    renderPage()
    expect(screen.queryByText('Active Runs')).not.toBeInTheDocument()
  })

  it('shows run history section for completed runs', () => {
    const run = useAIAgentStore.getState().startAgent(AgentType.Analyst, 'Analyze data')
    useAIAgentStore.getState().completeRun(run.id)

    renderPage()

    expect(screen.getByText(/Run History/)).toBeInTheDocument()
  })

  it('toggles run history table visibility', async () => {
    const user = userEvent.setup()
    const run = useAIAgentStore.getState().startAgent(AgentType.Analyst, 'Analyze data')
    useAIAgentStore.getState().completeRun(run.id)

    renderPage()

    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    const toggle = screen.getByRole('button', { name: /Run History/ })
    await user.click(toggle)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Analyze data')).toBeInTheDocument()
  })

  it('does not show run history section when no completed runs', () => {
    renderPage()
    expect(screen.queryByText(/Run History/)).not.toBeInTheDocument()
  })

  // ─── Step output display ──────────────────────────────────────

  it('displays step output text when step has output', () => {
    const run = useAIAgentStore.getState().startAgent(AgentType.Researcher, 'Research task')
    useAIAgentStore.getState().updateRunStep(run.id, 0, StepStatus.Completed, 'Found 12 data sources')

    renderPage()

    expect(screen.getByText('Found 12 data sources')).toBeInTheDocument()
  })

  // ─── View Results button ──────────────────────────────────────

  it('shows View Results button for completed runs with results', async () => {
    const user = userEvent.setup()
    const run = useAIAgentStore.getState().startAgent(AgentType.Analyst, 'Analysis')
    useAIAgentStore.getState().setRunResult(run.id, 'Analysis complete.')
    useAIAgentStore.getState().completeRun(run.id)

    renderPage()

    await user.click(screen.getByRole('button', { name: /Run History/ }))

    expect(screen.getByRole('button', { name: /view results/i })).toBeInTheDocument()
  })

  it('shows results modal when View Results is clicked', async () => {
    const user = userEvent.setup()
    const run = useAIAgentStore.getState().startAgent(AgentType.Analyst, 'Data analysis')
    useAIAgentStore.getState().setRunResult(run.id, 'Here are the results of the analysis.')
    useAIAgentStore.getState().completeRun(run.id)

    renderPage()

    await user.click(screen.getByRole('button', { name: /Run History/ }))
    await user.click(screen.getByRole('button', { name: /view results/i }))

    expect(screen.getByRole('dialog', { name: /run results/i })).toBeInTheDocument()
    expect(screen.getByText('Run Results')).toBeInTheDocument()
    expect(screen.getByText(/Analysis report generated/)).toBeInTheDocument()
  })

  it('closes results modal when close button is clicked', async () => {
    const user = userEvent.setup()
    const run = useAIAgentStore.getState().startAgent(AgentType.Analyst, 'Data analysis')
    useAIAgentStore.getState().setRunResult(run.id, 'Results here.')
    useAIAgentStore.getState().completeRun(run.id)

    renderPage()

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

    renderPage()

    await user.click(screen.getByRole('button', { name: /Run History/ }))

    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  // ─── Tabs switching ───────────────────────────────────────────

  it('switches to Templates tab and shows workflow templates', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: /Templates/ }))

    expect(screen.getByText('Workflow Templates')).toBeInTheDocument()
    expect(screen.getByText('Blog Post Pipeline')).toBeInTheDocument()
    expect(screen.getByText('Security Audit')).toBeInTheDocument()
  })

  it('switches to Pipelines tab', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: /Pipelines/ }))

    expect(screen.getByText('Pipelines')).toBeInTheDocument()
    expect(screen.getByText('No pipelines yet')).toBeInTheDocument()
    expect(screen.getByText('Create a pipeline or use a template to get started.')).toBeInTheDocument()
  })

  // ─── Favorites ────────────────────────────────────────────────

  it('toggles favorite on agent card', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('tab', { name: /Agents/ }))

    const favBtn = screen.getByLabelText('Favorite Planner')
    await user.click(favBtn)

    expect(screen.getByLabelText('Unfavorite Planner')).toBeInTheDocument()
  })

  // ─── Canvas interactions ──────────────────────────────────────

  it('opens node picker when Add Node is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByLabelText('Add node'))
    expect(screen.getByText('Add Node')).toBeInTheDocument()
  })

  // ─── Marketplace ─────────────────────────────────────────────

  it('renders Featured Agents section header in agents tab', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: /Agents/ }))
    expect(screen.getByText('Featured Agents')).toBeInTheDocument()
    expect(screen.getByText('Runnable')).toBeInTheDocument()
  })

  it('renders marketplace domain sections in agents tab', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: /Agents/ }))

    const marketplace = screen.getByLabelText('Agent Marketplace')
    expect(marketplace).toBeInTheDocument()

    // Check that all domain names are visible as toggle buttons
    for (const domain of MARKETPLACE_DOMAINS) {
      expect(screen.getByLabelText(`Expand ${domain.name}`)).toBeInTheDocument()
    }
  })

  it('expands marketplace domain on click to show agents', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: /Agents/ }))

    const firstDomain = MARKETPLACE_DOMAINS[0]!
    const toggleBtn = screen.getByLabelText(`Expand ${firstDomain.name}`)
    await user.click(toggleBtn)

    // First agent in the domain should now be visible
    expect(screen.getByText(firstDomain.agents[0]!.name)).toBeInTheDocument()
  })

  it('marketplace agents have Run buttons', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: /Agents/ }))

    const firstDomain = MARKETPLACE_DOMAINS[0]!
    await user.click(screen.getByLabelText(`Expand ${firstDomain.name}`))

    // Run buttons should be 20 (featured) + first domain agents
    const runButtons = screen.getAllByRole('button', { name: /^Run /i })
    expect(runButtons).toHaveLength(20 + firstDomain.agents.length)
  })

  it('marketplace Run buttons are labeled with agent names', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: /Agents/ }))

    const firstDomain = MARKETPLACE_DOMAINS[0]!
    await user.click(screen.getByLabelText(`Expand ${firstDomain.name}`))

    // Each marketplace agent should have a "Run <agent name>" button
    const firstAgent = firstDomain.agents[0]!
    expect(screen.getByRole('button', { name: `Run ${firstAgent.name}` })).toBeInTheDocument()
  })

  it('collapses expanded domain on second click', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: /Agents/ }))

    const firstDomain = MARKETPLACE_DOMAINS[0]!
    const toggleBtn = screen.getByLabelText(`Expand ${firstDomain.name}`)
    await user.click(toggleBtn)
    expect(screen.getByText(firstDomain.agents[0]!.name)).toBeInTheDocument()

    // Click again to collapse
    const collapseBtn = screen.getByLabelText(`Collapse ${firstDomain.name}`)
    await user.click(collapseBtn)
    expect(screen.queryByText(firstDomain.agents[0]!.name)).not.toBeInTheDocument()
  })

  it('shows browse-only agent count in marketplace header', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: /Agents/ }))

    expect(screen.getByText(`${TOTAL_MARKETPLACE_AGENTS} browse-only agents`)).toBeInTheDocument()
  })
})
