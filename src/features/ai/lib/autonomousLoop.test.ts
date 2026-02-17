import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { AutonomousAgent, AgentLifecycle, AutonomyMode } from '../types'

// ─── Hoisted mock functions (available before vi.mock factories) ─────

const {
  mockGetAgent,
  mockSetLifecycle,
  mockHeartbeat,
  mockAddThinkingStep,
  mockIncrementErrorCount,
  mockQueueApproval,
  mockGetUnread,
  mockAcknowledge,
  mockPublish,
  mockSubscribe,
  mockRemember,
  mockGetAgentMemories,
  mockDeleteMemory,
  mockAddRepair,
  mockUpdateRepair,
  mockGetRepairsByAgent,
  mockGetConnector,
  mockMockExecute,
  mockExecute,
  mockSyncChat,
  mockExecuteTool,
  mockTriggerWorkflow,
  mockCheckActionCircuit,
  mockRecordActionOutcome,
  mockAcquireActionLock,
  mockReleaseActionLock,
  mockPruneAgentMemories,
  mockRecordUsage,
  mockCheckBudget,
  mockCheckContract,
  mockRecordContractViolation,
  mockIdentityValues,
} = vi.hoisted(() => ({
  mockGetAgent: vi.fn(),
  mockSetLifecycle: vi.fn(),
  mockHeartbeat: vi.fn(),
  mockAddThinkingStep: vi.fn(),
  mockIncrementErrorCount: vi.fn(),
  mockQueueApproval: vi.fn(),
  mockGetUnread: vi.fn().mockReturnValue([]),
  mockAcknowledge: vi.fn(),
  mockPublish: vi.fn(),
  mockSubscribe: vi.fn(),
  mockRemember: vi.fn(),
  mockGetAgentMemories: vi.fn().mockReturnValue([]),
  mockDeleteMemory: vi.fn(),
  mockAddRepair: vi.fn().mockReturnValue('repair-1'),
  mockUpdateRepair: vi.fn(),
  mockGetRepairsByAgent: vi.fn().mockReturnValue([]),
  mockGetConnector: vi.fn().mockReturnValue(undefined),
  mockMockExecute: vi.fn().mockReturnValue('{"success":true,"result":"mock"}'),
  mockExecute: vi.fn().mockResolvedValue('{"success":true,"result":"mock"}'),
  mockSyncChat: vi.fn().mockResolvedValue(null),
  mockExecuteTool: vi.fn().mockReturnValue('{"success":true}'),
  mockTriggerWorkflow: vi.fn(),
  mockCheckActionCircuit: vi.fn().mockReturnValue(null),
  mockRecordActionOutcome: vi.fn(),
  mockAcquireActionLock: vi.fn().mockReturnValue({ allowed: true, reason: 'Lock acquired' }),
  mockReleaseActionLock: vi.fn(),
  mockPruneAgentMemories: vi.fn().mockReturnValue({ deletedCount: 0, freedTokens: 0, deletedIds: [] }),
  mockRecordUsage: vi.fn().mockReturnValue('cost-1'),
  mockCheckBudget: vi.fn().mockReturnValue({ allowed: true, reason: 'Within budget', remainingTokens: 100000, remainingCostUsd: 10, usagePct: 0 }),
  mockCheckContract: vi.fn().mockReturnValue({ allowed: true, reason: 'Within contract scope' }),
  mockRecordContractViolation: vi.fn(),
  mockIdentityValues: vi.fn().mockReturnValue([]),
}))

// ─── Mock all dependencies ──────────────────────────────────────────

vi.mock('./llmClient', () => ({
  syncChat: mockSyncChat,
}))

vi.mock('./selfHealingEngine', () => ({
  classifyError: vi.fn().mockReturnValue('unknown'),
  analyzeError: vi.fn().mockResolvedValue({
    id: '',
    agentId: 'a1',
    errorType: 'unknown',
    errorMessage: '',
    analysis: '',
    repairAction: '',
    status: 'detected',
    timestamp: '',
    resolvedAt: null,
  }),
  attemptRepair: vi.fn().mockResolvedValue({
    status: 'failed',
    repairAction: 'manual',
    resolvedAt: null,
  }),
}))

vi.mock('./toolDefinitions', () => ({
  executeTool: mockExecuteTool,
  ORCHESTREE_TOOLS: [],
}))

vi.mock('./agentWorkflowBridge', () => ({
  triggerWorkflowFromAgent: mockTriggerWorkflow,
}))

vi.mock('./autonomousPromptBuilder', () => ({
  buildAutonomousPrompt: vi.fn().mockReturnValue('system prompt'),
}))

vi.mock('./circuitBreakerEngine', () => ({
  checkActionCircuit: mockCheckActionCircuit,
  recordActionOutcome: mockRecordActionOutcome,
}))

vi.mock('./governorEngine', () => ({
  acquireActionLock: mockAcquireActionLock,
  releaseActionLock: mockReleaseActionLock,
}))

vi.mock('./memoryLifecycleManager', () => ({
  pruneAgentMemories: mockPruneAgentMemories,
}))

vi.mock('./tokenCount', () => ({
  countTokens: vi.fn().mockReturnValue(100),
  TOKEN_BUDGET: 1_000_000,
  formatTokenCount: vi.fn().mockReturnValue('100'),
}))

// ─── Mock stores ────────────────────────────────────────────────────

vi.mock('../stores/useAgentRuntimeStore', () => {
  const mockStore = {
    getState: vi.fn().mockReturnValue({
      getAgent: mockGetAgent,
      setLifecycle: mockSetLifecycle,
      heartbeat: mockHeartbeat,
      addThinkingStep: mockAddThinkingStep,
      incrementErrorCount: mockIncrementErrorCount,
      queueApproval: mockQueueApproval,
    }),
  }
  return { default: mockStore }
})

vi.mock('../stores/useMessageBusStore', () => {
  const mockStore = {
    getState: vi.fn().mockReturnValue({
      getUnread: mockGetUnread,
      acknowledge: mockAcknowledge,
      publish: mockPublish,
      subscribe: mockSubscribe,
    }),
  }
  return { default: mockStore }
})

vi.mock('../stores/useAgentMemoryStore', () => {
  const mockStore = {
    getState: vi.fn().mockReturnValue({
      remember: mockRemember,
      getAgentMemories: mockGetAgentMemories,
      deleteMemory: mockDeleteMemory,
    }),
  }
  return { default: mockStore }
})

vi.mock('../stores/useRepairStore', () => {
  const mockStore = {
    getState: vi.fn().mockReturnValue({
      addRepair: mockAddRepair,
      updateRepair: mockUpdateRepair,
      getRepairsByAgent: mockGetRepairsByAgent,
    }),
  }
  return { default: mockStore }
})

vi.mock('../stores/useConnectorStore', () => {
  const mockStore = {
    getState: vi.fn().mockReturnValue({
      getConnector: mockGetConnector,
      mockExecute: mockMockExecute,
      execute: mockExecute,
    }),
  }
  return { default: mockStore }
})

vi.mock('../stores/useCostTrackingStore', () => {
  const mockStore = {
    getState: vi.fn().mockReturnValue({
      recordUsage: mockRecordUsage,
      checkBudget: mockCheckBudget,
    }),
  }
  return { default: mockStore }
})

vi.mock('../stores/useAgentIdentityStore', () => {
  const mockStore = {
    getState: vi.fn().mockReturnValue({
      identities: { values: mockIdentityValues },
      checkContract: mockCheckContract,
      recordContractViolation: mockRecordContractViolation,
    }),
  }
  return { default: mockStore }
})

// ─── Import after mocks ────────────────────────────────────────────

import { startAutonomousLoop, stopAutonomousLoop, isLoopRunning } from './autonomousLoop'

// ─── Helpers ────────────────────────────────────────────────────────

function makeAgent(overrides?: Partial<AutonomousAgent>): AutonomousAgent {
  return {
    id: 1,
    name: 'Test Agent',
    description: 'A test agent',
    integrations: '',
    autonomy: 'full_auto',
    price: 'N/A',
    lifecycle: 'deployed' as AgentLifecycle,
    autonomyMode: 'full_auto' as AutonomyMode,
    memoryIds: [],
    goalStack: [],
    thinkingLog: [],
    errorCount: 0,
    lastHeartbeat: new Date().toISOString(),
    connectorIds: [],
    ...overrides,
  }
}

/**
 * Helper to run exactly one loop cycle by returning an active agent
 * for the first N calls, then retired to exit the while-loop.
 * syncChat is called twice per cycle: once for reason(), once for planAction().
 */
function setupSingleCycle(
  agent: AutonomousAgent,
  reasonResult: string | null,
  planResult: string | null,
): void {
  let callCount = 0
  mockGetAgent.mockImplementation(() => {
    callCount++
    // Allow enough calls for the full cycle, then retire
    if (callCount <= 12) return agent
    return makeAgent({ lifecycle: 'retired' as AgentLifecycle })
  })

  // syncChat is called twice per cycle:
  //   1st call = reason(), 2nd call = planAction()
  mockSyncChat
    .mockResolvedValueOnce(reasonResult)
    .mockResolvedValueOnce(planResult)
}

// ─── Tests ──────────────────────────────────────────────────────────

describe('autonomousLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    stopAutonomousLoop('test-agent')
    stopAutonomousLoop('test-agent-2')
    vi.useRealTimers()
  })

  // ── Start / Stop / Duplicate ────────────────────────────────────

  describe('startAutonomousLoop / isLoopRunning / stopAutonomousLoop', () => {
    it('sets loop as running and isLoopRunning returns true', () => {
      mockGetAgent.mockReturnValue(makeAgent())
      startAutonomousLoop('test-agent')
      expect(isLoopRunning('test-agent')).toBe(true)
    })

    it('stops the loop and isLoopRunning returns false', () => {
      mockGetAgent.mockReturnValue(makeAgent())
      startAutonomousLoop('test-agent')
      expect(isLoopRunning('test-agent')).toBe(true)
      stopAutonomousLoop('test-agent')
      expect(isLoopRunning('test-agent')).toBe(false)
    })

    it('does not start duplicate loop for same agent', () => {
      mockGetAgent.mockReturnValue(makeAgent())
      startAutonomousLoop('test-agent')
      startAutonomousLoop('test-agent')
      expect(isLoopRunning('test-agent')).toBe(true)
      stopAutonomousLoop('test-agent')
      expect(isLoopRunning('test-agent')).toBe(false)
    })

    it('allows independent loops for different agents', () => {
      mockGetAgent.mockReturnValue(makeAgent())
      startAutonomousLoop('test-agent')
      startAutonomousLoop('test-agent-2')
      expect(isLoopRunning('test-agent')).toBe(true)
      expect(isLoopRunning('test-agent-2')).toBe(true)
      stopAutonomousLoop('test-agent')
      expect(isLoopRunning('test-agent')).toBe(false)
      expect(isLoopRunning('test-agent-2')).toBe(true)
    })

    it('stopAutonomousLoop is safe on non-existent agent', () => {
      expect(() => stopAutonomousLoop('nonexistent')).not.toThrow()
      expect(isLoopRunning('nonexistent')).toBe(false)
    })

    it('exits immediately when agent is not found at start', async () => {
      mockGetAgent.mockReturnValue(undefined)
      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(50)
      expect(isLoopRunning('test-agent')).toBe(false)
    })
  })

  // ── Full Cycle ─────────────────────────────────────────────────

  describe('loop cycle lifecycle', () => {
    it('runs observe-reason-plan-act-reflect then waits', async () => {
      setupSingleCycle(makeAgent(), 'some reasoning', null)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      expect(mockSetLifecycle).toHaveBeenCalled()
      expect(mockHeartbeat).toHaveBeenCalled()
      // addThinkingStep called for observe, reason, plan, act, reflect = 5 steps
      expect(mockAddThinkingStep).toHaveBeenCalled()
      const stepTypes = mockAddThinkingStep.mock.calls.map(
        (c) => (c[1] as { type: string }).type,
      )
      expect(stepTypes).toContain('observe')
      expect(stepTypes).toContain('reason')
      expect(stepTypes).toContain('plan')
      expect(stepTypes).toContain('act')
      expect(stepTypes).toContain('reflect')
    })
  })

  // ── planAction behavior (tested via addThinkingStep 'plan' content) ─

  describe('planAction — JSON parsing', () => {
    it('parses valid JSON action plan from syncChat', async () => {
      const toolAction = JSON.stringify([
        { type: 'tool', toolName: 'create_page', params: { title: 'Test' }, description: 'Create a page' },
      ])
      setupSingleCycle(makeAgent(), 'reasoning text', toolAction)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      // Find the 'plan' thinking step content
      const planStep = mockAddThinkingStep.mock.calls.find(
        (c) => (c[1] as { type: string }).type === 'plan',
      )
      expect(planStep).toBeDefined()
      const planContent: unknown = JSON.parse((planStep![1] as { content: string }).content)
      expect(Array.isArray(planContent)).toBe(true)
      const actions = planContent as Array<{ type: string; toolName: string }>
      expect(actions[0]?.type).toBe('tool')
      expect(actions[0]?.toolName).toBe('create_page')
    })

    it('falls back to type:none when syncChat returns non-JSON', async () => {
      setupSingleCycle(makeAgent(), 'reasoning', 'This is not JSON at all.')

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      const planStep = mockAddThinkingStep.mock.calls.find(
        (c) => (c[1] as { type: string }).type === 'plan',
      )
      expect(planStep).toBeDefined()
      const planContent: unknown = JSON.parse((planStep![1] as { content: string }).content)
      expect(Array.isArray(planContent)).toBe(true)
      const actions = planContent as Array<{ type: string; description: string }>
      expect(actions[0]?.type).toBe('none')
      expect(actions[0]?.description).toBe('This is not JSON at all.')
    })

    it('falls back to type:none when syncChat returns null (planAction)', async () => {
      setupSingleCycle(makeAgent(), 'reasoning', null)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      const planStep = mockAddThinkingStep.mock.calls.find(
        (c) => (c[1] as { type: string }).type === 'plan',
      )
      expect(planStep).toBeDefined()
      const planContent: unknown = JSON.parse((planStep![1] as { content: string }).content)
      const actions = planContent as Array<{ type: string }>
      expect(actions[0]?.type).toBe('none')
    })
  })

  // ── act execution by type ──────────────────────────────────────

  describe('act — executes by action type', () => {
    it('executes tool actions via executeTool', async () => {
      const plan = JSON.stringify([
        { type: 'tool', toolName: 'create_page', params: { title: 'Hello' }, description: 'Create page' },
      ])
      setupSingleCycle(makeAgent(), 'reasoning', plan)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      expect(mockExecuteTool).toHaveBeenCalledWith('create_page', { title: 'Hello' })
    })

    it('executes connector actions via execute', async () => {
      const plan = JSON.stringify([
        { type: 'connector', connectorId: 'gmail', actionId: 'gmail-send', params: { to: 'a@b.com' }, description: 'Send email' },
      ])
      setupSingleCycle(makeAgent(), 'reasoning', plan)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      expect(mockExecute).toHaveBeenCalledWith('gmail', 'gmail-send', { to: 'a@b.com' })
    })

    it('executes workflow actions via triggerWorkflowFromAgent', async () => {
      const plan = JSON.stringify([
        { type: 'workflow', workflowId: 'wf-123', params: {}, description: 'Trigger workflow' },
      ])
      setupSingleCycle(makeAgent(), 'reasoning', plan)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      expect(mockTriggerWorkflow).toHaveBeenCalledWith('test-agent', 'wf-123')
    })

    it('executes message actions via publish', async () => {
      const plan = JSON.stringify([
        { type: 'message', params: { topic: 'domain.finance' }, description: 'Budget alert' },
      ])
      setupSingleCycle(makeAgent(), 'reasoning', plan)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      // publish is called for act AND reflect, so check the act-specific call
      const publishCalls = mockPublish.mock.calls as Array<[string, string, string]>
      const messageCall = publishCalls.find((c) => c[1] === 'domain.finance')
      expect(messageCall).toBeDefined()
      expect(messageCall?.[2]).toBe('Budget alert')
    })

    it('handles none actions as no-ops', async () => {
      const plan = JSON.stringify([
        { type: 'none', params: {}, description: 'Nothing to do' },
      ])
      setupSingleCycle(makeAgent(), 'reasoning', plan)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      // act step should contain 'No-op'
      const actStep = mockAddThinkingStep.mock.calls.find(
        (c) => (c[1] as { type: string }).type === 'act',
      )
      expect(actStep).toBeDefined()
      expect((actStep![1] as { content: string }).content).toContain('No-op')
      expect((actStep![1] as { content: string }).content).toContain('Nothing to do')
    })
  })

  // ── Autonomy mode gating ───────────────────────────────────────

  describe('act — autonomy mode gating', () => {
    it('queues for approval in suggest mode', async () => {
      const plan = JSON.stringify([
        { type: 'tool', toolName: 'create_page', params: { title: 'X' }, description: 'Create' },
      ])
      setupSingleCycle(
        makeAgent({ autonomyMode: 'suggest' as AutonomyMode }),
        'reasoning',
        plan,
      )

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      expect(mockQueueApproval).toHaveBeenCalledWith(
        'test-agent',
        'execute_plan',
        expect.stringContaining('[tool] Create'),
      )
      // executeTool should NOT have been called
      expect(mockExecuteTool).not.toHaveBeenCalled()
    })

    it('queues for approval in ask_first mode', async () => {
      const plan = JSON.stringify([
        { type: 'connector', connectorId: 'slack', actionId: 'slack-send', params: {}, description: 'Post message' },
      ])
      setupSingleCycle(
        makeAgent({ autonomyMode: 'ask_first' as AutonomyMode }),
        'reasoning',
        plan,
      )

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      expect(mockQueueApproval).toHaveBeenCalledWith(
        'test-agent',
        'execute_plan',
        expect.stringContaining('[connector] Post message'),
      )
      expect(mockMockExecute).not.toHaveBeenCalled()
    })

    it('executes immediately in full_auto mode without approval', async () => {
      const plan = JSON.stringify([
        { type: 'tool', toolName: 'list_issues', params: {}, description: 'List issues' },
      ])
      setupSingleCycle(
        makeAgent({ autonomyMode: 'full_auto' as AutonomyMode }),
        'reasoning',
        plan,
      )

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      expect(mockExecuteTool).toHaveBeenCalledWith('list_issues', {})
      expect(mockQueueApproval).not.toHaveBeenCalled()
    })
  })

  // ── Pre-flight checks ────────────────────────────────────────────

  describe('pre-flight checks', () => {
    it('calls pruneAgentMemories during observe', async () => {
      setupSingleCycle(makeAgent(), 'reasoning', null)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      expect(mockPruneAgentMemories).toHaveBeenCalledWith('test-agent')
    })

    it('records cost usage after reason and plan LLM calls', async () => {
      setupSingleCycle(makeAgent(), 'reasoning', null)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      // recordUsage should be called for reason() and planAction() LLM calls
      const usageCalls = mockRecordUsage.mock.calls as Array<[string, string, string, unknown, number]>
      const reasonCall = usageCalls.find((c) => c[2] === 'reason')
      const planCall = usageCalls.find((c) => c[2] === 'plan')
      expect(reasonCall).toBeDefined()
      expect(planCall).toBeDefined()
    })

    it('blocks action when circuit breaker is open', async () => {
      mockCheckActionCircuit.mockReturnValueOnce({ allowed: false, state: 'open', reason: 'Circuit open' })
      const plan = JSON.stringify([
        { type: 'connector', connectorId: 'gmail', actionId: 'send', params: {}, description: 'Send email' },
      ])
      setupSingleCycle(makeAgent(), 'reasoning', plan)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      expect(mockMockExecute).not.toHaveBeenCalled()
      expect(mockQueueApproval).toHaveBeenCalledWith(
        'test-agent',
        'preflight_blocked',
        expect.stringContaining('Circuit breaker'),
      )
    })

    it('blocks action when budget is exhausted', async () => {
      mockCheckBudget.mockReturnValueOnce({ allowed: false, reason: 'Token budget exhausted', remainingTokens: 0, remainingCostUsd: 0, usagePct: 100 })
      const plan = JSON.stringify([
        { type: 'tool', toolName: 'create_page', params: {}, description: 'Create page' },
      ])
      setupSingleCycle(makeAgent(), 'reasoning', plan)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      expect(mockExecuteTool).not.toHaveBeenCalled()
      expect(mockQueueApproval).toHaveBeenCalledWith(
        'test-agent',
        'preflight_blocked',
        expect.stringContaining('Budget'),
      )
    })

    it('blocks action when lock is denied', async () => {
      mockAcquireActionLock.mockReturnValueOnce({ allowed: false, reason: 'Lower priority' })
      const plan = JSON.stringify([
        { type: 'tool', toolName: 'create_page', params: {}, description: 'Create page' },
      ])
      setupSingleCycle(makeAgent(), 'reasoning', plan)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      expect(mockExecuteTool).not.toHaveBeenCalled()
      const actStep = mockAddThinkingStep.mock.calls.find(
        (c) => (c[1] as { type: string }).type === 'act',
      )
      expect(actStep).toBeDefined()
      expect((actStep![1] as { content: string }).content).toContain('LOCK_DENIED')
    })

    it('releases lock after action execution', async () => {
      const plan = JSON.stringify([
        { type: 'tool', toolName: 'create_page', params: {}, description: 'Create page' },
      ])
      setupSingleCycle(makeAgent(), 'reasoning', plan)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      expect(mockAcquireActionLock).toHaveBeenCalled()
      expect(mockReleaseActionLock).toHaveBeenCalled()
    })

    it('records connector success outcome', async () => {
      const plan = JSON.stringify([
        { type: 'connector', connectorId: 'gmail', actionId: 'gmail-send', params: {}, description: 'Send' },
      ])
      setupSingleCycle(makeAgent(), 'reasoning', plan)

      startAutonomousLoop('test-agent', 100)
      await vi.advanceTimersByTimeAsync(500)

      expect(mockRecordActionOutcome).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'connector', connectorId: 'gmail' }),
        true,
      )
    })
  })
})
