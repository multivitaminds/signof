import { WebSocketManager } from './websocket'

class MockWebSocket {
  static OPEN = 1
  static CONNECTING = 0
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onerror: ((e: Event) => void) | null = null
  onmessage: ((e: { data: string }) => void) | null = null

  send = vi.fn()
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.()
  })

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN
    this.onopen?.()
  }

  simulateMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) })
  }
}

let mockInstance: MockWebSocket
let constructorArgs: string[]

beforeEach(() => {
  constructorArgs = []
  const WS = class extends MockWebSocket {
    constructor(url: string) {
      super()
      constructorArgs.push(url)
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      mockInstance = this
    }
  }
  Object.assign(WS, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 })
  vi.stubGlobal('WebSocket', WS)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('WebSocketManager', () => {
  it('connects to the specified URL', () => {
    const ws = new WebSocketManager({ url: 'ws://localhost:8080' })
    ws.connect()

    expect(constructorArgs).toContain('ws://localhost:8080')
  })

  it('reports connected state after open', () => {
    const ws = new WebSocketManager({ url: 'ws://localhost:8080' })
    ws.connect()

    expect(ws.isConnected).toBe(false)

    mockInstance.simulateOpen()

    expect(ws.isConnected).toBe(true)
    expect(ws.connectionState).toBe('connected')
  })

  it('sends JSON messages when connected', () => {
    const ws = new WebSocketManager({ url: 'ws://localhost:8080' })
    ws.connect()
    mockInstance.simulateOpen()

    ws.send('test:event', { hello: 'world' })

    expect(mockInstance.send).toHaveBeenCalledTimes(1)
    const sent = JSON.parse(mockInstance.send.mock.calls[0]?.[0] as string)
    expect(sent.event).toBe('test:event')
    expect(sent.data).toEqual({ hello: 'world' })
  })

  it('routes messages to event handlers', () => {
    const ws = new WebSocketManager({ url: 'ws://localhost:8080' })
    ws.connect()
    mockInstance.simulateOpen()

    const handler = vi.fn()
    ws.on('chat:message', handler)

    mockInstance.simulateMessage({ event: 'chat:message', data: { text: 'hi' } })

    expect(handler).toHaveBeenCalledWith({ text: 'hi' })
  })

  it('unsubscribes handlers', () => {
    const ws = new WebSocketManager({ url: 'ws://localhost:8080' })
    ws.connect()
    mockInstance.simulateOpen()

    const handler = vi.fn()
    const unsub = ws.on('event', handler)
    unsub()

    mockInstance.simulateMessage({ event: 'event', data: {} })

    expect(handler).not.toHaveBeenCalled()
  })

  it('disconnects cleanly', () => {
    const ws = new WebSocketManager({ url: 'ws://localhost:8080' })
    ws.connect()
    mockInstance.simulateOpen()

    ws.disconnect()

    expect(mockInstance.close).toHaveBeenCalled()
    expect(ws.connectionState).toBe('disconnected')
  })
})
