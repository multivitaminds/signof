import { buildAutonomousPrompt } from './autonomousPromptBuilder'
import { MessagePriority, RepairStatus } from '../types'
import type { AutonomousAgent, ConnectorDefinition, AgentMessage, RepairRecord } from '../types'
import type { MemoryEntry } from '../types'

const mockAgent: AutonomousAgent = {
  id: 1,
  name: 'Financial Agent',
  description: 'Manages financial tasks',
  integrations: 'stripe, quickbooks',
  autonomy: 'full_auto',
  price: 'Free',
  lifecycle: 'deployed',
  autonomyMode: 'full_auto',
  memoryIds: [],
  goalStack: [
    { id: 'g1', description: 'Monitor expenses', priority: 5, status: 'active', subGoals: ['Track receipts'], createdAt: '2026-01-01' },
    { id: 'g2', description: 'Generate report', priority: 3, status: 'active', subGoals: [], createdAt: '2026-01-01' },
    { id: 'g3', description: 'Old task', priority: 1, status: 'completed', subGoals: [], createdAt: '2026-01-01' },
  ],
  thinkingLog: [],
  errorCount: 0,
  lastHeartbeat: new Date().toISOString(),
  connectorIds: ['stripe', 'quickbooks'],
}

const mockConnectors: ConnectorDefinition[] = [
  {
    id: 'stripe', name: 'Stripe', category: 'finance', icon: 'credit-card',
    description: 'Payments', authType: 'api_key', status: 'connected',
    actions: [{ id: 'charge', name: 'Create Charge', description: 'Charge', inputSchema: {}, outputSchema: {} }],
  },
  {
    id: 'quickbooks', name: 'QuickBooks', category: 'finance', icon: 'book',
    description: 'Accounting', authType: 'oauth2', status: 'disconnected',
    actions: [{ id: 'invoice', name: 'Create Invoice', description: 'Invoice', inputSchema: {}, outputSchema: {} }],
  },
  {
    id: 'gmail', name: 'Gmail', category: 'communication', icon: 'mail',
    description: 'Email', authType: 'oauth2', status: 'connected',
    actions: [],
  },
]

describe('buildAutonomousPrompt', () => {
  it('includes agent identity', () => {
    const prompt = buildAutonomousPrompt(mockAgent, [], [], [], [])
    expect(prompt).toContain('Financial Agent')
    expect(prompt).toContain('Manages financial tasks')
    expect(prompt).toContain('stripe, quickbooks')
  })

  it('includes full_auto autonomy instructions', () => {
    const prompt = buildAutonomousPrompt(mockAgent, [], [], [], [])
    expect(prompt).toContain('FULL AUTO')
    expect(prompt).toContain('act freely')
  })

  it('includes suggest autonomy instructions', () => {
    const suggestAgent = { ...mockAgent, autonomyMode: 'suggest' as const }
    const prompt = buildAutonomousPrompt(suggestAgent, [], [], [], [])
    expect(prompt).toContain('SUGGEST')
    expect(prompt).toContain('user review')
  })

  it('includes ask_first autonomy instructions', () => {
    const askAgent = { ...mockAgent, autonomyMode: 'ask_first' as const }
    const prompt = buildAutonomousPrompt(askAgent, [], [], [], [])
    expect(prompt).toContain('ASK FIRST')
    expect(prompt).toContain('explicit user permission')
  })

  it('includes active goals sorted by priority', () => {
    const prompt = buildAutonomousPrompt(mockAgent, [], [], [], [])
    expect(prompt).toContain('Monitor expenses')
    expect(prompt).toContain('Generate report')
    expect(prompt).toContain('[P5]')
    expect(prompt).toContain('[P3]')
    // Completed goals should not appear in active section header position
    expect(prompt).not.toContain('[P1] Old task')
  })

  it('includes sub-goals', () => {
    const prompt = buildAutonomousPrompt(mockAgent, [], [], [], [])
    expect(prompt).toContain('Track receipts')
  })

  it('includes only connectors assigned to the agent', () => {
    const prompt = buildAutonomousPrompt(mockAgent, [], mockConnectors, [], [])
    expect(prompt).toContain('Stripe')
    expect(prompt).toContain('QuickBooks')
    expect(prompt).not.toContain('Gmail') // not in agent's connectorIds
  })

  it('includes connector actions', () => {
    const prompt = buildAutonomousPrompt(mockAgent, [], mockConnectors, [], [])
    expect(prompt).toContain('Create Charge')
    expect(prompt).toContain('Create Invoice')
  })

  it('includes memories', () => {
    const memories: MemoryEntry[] = [{
      id: 'm1', title: 'Q4 Revenue', content: 'Revenue was $10M in Q4',
      category: 'workflows', tags: [], scope: 'personal', tokenCount: 10,
      createdAt: '2026-01-01', updatedAt: '2026-01-01', pinned: false,
      sourceType: 'agent', sourceRef: 'agent-1', lastAccessedAt: '2026-01-01', accessCount: 5,
    }]
    const prompt = buildAutonomousPrompt(mockAgent, memories, [], [], [])
    expect(prompt).toContain('Q4 Revenue')
    expect(prompt).toContain('Revenue was $10M')
  })

  it('includes recent messages', () => {
    const messages: AgentMessage[] = [{
      id: 'msg1', fromAgentId: 'agent-2', toAgentId: null,
      topic: 'domain.finance', content: 'Budget updated',
      priority: MessagePriority.High, timestamp: '2026-01-01', acknowledged: false,
    }]
    const prompt = buildAutonomousPrompt(mockAgent, [], [], messages, [])
    expect(prompt).toContain('Budget updated')
    expect(prompt).toContain('agent-2')
  })

  it('includes repair history', () => {
    const repairs: RepairRecord[] = [{
      id: 'r1', agentId: '1', errorType: 'network',
      errorMessage: 'Connection refused', analysis: 'Network issue',
      repairAction: 'Retried', status: RepairStatus.Resolved,
      timestamp: '2026-01-01', resolvedAt: '2026-01-01',
    }]
    const prompt = buildAutonomousPrompt(mockAgent, [], [], [], repairs)
    expect(prompt).toContain('network')
    expect(prompt).toContain('Connection refused')
    expect(prompt).toContain('Retried')
  })

  it('includes behavioral instructions', () => {
    const prompt = buildAutonomousPrompt(mockAgent, [], [], [], [])
    expect(prompt).toContain('observe')
    expect(prompt).toContain('reason')
    expect(prompt).toContain('plan')
    expect(prompt).toContain('act')
    expect(prompt).toContain('reflect')
  })
})
