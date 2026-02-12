import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentType } from '../../types'
import type { AgentTypeDefinition } from '../../types'
import AgentConfigPanel from './AgentConfigPanel'

const mockDefinition: AgentTypeDefinition = {
  type: AgentType.Planner,
  label: 'Planner',
  description: 'Breaks down complex tasks into actionable plans',
  icon: 'ClipboardList',
  color: '#4F46E5',
  category: 'core',
  useCases: ['Break a product launch into phases'],
  capabilities: ['Task decomposition'],
  defaultSteps: [
    { label: 'Analyzing', durationMs: 1000 },
  ],
}

const defaultAgent = {
  name: 'My Planner',
  type: AgentType.Planner as typeof AgentType.Planner,
  instructions: 'Plan all the things',
  memoryAllocation: 10000,
}

describe('AgentConfigPanel', () => {
  it('renders agent name input with current value', () => {
    render(
      <AgentConfigPanel
        agent={defaultAgent}
        typeDefinition={mockDefinition}
        onChange={vi.fn()}
      />
    )

    const input = screen.getByLabelText('Agent Name') as HTMLInputElement
    expect(input.value).toBe('My Planner')
  })

  it('shows type info from definition', () => {
    render(
      <AgentConfigPanel
        agent={defaultAgent}
        typeDefinition={mockDefinition}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText('Planner')).toBeInTheDocument()
    expect(screen.getByText('Breaks down complex tasks into actionable plans')).toBeInTheDocument()
  })

  it('fires onChange when name changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <AgentConfigPanel
        agent={defaultAgent}
        typeDefinition={mockDefinition}
        onChange={onChange}
      />
    )

    const input = screen.getByLabelText('Agent Name')
    await user.clear(input)
    await user.type(input, 'New Name')

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ name: expect.any(String) }))
  })

  it('fires onChange when instructions change', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <AgentConfigPanel
        agent={defaultAgent}
        typeDefinition={mockDefinition}
        onChange={onChange}
      />
    )

    const textarea = screen.getByLabelText('Instructions')
    await user.clear(textarea)
    await user.type(textarea, 'New instructions')

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ instructions: expect.any(String) }))
  })

  it('shows memory allocation controls', () => {
    render(
      <AgentConfigPanel
        agent={defaultAgent}
        typeDefinition={mockDefinition}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByLabelText('Memory allocation value')).toBeInTheDocument()
    expect(screen.getByLabelText('Memory Allocation (tokens)')).toBeInTheDocument()
  })
})
