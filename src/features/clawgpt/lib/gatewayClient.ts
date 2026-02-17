import { WebSocketManager } from '../../../lib/websocket'
import { useGatewayStore } from '../stores/useGatewayStore'
import { useMessageStore } from '../stores/useMessageStore'
import { eventBus, EVENT_TYPES } from '../../../lib/eventBus'
import { GatewayStatus, MessageDirection, MessageStatus } from '../types'
import type { SoulConfig, BrainMessage, Session, ChannelType } from '../types'

let wsManager: WebSocketManager | null = null
let cleanupHandlers: Array<() => void> = []
let isFirstConnect = true

export function connectGateway(): void {
  if (wsManager?.isConnected) return

  // Set status to degraded (connecting)
  useGatewayStore.setState({ gatewayStatus: GatewayStatus.Degraded })

  wsManager = new WebSocketManager({
    url: `ws://${window.location.hostname}:3001`,
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
    onOpen: () => {
      // Send auth event if API key is configured
      const apiKey = localStorage.getItem('orchestree_api_key')
      if (apiKey) {
        wsManager?.send('auth', { token: apiKey })
      }

      // On reconnect, mark stale 'sending' messages as 'failed'
      if (!isFirstConnect) {
        const msgStore = useMessageStore.getState()
        const staleMessages = msgStore.messages.filter(
          (m) => m.status === MessageStatus.Sending
        )
        if (staleMessages.length > 0) {
          useMessageStore.setState((s) => ({
            messages: s.messages.map((m) =>
              m.status === MessageStatus.Sending
                ? { ...m, status: MessageStatus.Failed }
                : m
            ),
          }))
        }
      }

      useGatewayStore.setState({
        gatewayStatus: GatewayStatus.Online,
        uptimeSince: new Date().toISOString(),
        reconnectAttempts: 0,
      })
      eventBus.emit(EVENT_TYPES.BRAIN_GATEWAY_STATUS, GatewayStatus.Online)
      loadSessionsFromServer()

      isFirstConnect = false
    },
    onClose: () => {
      useGatewayStore.setState({
        gatewayStatus: GatewayStatus.Offline,
        uptimeSince: null,
      })
      eventBus.emit(EVENT_TYPES.BRAIN_GATEWAY_STATUS, GatewayStatus.Offline)
    },
    onReconnecting: (attempt: number, maxAttempts: number) => {
      useGatewayStore.setState({
        gatewayStatus: GatewayStatus.Degraded,
        reconnectAttempts: attempt,
        maxReconnectAttempts: maxAttempts,
      })
      eventBus.emit(EVENT_TYPES.BRAIN_GATEWAY_STATUS, GatewayStatus.Degraded)
    },
    onError: () => {
      useGatewayStore.setState({ gatewayStatus: GatewayStatus.Degraded })
      eventBus.emit(EVENT_TYPES.BRAIN_GATEWAY_STATUS, GatewayStatus.Degraded)
    },
  })

  // Register WS event handlers
  const unsub1 = wsManager.on('chat.response', (data: unknown) => {
    const d = data as {
      sessionId: string
      message: { content: string; toolCalls?: string[] }
    }
    const msgStore = useMessageStore.getState()
    // Find the last 'sending' message for this session and mark as sent
    const sendingMsg = msgStore.messages
      .filter(
        (m) =>
          m.sessionId === d.sessionId && m.status === MessageStatus.Sending
      )
      .pop()
    if (sendingMsg) {
      useMessageStore.setState((s) => ({
        messages: s.messages.map((m) =>
          m.id === sendingMsg.id ? { ...m, status: MessageStatus.Sent } : m
        ),
      }))
    }

    // Look up session to get channel info
    const session = useGatewayStore
      .getState()
      .activeSessions.find((s) => s.id === d.sessionId)

    // Check if an agent should handle this — extract agentId from response if present
    const responseAgentId = (d as Record<string, unknown>).agentId as string | null ?? null
    const agentDisplayName = responseAgentId ? (responseAgentId) : null

    // Add AI response as inbound message
    msgStore.receiveMessage({
      sessionId: d.sessionId,
      channelId: session?.channelId ?? '',
      channelType: (session?.channelType ?? 'web_chat') as ChannelType,
      direction: MessageDirection.Inbound,
      content: d.message.content,
      senderName: agentDisplayName ?? 'Atlas',
      senderAvatar: null,
      toolCalls: d.message.toolCalls ?? null,
      agentId: responseAgentId,
      status: MessageStatus.Delivered,
    })

    // If session has no agent assigned, route to the agent kernel for future messages
    if (session && !session.agentId) {
      import('./agentKernel').then(({ handleChannelMessage }) => {
        handleChannelMessage(d.sessionId, d.message.content, session.channelType)
      }).catch(() => { /* kernel not available */ })
    }

    // Increment daily message count
    useGatewayStore.getState().incrementMessageCount()

    eventBus.emit(EVENT_TYPES.BRAIN_MESSAGE_RECEIVED, d)
  })

  const unsub2 = wsManager.on('chat.typing', (_data: unknown) => {
    // Typing indicator - can be used by UI to show typing state
  })

  const unsub3 = wsManager.on('session.created', (data: unknown) => {
    const session = data as Session
    useGatewayStore.setState((s) => ({
      activeSessions: [...s.activeSessions, session],
    }))
    eventBus.emit(EVENT_TYPES.BRAIN_SESSION_CREATED, session)
  })

  const unsub4 = wsManager.on('session.closed', (data: unknown) => {
    const d = data as { sessionId: string }
    useGatewayStore.getState().closeSession(d.sessionId)
  })

  const unsub5 = wsManager.on('error', (data: unknown) => {
    console.error('[Gateway error]', data)
  })

  cleanupHandlers = [unsub1, unsub2, unsub3, unsub4, unsub5]

  wsManager.connect()
}

export function disconnectGateway(): void {
  cleanupHandlers.forEach((fn) => fn())
  cleanupHandlers = []
  wsManager?.disconnect()
  wsManager = null
  useGatewayStore.setState({
    gatewayStatus: GatewayStatus.Offline,
    uptimeSince: null,
  })
}

export function sendChatMessage(
  sessionId: string,
  content: string,
  soulConfig: SoulConfig,
  skills: Array<{ id: string; name: string; description: string; handler: string }>,
  channelId?: string,
  channelType?: string,
  senderName?: string,
): void {
  wsManager?.send('chat.message', {
    sessionId,
    content,
    soulConfig,
    skills,
    channelId,
    channelType,
    senderName,
  })
}

export function sendSoulUpdate(config: SoulConfig): void {
  wsManager?.send('soul.update', config)
}

export function isGatewayConnected(): boolean {
  return wsManager?.isConnected ?? false
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const apiKey = localStorage.getItem('orchestree_api_key')
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }
  return headers
}

async function loadSessionsFromServer(): Promise<void> {
  try {
    const res = await fetch('/api/sessions', { headers: getAuthHeaders() })
    const data = (await res.json()) as { sessions: Session[] }
    if (data.sessions?.length > 0) {
      useGatewayStore.setState({ activeSessions: data.sessions })
    }
    // Load messages for each session
    for (const session of data.sessions ?? []) {
      const msgRes = await fetch(`/api/sessions/${session.id}/messages`, { headers: getAuthHeaders() })
      const msgData = (await msgRes.json()) as { messages: BrainMessage[] }
      if (msgData.messages?.length > 0) {
        useMessageStore.setState((s) => ({
          messages: [...s.messages, ...msgData.messages],
        }))
      }
    }
  } catch {
    // Server not available, continue with local state
  }
}
