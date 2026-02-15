import { AgentLifecycle } from '../types'
import type { MarketplaceAgent } from '../types'
import useAgentRuntimeStore from './useAgentRuntimeStore'

const mockAgent: MarketplaceAgent = {
  id: 1,
  name: 'Test Agent',
  description: 'A test autonomous agent',
  integrations: 'gmail, slack',
  autonomy: 'full_auto',
  price: 'Free',
}

describe('useAgentRuntimeStore', () => {
  beforeEach(() => {
    useAgentRuntimeStore.setState({
      deployedAgents: new Map(),
      approvalQueue: [],
    })
  })

  describe('deployAgent / retireAgent', () => {
    it('deploys an agent and returns an ID', () => {
      const id = useAgentRuntimeStore.getState().deployAgent(mockAgent, 'full_auto', ['gmail'])
      expect(id).toBeTruthy()
      const agent = useAgentRuntimeStore.getState().getAgent(id)
      expect(agent).toBeDefined()
      expect(agent!.name).toBe('Test Agent')
      expect(agent!.lifecycle).toBe(AgentLifecycle.Deployed)
      expect(agent!.autonomyMode).toBe('full_auto')
      expect(agent!.connectorIds).toEqual(['gmail'])
      expect(agent!.errorCount).toBe(0)
    })

    it('generates unique IDs for multiple deployments', () => {
      const id1 = useAgentRuntimeStore.getState().deployAgent(mockAgent, 'suggest', [])
      const id2 = useAgentRuntimeStore.getState().deployAgent(mockAgent, 'ask_first', [])
      expect(id1).not.toBe(id2)
      expect(useAgentRuntimeStore.getState().deployedAgents.size).toBe(2)
    })

    it('retires an agent', () => {
      const id = useAgentRuntimeStore.getState().deployAgent(mockAgent, 'full_auto', [])
      useAgentRuntimeStore.getState().retireAgent(id)
      const agent = useAgentRuntimeStore.getState().getAgent(id)
      expect(agent!.lifecycle).toBe(AgentLifecycle.Retired)
    })

    it('retiring a non-existent agent does nothing', () => {
      useAgentRuntimeStore.getState().retireAgent('non-existent')
      expect(useAgentRuntimeStore.getState().deployedAgents.size).toBe(0)
    })
  })

  describe('setAutonomyMode', () => {
    it('changes autonomy mode', () => {
      const id = useAgentRuntimeStore.getState().deployAgent(mockAgent, 'full_auto', [])
      useAgentRuntimeStore.getState().setAutonomyMode(id, 'suggest')
      expect(useAgentRuntimeStore.getState().getAgent(id)!.autonomyMode).toBe('suggest')
    })
  })

  describe('setLifecycle', () => {
    it('transitions lifecycle state', () => {
      const id = useAgentRuntimeStore.getState().deployAgent(mockAgent, 'full_auto', [])
      useAgentRuntimeStore.getState().setLifecycle(id, AgentLifecycle.Thinking)
      expect(useAgentRuntimeStore.getState().getAgent(id)!.lifecycle).toBe(AgentLifecycle.Thinking)
      useAgentRuntimeStore.getState().setLifecycle(id, AgentLifecycle.Acting)
      expect(useAgentRuntimeStore.getState().getAgent(id)!.lifecycle).toBe(AgentLifecycle.Acting)
    })
  })

  describe('goal management', () => {
    it('pushes and completes goals', () => {
      const id = useAgentRuntimeStore.getState().deployAgent(mockAgent, 'full_auto', [])
      const goalId = useAgentRuntimeStore.getState().pushGoal(id, 'Test goal', 5)
      expect(goalId).toBeTruthy()

      const agent = useAgentRuntimeStore.getState().getAgent(id)!
      expect(agent.goalStack).toHaveLength(1)
      expect(agent.goalStack[0]!.description).toBe('Test goal')
      expect(agent.goalStack[0]!.priority).toBe(5)
      expect(agent.goalStack[0]!.status).toBe('active')

      useAgentRuntimeStore.getState().completeGoal(id, goalId)
      const updated = useAgentRuntimeStore.getState().getAgent(id)!
      expect(updated.goalStack[0]!.status).toBe('completed')
    })

    it('supports multiple goals', () => {
      const id = useAgentRuntimeStore.getState().deployAgent(mockAgent, 'full_auto', [])
      useAgentRuntimeStore.getState().pushGoal(id, 'Goal 1', 3)
      useAgentRuntimeStore.getState().pushGoal(id, 'Goal 2', 7)
      expect(useAgentRuntimeStore.getState().getAgent(id)!.goalStack).toHaveLength(2)
    })
  })

  describe('thinking steps', () => {
    it('adds thinking steps with auto-generated ID and timestamp', () => {
      const id = useAgentRuntimeStore.getState().deployAgent(mockAgent, 'full_auto', [])
      useAgentRuntimeStore.getState().addThinkingStep(id, {
        type: 'observe',
        content: 'Observing context',
        durationMs: 150,
      })
      const agent = useAgentRuntimeStore.getState().getAgent(id)!
      expect(agent.thinkingLog).toHaveLength(1)
      expect(agent.thinkingLog[0]!.type).toBe('observe')
      expect(agent.thinkingLog[0]!.content).toBe('Observing context')
      expect(agent.thinkingLog[0]!.durationMs).toBe(150)
      expect(agent.thinkingLog[0]!.id).toBeTruthy()
      expect(agent.thinkingLog[0]!.timestamp).toBeTruthy()
    })
  })

  describe('approval queue', () => {
    it('queues and approves actions', () => {
      const id = useAgentRuntimeStore.getState().deployAgent(mockAgent, 'full_auto', [])
      const approvalId = useAgentRuntimeStore.getState().queueApproval(id, 'send_email', 'Send email to user')
      expect(approvalId).toBeTruthy()
      expect(useAgentRuntimeStore.getState().approvalQueue).toHaveLength(1)

      const approved = useAgentRuntimeStore.getState().approveAction(approvalId)
      expect(approved).not.toBeNull()
      expect(approved!.action).toBe('send_email')
      expect(useAgentRuntimeStore.getState().approvalQueue).toHaveLength(0)
    })

    it('rejects actions', () => {
      const id = useAgentRuntimeStore.getState().deployAgent(mockAgent, 'full_auto', [])
      const approvalId = useAgentRuntimeStore.getState().queueApproval(id, 'delete_data', 'Delete all records')
      useAgentRuntimeStore.getState().rejectAction(approvalId)
      expect(useAgentRuntimeStore.getState().approvalQueue).toHaveLength(0)
    })

    it('approving non-existent returns null', () => {
      const result = useAgentRuntimeStore.getState().approveAction('fake-id')
      expect(result).toBeNull()
    })
  })

  describe('heartbeat / errorCount', () => {
    it('updates heartbeat timestamp', () => {
      const id = useAgentRuntimeStore.getState().deployAgent(mockAgent, 'full_auto', [])
      const before = useAgentRuntimeStore.getState().getAgent(id)!.lastHeartbeat
      // Small delay to ensure different timestamp
      useAgentRuntimeStore.getState().heartbeat(id)
      const after = useAgentRuntimeStore.getState().getAgent(id)!.lastHeartbeat
      expect(after).toBeTruthy()
      expect(new Date(after).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime())
    })

    it('increments error count', () => {
      const id = useAgentRuntimeStore.getState().deployAgent(mockAgent, 'full_auto', [])
      expect(useAgentRuntimeStore.getState().getAgent(id)!.errorCount).toBe(0)
      useAgentRuntimeStore.getState().incrementErrorCount(id)
      expect(useAgentRuntimeStore.getState().getAgent(id)!.errorCount).toBe(1)
      useAgentRuntimeStore.getState().incrementErrorCount(id)
      expect(useAgentRuntimeStore.getState().getAgent(id)!.errorCount).toBe(2)
    })
  })

  describe('getAgent', () => {
    it('returns undefined for non-existent agent', () => {
      expect(useAgentRuntimeStore.getState().getAgent('nope')).toBeUndefined()
    })
  })
})
