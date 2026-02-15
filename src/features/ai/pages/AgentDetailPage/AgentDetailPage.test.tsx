import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AgentDetailPage from './AgentDetailPage'

function renderWithRoute(agentId: string) {
  return render(
    <MemoryRouter initialEntries={[`/copilot/agents/${agentId}`]}>
      <Routes>
        <Route path="/copilot/agents/:agentId" element={<AgentDetailPage />} />
        <Route path="/copilot/agents" element={<div data-testid="agents-list">Agents List</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AgentDetailPage', () => {
  // ─── Core Agent Rendering ───────────────────────────────────────────

  it('renders a core agent detail page', () => {
    renderWithRoute('planner')
    expect(screen.getByRole('heading', { name: 'Planner Agent' })).toBeInTheDocument()
  })

  it('shows the agent tagline', () => {
    renderWithRoute('planner')
    expect(screen.getByText('From vision to roadmap')).toBeInTheDocument()
  })

  it('shows category and archetype badges', () => {
    renderWithRoute('planner')
    expect(screen.getByText('core')).toBeInTheDocument()
    expect(screen.getByText('The Architect')).toBeInTheDocument()
  })

  it('shows the codename badge', () => {
    renderWithRoute('planner')
    expect(screen.getByText('ATLAS')).toBeInTheDocument()
  })

  it('renders use cases for core agents', () => {
    renderWithRoute('planner')
    expect(screen.getByText('Use Cases')).toBeInTheDocument()
    expect(screen.getByText('Break a product launch into phases')).toBeInTheDocument()
  })

  it('renders capabilities as tags for core agents', () => {
    renderWithRoute('planner')
    expect(screen.getByText('Capabilities')).toBeInTheDocument()
    expect(screen.getByText('Task decomposition')).toBeInTheDocument()
    expect(screen.getByText('Milestone planning')).toBeInTheDocument()
  })

  it('shows the Run button', () => {
    renderWithRoute('planner')
    expect(screen.getByText('Run')).toBeInTheDocument()
  })

  // ─── Marketplace Agent Rendering ────────────────────────────────────

  it('renders a marketplace agent detail page', () => {
    renderWithRoute('work-1')
    expect(screen.getByRole('heading', { name: /Agent$/ })).toBeInTheDocument()
  })

  it('shows integrations for marketplace agents', () => {
    renderWithRoute('work-1')
    expect(screen.getByText('Integrations')).toBeInTheDocument()
  })

  it('shows autonomy for marketplace agents', () => {
    renderWithRoute('work-1')
    expect(screen.getByText('Autonomy')).toBeInTheDocument()
  })

  it('shows price for marketplace agents', () => {
    renderWithRoute('work-1')
    expect(screen.getByText('Price')).toBeInTheDocument()
  })

  // ─── Tab Navigation ─────────────────────────────────────────────────

  it('renders all 6 persona tabs', () => {
    renderWithRoute('planner')
    expect(screen.getByRole('tab', { name: 'ROLES' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'SKILLS' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'MEMORY' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'USER' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'SOUL' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'IDENTITY' })).toBeInTheDocument()
  })

  it('defaults to ROLES tab as active', () => {
    renderWithRoute('planner')
    expect(screen.getByRole('tab', { name: 'ROLES' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'SKILLS' })).toHaveAttribute('aria-selected', 'false')
  })

  it('switches to SKILLS tab on click', async () => {
    const user = userEvent.setup()
    renderWithRoute('planner')

    await user.click(screen.getByRole('tab', { name: 'SKILLS' }))

    expect(screen.getByRole('tab', { name: 'SKILLS' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'ROLES' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByText('Technical Skills')).toBeInTheDocument()
  })

  it('switches to MEMORY tab on click', async () => {
    const user = userEvent.setup()
    renderWithRoute('planner')

    await user.click(screen.getByRole('tab', { name: 'MEMORY' }))

    expect(screen.getByRole('tab', { name: 'MEMORY' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Context Window')).toBeInTheDocument()
  })

  it('switches to USER tab on click', async () => {
    const user = userEvent.setup()
    renderWithRoute('planner')

    await user.click(screen.getByRole('tab', { name: 'USER' }))

    expect(screen.getByRole('tab', { name: 'USER' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Interaction Style')).toBeInTheDocument()
  })

  it('switches to SOUL tab on click', async () => {
    const user = userEvent.setup()
    renderWithRoute('planner')

    await user.click(screen.getByRole('tab', { name: 'SOUL' }))

    expect(screen.getByRole('tab', { name: 'SOUL' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Purpose')).toBeInTheDocument()
  })

  it('switches to IDENTITY tab on click', async () => {
    const user = userEvent.setup()
    renderWithRoute('planner')

    await user.click(screen.getByRole('tab', { name: 'IDENTITY' }))

    expect(screen.getByRole('tab', { name: 'IDENTITY' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('v3.2.0')).toBeInTheDocument()
    expect(screen.getByText('Visual Identity')).toBeInTheDocument()
  })

  // ─── Default ROLES Tab Content ──────────────────────────────────────

  it('shows mission statement on ROLES tab by default', () => {
    renderWithRoute('planner')
    expect(screen.getByText('Mission Statement')).toBeInTheDocument()
    expect(screen.getByText(/Transform complex goals into clear, actionable roadmaps/)).toBeInTheDocument()
  })

  it('shows role title, department, and reporting', () => {
    renderWithRoute('planner')
    expect(screen.getByText('Strategic Planning Director')).toBeInTheDocument()
    expect(screen.getByText('Operations')).toBeInTheDocument()
    expect(screen.getByText('Workspace Coordinator')).toBeInTheDocument()
  })

  it('shows responsibilities list', () => {
    renderWithRoute('planner')
    expect(screen.getByText('Responsibilities')).toBeInTheDocument()
    expect(screen.getByText('Break down complex goals into actionable milestones')).toBeInTheDocument()
  })

  it('shows authorities list', () => {
    renderWithRoute('planner')
    expect(screen.getByText('Authorities')).toBeInTheDocument()
    expect(screen.getByText('Define project structure and phases')).toBeInTheDocument()
  })

  it('shows boundaries list', () => {
    renderWithRoute('planner')
    expect(screen.getByText('Boundaries')).toBeInTheDocument()
    expect(screen.getByText('Does not execute tasks directly')).toBeInTheDocument()
  })

  // ─── Not Found State ────────────────────────────────────────────────

  it('shows not-found state for invalid agent ID', () => {
    renderWithRoute('nonexistent-agent-xyz')
    expect(screen.getByText('Agent Not Found')).toBeInTheDocument()
    expect(screen.getByText("The agent you're looking for doesn't exist or has been removed.")).toBeInTheDocument()
  })

  it('shows Back to Agents button on not-found page', () => {
    renderWithRoute('nonexistent-agent-xyz')
    expect(screen.getByText('Back to Agents')).toBeInTheDocument()
  })

  // ─── Navigation ─────────────────────────────────────────────────────

  it('navigates back to agents list when Back button is clicked', async () => {
    const user = userEvent.setup()
    renderWithRoute('planner')

    await user.click(screen.getAllByText('Back to Agents')[0]!)

    expect(screen.getByTestId('agents-list')).toBeInTheDocument()
  })

  it('navigates back from not-found page', async () => {
    const user = userEvent.setup()
    renderWithRoute('nonexistent-agent-xyz')

    await user.click(screen.getByText('Back to Agents'))

    expect(screen.getByTestId('agents-list')).toBeInTheDocument()
  })

  // ─── Multiple Core Agents ──────────────────────────────────────────

  it('renders researcher agent correctly', () => {
    renderWithRoute('researcher')
    expect(screen.getByRole('heading', { name: 'Researcher Agent' })).toBeInTheDocument()
  })

  it('renders developer agent correctly', () => {
    renderWithRoute('developer')
    expect(screen.getByRole('heading', { name: 'Developer Agent' })).toBeInTheDocument()
  })

  it('renders writer agent correctly', () => {
    renderWithRoute('writer')
    expect(screen.getByRole('heading', { name: 'Writer Agent' })).toBeInTheDocument()
  })

  // ─── Tabpanel Role ─────────────────────────────────────────────────

  it('has a tabpanel role for content area', () => {
    renderWithRoute('planner')
    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })

  it('has a tablist role for tab navigation', () => {
    renderWithRoute('planner')
    expect(screen.getByRole('tablist', { name: 'Persona documents' })).toBeInTheDocument()
  })
})
