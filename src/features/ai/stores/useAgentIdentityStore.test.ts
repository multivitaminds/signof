import useAgentIdentityStore from './useAgentIdentityStore'
import type { ParsedAction } from '../types'

beforeEach(() => {
  useAgentIdentityStore.setState({
    identities: new Map(),
  })
})

describe('createIdentity', () => {
  it('creates identity with defaults', () => {
    const id = useAgentIdentityStore.getState().createIdentity('planner', 'Test Planner')
    const identity = useAgentIdentityStore.getState().getIdentity(id)

    expect(identity).toBeDefined()
    expect(identity!.agentType).toBe('planner')
    expect(identity!.displayName).toBe('Test Planner')
    expect(identity!.totalDeployments).toBe(0)
    expect(identity!.totalCycles).toBe(0)
    expect(identity!.totalActionsExecuted).toBe(0)
    expect(identity!.totalErrors).toBe(0)
    expect(identity!.totalRepairs).toBe(0)
    expect(identity!.reputationScore).toBe(50)
    expect(identity!.successRate).toBe(1)
    expect(identity!.contractViolations).toBe(0)
    expect(identity!.retiredAt).toBeNull()
    expect(identity!.lastDeployedAt).toBeNull()
    expect(identity!.contract.allowedTools).toEqual([])
    expect(identity!.contract.allowedConnectors).toEqual([])
    expect(identity!.contract.maxAutonomyLevel).toBe('full_auto')
    expect(identity!.contract.maxTokenBudget).toBe(100000)
    expect(identity!.contract.maxCostUsdBudget).toBe(10)
  })

  it('applies contract overrides', () => {
    const id = useAgentIdentityStore.getState().createIdentity('developer', 'Dev Agent', {
      allowedTools: ['search', 'edit'],
      maxTokenBudget: 50000,
    })
    const identity = useAgentIdentityStore.getState().getIdentity(id)

    expect(identity!.contract.allowedTools).toEqual(['search', 'edit'])
    expect(identity!.contract.maxTokenBudget).toBe(50000)
    expect(identity!.contract.maxCostUsdBudget).toBe(10) // default kept
  })
})

describe('findByAgentType', () => {
  it('filters identities by type', () => {
    const store = useAgentIdentityStore.getState()
    store.createIdentity('planner', 'Planner 1')
    store.createIdentity('planner', 'Planner 2')
    store.createIdentity('writer', 'Writer 1')

    const planners = useAgentIdentityStore.getState().findByAgentType('planner')
    expect(planners).toHaveLength(2)
    expect(planners.every((p) => p.agentType === 'planner')).toBe(true)
  })
})

describe('recordDeployment / recordCycle / recordAction / recordError / recordRepair', () => {
  it('increments deployment counter and sets lastDeployedAt', () => {
    const id = useAgentIdentityStore.getState().createIdentity('analyst', 'Analyst')
    useAgentIdentityStore.getState().recordDeployment(id)
    const identity = useAgentIdentityStore.getState().getIdentity(id)

    expect(identity!.totalDeployments).toBe(1)
    expect(identity!.lastDeployedAt).not.toBeNull()
  })

  it('increments cycle counter', () => {
    const id = useAgentIdentityStore.getState().createIdentity('analyst', 'Analyst')
    useAgentIdentityStore.getState().recordCycle(id)
    useAgentIdentityStore.getState().recordCycle(id)
    const identity = useAgentIdentityStore.getState().getIdentity(id)

    expect(identity!.totalCycles).toBe(2)
  })

  it('increments action counter and recalculates successRate', () => {
    const id = useAgentIdentityStore.getState().createIdentity('analyst', 'Analyst')
    useAgentIdentityStore.getState().recordAction(id)
    useAgentIdentityStore.getState().recordAction(id)
    const identity = useAgentIdentityStore.getState().getIdentity(id)

    expect(identity!.totalActionsExecuted).toBe(2)
    expect(identity!.successRate).toBe(1) // no errors yet
  })

  it('increments error counter and recalculates successRate', () => {
    const id = useAgentIdentityStore.getState().createIdentity('analyst', 'Analyst')
    useAgentIdentityStore.getState().recordAction(id)
    useAgentIdentityStore.getState().recordAction(id)
    useAgentIdentityStore.getState().recordError(id) // 2 actions, 1 error => (2-1)/2 = 0.5
    const identity = useAgentIdentityStore.getState().getIdentity(id)

    expect(identity!.totalErrors).toBe(1)
    expect(identity!.successRate).toBe(0.5)
  })

  it('increments repair counter', () => {
    const id = useAgentIdentityStore.getState().createIdentity('analyst', 'Analyst')
    useAgentIdentityStore.getState().recordRepair(id)
    const identity = useAgentIdentityStore.getState().getIdentity(id)

    expect(identity!.totalRepairs).toBe(1)
  })
})

describe('recordContractViolation', () => {
  it('increments violations and adjusts reputation', () => {
    const id = useAgentIdentityStore.getState().createIdentity('writer', 'Writer')
    useAgentIdentityStore.getState().recordContractViolation(id)
    const identity = useAgentIdentityStore.getState().getIdentity(id)

    expect(identity!.contractViolations).toBe(1)
    // Reputation should drop from 50 due to violation penalty
    expect(identity!.reputationScore).toBeLessThan(100)
  })
})

describe('checkContract', () => {
  it('allows when no restrictions', () => {
    const id = useAgentIdentityStore.getState().createIdentity('planner', 'Planner')
    const action: ParsedAction = {
      type: 'tool',
      toolName: 'search',
      params: {},
      description: 'Search',
    }
    const result = useAgentIdentityStore.getState().checkContract(id, action)
    expect(result.allowed).toBe(true)
    expect(result.reason).toBe('Within contract scope')
  })

  it('denies tool not in allowedTools', () => {
    const id = useAgentIdentityStore.getState().createIdentity('planner', 'Planner', {
      allowedTools: ['read', 'write'],
    })
    const action: ParsedAction = {
      type: 'tool',
      toolName: 'delete',
      params: {},
      description: 'Delete file',
    }
    const result = useAgentIdentityStore.getState().checkContract(id, action)
    expect(result.allowed).toBe(false)
    expect(result.violationType).toBe('tool_denied')
  })

  it('denies connector not in allowedConnectors', () => {
    const id = useAgentIdentityStore.getState().createIdentity('planner', 'Planner', {
      allowedConnectors: ['slack', 'github'],
    })
    const action: ParsedAction = {
      type: 'connector',
      connectorId: 'stripe',
      params: {},
      description: 'Charge card',
    }
    const result = useAgentIdentityStore.getState().checkContract(id, action)
    expect(result.allowed).toBe(false)
    expect(result.violationType).toBe('connector_denied')
  })

  it('allows tool when in allowedTools list', () => {
    const id = useAgentIdentityStore.getState().createIdentity('planner', 'Planner', {
      allowedTools: ['search', 'read'],
    })
    const action: ParsedAction = {
      type: 'tool',
      toolName: 'search',
      params: {},
      description: 'Search',
    }
    const result = useAgentIdentityStore.getState().checkContract(id, action)
    expect(result.allowed).toBe(true)
  })

  it('allows when allowedTools is empty (unrestricted)', () => {
    const id = useAgentIdentityStore.getState().createIdentity('planner', 'Planner')
    const action: ParsedAction = {
      type: 'tool',
      toolName: 'anything',
      params: {},
      description: 'Anything',
    }
    const result = useAgentIdentityStore.getState().checkContract(id, action)
    expect(result.allowed).toBe(true)
  })

  it('allows when identity not found', () => {
    const result = useAgentIdentityStore.getState().checkContract('nonexistent', {
      type: 'tool',
      toolName: 'delete',
      params: {},
      description: 'Delete',
    })
    expect(result.allowed).toBe(true)
    expect(result.reason).toContain('not found')
  })
})

describe('computeReputationScore', () => {
  it('calculates correctly with reliability + activity - penalties', () => {
    const id = useAgentIdentityStore.getState().createIdentity('analyst', 'Analyst')
    // Give them 2000 cycles for max activity points: min(2000/100, 20) = 20
    for (let i = 0; i < 2000; i++) {
      useAgentIdentityStore.getState().recordCycle(id)
    }
    // Record actions with 100% success for max reliability (80)
    useAgentIdentityStore.getState().recordAction(id)

    const score = useAgentIdentityStore.getState().computeReputationScore(id)
    // successRate=1 => 80 + min(2000/100,20)=20 - 0 = 100
    expect(score).toBe(100)
  })

  it('clamps to 0-100', () => {
    const id = useAgentIdentityStore.getState().createIdentity('analyst', 'Analyst')
    // Many violations to push below 0
    for (let i = 0; i < 20; i++) {
      useAgentIdentityStore.getState().recordContractViolation(id)
    }

    const score = useAgentIdentityStore.getState().computeReputationScore(id)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('returns 50 for unknown identity', () => {
    const score = useAgentIdentityStore.getState().computeReputationScore('nonexistent')
    expect(score).toBe(50)
  })
})

describe('retire', () => {
  it('sets retiredAt and identity remains accessible', () => {
    const id = useAgentIdentityStore.getState().createIdentity('writer', 'Writer')
    useAgentIdentityStore.getState().retire(id)
    const identity = useAgentIdentityStore.getState().getIdentity(id)

    expect(identity).toBeDefined()
    expect(identity!.retiredAt).not.toBeNull()
  })
})

describe('updateContract', () => {
  it('merges updates and sets updatedAt', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
    const id = useAgentIdentityStore.getState().createIdentity('developer', 'Dev')
    const before = useAgentIdentityStore.getState().getIdentity(id)!
    const originalUpdatedAt = before.contract.updatedAt

    vi.setSystemTime(new Date('2025-01-01T00:01:00Z'))
    useAgentIdentityStore.getState().updateContract(id, {
      allowedTools: ['git', 'npm'],
      maxTokenBudget: 200000,
    })

    const after = useAgentIdentityStore.getState().getIdentity(id)!
    expect(after.contract.allowedTools).toEqual(['git', 'npm'])
    expect(after.contract.maxTokenBudget).toBe(200000)
    expect(after.contract.maxCostUsdBudget).toBe(10) // unchanged
    expect(after.contract.updatedAt).not.toBe(originalUpdatedAt)
    vi.useRealTimers()
  })
})
