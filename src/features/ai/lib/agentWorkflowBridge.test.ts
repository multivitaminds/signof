import { triggerWorkflowFromAgent, deployAgentFromWorkflow, getAvailableConnectorsForAgent } from './agentWorkflowBridge'
import useWorkflowStore from '../stores/useWorkflowStore'
import useAgentRuntimeStore from '../stores/useAgentRuntimeStore'
import useMessageBusStore from '../stores/useMessageBusStore'
import useConnectorStore from '../stores/useConnectorStore'

// Mock the autonomous loop to prevent actual loop execution
vi.mock('./autonomousLoop', () => ({
  startAutonomousLoop: vi.fn(),
}))

// Save initial connector state
const initialConnectors = useConnectorStore.getState().connectors.map((c) => ({ ...c }))

describe('agentWorkflowBridge', () => {
  beforeEach(() => {
    // Reset all stores
    useWorkflowStore.setState({ workflows: [], activeWorkflowId: null })
    useAgentRuntimeStore.setState({ deployedAgents: new Map(), approvalQueue: [] })

    const initialTopics = new Map<string, string[]>()
    for (const topic of ['system.alerts', 'domain.finance', 'domain.health', 'domain.work', 'coordination.handoff', 'healing.report']) {
      initialTopics.set(topic, [])
    }
    useMessageBusStore.setState({ topics: initialTopics, messages: [], unacknowledged: new Map() })
    useConnectorStore.setState({
      connectors: initialConnectors.map((c) => ({ ...c, status: 'disconnected' as const })),
    })
  })

  describe('triggerWorkflowFromAgent', () => {
    it('sets workflow status to active and publishes message', () => {
      const wfId = useWorkflowStore.getState().createWorkflow('Test Workflow')
      triggerWorkflowFromAgent('agent-1', wfId)

      const wf = useWorkflowStore.getState().workflows.find((w) => w.id === wfId)
      expect(wf!.status).toBe('active')

      const messages = useMessageBusStore.getState().messages
      expect(messages.length).toBeGreaterThanOrEqual(1)
      expect(messages.some((m) => m.content.includes('Test Workflow'))).toBe(true)
    })

    it('publishes error message for non-existent workflow', () => {
      triggerWorkflowFromAgent('agent-1', 'fake-workflow-id')

      const messages = useMessageBusStore.getState().messages
      expect(messages.length).toBeGreaterThanOrEqual(1)
      expect(messages.some((m) => m.content.includes('not found'))).toBe(true)
    })
  })

  describe('deployAgentFromWorkflow', () => {
    it('deploys an agent from workflow node data and returns ID', () => {
      const deployedId = deployAgentFromWorkflow({
        agentId: '42',
        name: 'Workflow Agent',
        task: 'Process invoices',
        autonomyMode: 'suggest',
        connectorIds: ['stripe'],
      })

      expect(deployedId).toBeTruthy()
      const agent = useAgentRuntimeStore.getState().getAgent(deployedId!)
      expect(agent).toBeDefined()
      expect(agent!.name).toBe('Workflow Agent')
    })

    it('returns null when no agentId provided', () => {
      const result = deployAgentFromWorkflow({ name: 'No ID Agent' })
      expect(result).toBeNull()
    })

    it('uses defaults for missing fields', () => {
      const deployedId = deployAgentFromWorkflow({ agentId: '99' })
      expect(deployedId).toBeTruthy()
      const agent = useAgentRuntimeStore.getState().getAgent(deployedId!)
      expect(agent!.name).toContain('Workflow Agent')
    })
  })

  describe('getAvailableConnectorsForAgent', () => {
    it('returns empty for non-existent agent', () => {
      expect(getAvailableConnectorsForAgent('fake-agent')).toEqual([])
    })

    it('returns only connected connectors assigned to the agent', () => {
      // Deploy an agent with connector IDs
      const agentId = useAgentRuntimeStore.getState().deployAgent(
        { id: 1, name: 'Test', description: 'Test', integrations: '', autonomy: 'full_auto', price: 'Free' },
        'full_auto',
        ['gmail', 'slack', 'stripe'],
      )

      // Connect only gmail and stripe
      useConnectorStore.getState().setConnectorStatus('gmail', 'connected')
      useConnectorStore.getState().setConnectorStatus('stripe', 'connected')
      // slack stays disconnected

      const available = getAvailableConnectorsForAgent(agentId)
      expect(available).toHaveLength(2)
      expect(available).toContain('gmail')
      expect(available).toContain('stripe')
      expect(available).not.toContain('slack')
    })
  })
})
