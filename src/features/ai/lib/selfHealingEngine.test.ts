import { classifyError, attemptRepair } from './selfHealingEngine'
import { RepairStatus } from '../types'
import type { RepairRecord } from '../types'

// Mock the LLM client to avoid real API calls
vi.mock('./llmClient', () => ({
  syncChat: vi.fn().mockResolvedValue('LLM analysis: This is a test error'),
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
    function makeRecord(errorType: string): RepairRecord {
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
      }
    }

    it('resolves network errors with retry', async () => {
      const result = await attemptRepair(makeRecord('network'))
      expect(result.status).toBe(RepairStatus.Resolved)
      expect(result.resolvedAt).toBeTruthy()
      expect(result.repairAction).toContain('Retried')
    })

    it('resolves rate-limit errors with delay', async () => {
      const result = await attemptRepair(makeRecord('rate-limit'))
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
  })
})
