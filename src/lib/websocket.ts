type MessageHandler = (data: unknown) => void

interface WebSocketConfig {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  onReconnecting?: (attempt: number, maxAttempts: number) => void
}

export class WebSocketManager {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private handlers = new Map<string, Set<MessageHandler>>()
  private reconnectCount = 0
  private reconnectTimer: number | null = null
  private intentionalClose = false

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      ...config,
    }
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return

    try {
      this.ws = new WebSocket(this.config.url)
    } catch {
      return
    }

    this.ws.onopen = () => {
      this.reconnectCount = 0
      this.config.onOpen?.()
    }

    this.ws.onclose = () => {
      this.config.onClose?.()
      if (!this.intentionalClose && this.reconnectCount < (this.config.maxReconnectAttempts ?? 10)) {
        this.reconnectCount++
        const delay = Math.min(1000 * Math.pow(2, this.reconnectCount - 1), 30000) + Math.random() * 1000
        this.config.onReconnecting?.(this.reconnectCount, this.config.maxReconnectAttempts ?? 10)
        this.reconnectTimer = window.setTimeout(() => {
          this.connect()
        }, delay)
      }
    }

    this.ws.onerror = (e) => {
      this.config.onError?.(e)
    }

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data as string) as { event: string; data: unknown }
        const eventHandlers = this.handlers.get(parsed.event)
        if (eventHandlers) {
          for (const handler of eventHandlers) {
            handler(parsed.data)
          }
        }
      } catch {
        // Ignore non-JSON messages
      }
    }
  }

  disconnect(): void {
    this.intentionalClose = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
  }

  send(event: string, data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data, timestamp: Date.now() }))
    }
  }

  on(event: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
    return () => {
      this.handlers.get(event)?.delete(handler)
    }
  }

  get reconnectAttempts(): number {
    return this.reconnectCount
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get connectionState(): 'connecting' | 'connected' | 'disconnected' | 'reconnecting' {
    if (!this.ws) return 'disconnected'
    if (this.ws.readyState === WebSocket.OPEN) return 'connected'
    if (this.ws.readyState === WebSocket.CONNECTING) return 'connecting'
    if (this.reconnectCount > 0) return 'reconnecting'
    return 'disconnected'
  }
}

let instance: WebSocketManager | null = null

export function getWebSocket(config?: WebSocketConfig): WebSocketManager | null {
  if (!instance && config) {
    instance = new WebSocketManager(config)
  }
  return instance
}

export function disconnectWebSocket(): void {
  instance?.disconnect()
  instance = null
}
