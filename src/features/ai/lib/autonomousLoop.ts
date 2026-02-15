import { AgentLifecycle } from '../types'
import type { ThinkingStep } from '../types'
import useAgentRuntimeStore from '../stores/useAgentRuntimeStore'
import useMessageBusStore from '../stores/useMessageBusStore'
import useAgentMemoryStore from '../stores/useAgentMemoryStore'
import useRepairStore from '../stores/useRepairStore'
import useConnectorStore from '../stores/useConnectorStore'
import { buildAutonomousPrompt } from './autonomousPromptBuilder'
import { syncChat } from './llmClient'
import { classifyError, analyzeError, attemptRepair } from './selfHealingEngine'

const DEFAULT_CYCLE_INTERVAL_MS = 30_000
const activeLoops = new Map<string, AbortController>()

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
    if (!currentAgent || currentAgent.lifecycle === 'retired') {
      break
    }

    try {
      // 1. OBSERVE — gather context
      const startTime = Date.now()
      useAgentRuntimeStore.getState().setLifecycle(agentId, AgentLifecycle.Thinking)
      useAgentRuntimeStore.getState().heartbeat(agentId)

      const observeStep = await observe(agentId)
      addStep(agentId, 'observe', observeStep, Date.now() - startTime)

      // 2. REASON — analyze context with LLM
      const reasonStart = Date.now()
      const reasoning = await reason(agentId, observeStep)
      addStep(agentId, 'reason', reasoning, Date.now() - reasonStart)

      // 3. PLAN — decide next action
      const planStart = Date.now()
      const plan = await planAction(agentId, reasoning)
      addStep(agentId, 'plan', plan, Date.now() - planStart)

      // 4. ACT — execute or queue for approval
      const actStart = Date.now()
      useAgentRuntimeStore.getState().setLifecycle(agentId, AgentLifecycle.Acting)
      const result = await act(agentId, plan)
      addStep(agentId, 'act', result, Date.now() - actStart)

      // 5. REFLECT — evaluate result, update memory
      const reflectStart = Date.now()
      await reflect(agentId, result)
      addStep(agentId, 'reflect', 'Cycle completed successfully', Date.now() - reflectStart)

    } catch (error: unknown) {
      // 6. HEAL — self-healing on error
      useAgentRuntimeStore.getState().setLifecycle(agentId, AgentLifecycle.Healing)
      useAgentRuntimeStore.getState().incrementErrorCount(agentId)
      await heal(agentId, error)
    }

    // 7. WAIT — configurable interval
    useAgentRuntimeStore.getState().setLifecycle(agentId, AgentLifecycle.Waiting)
    await sleep(intervalMs, signal)
  }

  activeLoops.delete(agentId)
}

// ─── Step Implementations ──────────────────────────────────────────

async function observe(agentId: string): Promise<string> {
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

  const result = await syncChat({
    messages: [{
      role: 'user',
      content: `Current observations:\n${observations}\n\nAnalyze the situation and determine what actions should be taken next. Be specific about which tools or connectors to use.`,
    }],
    systemPrompt,
    maxTokens: 512,
  })

  return result ?? 'No reasoning available — LLM may be in demo mode.'
}

async function planAction(_agentId: string, reasoning: string): Promise<string> {
  // In a full implementation, this would parse the LLM's reasoning to extract
  // specific tool calls or connector actions. For now, return the plan as text.
  return reasoning
}

async function act(agentId: string, plan: string): Promise<string> {
  const agent = useAgentRuntimeStore.getState().getAgent(agentId)
  if (!agent) return 'Agent not found'

  if (agent.autonomyMode === 'full_auto') {
    // Execute directly — in full implementation, parse plan for tool calls
    return `Executed plan: ${plan.slice(0, 200)}`
  }

  // Queue for approval
  useAgentRuntimeStore.getState().queueApproval(
    agentId,
    'execute_plan',
    plan.slice(0, 500),
  )
  return 'Action queued for user approval'
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

  // Report healing to message bus
  useMessageBusStore.getState().publish(
    agentId,
    'healing.report',
    `Self-healing ${repaired.status}: ${errorType} — ${repaired.repairAction.slice(0, 200)}`,
  )

  addStep(agentId, 'reflect', `Self-healing: ${repaired.status} — ${errorType}`, 0)
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
