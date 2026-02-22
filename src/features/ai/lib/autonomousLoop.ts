import { AgentLifecycle } from '../types'
import type { ParsedAction, ThinkingStep, PreflightResult } from '../types'
import useAgentRuntimeStore from '../stores/useAgentRuntimeStore'
import useMessageBusStore from '../stores/useMessageBusStore'
import useAgentMemoryStore from '../stores/useAgentMemoryStore'
import useRepairStore from '../stores/useRepairStore'
import useConnectorStore from '../stores/useConnectorStore'
import { buildAutonomousPrompt } from './autonomousPromptBuilder'
import { syncChat } from './llmClient'
import { classifyError, analyzeError, attemptRepair } from './selfHealingEngine'
import { executeTool, ORIGINA_TOOLS } from './toolDefinitions'
import { triggerWorkflowFromAgent } from './agentWorkflowBridge'
import { checkActionCircuit, recordActionOutcome } from './circuitBreakerEngine'
import { acquireActionLock, releaseActionLock } from './governorEngine'
import { pruneAgentMemories } from './memoryLifecycleManager'
import useCostTrackingStore from '../stores/useCostTrackingStore'
import useAgentIdentityStore from '../stores/useAgentIdentityStore'
import { countTokens } from './tokenCount'
import { emitCycleStart, emitCycleEnd, emitAgentError } from '../../clawgpt/lib/fleetTelemetry'

const DEFAULT_CYCLE_INTERVAL_MS = 30_000
const MAX_CONSECUTIVE_FAILURES = 5
const BACKOFF_BASE_MS = 1_000
const BACKOFF_MAX_MS = 30_000
const activeLoops = new Map<string, AbortController>()
const consecutiveFailures = new Map<string, number>()

// ─── Start Autonomous Loop ─────────────────────────────────────────

export function startAutonomousLoop(
  agentId: string,
  intervalMs: number = DEFAULT_CYCLE_INTERVAL_MS,
): void {
  // Don't start duplicate loops
  if (activeLoops.has(agentId)) return

  const controller = new AbortController()
  activeLoops.set(agentId, controller)

  void runLoop(agentId, intervalMs, controller.signal)
}

export function stopAutonomousLoop(agentId: string): void {
  const controller = activeLoops.get(agentId)
  if (controller) {
    controller.abort()
    activeLoops.delete(agentId)
  }
  consecutiveFailures.delete(agentId)
}

export function isLoopRunning(agentId: string): boolean {
  return activeLoops.has(agentId)
}

// ─── Core Loop ─────────────────────────────────────────────────────

async function runLoop(
  agentId: string,
  intervalMs: number,
  signal: AbortSignal,
): Promise<void> {
  const runtime = useAgentRuntimeStore.getState()
  const agent = runtime.getAgent(agentId)
  if (!agent) {
    activeLoops.delete(agentId)
    return
  }

  while (!signal.aborted) {
    const currentAgent = useAgentRuntimeStore.getState().getAgent(agentId)
    if (!currentAgent || currentAgent.lifecycle === 'retired' || currentAgent.lifecycle === 'paused') {
      break
    }

    try {
      // 1. OBSERVE — gather context
      const startTime = Date.now()
      emitCycleStart(agentId, 'observe')
      useAgentRuntimeStore.getState().setLifecycle(agentId, AgentLifecycle.Thinking)
      useAgentRuntimeStore.getState().heartbeat(agentId)

      const observeStep = await observe(agentId)
      addStep(agentId, 'observe', observeStep, Date.now() - startTime)
      emitCycleEnd(agentId, 'observe', Date.now() - startTime)

      // 2. REASON — analyze context with LLM
      const reasonStart = Date.now()
      emitCycleStart(agentId, 'reason')
      const reasoning = await reason(agentId, observeStep)
      addStep(agentId, 'reason', reasoning, Date.now() - reasonStart)
      emitCycleEnd(agentId, 'reason', Date.now() - reasonStart)

      // 3. PLAN — decide next action
      const planStart = Date.now()
      emitCycleStart(agentId, 'plan')
      const plan = await planAction(agentId, reasoning)
      addStep(agentId, 'plan', plan, Date.now() - planStart)
      emitCycleEnd(agentId, 'plan', Date.now() - planStart)

      // 4. ACT — execute or queue for approval
      const actStart = Date.now()
      emitCycleStart(agentId, 'act')
      useAgentRuntimeStore.getState().setLifecycle(agentId, AgentLifecycle.Acting)
      const result = await act(agentId, plan)
      addStep(agentId, 'act', result, Date.now() - actStart)
      emitCycleEnd(agentId, 'act', Date.now() - actStart)

      // 5. REFLECT — evaluate result, update memory
      const reflectStart = Date.now()
      emitCycleStart(agentId, 'reflect')
      await reflect(agentId, result)
      addStep(agentId, 'reflect', 'Cycle completed successfully', Date.now() - reflectStart)
      emitCycleEnd(agentId, 'reflect', Date.now() - reflectStart)

      // Reset consecutive failure counter on success
      consecutiveFailures.set(agentId, 0)

    } catch (error: unknown) {
      // 6. HEAL — self-healing on error
      useAgentRuntimeStore.getState().setLifecycle(agentId, AgentLifecycle.Healing)
      useAgentRuntimeStore.getState().incrementErrorCount(agentId)
      emitAgentError(agentId, 'cycle_error', error instanceof Error ? error.message : String(error))
      await heal(agentId, error)

      // Track consecutive failures for graceful degradation
      const failures = (consecutiveFailures.get(agentId) ?? 0) + 1
      consecutiveFailures.set(agentId, failures)

      if (failures >= MAX_CONSECUTIVE_FAILURES) {
        // Pause agent after too many consecutive failures
        useAgentRuntimeStore.getState().setLifecycle(agentId, AgentLifecycle.Paused)
        addStep(agentId, 'reflect', `Paused after ${failures} consecutive failures — manual restart required`, 0)
        emitAgentError(agentId, 'auto_paused', `Agent paused after ${failures} consecutive LLM failures`)
        activeLoops.delete(agentId)
        consecutiveFailures.delete(agentId)
        return
      }

      // Exponential backoff between retries
      const backoffMs = Math.min(BACKOFF_BASE_MS * 2 ** (failures - 1), BACKOFF_MAX_MS)
      addStep(agentId, 'reflect', `Backing off ${Math.round(backoffMs / 1000)}s after failure ${failures}/${MAX_CONSECUTIVE_FAILURES}`, 0)
      await sleep(backoffMs, signal)
    }

    // 7. WAIT — configurable interval
    useAgentRuntimeStore.getState().setLifecycle(agentId, AgentLifecycle.Waiting)
    await sleep(intervalMs, signal)
  }

  activeLoops.delete(agentId)
}

// ─── Step Implementations ──────────────────────────────────────────

async function observe(agentId: string): Promise<string> {
  // Lightweight rule-based memory pruning — zero LLM cost
  pruneAgentMemories(agentId)

  const agent = useAgentRuntimeStore.getState().getAgent(agentId)
  if (!agent) return 'Agent not found'

  const unread = useMessageBusStore.getState().getUnread(agentId)
  const activeGoals = agent.goalStack.filter((g) => g.status === 'active')

  const observations: string[] = []
  observations.push(`Active goals: ${activeGoals.length}`)
  observations.push(`Unread messages: ${unread.length}`)
  observations.push(`Error count: ${agent.errorCount}`)

  if (unread.length > 0) {
    observations.push('Messages:')
    for (const msg of unread.slice(0, 5)) {
      observations.push(`  - [${msg.priority}] ${msg.fromAgentId}: ${msg.content.slice(0, 100)}`)
      useMessageBusStore.getState().acknowledge(agentId, msg.id)
    }
  }

  return observations.join('\n')
}

async function reason(agentId: string, observations: string): Promise<string> {
  const agent = useAgentRuntimeStore.getState().getAgent(agentId)
  if (!agent) return 'Agent not found'

  const memories = useAgentMemoryStore.getState().getAgentMemories(agentId)
  const connectors = agent.connectorIds.map((id) => useConnectorStore.getState().getConnector(id)).filter((c): c is NonNullable<typeof c> => c !== undefined)
  const recentMessages = useMessageBusStore.getState().getUnread(agentId)
  const recentRepairs = useRepairStore.getState().getRepairsByAgent(agentId)

  const systemPrompt = buildAutonomousPrompt(agent, memories, connectors, recentMessages, recentRepairs)

  const userContent = `Current observations:\n${observations}\n\nAnalyze the situation and determine what actions should be taken next. Be specific about which tools or connectors to use.`
  const result = await syncChat({
    messages: [{ role: 'user', content: userContent }],
    systemPrompt,
    maxTokens: 512,
  })

  // Track cost of LLM call
  const inputTokens = countTokens(systemPrompt + userContent)
  const outputTokens = result ? countTokens(result) : 0
  useCostTrackingStore.getState().recordUsage(
    agentId, 'llm', 'reason',
    { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
    (inputTokens * 0.003 + outputTokens * 0.015) / 1000, // TODO: Use real pricing from server response
  )

  return result ?? 'No reasoning available — LLM may be in demo mode.'
}

async function planAction(agentId: string, reasoning: string): Promise<string> {
  const agent = useAgentRuntimeStore.getState().getAgent(agentId)
  if (!agent) return JSON.stringify([{ type: 'none', params: {}, description: 'Agent not found' }])

  // Build context about available connectors and tools
  const connectors = agent.connectorIds
    .map((id) => useConnectorStore.getState().getConnector(id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)

  const tools = ORIGINA_TOOLS

  const connectorContext = connectors.length > 0
    ? connectors.map((c) => `Connector "${c.name}" (id: ${c.id}, status: ${c.status}): actions=[${c.actions.map((a) => `${a.id}: ${a.name}`).join(', ')}]`).join('\n')
    : 'No connectors available.'

  const toolContext = tools.length > 0
    ? tools.map((t) => `Tool "${t.name}": ${t.description}`).join('\n')
    : 'No tools available.'

  const planPrompt = `Given the following reasoning about the current situation, output a JSON array of actions to take.

Reasoning:
${reasoning}

Available connectors:
${connectorContext}

Available tools:
${toolContext}

Each action in the array must be a JSON object with these fields:
- "type": one of "connector", "tool", "workflow", "message", "none"
- "connectorId": (for connector type) the connector id
- "actionId": (for connector type) the action id
- "toolName": (for tool type) the tool name
- "workflowId": (for workflow type) the workflow id
- "params": object of parameters
- "description": brief description of what this action does

If no action is needed, return: [{"type":"none","params":{},"description":"No action needed"}]

Respond ONLY with the JSON array, no markdown fences or explanation.`

  const result = await syncChat({
    messages: [{ role: 'user', content: planPrompt }],
    maxTokens: 512,
  })

  // Track cost of LLM call
  const planInputTokens = countTokens(planPrompt)
  const planOutputTokens = result ? countTokens(result) : 0
  useCostTrackingStore.getState().recordUsage(
    agentId, 'llm', 'plan',
    { inputTokens: planInputTokens, outputTokens: planOutputTokens, totalTokens: planInputTokens + planOutputTokens },
    (planInputTokens * 0.003 + planOutputTokens * 0.015) / 1000, // TODO: Use real pricing from server response
  )

  if (!result) {
    return JSON.stringify([{ type: 'none', params: {}, description: reasoning }])
  }

  // Try to parse the response as JSON
  try {
    const parsed: unknown = JSON.parse(result)
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Validate each item has at minimum type and description
      const actions = (parsed as Record<string, unknown>[]).map((item): ParsedAction => ({
        type: (typeof item.type === 'string' && ['connector', 'tool', 'workflow', 'message', 'none'].includes(item.type))
          ? item.type as ParsedAction['type']
          : 'none',
        connectorId: typeof item.connectorId === 'string' ? item.connectorId : undefined,
        actionId: typeof item.actionId === 'string' ? item.actionId : undefined,
        toolName: typeof item.toolName === 'string' ? item.toolName : undefined,
        workflowId: typeof item.workflowId === 'string' ? item.workflowId : undefined,
        params: (item.params !== null && typeof item.params === 'object' && !Array.isArray(item.params))
          ? item.params as Record<string, unknown>
          : {},
        description: typeof item.description === 'string' ? item.description : 'No description',
      }))
      return JSON.stringify(actions)
    }
  } catch {
    // JSON parse failed — fall through
  }

  // Fallback: wrap raw reasoning as a no-op action
  return JSON.stringify([{ type: 'none', params: {}, description: result }])
}

async function act(agentId: string, plan: string): Promise<string> {
  const agent = useAgentRuntimeStore.getState().getAgent(agentId)
  if (!agent) return 'Agent not found'

  // Deserialize the action plan
  let actions: ParsedAction[]
  try {
    const parsed: unknown = JSON.parse(plan)
    actions = Array.isArray(parsed) ? parsed as ParsedAction[] : []
  } catch {
    return `Could not parse action plan: ${plan.slice(0, 200)}`
  }

  if (actions.length === 0) {
    return 'No actions to execute'
  }

  // For suggest/ask_first modes, queue for approval instead of executing
  if (agent.autonomyMode !== 'full_auto') {
    const descriptions = actions.map((a) => `[${a.type}] ${a.description}`).join('; ')
    useAgentRuntimeStore.getState().queueApproval(
      agentId,
      'execute_plan',
      descriptions.slice(0, 500),
    )
    return 'Action queued for user approval'
  }

  // Full auto: execute each action and collect results
  const results: string[] = []

  for (const action of actions) {
    // ── PRE-FLIGHT CHECKS ──────────────────────────────────────────
    const preflight = runPreflightChecks(agentId, action)
    if (!preflight.allowed) {
      useAgentRuntimeStore.getState().queueApproval(
        agentId, 'preflight_blocked',
        `Blocked: ${preflight.blockingReason} — [${action.type}] ${action.description}`,
      )
      results.push(`BLOCKED: ${preflight.blockingReason}`)
      continue
    }

    // ── ACQUIRE LOCK ───────────────────────────────────────────────
    const topGoal = agent.goalStack[0]
    const priority = topGoal ? topGoal.priority : 1
    const lock = acquireActionLock(action, agentId, priority)
    if (!lock.allowed) {
      results.push(`LOCK_DENIED: ${lock.reason}`)
      continue
    }

    try {
      switch (action.type) {
        case 'connector': {
          if (action.connectorId && action.actionId) {
            const result = await useConnectorStore.getState().execute(
              action.connectorId,
              action.actionId,
              action.params,
            )
            results.push(`Connector(${action.connectorId}/${action.actionId}): ${result}`)
          } else {
            results.push(`Connector action skipped — missing connectorId or actionId`)
          }
          break
        }

        case 'tool': {
          if (action.toolName) {
            const result = executeTool(action.toolName, action.params)
            results.push(`Tool(${action.toolName}): ${result}`)
          } else {
            results.push(`Tool action skipped — missing toolName`)
          }
          break
        }

        case 'workflow': {
          if (action.workflowId) {
            triggerWorkflowFromAgent(agentId, action.workflowId)
            results.push(`Workflow(${action.workflowId}): triggered`)
          } else {
            results.push(`Workflow action skipped — missing workflowId`)
          }
          break
        }

        case 'message': {
          const topic = typeof action.params.topic === 'string' ? action.params.topic : 'coordination.handoff'
          useMessageBusStore.getState().publish(agentId, topic, action.description)
          results.push(`Message(${topic}): published`)
          break
        }

        case 'none':
        default: {
          results.push(`No-op: ${action.description}`)
          break
        }
      }

      // ── RECORD SUCCESS ─────────────────────────────────────────
      if (action.type === 'connector' && action.connectorId) {
        recordActionOutcome(action, true)
      }
      // Record tool/connector cost
      useCostTrackingStore.getState().recordUsage(
        agentId,
        action.type === 'connector' ? 'connector' : 'tool',
        `${action.type}:${action.toolName ?? action.connectorId ?? 'unknown'}`,
        null,
        action.type === 'connector' ? 0.001 : 0.0001,
      )
    } finally {
      releaseActionLock(action, agentId)
    }
  }

  return results.join('\n')
}

async function reflect(agentId: string, result: string): Promise<void> {
  // Store observation in agent memory
  if (result && result !== 'Agent not found') {
    useAgentMemoryStore.getState().remember(
      agentId,
      result.slice(0, 500),
      'workflows',
      `Cycle result: ${new Date().toISOString()}`,
    )
  }

  // Publish outcome to message bus
  useMessageBusStore.getState().publish(
    agentId,
    'coordination.handoff',
    `Agent completed cycle: ${result.slice(0, 200)}`,
  )
}

async function heal(agentId: string, error: unknown): Promise<void> {
  const errorType = classifyError(error)
  const agent = useAgentRuntimeStore.getState().getAgent(agentId)
  const agentContext = agent ? `Agent: ${agent.name}, Goals: ${agent.goalStack.length}` : ''

  const record = await analyzeError(error, agentId, agentContext)
  const repairId = useRepairStore.getState().addRepair(record)

  const repaired = await attemptRepair({ ...record, id: repairId })
  useRepairStore.getState().updateRepair(repairId, {
    status: repaired.status,
    repairAction: repaired.repairAction,
    resolvedAt: repaired.resolvedAt,
  })

  // Record circuit breaker outcome for connector errors
  if (record.context?.connectorId) {
    recordActionOutcome(
      { type: 'connector', connectorId: record.context.connectorId, params: {}, description: '' },
      repaired.status === 'resolved',
    )
  }

  // Report healing to message bus
  useMessageBusStore.getState().publish(
    agentId,
    'healing.report',
    `Self-healing ${repaired.status}: ${errorType} — ${repaired.repairAction.slice(0, 200)}`,
  )

  addStep(agentId, 'reflect', `Self-healing: ${repaired.status} — ${errorType}`, 0)
}

// ─── Pre-Flight Checks ────────────────────────────────────────────

function runPreflightChecks(agentId: string, action: ParsedAction): PreflightResult {
  const result: PreflightResult = {
    allowed: true,
    checks: {
      circuitBreaker: null,
      budget: null,
      contract: null,
      governor: null,
    },
    blockingReason: null,
  }

  // 1. Circuit breaker check
  const circuitCheck = checkActionCircuit(action)
  result.checks.circuitBreaker = circuitCheck
  if (circuitCheck && !circuitCheck.allowed) {
    result.allowed = false
    result.blockingReason = `Circuit breaker: ${circuitCheck.reason}`
    return result
  }

  // 2. Budget check
  const estimatedTokens = action.type === 'connector' ? 0 : 50
  const estimatedCost = action.type === 'connector' ? 0.001 : 0.0001
  const budgetCheck = useCostTrackingStore.getState().checkBudget(agentId, estimatedTokens, estimatedCost)
  result.checks.budget = budgetCheck
  if (!budgetCheck.allowed) {
    result.allowed = false
    result.blockingReason = `Budget: ${budgetCheck.reason}`
    return result
  }

  // 3. Contract check
  const identities = useAgentIdentityStore.getState()
  const allIdentities = Array.from(identities.identities.values())
  const identity = allIdentities.find((i) => i.id === agentId || i.displayName === agentId)
  if (identity) {
    const contractCheck = identities.checkContract(identity.id, action)
    result.checks.contract = contractCheck
    if (!contractCheck.allowed) {
      identities.recordContractViolation(identity.id)
      result.allowed = false
      result.blockingReason = `Contract: ${contractCheck.reason}`
      return result
    }
  }

  return result
}

// ─── Helpers ────────────────────────────────────────────────────────

function addStep(
  agentId: string,
  type: ThinkingStep['type'],
  content: string,
  durationMs: number,
): void {
  useAgentRuntimeStore.getState().addThinkingStep(agentId, {
    type,
    content,
    durationMs,
  })
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)
    const onAbort = () => {
      clearTimeout(timer)
      resolve()
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}
