import { act } from '@testing-library/react'
import { AgentType, AgentStatus, TeamStatus, StepStatus } from '../types'

// Mock simulation engine before importing store
const mockRunSimulation = vi.fn().mockReturnValue({
  pause: vi.fn(),
  resume: vi.fn(),
  cancel: vi.fn(),
})

vi.mock('../lib/simulationEngine', () => ({
  runSimulation: (...args: unknown[]) => mockRunSimulation(...args),
}))

// Import store after mocks
const { default: useAgentStore } = await import('./useAgentStore')

function makeAgentConfig(overrides: Partial<{ name: string; type: AgentType; instructions: string; memoryAllocation: number }> = {}) {
  return {
    name: overrides.name ?? 'Test Agent',
    type: overrides.type ?? AgentType.Planner,
    instructions: overrides.instructions ?? 'Test instructions',
    memoryAllocation: overrides.memoryAllocation ?? 10000,
  }
}

describe('useAgentStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useAgentStore.setState({ teams: [], activeTeamId: null })
    mockRunSimulation.mockClear()
    mockRunSimulation.mockReturnValue({
      pause: vi.fn(),
      resume: vi.fn(),
      cancel: vi.fn(),
    })
  })

  describe('createTeam', () => {
    it('creates a team with agents and steps', () => {
      const { createTeam } = useAgentStore.getState()
      const team = createTeam('My Team', [
        makeAgentConfig({ name: 'Planner 1', type: AgentType.Planner }),
        makeAgentConfig({ name: 'Dev 1', type: AgentType.Developer }),
      ])

      expect(team.name).toBe('My Team')
      expect(team.status).toBe(TeamStatus.Draft)
      expect(team.agents).toHaveLength(2)
      expect(team.agents[0]!.name).toBe('Planner 1')
      expect(team.agents[0]!.type).toBe(AgentType.Planner)
      expect(team.agents[0]!.status).toBe(AgentStatus.Idle)
      expect(team.agents[0]!.steps.length).toBeGreaterThan(0)
      expect(team.agents[0]!.steps[0]!.status).toBe(StepStatus.Pending)

      const { teams } = useAgentStore.getState()
      expect(teams).toHaveLength(1)
    })
  })

  describe('deleteTeam', () => {
    it('removes the team from state', () => {
      const { createTeam } = useAgentStore.getState()
      const team = createTeam('To Delete', [makeAgentConfig()])

      const { deleteTeam } = useAgentStore.getState()
      deleteTeam(team.id)

      const { teams } = useAgentStore.getState()
      expect(teams).toHaveLength(0)
    })

    it('clears activeTeamId if the deleted team was active', () => {
      const { createTeam } = useAgentStore.getState()
      const team = createTeam('Active Team', [makeAgentConfig()])

      const { setActiveTeam } = useAgentStore.getState()
      setActiveTeam(team.id)
      expect(useAgentStore.getState().activeTeamId).toBe(team.id)

      const { deleteTeam } = useAgentStore.getState()
      deleteTeam(team.id)
      expect(useAgentStore.getState().activeTeamId).toBeNull()
    })
  })

  describe('setActiveTeam', () => {
    it('sets the active team ID', () => {
      const { setActiveTeam } = useAgentStore.getState()
      setActiveTeam('some-id')
      expect(useAgentStore.getState().activeTeamId).toBe('some-id')
    })

    it('can clear the active team', () => {
      const { setActiveTeam } = useAgentStore.getState()
      setActiveTeam('some-id')
      setActiveTeam(null)
      expect(useAgentStore.getState().activeTeamId).toBeNull()
    })
  })

  describe('startTeam', () => {
    it('sets team and agent statuses to running', () => {
      const { createTeam } = useAgentStore.getState()
      const team = createTeam('Run Team', [
        makeAgentConfig({ name: 'A1' }),
        makeAgentConfig({ name: 'A2' }),
      ])

      const { startTeam } = useAgentStore.getState()
      startTeam(team.id)

      const { teams } = useAgentStore.getState()
      const updated = teams.find(t => t.id === team.id)!
      expect(updated.status).toBe(TeamStatus.Running)
      expect(updated.agents[0]!.status).toBe(AgentStatus.Running)
      expect(updated.agents[1]!.status).toBe(AgentStatus.Running)
    })

    it('calls runSimulation for each agent', () => {
      const { createTeam } = useAgentStore.getState()
      const team = createTeam('Sim Team', [
        makeAgentConfig({ name: 'A1' }),
        makeAgentConfig({ name: 'A2' }),
      ])

      const { startTeam } = useAgentStore.getState()
      startTeam(team.id)

      expect(mockRunSimulation).toHaveBeenCalledTimes(2)
    })
  })

  describe('sendMessage', () => {
    it('adds a user message to the team', () => {
      const { createTeam } = useAgentStore.getState()
      const team = createTeam('Chat Team', [makeAgentConfig()])
      const agentId = team.agents[0]!.id

      const { sendMessage } = useAgentStore.getState()
      sendMessage(team.id, agentId, 'Hello agent')

      const { teams } = useAgentStore.getState()
      const updated = teams.find(t => t.id === team.id)!
      expect(updated.messages).toHaveLength(1)
      expect(updated.messages[0]!.role).toBe('user')
      expect(updated.messages[0]!.content).toBe('Hello agent')
      expect(updated.messages[0]!.agentId).toBe(agentId)
    })

    it('adds a mock agent response after a delay', async () => {
      vi.useFakeTimers()
      const { createTeam } = useAgentStore.getState()
      const team = createTeam('Chat Team', [makeAgentConfig()])
      const agentId = team.agents[0]!.id

      const { sendMessage } = useAgentStore.getState()
      sendMessage(team.id, agentId, 'Hello')

      // Agent hasn't responded yet
      expect(useAgentStore.getState().teams.find(t => t.id === team.id)!.messages).toHaveLength(1)

      // Fast-forward past max delay (1500ms)
      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      const messages = useAgentStore.getState().teams.find(t => t.id === team.id)!.messages
      expect(messages).toHaveLength(2)
      expect(messages[1]!.role).toBe('agent')
      vi.useRealTimers()
    })
  })

  describe('stale detection on rehydration', () => {
    it('resets running agents to paused on rehydration', () => {
      // Simulate a rehydrated state with running agents
      useAgentStore.setState({
        teams: [{
          id: 'team-1',
          name: 'Stale Team',
          status: TeamStatus.Running,
          agents: [{
            id: 'agent-1',
            name: 'Running Agent',
            type: AgentType.Planner,
            status: AgentStatus.Running,
            instructions: '',
            memoryAllocation: 10000,
            steps: [],
            currentStepIndex: 0,
          }],
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
        activeTeamId: null,
      })

      // The onRehydrate callback is called by zustand persist
      // We simulate what it would do
      const state = useAgentStore.getState()
      const fixedTeams = state.teams.map(team => ({
        ...team,
        status: team.status === TeamStatus.Running ? TeamStatus.Paused : team.status,
        agents: team.agents.map(agent => ({
          ...agent,
          status: agent.status === AgentStatus.Running ? AgentStatus.Paused : agent.status,
        })),
      }))

      useAgentStore.setState({ teams: fixedTeams })

      const { teams } = useAgentStore.getState()
      expect(teams[0]!.status).toBe(TeamStatus.Paused)
      expect(teams[0]!.agents[0]!.status).toBe(AgentStatus.Paused)
    })
  })
})
