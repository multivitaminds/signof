import { describe, it, expect, beforeEach } from 'vitest'
import useCostTrackingStore from './useCostTrackingStore'

describe('useCostTrackingStore', () => {
  beforeEach(() => {
    useCostTrackingStore.setState({
      budgets: new Map(),
      costHistory: [],
    })
  })

  describe('setBudget', () => {
    it('creates budget with defaults', () => {
      useCostTrackingStore.getState().setBudget('agent-1', 10000, 5.0)
      const budget = useCostTrackingStore.getState().getBudget('agent-1')
      expect(budget).toBeDefined()
      expect(budget!.maxTokens).toBe(10000)
      expect(budget!.maxCostUsd).toBe(5.0)
      expect(budget!.usedTokens).toBe(0)
      expect(budget!.usedCostUsd).toBe(0)
      expect(budget!.warningThresholdPct).toBe(80)
      expect(budget!.pauseThresholdPct).toBe(95)
    })

    it('updates existing budget', () => {
      useCostTrackingStore.getState().setBudget('agent-1', 10000, 5.0)
      useCostTrackingStore.getState().setBudget('agent-1', 20000, 10.0, 70, 90)
      const budget = useCostTrackingStore.getState().getBudget('agent-1')
      expect(budget!.maxTokens).toBe(20000)
      expect(budget!.maxCostUsd).toBe(10.0)
      expect(budget!.warningThresholdPct).toBe(70)
      expect(budget!.pauseThresholdPct).toBe(90)
    })
  })

  describe('recordUsage', () => {
    it('records cost and returns id', () => {
      const id = useCostTrackingStore.getState().recordUsage(
        'agent-1', 'llm', 'completion',
        { inputTokens: 100, outputTokens: 50, totalTokens: 150 }, 0.005,
      )
      expect(id).toBeTruthy()
      const history = useCostTrackingStore.getState().costHistory
      expect(history).toHaveLength(1)
      expect(history[0]!.agentId).toBe('agent-1')
      expect(history[0]!.estimatedCostUsd).toBe(0.005)
    })

    it('increments budget counters', () => {
      useCostTrackingStore.getState().setBudget('agent-1', 10000, 5.0)
      useCostTrackingStore.getState().recordUsage(
        'agent-1', 'llm', 'completion',
        { inputTokens: 100, outputTokens: 50, totalTokens: 150 }, 0.005,
      )
      const budget = useCostTrackingStore.getState().getBudget('agent-1')
      expect(budget!.usedTokens).toBe(150)
      expect(budget!.usedCostUsd).toBe(0.005)
    })

    it('works without budget set', () => {
      const id = useCostTrackingStore.getState().recordUsage(
        'agent-no-budget', 'tool', 'search', null, 0.001,
      )
      expect(id).toBeTruthy()
      expect(useCostTrackingStore.getState().costHistory).toHaveLength(1)
    })
  })

  describe('checkBudget', () => {
    it('allows when within budget', () => {
      useCostTrackingStore.getState().setBudget('agent-1', 10000, 5.0)
      const result = useCostTrackingStore.getState().checkBudget('agent-1', 100, 0.01)
      expect(result.allowed).toBe(true)
      expect(result.reason).toBe('Within budget')
    })

    it('denies when tokens exhausted', () => {
      useCostTrackingStore.getState().setBudget('agent-1', 1000, 5.0)
      useCostTrackingStore.getState().recordUsage(
        'agent-1', 'llm', 'completion',
        { inputTokens: 500, outputTokens: 400, totalTokens: 900 }, 0.01,
      )
      const result = useCostTrackingStore.getState().checkBudget('agent-1', 200, 0.01)
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Token budget exhausted')
    })

    it('denies when cost exhausted', () => {
      useCostTrackingStore.getState().setBudget('agent-1', 100000, 1.0)
      useCostTrackingStore.getState().recordUsage(
        'agent-1', 'llm', 'completion',
        { inputTokens: 100, outputTokens: 50, totalTokens: 150 }, 0.9,
      )
      const result = useCostTrackingStore.getState().checkBudget('agent-1', 100, 0.2)
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Cost budget exhausted')
    })

    it('denies when pause threshold reached', () => {
      useCostTrackingStore.getState().setBudget('agent-1', 10000, 5.0, 80, 95)
      useCostTrackingStore.getState().recordUsage(
        'agent-1', 'llm', 'completion',
        { inputTokens: 4500, outputTokens: 4500, totalTokens: 9000 }, 0.1,
      )
      const result = useCostTrackingStore.getState().checkBudget('agent-1', 600, 0.01)
      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Pause threshold reached')
    })

    it('allows unlimited when no budget', () => {
      const result = useCostTrackingStore.getState().checkBudget('unknown-agent', 100, 0.01)
      expect(result.allowed).toBe(true)
      expect(result.reason).toBe('No budget set')
      expect(result.remainingTokens).toBe(Infinity)
      expect(result.remainingCostUsd).toBe(Infinity)
    })
  })

  describe('getCostHistory', () => {
    it('filters by agent', () => {
      useCostTrackingStore.getState().recordUsage('agent-1', 'llm', 'op1', null, 0.01)
      useCostTrackingStore.getState().recordUsage('agent-2', 'llm', 'op2', null, 0.02)
      useCostTrackingStore.getState().recordUsage('agent-1', 'tool', 'op3', null, 0.03)
      const history = useCostTrackingStore.getState().getCostHistory('agent-1')
      expect(history).toHaveLength(2)
      expect(history.every((r) => r.agentId === 'agent-1')).toBe(true)
    })

    it('respects limit', () => {
      for (let i = 0; i < 10; i++) {
        useCostTrackingStore.getState().recordUsage('agent-1', 'llm', `op${i}`, null, 0.01)
      }
      const history = useCostTrackingStore.getState().getCostHistory('agent-1', 3)
      expect(history).toHaveLength(3)
    })
  })

  describe('getTotalCost', () => {
    it('sums all costs', () => {
      useCostTrackingStore.getState().recordUsage('agent-1', 'llm', 'op1', null, 0.01)
      useCostTrackingStore.getState().recordUsage('agent-2', 'llm', 'op2', null, 0.02)
      useCostTrackingStore.getState().recordUsage('agent-1', 'tool', 'op3', null, 0.03)
      const total = useCostTrackingStore.getState().getTotalCost()
      expect(total).toBeCloseTo(0.06)
    })
  })
})
