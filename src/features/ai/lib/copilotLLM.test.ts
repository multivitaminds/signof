import { copilotChat, copilotAnalysis } from './copilotLLM'

// ─── Mock llmClient ─────────────────────────────────────────────────

const mockIsLLMAvailable = vi.fn<() => boolean>()
const mockSyncChat = vi.fn<() => Promise<string | null>>()

vi.mock('./llmClient', () => ({
  isLLMAvailable: (...args: unknown[]) => mockIsLLMAvailable(...(args as [])),
  syncChat: (...args: unknown[]) => mockSyncChat(...(args as [])),
}))

// ─── Tests ──────────────────────────────────────────────────────────

describe('copilotChat', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns LLM response when available and successful', async () => {
    mockIsLLMAvailable.mockReturnValue(true)
    mockSyncChat.mockResolvedValue('LLM says hello')

    const result = await copilotChat('Documents', 'Help me', '5 docs', () => 'fallback')

    expect(result).toBe('LLM says hello')
    expect(mockSyncChat).toHaveBeenCalledOnce()
    expect(mockSyncChat).toHaveBeenCalledWith({
      messages: [{ role: 'user', content: 'Help me' }],
      systemPrompt: expect.stringContaining('Documents Copilot'),
    })
  })

  it('returns fallback when LLM is unavailable', async () => {
    mockIsLLMAvailable.mockReturnValue(false)

    const result = await copilotChat('Projects', 'Help', 'ctx', () => 'offline response')

    expect(result).toBe('offline response')
    expect(mockSyncChat).not.toHaveBeenCalled()
  })

  it('returns fallback when syncChat returns null', async () => {
    mockIsLLMAvailable.mockReturnValue(true)
    mockSyncChat.mockResolvedValue(null)

    const result = await copilotChat('Inbox', 'Hello', 'ctx', () => 'fallback text')

    expect(result).toBe('fallback text')
  })

  it('returns fallback when syncChat throws', async () => {
    mockIsLLMAvailable.mockReturnValue(true)
    mockSyncChat.mockRejectedValue(new Error('Network error'))

    const result = await copilotChat('Workspace', 'Hi', 'ctx', () => 'error fallback')

    expect(result).toBe('error fallback')
  })

  it('includes module name and context in system prompt', async () => {
    mockIsLLMAvailable.mockReturnValue(true)
    mockSyncChat.mockResolvedValue('response')

    await copilotChat('Accounting', 'query', '3 invoices, 2 overdue', () => '')

    const call = mockSyncChat.mock.calls[0] as unknown as [{ systemPrompt: string }]
    expect(call[0].systemPrompt).toContain('Accounting Copilot')
    expect(call[0].systemPrompt).toContain('3 invoices, 2 overdue')
  })
})

describe('copilotAnalysis', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns parsed JSON when LLM returns valid JSON', async () => {
    mockIsLLMAvailable.mockReturnValue(true)
    mockSyncChat.mockResolvedValue(
      JSON.stringify({ summary: 'All healthy', items: ['Item A', 'Item B'] }),
    )

    const result = await copilotAnalysis(
      'Developer',
      'API health',
      '3 keys',
      () => ({ summary: 'fallback', items: [] }),
    )

    expect(result).toEqual({ summary: 'All healthy', items: ['Item A', 'Item B'] })
  })

  it('handles non-JSON response gracefully', async () => {
    mockIsLLMAvailable.mockReturnValue(true)
    mockSyncChat.mockResolvedValue('Everything looks good, no issues found.')

    const result = await copilotAnalysis(
      'Databases',
      'schema',
      '5 tables',
      () => ({ summary: 'fallback', items: [] }),
    )

    expect(result.summary).toBe('Everything looks good, no issues found.'.slice(0, 120))
    expect(result.items).toEqual(['Everything looks good, no issues found.'])
  })

  it('returns fallback when LLM is unavailable', async () => {
    mockIsLLMAvailable.mockReturnValue(false)

    const fallback = { summary: 'Offline analysis', items: ['Item 1'] }
    const result = await copilotAnalysis('Tax', 'documents', 'ctx', () => fallback)

    expect(result).toEqual(fallback)
    expect(mockSyncChat).not.toHaveBeenCalled()
  })

  it('returns fallback when syncChat returns null', async () => {
    mockIsLLMAvailable.mockReturnValue(true)
    mockSyncChat.mockResolvedValue(null)

    const fallback = { summary: 'Null fallback', items: ['X'] }
    const result = await copilotAnalysis('Scheduling', 'conflicts', 'ctx', () => fallback)

    expect(result).toEqual(fallback)
  })

  it('returns fallback when syncChat throws', async () => {
    mockIsLLMAvailable.mockReturnValue(true)
    mockSyncChat.mockRejectedValue(new Error('Server down'))

    const fallback = { summary: 'Error fallback', items: ['Recovery'] }
    const result = await copilotAnalysis('Inbox', 'triage', 'ctx', () => fallback)

    expect(result).toEqual(fallback)
  })

  it('includes analysis type in system prompt', async () => {
    mockIsLLMAvailable.mockReturnValue(true)
    mockSyncChat.mockResolvedValue(JSON.stringify({ summary: 's', items: [] }))

    await copilotAnalysis('Projects', 'sprint_health', '12 issues', () => ({ summary: '', items: [] }))

    const call = mockSyncChat.mock.calls[0] as unknown as [{ systemPrompt: string; messages: { content: string }[] }]
    expect(call[0].systemPrompt).toContain('sprint_health analysis')
    expect(call[0].systemPrompt).toContain('12 issues')
    expect(call[0].messages[0]!.content).toBe('Run sprint_health analysis')
  })
})
