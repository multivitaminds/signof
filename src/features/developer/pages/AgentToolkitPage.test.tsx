import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AgentToolkitPage from './AgentToolkitPage'

describe('AgentToolkitPage', () => {
  it('renders title and install command', () => {
    render(<AgentToolkitPage />)
    expect(screen.getByText('Agent Toolkit')).toBeInTheDocument()
    // CodeBlock tokenizes the text, so check the code block container
    const codeBlocks = document.querySelectorAll('.code-block')
    const firstBlock = codeBlocks[0] as HTMLElement
    expect(firstBlock.textContent).toContain('npm')
    expect(firstBlock.textContent).toContain('install')
    expect(firstBlock.textContent).toContain('agent-toolkit')
  })

  it('renders All pill and 6 category pills', () => {
    render(<AgentToolkitPage />)
    const categorySection = screen.getByText('Agent Categories').closest('.agent-toolkit__section') as HTMLElement
    const pills = within(categorySection).getAllByRole('button')
    expect(within(categorySection).getByText('All')).toBeInTheDocument()
    expect(within(categorySection).getByText('Core')).toBeInTheDocument()
    expect(within(categorySection).getByText('Creative')).toBeInTheDocument()
    expect(within(categorySection).getByText('Technical')).toBeInTheDocument()
    expect(within(categorySection).getByText('Business')).toBeInTheDocument()
    expect(within(categorySection).getByText('People')).toBeInTheDocument()
    expect(pills.length).toBeGreaterThanOrEqual(7)
  })

  it('shows all 20 agents when All is selected', () => {
    render(<AgentToolkitPage />)
    // "Planner" appears in agent cards AND in code blocks, so scope to the agents grid
    const agentsGrid = document.querySelector('.agent-toolkit__agents-grid') as HTMLElement
    expect(within(agentsGrid).getByText('Planner')).toBeInTheDocument()
    expect(within(agentsGrid).getByText('Customer Success')).toBeInTheDocument()
  })

  it('filters agents by category when pill clicked', async () => {
    const user = userEvent.setup()
    render(<AgentToolkitPage />)
    const categorySection = screen.getByText('Agent Categories').closest('.agent-toolkit__section') as HTMLElement
    const pillsContainer = categorySection.querySelector('.agent-toolkit__category-pills') as HTMLElement
    await user.click(within(pillsContainer).getByText('Technical'))

    const agentsGrid = document.querySelector('.agent-toolkit__agents-grid') as HTMLElement
    expect(within(agentsGrid).getByText('Developer')).toBeInTheDocument()
    expect(within(agentsGrid).getByText('Security')).toBeInTheDocument()
    expect(within(agentsGrid).getByText('DevOps')).toBeInTheDocument()
    expect(within(agentsGrid).queryByText('Planner')).not.toBeInTheDocument()
  })

  it('expands agent card to show details', async () => {
    const user = userEvent.setup()
    render(<AgentToolkitPage />)
    const expandButtons = screen.getAllByRole('button', { name: /details/i })
    await user.click(expandButtons[0]!)
    expect(screen.getByText('Capabilities')).toBeInTheDocument()
  })

  it('collapses expanded agent when clicked again', async () => {
    const user = userEvent.setup()
    render(<AgentToolkitPage />)
    const expandButtons = screen.getAllByRole('button', { name: /details/i })
    await user.click(expandButtons[0]!) // expand
    await user.click(expandButtons[0]!) // collapse
    expect(screen.queryByText('Capabilities')).not.toBeInTheDocument()
  })

  it('renders all 4 framework tabs', () => {
    render(<AgentToolkitPage />)
    expect(screen.getByText('OpenAI Agents SDK')).toBeInTheDocument()
    expect(screen.getByText('LangChain')).toBeInTheDocument()
    expect(screen.getByText('CrewAI')).toBeInTheDocument()
    expect(screen.getByText('AutoGen')).toBeInTheDocument()
  })

  it('switches framework code when tab clicked', async () => {
    const user = userEvent.setup()
    render(<AgentToolkitPage />)
    await user.click(screen.getByText('LangChain'))
    const frameworkSection = screen.getByText('Framework Integration').closest('.agent-toolkit__section') as HTMLElement
    const codeBlock = frameworkSection.querySelector('.code-block') as HTMLElement
    expect(codeBlock.textContent).toContain('initialize_agent')
  })

  it('renders team orchestration section', () => {
    render(<AgentToolkitPage />)
    expect(screen.getByText('Team Orchestration')).toBeInTheDocument()
    const teamSection = screen.getByText('Team Orchestration').closest('.agent-toolkit__section') as HTMLElement
    const codeBlock = teamSection.querySelector('.code-block') as HTMLElement
    expect(codeBlock.textContent).toContain('AgentTeam')
  })

  it('renders marketplace section with search', () => {
    render(<AgentToolkitPage />)
    expect(screen.getByText('Agent Marketplace')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('filters marketplace by domain', async () => {
    const user = userEvent.setup()
    render(<AgentToolkitPage />)
    // Target the marketplace pill container specifically
    const marketplaceSection = screen.getByText('Agent Marketplace').closest('.agent-toolkit__section') as HTMLElement
    const pillsContainer = marketplaceSection.querySelector('.agent-toolkit__marketplace-pills') as HTMLElement
    await user.click(within(pillsContainer).getByText('Finance & Money'))
    expect(screen.getByText('Invoice Processor')).toBeInTheDocument()
    expect(screen.queryByText('Meeting Summarizer')).not.toBeInTheDocument()
  })

  it('filters marketplace by search', async () => {
    const user = userEvent.setup()
    render(<AgentToolkitPage />)
    await user.type(screen.getByPlaceholderText(/search/i), 'invoice')
    // Wait for debounce
    await new Promise(r => setTimeout(r, 300))
    expect(screen.getByText('Invoice Processor')).toBeInTheDocument()
  })
})
