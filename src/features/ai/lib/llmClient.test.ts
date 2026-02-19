import { syncChat, syncChatSafe, streamChat, isLLMAvailable } from './llmClient'
import type { StreamChatCallbacks } from './llmClient'

// ─── Mock useLLMConfigStore ──────────────────────────────────────────

const mockStoreState = {
  mode: 'demo' as string,
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
}

vi.mock('../stores/useLLMConfigStore', () => ({
  default: {
    getState: () => mockStoreState,
  },
}))

vi.mock('../stores/useMemoryStore', () => ({
  useMemoryStore: {
    getState: () => ({ entries: [] }),
  },
}))

// ─── Helpers ─────────────────────────────────────────────────────────

function mockFetchResponse(body: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    body: null,
  })
}

function mockSSEResponse(events: string[]) {
  const encoded = new TextEncoder().encode(events.join('\n') + '\n')
  let readCount = 0
  const reader = {
    read: vi.fn().mockImplementation(() => {
      if (readCount === 0) {
        readCount++
        return Promise.resolve({ done: false, value: encoded })
      }
      return Promise.resolve({ done: true, value: undefined })
    }),
  }

  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    body: { getReader: () => reader },
  })
}

// ─── Tests ──────────────────────────────────────────────────────────

describe('isLLMAvailable', () => {
  it('returns true when mode is live', () => {
    mockStoreState.mode = 'live'
    expect(isLLMAvailable()).toBe(true)
  })

  it('returns false when mode is demo', () => {
    mockStoreState.mode = 'demo'
    expect(isLLMAvailable()).toBe(false)
  })
})

describe('syncChat', () => {
  beforeEach(() => {
    mockStoreState.mode = 'live'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reads content field from response', async () => {
    globalThis.fetch = mockFetchResponse({ content: 'Hello from LLM' })

    const result = await syncChat({
      messages: [{ role: 'user', content: 'Hi' }],
    })

    expect(result).toBe('Hello from LLM')
  })

  it('falls back to text field when content is absent', async () => {
    globalThis.fetch = mockFetchResponse({ text: 'Hello from text field' })

    const result = await syncChat({
      messages: [{ role: 'user', content: 'Hi' }],
    })

    expect(result).toBe('Hello from text field')
  })

  it('prefers content over text when both present', async () => {
    globalThis.fetch = mockFetchResponse({ content: 'from content', text: 'from text' })

    const result = await syncChat({
      messages: [{ role: 'user', content: 'Hi' }],
    })

    expect(result).toBe('from content')
  })

  it('returns null when neither field is present', async () => {
    globalThis.fetch = mockFetchResponse({})

    const result = await syncChat({
      messages: [{ role: 'user', content: 'Hi' }],
    })

    expect(result).toBeNull()
  })

  it('returns null on HTTP error', async () => {
    globalThis.fetch = mockFetchResponse({}, false, 500)

    const result = await syncChat({
      messages: [{ role: 'user', content: 'Hi' }],
    })

    expect(result).toBeNull()
  })

  it('returns null on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network failure'))

    const result = await syncChat({
      messages: [{ role: 'user', content: 'Hi' }],
    })

    expect(result).toBeNull()
  })
})

describe('syncChatSafe', () => {
  beforeEach(() => {
    mockStoreState.mode = 'live'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reads content field from response', async () => {
    globalThis.fetch = mockFetchResponse({ content: 'Safe response' })

    const result = await syncChatSafe({
      messages: [{ role: 'user', content: 'Hi' }],
    })

    expect(result.status).toBe('success')
    if (result.status === 'success') {
      expect(result.content).toBe('Safe response')
    }
  })

  it('falls back to text field when content is absent', async () => {
    globalThis.fetch = mockFetchResponse({ text: 'Text field response' })

    const result = await syncChatSafe({
      messages: [{ role: 'user', content: 'Hi' }],
    })

    expect(result.status).toBe('success')
    if (result.status === 'success') {
      expect(result.content).toBe('Text field response')
    }
  })

  it('returns error on HTTP 429', async () => {
    globalThis.fetch = mockFetchResponse('Rate limited', false, 429)

    const result = await syncChatSafe({
      messages: [{ role: 'user', content: 'Hi' }],
    })

    expect(result.status).toBe('error')
    if (result.status === 'error') {
      expect(result.errorType).toBe('rate_limited')
    }
  })
})

describe('streamChat', () => {
  beforeEach(() => {
    mockStoreState.mode = 'live'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('handles text_delta event type', async () => {
    globalThis.fetch = mockSSEResponse([
      'data: {"type":"text_delta","text":"Hello "}',
      'data: {"type":"text_delta","text":"world"}',
      'data: [DONE]',
    ])

    const callbacks: StreamChatCallbacks = {
      onText: vi.fn(),
      onToolUse: vi.fn(),
      onError: vi.fn(),
      onDone: vi.fn(),
    }

    await streamChat({ messages: [{ role: 'user', content: 'Hi' }] }, callbacks)

    expect(callbacks.onText).toHaveBeenCalledWith('Hello ')
    expect(callbacks.onText).toHaveBeenCalledWith('world')
    expect(callbacks.onDone).toHaveBeenCalled()
    expect(callbacks.onError).not.toHaveBeenCalled()
  })

  it('handles original text event type', async () => {
    globalThis.fetch = mockSSEResponse([
      'data: {"type":"text","text":"Legacy text"}',
      'data: [DONE]',
    ])

    const callbacks: StreamChatCallbacks = {
      onText: vi.fn(),
      onToolUse: vi.fn(),
      onError: vi.fn(),
      onDone: vi.fn(),
    }

    await streamChat({ messages: [{ role: 'user', content: 'Hi' }] }, callbacks)

    expect(callbacks.onText).toHaveBeenCalledWith('Legacy text')
    expect(callbacks.onDone).toHaveBeenCalled()
  })

  it('handles mixed text and text_delta events', async () => {
    globalThis.fetch = mockSSEResponse([
      'data: {"type":"text","text":"First "}',
      'data: {"type":"text_delta","text":"Second"}',
      'data: [DONE]',
    ])

    const callbacks: StreamChatCallbacks = {
      onText: vi.fn(),
      onToolUse: vi.fn(),
      onError: vi.fn(),
      onDone: vi.fn(),
    }

    await streamChat({ messages: [{ role: 'user', content: 'Hi' }] }, callbacks)

    expect(callbacks.onText).toHaveBeenCalledTimes(2)
    expect(callbacks.onText).toHaveBeenCalledWith('First ')
    expect(callbacks.onText).toHaveBeenCalledWith('Second')
  })

  it('calls onError for HTTP 503', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      body: null,
    })

    const callbacks: StreamChatCallbacks = {
      onText: vi.fn(),
      onToolUse: vi.fn(),
      onError: vi.fn(),
      onDone: vi.fn(),
    }

    await streamChat({ messages: [{ role: 'user', content: 'Hi' }] }, callbacks)

    expect(callbacks.onError).toHaveBeenCalledWith('demo_mode')
  })
})
