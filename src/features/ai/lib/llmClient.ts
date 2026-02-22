import useLLMConfigStore from '../stores/useLLMConfigStore'
import { useMemoryStore } from '../stores/useMemoryStore'
import { AGENT_DEFINITIONS } from './agentDefinitions'
import type { AgentType } from '../types'

// ─── Types ──────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ToolUseBlock {
  id: string
  name: string
  input: Record<string, unknown>
}

export interface StreamChatOptions {
  messages: ChatMessage[]
  systemPrompt?: string
  provider?: string
  model?: string
  maxTokens?: number
  tools?: unknown[]
}

export interface StreamChatCallbacks {
  onText: (text: string) => void
  onToolUse: (toolUse: ToolUseBlock) => void
  onError: (error: string) => void
  onDone: () => void
}

export interface AgentStepCallbacks {
  onStepStart: (stepIndex: number) => void
  onStepComplete: (stepIndex: number, output: string) => void
  onStepStreaming?: (stepIndex: number, partialText: string) => void
  onAllComplete: (summary: string) => void
  onError: (stepIndex: number, error: string) => void
}

// ─── Helpers ────────────────────────────────────────────────────────

const STEP_TIMEOUT_MS = 30_000

function getConfigFromStore(): { provider: string; model: string } {
  const state = useLLMConfigStore.getState()
  return { provider: state.provider, model: state.model }
}

// ─── isLLMAvailable ─────────────────────────────────────────────────

export function isLLMAvailable(): boolean {
  return useLLMConfigStore.getState().mode === 'live'
}

// ─── streamChat ─────────────────────────────────────────────────────

export async function streamChat(
  options: StreamChatOptions,
  callbacks: StreamChatCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const config = getConfigFromStore()
  const provider = options.provider ?? config.provider
  const model = options.model ?? config.model

  let response: Response
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: options.messages,
        systemPrompt: options.systemPrompt,
        provider,
        model,
        maxTokens: options.maxTokens,
        tools: options.tools,
      }),
      signal,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error'
    callbacks.onError(signal?.aborted ? 'aborted' : message)
    return
  }

  if (!response.ok) {
    callbacks.onError(response.status === 503 ? 'demo_mode' : `HTTP ${response.status}`)
    return
  }

  const body = response.body
  if (!body) {
    callbacks.onError('No response body')
    return
  }

  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      // Keep the last partial line in the buffer
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const payload = trimmed.slice(6)

        if (payload === '[DONE]') {
          callbacks.onDone()
          return
        }

        try {
          const parsed: { type?: string; text?: string; tool_use?: ToolUseBlock } =
            JSON.parse(payload)

          if ((parsed.type === 'text' || parsed.type === 'text_delta') && parsed.text !== undefined && parsed.text !== null) {
            callbacks.onText(parsed.text)
          } else if (parsed.type === 'tool_use' && parsed.tool_use) {
            callbacks.onToolUse(parsed.tool_use)
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim().startsWith('data: ')) {
      const payload = buffer.trim().slice(6)
      if (payload !== '[DONE]') {
        try {
          const parsed: { type?: string; text?: string; tool_use?: ToolUseBlock } =
            JSON.parse(payload)
          if ((parsed.type === 'text' || parsed.type === 'text_delta') && parsed.text !== undefined && parsed.text !== null) {
            callbacks.onText(parsed.text)
          } else if (parsed.type === 'tool_use' && parsed.tool_use) {
            callbacks.onToolUse(parsed.tool_use)
          }
        } catch {
          // Skip malformed
        }
      }
    }

    callbacks.onDone()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Stream error'
    callbacks.onError(signal?.aborted ? 'aborted' : message)
  }
}

// ─── Discriminated Result Types ─────────────────────────────────────

export type LLMErrorType = 'server_down' | 'provider_error' | 'rate_limited' | 'timeout'

export interface LLMSuccessResult {
  status: 'success'
  content: string | null
  usage: { inputTokens: number; outputTokens: number } | null
}

export interface LLMErrorResult {
  status: 'error'
  errorType: LLMErrorType
  message: string
}

export type LLMResult = LLMSuccessResult | LLMErrorResult

function classifyHttpError(statusCode: number, message: string): LLMErrorType {
  if (statusCode === 429) return 'rate_limited'
  if (statusCode === 503 || statusCode === 502) return 'server_down'
  if (statusCode >= 500) return 'provider_error'
  if (message.includes('timeout') || message.includes('aborted')) return 'timeout'
  return 'provider_error'
}

function classifyNetworkError(err: unknown): LLMErrorType {
  const msg = err instanceof Error ? err.message.toLowerCase() : ''
  if (msg.includes('timeout') || msg.includes('aborted')) return 'timeout'
  return 'server_down'
}

// ─── syncChat ───────────────────────────────────────────────────────

export async function syncChat(options: StreamChatOptions): Promise<string | null> {
  const config = getConfigFromStore()
  const provider = options.provider ?? config.provider
  const model = options.model ?? config.model

  try {
    const response = await fetch('/api/chat/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: options.messages,
        systemPrompt: options.systemPrompt,
        provider,
        model,
        maxTokens: options.maxTokens,
        tools: options.tools,
      }),
    })

    if (!response.ok) return null

    const data: { content?: string; text?: string } = await response.json()
    return data.content ?? data.text ?? null
  } catch {
    return null
  }
}

// ─── syncChatSafe — returns discriminated result ────────────────────

export async function syncChatSafe(options: StreamChatOptions): Promise<LLMResult> {
  const config = getConfigFromStore()
  const provider = options.provider ?? config.provider
  const model = options.model ?? config.model

  let response: Response
  try {
    response = await fetch('/api/chat/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: options.messages,
        systemPrompt: options.systemPrompt,
        provider,
        model,
        maxTokens: options.maxTokens,
        tools: options.tools,
      }),
    })
  } catch (err: unknown) {
    return {
      status: 'error',
      errorType: classifyNetworkError(err),
      message: err instanceof Error ? err.message : 'Network error',
    }
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    return {
      status: 'error',
      errorType: classifyHttpError(response.status, errorText),
      message: `HTTP ${response.status}: ${errorText.slice(0, 200)}`,
    }
  }

  const data: { content?: string; text?: string } = await response.json()
  return {
    status: 'success',
    content: data.content ?? data.text ?? null,
    usage: null,
  }
}

// ─── streamChatSafe — returns discriminated result ──────────────────

export async function streamChatSafe(
  options: StreamChatOptions,
  callbacks: Omit<StreamChatCallbacks, 'onError'>,
  signal?: AbortSignal,
): Promise<LLMResult> {
  let collectedText = ''
  let error: LLMResult | null = null

  await streamChat(
    options,
    {
      onText: (text) => {
        collectedText += text
        callbacks.onText(text)
      },
      onToolUse: callbacks.onToolUse,
      onError: (errMsg) => {
        let errorType: LLMErrorType = 'provider_error'
        if (errMsg === 'demo_mode' || errMsg.includes('503')) errorType = 'server_down'
        else if (errMsg.includes('429')) errorType = 'rate_limited'
        else if (errMsg === 'aborted' || errMsg.includes('timeout')) errorType = 'timeout'
        error = { status: 'error', errorType, message: errMsg }
      },
      onDone: callbacks.onDone,
    },
    signal,
  )

  if (error) return error

  return {
    status: 'success',
    content: collectedText || null,
    usage: null,
  }
}

// ─── buildAgentSystemPrompt ─────────────────────────────────────────

export function buildAgentSystemPrompt(
  agentType: AgentType,
  task: string,
  step?: string,
  previousOutputs?: string[],
): string {
  const definition = AGENT_DEFINITIONS.find((d) => d.type === agentType)
  if (!definition) {
    return `You are an AI assistant. Complete the following task: ${task}`
  }

  const lines: string[] = [
    `You are the ${definition.label} agent for OriginA.`,
    `Role: ${definition.description}`,
    '',
    'Capabilities:',
    ...definition.capabilities.map((c) => `- ${c}`),
    '',
    'Example use cases:',
    ...definition.useCases.map((u) => `- ${u}`),
    '',
    `Task: ${task}`,
  ]

  if (step) {
    lines.push('', `Current step: ${step}`)
  }

  if (previousOutputs && previousOutputs.length > 0) {
    lines.push('', 'Previous step outputs:')
    previousOutputs.forEach((output, i) => {
      lines.push(`--- Step ${i + 1} ---`, output)
    })
  }

  lines.push(
    '',
    'Instructions:',
    '- Be concise and actionable',
    '- Use OriginA workspace context when available',
    '- Return structured data when possible',
    '- If you cannot complete the task, explain what is needed',
  )

  const memoryState = useMemoryStore.getState()
  const entries = memoryState.entries
  const relevantMemories = entries
    .filter((m) => m.pinned || m.accessCount > 2)
    .slice(0, 10)

  if (relevantMemories.length > 0) {
    lines.push('', 'Workspace Memory (organizational context):')
    for (const mem of relevantMemories) {
      lines.push(`[${mem.category}] ${mem.title}: ${mem.content.slice(0, 200)}`)
    }
  }

  return lines.join('\n')
}

// ─── runAgentWithLLM ────────────────────────────────────────────────

export async function runAgentWithLLM(
  agentType: AgentType,
  task: string,
  steps: string[],
  callbacks: AgentStepCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const previousOutputs: string[] = []

  for (let i = 0; i < steps.length; i++) {
    if (signal?.aborted) {
      callbacks.onError(i, 'aborted')
      return
    }

    callbacks.onStepStart(i)

    const stepLabel = steps[i]
    if (!stepLabel) {
      callbacks.onError(i, 'Invalid step')
      return
    }

    const systemPrompt = buildAgentSystemPrompt(agentType, task, stepLabel, previousOutputs)

    // Create a per-step timeout controller
    const stepController = new AbortController()
    const timeoutId = setTimeout(() => stepController.abort(), STEP_TIMEOUT_MS)

    // Combine with external signal
    const onExternalAbort = () => stepController.abort()
    signal?.addEventListener('abort', onExternalAbort)

    let stepOutput = ''
    let stepError: string | null = null

    try {
      await streamChat(
        {
          messages: [{ role: 'user', content: `Execute step: ${stepLabel}` }],
          systemPrompt,
        },
        {
          onText: (text) => {
            stepOutput += text
            callbacks.onStepStreaming?.(i, stepOutput)
          },
          onToolUse: () => {
            // Tool use handled by caller if needed
          },
          onError: (error) => {
            stepError = error
          },
          onDone: () => {
            // Stream complete
          },
        },
        stepController.signal,
      )
    } finally {
      clearTimeout(timeoutId)
      signal?.removeEventListener('abort', onExternalAbort)
    }

    if (stepError) {
      callbacks.onError(i, stepError)
      return
    }

    previousOutputs.push(stepOutput)
    callbacks.onStepComplete(i, stepOutput)
  }

  // Final synthesis call
  const summaryPrompt = buildAgentSystemPrompt(agentType, task, undefined, previousOutputs)
  const summary = await syncChat({
    messages: [
      {
        role: 'user',
        content: 'Synthesize the results from all steps into a concise summary of what was accomplished.',
      },
    ],
    systemPrompt: summaryPrompt,
  })

  callbacks.onAllComplete(summary ?? 'Agent completed all steps.')
}
