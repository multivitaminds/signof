import { evaluateExpression, evaluateCondition, buildExecutionPlan, executeNode } from './workflowExecutionEngine'
import { NodeStatus } from '../types'
import type { WorkflowNode, WorkflowConnection } from '../types'

// Mock dependencies
vi.mock('./toolDefinitions', () => ({
  executeTool: vi.fn().mockReturnValue(JSON.stringify({ success: true, result: 'mock tool result' })),
}))

vi.mock('./llmClient', () => ({
  syncChat: vi.fn().mockResolvedValue('LLM response for test'),
}))

describe('workflowExecutionEngine', () => {
  describe('evaluateExpression', () => {
    it('resolves simple path', () => {
      expect(evaluateExpression('name', { name: 'Alice' })).toBe('Alice')
    })

    it('resolves nested path', () => {
      expect(evaluateExpression('user.name', { user: { name: 'Bob' } })).toBe('Bob')
    })

    it('resolves deeply nested path', () => {
      expect(evaluateExpression('a.b.c', { a: { b: { c: 42 } } })).toBe(42)
    })

    it('returns undefined for missing path', () => {
      expect(evaluateExpression('missing.path', { name: 'test' })).toBeUndefined()
    })

    it('returns null for null value in context', () => {
      expect(evaluateExpression('name', { name: null })).toBeNull()
    })

    it('returns undefined for empty expression', () => {
      expect(evaluateExpression('', {})).toBeUndefined()
    })
  })

  describe('evaluateCondition', () => {
    it('evaluates equality (===)', () => {
      expect(evaluateCondition('name === "Alice"', { name: 'Alice' })).toBe(true)
      expect(evaluateCondition('name === "Bob"', { name: 'Alice' })).toBe(false)
    })

    it('evaluates inequality (!==)', () => {
      expect(evaluateCondition('name !== "Bob"', { name: 'Alice' })).toBe(true)
      expect(evaluateCondition('name !== "Alice"', { name: 'Alice' })).toBe(false)
    })

    it('evaluates greater than (>)', () => {
      expect(evaluateCondition('age > 18', { age: 25 })).toBe(true)
      expect(evaluateCondition('age > 18', { age: 10 })).toBe(false)
    })

    it('evaluates less than (<)', () => {
      expect(evaluateCondition('count < 5', { count: 3 })).toBe(true)
      expect(evaluateCondition('count < 5', { count: 10 })).toBe(false)
    })

    it('evaluates greater than or equal (>=)', () => {
      expect(evaluateCondition('age >= 18', { age: 18 })).toBe(true)
      expect(evaluateCondition('age >= 18', { age: 17 })).toBe(false)
    })

    it('evaluates less than or equal (<=)', () => {
      expect(evaluateCondition('count <= 5', { count: 5 })).toBe(true)
    })

    it('handles boolean literals', () => {
      expect(evaluateCondition('active === true', { active: true })).toBe(true)
      expect(evaluateCondition('active === false', { active: false })).toBe(true)
    })

    it('handles null literal', () => {
      expect(evaluateCondition('value === null', { value: null })).toBe(true)
    })

    it('falls back to truthy check', () => {
      expect(evaluateCondition('name', { name: 'Alice' })).toBe(true)
      expect(evaluateCondition('name', { name: '' })).toBe(false)
    })
  })

  describe('buildExecutionPlan', () => {
    it('returns single stage for single node', () => {
      const nodes: WorkflowNode[] = [
        { id: 'n1', type: 'manual_trigger', label: 'Start', x: 0, y: 0, data: {}, status: NodeStatus.Idle, output: null },
      ]
      const plan = buildExecutionPlan(nodes, [])
      expect(plan.stages).toHaveLength(1)
      expect(plan.stages[0]).toEqual(['n1'])
    })

    it('creates sequential stages for linear graph', () => {
      const nodes: WorkflowNode[] = [
        { id: 'n1', type: 'manual_trigger', label: 'Start', x: 0, y: 0, data: {}, status: NodeStatus.Idle, output: null },
        { id: 'n2', type: 'tool_action', label: 'Action', x: 200, y: 0, data: {}, status: NodeStatus.Idle, output: null },
        { id: 'n3', type: 'send_notification', label: 'Notify', x: 400, y: 0, data: {}, status: NodeStatus.Idle, output: null },
      ]
      const connections: WorkflowConnection[] = [
        { id: 'c1', sourceNodeId: 'n1', sourcePortId: 'out', targetNodeId: 'n2', targetPortId: 'in', status: NodeStatus.Idle },
        { id: 'c2', sourceNodeId: 'n2', sourcePortId: 'out', targetNodeId: 'n3', targetPortId: 'in', status: NodeStatus.Idle },
      ]
      const plan = buildExecutionPlan(nodes, connections)
      expect(plan.stages).toHaveLength(3)
      expect(plan.stages[0]).toEqual(['n1'])
      expect(plan.stages[1]).toEqual(['n2'])
      expect(plan.stages[2]).toEqual(['n3'])
    })

    it('groups parallel nodes in the same stage', () => {
      const nodes: WorkflowNode[] = [
        { id: 'n1', type: 'manual_trigger', label: 'Start', x: 0, y: 0, data: {}, status: NodeStatus.Idle, output: null },
        { id: 'n2', type: 'tool_action', label: 'Action A', x: 200, y: -50, data: {}, status: NodeStatus.Idle, output: null },
        { id: 'n3', type: 'tool_action', label: 'Action B', x: 200, y: 50, data: {}, status: NodeStatus.Idle, output: null },
      ]
      const connections: WorkflowConnection[] = [
        { id: 'c1', sourceNodeId: 'n1', sourcePortId: 'out', targetNodeId: 'n2', targetPortId: 'in', status: NodeStatus.Idle },
        { id: 'c2', sourceNodeId: 'n1', sourcePortId: 'out', targetNodeId: 'n3', targetPortId: 'in', status: NodeStatus.Idle },
      ]
      const plan = buildExecutionPlan(nodes, connections)
      expect(plan.stages).toHaveLength(2)
      expect(plan.stages[0]).toEqual(['n1'])
      expect(plan.stages[1]!.sort()).toEqual(['n2', 'n3'])
    })

    it('handles disconnected nodes', () => {
      const nodes: WorkflowNode[] = [
        { id: 'n1', type: 'manual_trigger', label: 'A', x: 0, y: 0, data: {}, status: NodeStatus.Idle, output: null },
        { id: 'n2', type: 'manual_trigger', label: 'B', x: 200, y: 0, data: {}, status: NodeStatus.Idle, output: null },
      ]
      const plan = buildExecutionPlan(nodes, [])
      expect(plan.stages).toHaveLength(1)
      expect(plan.stages[0]!.sort()).toEqual(['n1', 'n2'])
    })
  })

  describe('executeNode', () => {
    const ctx = { nodeOutputs: new Map(), variables: new Map() }

    function makeNode(type: string, data: Record<string, unknown> = {}): WorkflowNode {
      return { id: 'test-node', type, label: 'Test', x: 0, y: 0, data, status: NodeStatus.Idle, output: null }
    }

    it('executes trigger nodes', async () => {
      const result = await executeNode(makeNode('manual_trigger'), { hello: 'world' }, ctx)
      expect(result.success).toBe(true)
      expect(result.output).toEqual({ hello: 'world' })
    })

    it('executes tool_action nodes', async () => {
      const result = await executeNode(makeNode('tool_action', { toolName: 'test_tool', input: {} }), {}, ctx)
      expect(result.success).toBe(true)
    })

    it('executes connector_action nodes', async () => {
      const result = await executeNode(makeNode('connector_action', { connectorId: 'gmail', actionId: 'send' }), {}, ctx)
      expect(result.success).toBe(true)
      expect((result.output as Record<string, unknown>).connector).toBe('gmail')
    })

    it('executes if_else with true condition', async () => {
      const result = await executeNode(
        makeNode('if_else', { condition: 'data.value > 10' }),
        { value: 20 },
        ctx,
      )
      expect(result.success).toBe(true)
      expect((result.output as Record<string, unknown>).branch).toBe('true')
    })

    it('executes if_else with false condition', async () => {
      const result = await executeNode(
        makeNode('if_else', { condition: 'data.value > 10' }),
        { value: 5 },
        ctx,
      )
      expect(result.success).toBe(true)
      expect((result.output as Record<string, unknown>).branch).toBe('false')
    })

    it('executes merge node (passthrough)', async () => {
      const result = await executeNode(makeNode('merge'), { merged: true }, ctx)
      expect(result.success).toBe(true)
      expect(result.output).toEqual({ merged: true })
    })

    it('executes loop node with array', async () => {
      const result = await executeNode(
        makeNode('loop', { arrayField: 'data.items' }),
        { items: [1, 2, 3] },
        ctx,
      )
      expect(result.success).toBe(true)
      expect((result.output as Record<string, unknown>).items).toEqual([1, 2, 3])
      expect((result.output as Record<string, unknown>).count).toBe(3)
    })

    it('loop node fails for non-array', async () => {
      const result = await executeNode(
        makeNode('loop', { arrayField: 'data.notArray' }),
        { notArray: 'string' },
        ctx,
      )
      expect(result.success).toBe(false)
      expect(result.error).toContain('not an array')
    })

    it('executes set_variable node', async () => {
      const localCtx = { nodeOutputs: new Map(), variables: new Map() }
      const result = await executeNode(
        makeNode('set_variable', { name: 'myVar', value: 'data.count' }),
        { count: 42 },
        localCtx,
      )
      expect(result.success).toBe(true)
      expect(localCtx.variables.get('myVar')).toBe(42)
    })

    it('executes map_fields node', async () => {
      const result = await executeNode(
        makeNode('map_fields', { mapping: { old_name: 'new_name', old_email: 'new_email' } }),
        { old_name: 'Alice', old_email: 'alice@test.com' },
        ctx,
      )
      expect(result.success).toBe(true)
      expect((result.output as Record<string, unknown>).new_name).toBe('Alice')
      expect((result.output as Record<string, unknown>).new_email).toBe('alice@test.com')
    })

    it('executes aggregate sum', async () => {
      const result = await executeNode(
        makeNode('aggregate', { arrayField: 'data.numbers', operation: 'sum' }),
        { numbers: [10, 20, 30] },
        ctx,
      )
      expect(result.success).toBe(true)
      expect((result.output as Record<string, unknown>).result).toBe(60)
    })

    it('executes aggregate count', async () => {
      const result = await executeNode(
        makeNode('aggregate', { arrayField: 'data.items', operation: 'count' }),
        { items: ['a', 'b', 'c'] },
        ctx,
      )
      expect(result.success).toBe(true)
      expect((result.output as Record<string, unknown>).result).toBe(3)
    })

    it('executes aggregate avg', async () => {
      const result = await executeNode(
        makeNode('aggregate', { arrayField: 'data.nums', operation: 'avg' }),
        { nums: [10, 20, 30] },
        ctx,
      )
      expect(result.success).toBe(true)
      expect((result.output as Record<string, unknown>).result).toBe(20)
    })

    it('executes template node', async () => {
      const result = await executeNode(
        makeNode('template', { template: 'Hello {{name}}, you have {{count}} items' }),
        { name: 'Alice', count: 5 },
        ctx,
      )
      expect(result.success).toBe(true)
      expect(result.output).toBe('Hello Alice, you have 5 items')
    })

    it('returns error for unknown node type', async () => {
      const result = await executeNode(makeNode('completely_unknown'), {}, ctx)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Unknown node type')
    })

    it('executes agent_autonomous as placeholder', async () => {
      const result = await executeNode(
        makeNode('agent_autonomous', { agentId: 'a1', task: 'Do something' }),
        {},
        ctx,
      )
      expect(result.success).toBe(true)
      expect((result.output as Record<string, unknown>).status).toBe('deployed')
    })
  })
})
