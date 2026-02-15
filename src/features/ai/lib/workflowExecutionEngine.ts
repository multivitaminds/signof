import type { Workflow, WorkflowNode, WorkflowConnection, ExecutionEvent, NodeResult } from '../types'
import { getNodeDefinition } from './nodeDefinitions'
import { executeTool } from './toolDefinitions'
import { syncChat } from './llmClient'
import useConnectorStore from '../stores/useConnectorStore'
import { deployAgentFromWorkflow } from './agentWorkflowBridge'

// ─── Types ──────────────────────────────────────────────────────────

interface ExecutionPlan {
  stages: string[][]  // each stage is a list of node IDs that can run in parallel
}

interface ExecutionContext {
  nodeOutputs: Map<string, unknown>
  variables: Map<string, unknown>
}

// ─── Expression Evaluator ───────────────────────────────────────────

export function evaluateExpression(expr: string, context: Record<string, unknown>): unknown {
  if (!expr || expr.trim() === '') return undefined

  // Simple path-based evaluation: "data.field.subfield"
  const parts = expr.split('.')
  let current: unknown = context
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return current
}

export function evaluateCondition(expr: string, context: Record<string, unknown>): boolean {
  // Support simple comparisons: "field === value", "field !== value", "field > value"
  const operators = ['===', '!==', '>=', '<=', '>', '<'] as const
  for (const op of operators) {
    if (expr.includes(op)) {
      const [leftExpr, rightExpr] = expr.split(op).map((s) => s.trim())
      if (!leftExpr || !rightExpr) continue
      const left = evaluateExpression(leftExpr, context)
      // Try to parse right side as literal
      let right: unknown = rightExpr
      if (rightExpr === 'true') right = true
      else if (rightExpr === 'false') right = false
      else if (rightExpr === 'null') right = null
      else if (rightExpr.startsWith('"') && rightExpr.endsWith('"')) right = rightExpr.slice(1, -1)
      else if (rightExpr.startsWith("'") && rightExpr.endsWith("'")) right = rightExpr.slice(1, -1)
      else if (!isNaN(Number(rightExpr))) right = Number(rightExpr)
      else right = evaluateExpression(rightExpr, context)

      switch (op) {
        case '===': return left === right
        case '!==': return left !== right
        case '>=': return Number(left) >= Number(right)
        case '<=': return Number(left) <= Number(right)
        case '>': return Number(left) > Number(right)
        case '<': return Number(left) < Number(right)
      }
    }
  }

  // Truthy check
  const val = evaluateExpression(expr, context)
  return Boolean(val)
}

// ─── Template Rendering ─────────────────────────────────────────────

function renderTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_match, path: string) => {
    const value = evaluateExpression(path, data)
    return value !== undefined && value !== null ? String(value) : ''
  })
}

// ─── Build Execution Plan ───────────────────────────────────────────

export function buildExecutionPlan(
  nodes: WorkflowNode[],
  connections: WorkflowConnection[],
): ExecutionPlan {
  // Build adjacency list and in-degree map
  const inDegree = new Map<string, number>()
  const adjacency = new Map<string, string[]>()

  for (const node of nodes) {
    inDegree.set(node.id, 0)
    adjacency.set(node.id, [])
  }

  for (const conn of connections) {
    const targets = adjacency.get(conn.sourceNodeId) ?? []
    targets.push(conn.targetNodeId)
    adjacency.set(conn.sourceNodeId, targets)
    inDegree.set(conn.targetNodeId, (inDegree.get(conn.targetNodeId) ?? 0) + 1)
  }

  // Kahn's algorithm for topological sort with parallel stages
  const stages: string[][] = []
  let queue = nodes
    .filter((n) => (inDegree.get(n.id) ?? 0) === 0)
    .map((n) => n.id)

  while (queue.length > 0) {
    stages.push([...queue])
    const nextQueue: string[] = []

    for (const nodeId of queue) {
      const neighbors = adjacency.get(nodeId) ?? []
      for (const neighbor of neighbors) {
        const deg = (inDegree.get(neighbor) ?? 1) - 1
        inDegree.set(neighbor, deg)
        if (deg === 0) {
          nextQueue.push(neighbor)
        }
      }
    }

    queue = nextQueue
  }

  return { stages }
}

// ─── Schema Validation ──────────────────────────────────────────────

function validateAgainstSchema(data: unknown, schema: Record<string, unknown> | undefined): string | null {
  if (!schema || typeof data !== 'object' || data === null) {
    if (schema && (typeof data !== 'object' || data === null)) {
      return 'Expected an object but got ' + typeof data
    }
    return null
  }
  const obj = data as Record<string, unknown>
  const required = (schema.required as string[]) ?? []
  const properties = (schema.properties as Record<string, { type?: string }>) ?? {}

  const errors: string[] = []
  for (const key of required) {
    if (!(key in obj)) {
      errors.push(`Missing required field: ${key}`)
    }
  }

  for (const [key, value] of Object.entries(obj)) {
    const propDef = properties[key]
    if (propDef?.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value
      if (actualType !== propDef.type && !(propDef.type === 'integer' && typeof value === 'number')) {
        errors.push(`Field "${key}" expected type "${propDef.type}" but got "${actualType}"`)
      }
    }
  }

  return errors.length > 0 ? errors.join('; ') : null
}

// ─── Node Execution ─────────────────────────────────────────────────

export async function executeNode(
  node: WorkflowNode,
  inputData: unknown,
  context: ExecutionContext,
): Promise<NodeResult> {
  const def = getNodeDefinition(node.type)
  if (!def) {
    return { success: false, output: null, error: `Unknown node type: ${node.type}` }
  }

  try {
    switch (node.type) {
      // ── Triggers ────────────────────────────────────────────────
      case 'manual_trigger':
      case 'schedule_trigger':
      case 'webhook_trigger':
      case 'event_trigger':
      case 'connector_trigger':
        return { success: true, output: inputData ?? {} }

      // ── Actions ─────────────────────────────────────────────────
      case 'tool_action': {
        const toolName = node.data.toolName as string
        const toolInput = (node.data.input as Record<string, unknown>) ?? {}
        const merged = { ...toolInput, ...(typeof inputData === 'object' && inputData !== null ? inputData as Record<string, unknown> : {}) }
        const result = executeTool(toolName, merged)
        return { success: true, output: JSON.parse(result) }
      }

      case 'connector_action': {
        const connectorId = node.data.connectorId as string
        const actionId = node.data.actionId as string
        const nodeParams = (node.data.params as Record<string, unknown>) ?? {}
        const mergedParams = {
          ...(typeof inputData === 'object' && inputData !== null ? inputData as Record<string, unknown> : {}),
          ...nodeParams,
        }
        const resultStr = useConnectorStore.getState().mockExecute(connectorId, actionId, mergedParams)
        const parsed = JSON.parse(resultStr) as Record<string, unknown>
        if (parsed.success === false) {
          return { success: false, output: parsed, error: parsed.error as string }
        }
        return { success: true, output: parsed }
      }

      case 'http_request': {
        const data = (typeof inputData === 'object' && inputData !== null ? inputData : {}) as Record<string, unknown>
        const url = renderTemplate((node.data.url as string) ?? '', data)
        const rawBody = node.data.body
        const bodyStr = typeof rawBody === 'string' ? renderTemplate(rawBody, data) : (rawBody ? JSON.stringify(rawBody) : undefined)
        const method = (node.data.method as string) ?? 'GET'
        const timeoutMs = (node.data.timeout as number) ?? 30000
        const maxRetries = (node.data.retries as number) ?? 0

        let lastError = ''
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
          try {
            const response = await fetch(url, {
              method,
              headers: typeof node.data.headers === 'object' && node.data.headers !== null
                ? node.data.headers as Record<string, string>
                : undefined,
              body: method !== 'GET' && bodyStr ? bodyStr : undefined,
              signal: controller.signal,
            })
            clearTimeout(timeoutId)

            if (response.status === 429 && attempt < maxRetries) {
              const retryAfter = response.headers.get('Retry-After')
              const waitMs = retryAfter ? Math.min(parseInt(retryAfter, 10) * 1000, 10000) : 5000
              await new Promise((resolve) => setTimeout(resolve, waitMs))
              continue
            }

            const text = await response.text()
            let parsed: unknown = text
            try { parsed = JSON.parse(text) } catch { /* use raw text */ }
            return { success: response.ok, output: parsed, error: response.ok ? undefined : `HTTP ${response.status}` }
          } catch (err: unknown) {
            clearTimeout(timeoutId)
            lastError = err instanceof Error ? err.message : 'HTTP request failed'
            if (attempt < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, Math.min(1000 * 2 ** attempt, 8000)))
              continue
            }
          }
        }
        return { success: false, output: null, error: lastError }
      }

      case 'send_notification': {
        const toolResult = executeTool('send_notification', {
          title: node.data.title as string,
          message: node.data.message as string,
        })
        return { success: true, output: JSON.parse(toolResult) }
      }

      // ── Agent Nodes ─────────────────────────────────────────────
      case 'agent_think': {
        const prompt = node.data.prompt as string
        const systemPrompt = (node.data.systemPrompt as string) || undefined
        const dataStr = typeof inputData === 'string' ? inputData : JSON.stringify(inputData ?? {})
        const result = await syncChat({
          messages: [{ role: 'user', content: `${prompt}\n\nInput data:\n${dataStr}` }],
          systemPrompt,
          maxTokens: (node.data.maxTokens as number) ?? 1024,
        })
        return { success: true, output: result ?? '' }
      }

      case 'agent_classify': {
        const categories = (node.data.categories as string).split(',').map((c) => c.trim())
        const inputField = (node.data.inputField as string) || 'content'
        const content = typeof inputData === 'object' && inputData !== null
          ? (inputData as Record<string, unknown>)[inputField]
          : inputData
        const result = await syncChat({
          messages: [{
            role: 'user',
            content: `Classify the following into exactly one of these categories: ${categories.join(', ')}\n\nInput: ${String(content)}\n\nRespond with only the category name.`,
          }],
        })
        return { success: true, output: { category: result?.trim() ?? 'unknown', input: content } }
      }

      case 'agent_extract': {
        const schema = node.data.schema as Record<string, unknown> | undefined
        const schemaStr = JSON.stringify(schema)
        const instructions = (node.data.instructions as string) || ''
        const result = await syncChat({
          messages: [{
            role: 'user',
            content: `Extract structured data from the following input according to this schema: ${schemaStr}\n${instructions ? `Instructions: ${instructions}\n` : ''}\nInput: ${JSON.stringify(inputData)}\n\nRespond with only valid JSON.`,
          }],
        })
        let parsed: unknown = result
        try { if (result) parsed = JSON.parse(result) } catch { /* use raw */ }

        // Validate against schema
        const validationError = validateAgainstSchema(parsed, schema)
        if (validationError) {
          // Retry once with explicit error feedback
          const retryResult = await syncChat({
            messages: [{
              role: 'user',
              content: `Your previous response had validation errors: ${validationError}\n\nPlease extract structured data from this input according to this schema: ${schemaStr}\n${instructions ? `Instructions: ${instructions}\n` : ''}\nInput: ${JSON.stringify(inputData)}\n\nRespond with ONLY valid JSON matching the schema exactly.`,
            }],
          })
          let retryParsed: unknown = retryResult
          try { if (retryResult) retryParsed = JSON.parse(retryResult) } catch { /* use raw */ }
          const retryError = validateAgainstSchema(retryParsed, schema)
          if (retryError) {
            return { success: false, output: retryParsed, error: `Schema validation failed: ${retryError}` }
          }
          return { success: true, output: retryParsed }
        }

        return { success: true, output: parsed }
      }

      case 'agent_autonomous': {
        const deployedId = deployAgentFromWorkflow(node.data)
        if (!deployedId) {
          return { success: false, output: null, error: 'Failed to deploy agent — missing agentId in node data' }
        }
        return {
          success: true,
          output: {
            agentId: deployedId,
            task: node.data.task,
            status: 'deployed',
          },
        }
      }

      // ── Logic Nodes ─────────────────────────────────────────────
      case 'if_else': {
        const ctx = { data: inputData as Record<string, unknown>, ...Object.fromEntries(context.variables) }
        const result = evaluateCondition(node.data.condition as string, ctx)
        return { success: true, output: { branch: result ? 'true' : 'false', data: inputData } }
      }

      case 'switch': {
        const field = node.data.field as string
        const cases = node.data.cases as string[]
        const ctx = { data: inputData as Record<string, unknown>, ...Object.fromEntries(context.variables) }
        const value = evaluateExpression(field, ctx)
        const matchIndex = cases.findIndex((c) => c === String(value))
        const branch = matchIndex >= 0 ? `case_${matchIndex}` : 'default'
        return { success: true, output: { branch, data: inputData } }
      }

      case 'merge': {
        return { success: true, output: inputData }
      }

      case 'loop': {
        const arrayField = node.data.arrayField as string
        const ctx = { data: inputData as Record<string, unknown> }
        const arr = evaluateExpression(arrayField, ctx)
        if (!Array.isArray(arr)) {
          return { success: false, output: null, error: `${arrayField} is not an array` }
        }
        return { success: true, output: { items: arr, count: arr.length } }
      }

      case 'delay': {
        const duration = (node.data.duration as number) ?? 5
        await new Promise((resolve) => setTimeout(resolve, duration * 1000))
        return { success: true, output: inputData }
      }

      // ── Transform Nodes ─────────────────────────────────────────
      case 'set_variable': {
        const name = node.data.name as string
        const ctx = { data: inputData as Record<string, unknown>, ...Object.fromEntries(context.variables) }
        const value = evaluateExpression(node.data.value as string, ctx)
        context.variables.set(name, value)
        return { success: true, output: { ...((typeof inputData === 'object' && inputData !== null ? inputData : {}) as Record<string, unknown>), [name]: value } }
      }

      case 'map_fields': {
        const mapping = node.data.mapping as Record<string, string>
        const input = (typeof inputData === 'object' && inputData !== null ? inputData : {}) as Record<string, unknown>
        const output: Record<string, unknown> = {}
        for (const [oldKey, newKey] of Object.entries(mapping)) {
          output[newKey] = input[oldKey]
        }
        return { success: true, output }
      }

      case 'filter': {
        const arrField = node.data.arrayField as string
        const ctx = { data: inputData as Record<string, unknown> }
        const items = evaluateExpression(arrField, ctx)
        if (!Array.isArray(items)) {
          return { success: false, output: null, error: `${arrField} is not an array` }
        }
        // Simple filter — evaluate condition per item
        const condition = node.data.condition as string
        const filtered = items.filter((item) => {
          const itemCtx = { item: item as Record<string, unknown>, data: inputData as Record<string, unknown> }
          return evaluateCondition(condition, itemCtx)
        })
        return { success: true, output: filtered }
      }

      case 'aggregate': {
        const aggField = node.data.arrayField as string
        const operation = node.data.operation as string
        const valueField = node.data.field as string
        const ctx = { data: inputData as Record<string, unknown> }
        const items = evaluateExpression(aggField, ctx)
        if (!Array.isArray(items)) {
          return { success: false, output: null, error: `${aggField} is not an array` }
        }
        const values = valueField
          ? items.map((item) => Number((item as Record<string, unknown>)[valueField]))
          : items.map(Number)

        let result: number
        switch (operation) {
          case 'sum': result = values.reduce((a, b) => a + b, 0); break
          case 'count': result = items.length; break
          case 'avg': result = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0; break
          case 'min': result = values.length > 0 ? Math.min(...values) : 0; break
          case 'max': result = values.length > 0 ? Math.max(...values) : 0; break
          default: result = items.length
        }
        return { success: true, output: { result, operation, count: items.length } }
      }

      case 'template': {
        const tpl = node.data.template as string
        const data = (typeof inputData === 'object' && inputData !== null ? inputData : {}) as Record<string, unknown>
        const rendered = renderTemplate(tpl, data)
        return { success: true, output: rendered }
      }

      default:
        return { success: false, output: null, error: `Unhandled node type: ${node.type}` }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Node execution failed'
    return { success: false, output: null, error: msg }
  }
}

// ─── Get Output Port for Branching ──────────────────────────────────

function getOutputPort(node: WorkflowNode, result: NodeResult): string {
  if (node.type === 'if_else' && typeof result.output === 'object' && result.output !== null) {
    return (result.output as Record<string, unknown>).branch as string ?? 'true'
  }
  if (node.type === 'switch' && typeof result.output === 'object' && result.output !== null) {
    return (result.output as Record<string, unknown>).branch as string ?? 'default'
  }
  if (node.type === 'loop') {
    return 'item' // 'done' handled after iteration
  }
  return 'out'
}

// ─── Workflow Execution ─────────────────────────────────────────────

export async function* executeWorkflow(
  workflow: Workflow,
): AsyncGenerator<ExecutionEvent> {
  const plan = buildExecutionPlan(workflow.nodes, workflow.connections)
  const context: ExecutionContext = {
    nodeOutputs: new Map(),
    variables: new Map(),
  }

  // Build a map of connections by source for routing
  const connectionsBySource = new Map<string, WorkflowConnection[]>()
  for (const conn of workflow.connections) {
    const existing = connectionsBySource.get(conn.sourceNodeId) ?? []
    existing.push(conn)
    connectionsBySource.set(conn.sourceNodeId, existing)
  }

  // Build a map of connections by target for input gathering
  const connectionsByTarget = new Map<string, WorkflowConnection[]>()
  for (const conn of workflow.connections) {
    const existing = connectionsByTarget.get(conn.targetNodeId) ?? []
    existing.push(conn)
    connectionsByTarget.set(conn.targetNodeId, existing)
  }

  for (const stage of plan.stages) {
    for (const nodeId of stage) {
      const node = workflow.nodes.find((n) => n.id === nodeId)
      if (!node) continue

      // Gather input from upstream nodes
      const incomingConns = connectionsByTarget.get(nodeId) ?? []
      let inputData: unknown = null
      if (incomingConns.length === 1) {
        const conn = incomingConns[0]
        if (conn) {
          inputData = context.nodeOutputs.get(conn.sourceNodeId)
          if (typeof inputData === 'object' && inputData !== null && 'data' in (inputData as Record<string, unknown>)) {
            inputData = (inputData as Record<string, unknown>).data
          }
        }
      } else if (incomingConns.length > 1) {
        const merged: Record<string, unknown> = {}
        for (const conn of incomingConns) {
          const output = context.nodeOutputs.get(conn.sourceNodeId)
          if (typeof output === 'object' && output !== null) {
            Object.assign(merged, output)
          }
        }
        inputData = merged
      }

      yield {
        nodeId,
        type: 'start' as const,
        data: null,
        timestamp: new Date().toISOString(),
      }

      const result = await executeNode(node, inputData, context)
      context.nodeOutputs.set(nodeId, result.output)

      if (result.success) {
        const outputPort = getOutputPort(node, result)
        const outConns = connectionsBySource.get(nodeId) ?? []
        for (const conn of outConns) {
          if (conn.sourcePortId !== outputPort && (node.type === 'if_else' || node.type === 'switch')) {
            context.nodeOutputs.set(`${nodeId}:skip:${conn.targetNodeId}`, true)
          }
        }

        yield {
          nodeId,
          type: 'complete' as const,
          data: result.output,
          timestamp: new Date().toISOString(),
        }
      } else {
        yield {
          nodeId,
          type: 'error' as const,
          data: result.error,
          timestamp: new Date().toISOString(),
        }
      }
    }
  }
}
