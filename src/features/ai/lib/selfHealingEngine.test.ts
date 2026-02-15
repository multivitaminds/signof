import { classifyError, attemptRepair } from './selfHealingEngine'
import { RepairStatus } from '../types'
import type { RepairRecord, RepairContext } from '../types'

// Mock the LLM client to avoid real API calls
vi.mock('./llmClient', () => ({
  syncChat: vi.fn().mockResolvedValue('LLM analysis: This is a test error'),
}))

// Mock the connector store for auth-aware repair tests
const mockGetConnector = vi.fn()
const mockSetConnectorStatus = vi.fn()
vi.mock('../stores/useConnectorStore', () => ({
  default: {
    getState: () => ({
      getConnector: mockGetConnector,
      setConnectorStatus: mockSetConnectorStatus,
    }),
  },
}))

describe('selfHealingEngine', () => {
  describe('classifyError', () => {
    it('classifies network errors', () => {
      expect(classifyError(new Error('ECONNREFUSED'))).toBe('network')
      expect(classifyError(new Error('fetch failed: timeout'))).toBe('network')
      expect(classifyError(new Error('Network request aborted'))).toBe('network')
      expect(classifyError(new Error('ENOTFOUND host'))).toBe('network')
    })

    it('classifies auth errors', () => {
      expect(classifyError(new Error('401 Unauthorized'))).toBe('auth')
      expect(classifyError(new Error('403 Forbidden'))).toBe('auth')
      expect(classifyError(new Error('Invalid token'))).toBe('auth')
      expect(classifyError(new Error('Authentication required'))).toBe('auth')
    })

    it('classifies validation errors', () => {
      expect(classifyError(new Error('Validation failed'))).toBe('validation')
      expect(classifyError(new Error('Invalid input'))).toBe('validation')
      expect(classifyError(new Error('Required field missing'))).toBe('validation')
    })

    it('classifies rate limit errors', () => {
      expect(classifyError(new Error('429 Too Many Requests'))).toBe('rate-limit')
      expect(classifyError(new Error('Rate limit exceeded'))).toBe('rate-limit')
      expect(classifyError(new Error('Request throttled'))).toBe('rate-limit')
    })

    it('classifies schema mismatch errors', () => {
      expect(classifyError(new Error('unknown property in payload'))).toBe('schema-mismatch')
      expect(classifyError(new Error('unexpected field xyz'))).toBe('schema-mismatch')
    })

    it('classifies not-found errors', () => {
      expect(classifyError(new Error('404 Not Found'))).toBe('not-found')
      expect(classifyError(new Error('Resource does not exist'))).toBe('not-found')
    })

    it('classifies permission errors', () => {
      expect(classifyError(new Error('Permission denied'))).toBe('permission')
      expect(classifyError(new Error('Access denied to resource'))).toBe('permission')
    })

    it('classifies server errors', () => {
      expect(classifyError(new Error('500 Internal Server Error'))).toBe('server-error')
    })

    it('returns unknown for unrecognized errors', () => {
      expect(classifyError(new Error('Something completely weird happened'))).toBe('unknown')
    })

    it('handles non-Error values', () => {
      expect(classifyError('network timeout')).toBe('network')
      expect(classifyError(42)).toBe('unknown')
    })
  })

  describe('attemptRepair', () => {
    function makeRecord(errorType: string, context?: RepairContext): RepairRecord {
      return {
        id: 'repair-1',
        agentId: 'agent-1',
        errorType,
        errorMessage: 'Test error',
        analysis: 'Test analysis',
        repairAction: '',
        status: RepairStatus.Detected,
        timestamp: new Date().toISOString(),
        resolvedAt: null,
        context,
      }
    }

    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('resolves network errors with retry', async () => {
      const promise = attemptRepair(makeRecord('network'))
      await vi.runAllTimersAsync()
      const result = await promise
      expect(result.status).toBe(RepairStatus.Resolved)
      expect(result.resolvedAt).toBeTruthy()
      expect(result.repairAction).toContain('Retried')
    })

    it('resolves rate-limit errors with delay', async () => {
      const promise = attemptRepair(makeRecord('rate-limit'))
      await vi.runAllTimersAsync()
      const result = await promise
      expect(result.status).toBe(RepairStatus.Resolved)
      expect(result.repairAction).toContain('rate limit')
    })

    it('resolves validation errors', async () => {
      const result = await attemptRepair(makeRecord('validation'))
      expect(result.status).toBe(RepairStatus.Resolved)
      expect(result.repairAction).toContain('transformation')
    })

    it('resolves schema-mismatch errors', async () => {
      const result = await attemptRepair(makeRecord('schema-mismatch'))
      expect(result.status).toBe(RepairStatus.Resolved)
    })

    it('fails auth errors (needs user action)', async () => {
      const result = await attemptRepair(makeRecord('auth'))
      expect(result.status).toBe(RepairStatus.Failed)
      expect(result.repairAction).toContain('user action')
    })

    it('fails unknown errors', async () => {
      const result = await attemptRepair(makeRecord('unknown'))
      expect(result.status).toBe(RepairStatus.Failed)
      expect(result.repairAction).toContain('manual intervention')
    })

    // ─── New: Network backoff tests ─────────────────────────────────

    it('resolves network errors with exponential backoff', async () => {
      const promise = attemptRepair(makeRecord('network'))
      await vi.runAllTimersAsync()
      const result = await promise
      expect(result.status).toBe(RepairStatus.Resolved)
      expect(result.resolvedAt).toBeTruthy()
      expect(result.repairAction).toContain('exponential backoff')
      expect(result.repairAction).toContain('3 attempts')
    })

    // ─── New: Rate-limit tests ──────────────────────────────────────

    it('resolves rate-limit with custom retryAfterMs', async () => {
      const promise = attemptRepair(
        makeRecord('rate-limit', { retryAfterMs: 30_000 }),
      )
      await vi.runAllTimersAsync()
      const result = await promise
      expect(result.status).toBe(RepairStatus.Resolved)
      expect(result.resolvedAt).toBeTruthy()
      expect(result.repairAction).toContain('30s')
    })

    it('resolves rate-limit with default 60s when no context', async () => {
      const promise = attemptRepair(makeRecord('rate-limit'))
      await vi.runAllTimersAsync()
      const result = await promise
      expect(result.status).toBe(RepairStatus.Resolved)
      expect(result.repairAction).toContain('60s')
    })

    // ─── New: Auth connector-aware tests ────────────────────────────

    describe('auth with connector context', () => {
      beforeEach(() => {
        mockGetConnector.mockReset()
        mockSetConnectorStatus.mockReset()
      })

      it('fails with verify API key message for api_key connectors', async () => {
        mockGetConnector.mockReturnValue({
          id: 'stripe',
          name: 'Stripe',
          authType: 'api_key',
          status: 'connected',
        })

        const result = await attemptRepair(
          makeRecord('auth', { connectorId: 'stripe' }),
        )
        expect(result.status).toBe(RepairStatus.Failed)
        expect(result.repairAction).toContain('verify API key')
        expect(result.repairAction).toContain('Stripe')
      })

      it('fails with reconnect message for oauth2 connectors and sets error status', async () => {
        mockGetConnector.mockReturnValue({
          id: 'gmail',
          name: 'Gmail',
          authType: 'oauth2',
          status: 'connected',
        })

        const result = await attemptRepair(
          makeRecord('auth', { connectorId: 'gmail' }),
        )
        expect(result.status).toBe(RepairStatus.Failed)
        expect(result.repairAction).toContain('reconnect')
        expect(result.repairAction).toContain('Gmail')
        expect(mockSetConnectorStatus).toHaveBeenCalledWith('gmail', 'error')
      })

      it('falls back to generic message when connector not found', async () => {
        mockGetConnector.mockReturnValue(undefined)

        const result = await attemptRepair(
          makeRecord('auth', { connectorId: 'nonexistent' }),
        )
        expect(result.status).toBe(RepairStatus.Failed)
        expect(result.repairAction).toContain('user action needed')
      })

      it('falls back to generic message without connectorId context', async () => {
        const result = await attemptRepair(makeRecord('auth'))
        expect(result.status).toBe(RepairStatus.Failed)
        expect(result.repairAction).toContain('user action needed')
      })
    })

    // ─── New: Server error retry test ───────────────────────────────

    it('resolves server errors after retry', async () => {
      const promise = attemptRepair(makeRecord('server-error'))
      await vi.runAllTimersAsync()
      const result = await promise
      expect(result.status).toBe(RepairStatus.Resolved)
      expect(result.resolvedAt).toBeTruthy()
      expect(result.repairAction).toContain('Retried after 2s delay')
      expect(result.repairAction).toContain('server recovered')
    })
  })
})
