import useRepairStore from './useRepairStore'

describe('useRepairStore', () => {
  beforeEach(() => {
    useRepairStore.setState({ repairs: [] })
  })

  describe('addRepair', () => {
    it('adds a repair record and returns an ID', () => {
      const id = useRepairStore.getState().addRepair({
        agentId: 'agent-1',
        errorType: 'network',
        errorMessage: 'Connection refused',
        analysis: 'Network error detected',
        repairAction: 'Retry with backoff',
        status: 'detected',
      })
      expect(id).toBeTruthy()
      expect(useRepairStore.getState().repairs).toHaveLength(1)
      expect(useRepairStore.getState().repairs[0]!.agentId).toBe('agent-1')
      expect(useRepairStore.getState().repairs[0]!.timestamp).toBeTruthy()
      expect(useRepairStore.getState().repairs[0]!.resolvedAt).toBeNull()
    })
  })

  describe('updateRepair', () => {
    it('updates a repair record', () => {
      const id = useRepairStore.getState().addRepair({
        agentId: 'agent-1',
        errorType: 'auth',
        errorMessage: '401 Unauthorized',
        analysis: '',
        repairAction: '',
        status: 'detected',
      })
      useRepairStore.getState().updateRepair(id, {
        status: 'resolved',
        repairAction: 'Refreshed token',
        resolvedAt: new Date().toISOString(),
      })
      const repair = useRepairStore.getState().repairs[0]!
      expect(repair.status).toBe('resolved')
      expect(repair.repairAction).toBe('Refreshed token')
      expect(repair.resolvedAt).toBeTruthy()
    })
  })

  describe('getRepairsByAgent', () => {
    it('filters repairs by agent ID', () => {
      useRepairStore.getState().addRepair({
        agentId: 'agent-1', errorType: 'network', errorMessage: 'err', analysis: '', repairAction: '', status: 'detected',
      })
      useRepairStore.getState().addRepair({
        agentId: 'agent-2', errorType: 'auth', errorMessage: 'err', analysis: '', repairAction: '', status: 'detected',
      })
      useRepairStore.getState().addRepair({
        agentId: 'agent-1', errorType: 'validation', errorMessage: 'err', analysis: '', repairAction: '', status: 'resolved',
      })

      const agent1Repairs = useRepairStore.getState().getRepairsByAgent('agent-1')
      expect(agent1Repairs).toHaveLength(2)
      expect(agent1Repairs.every((r) => r.agentId === 'agent-1')).toBe(true)
    })
  })

  describe('getRepairsByStatus', () => {
    it('filters repairs by status', () => {
      useRepairStore.getState().addRepair({
        agentId: 'agent-1', errorType: 'network', errorMessage: 'err', analysis: '', repairAction: '', status: 'detected',
      })
      useRepairStore.getState().addRepair({
        agentId: 'agent-1', errorType: 'auth', errorMessage: 'err', analysis: '', repairAction: '', status: 'resolved',
      })

      expect(useRepairStore.getState().getRepairsByStatus('detected')).toHaveLength(1)
      expect(useRepairStore.getState().getRepairsByStatus('resolved')).toHaveLength(1)
      expect(useRepairStore.getState().getRepairsByStatus('failed')).toHaveLength(0)
    })
  })

  describe('getRecentRepairs', () => {
    it('returns repairs sorted by timestamp (newest first)', () => {
      useRepairStore.getState().addRepair({
        agentId: 'agent-1', errorType: 'network', errorMessage: 'first', analysis: '', repairAction: '', status: 'detected',
      })
      useRepairStore.getState().addRepair({
        agentId: 'agent-1', errorType: 'auth', errorMessage: 'second', analysis: '', repairAction: '', status: 'detected',
      })

      const recent = useRepairStore.getState().getRecentRepairs()
      expect(recent).toHaveLength(2)
      expect(new Date(recent[0]!.timestamp).getTime()).toBeGreaterThanOrEqual(new Date(recent[1]!.timestamp).getTime())
    })

    it('respects limit parameter', () => {
      for (let i = 0; i < 5; i++) {
        useRepairStore.getState().addRepair({
          agentId: 'agent-1', errorType: 'network', errorMessage: `err ${i}`, analysis: '', repairAction: '', status: 'detected',
        })
      }
      expect(useRepairStore.getState().getRecentRepairs(3)).toHaveLength(3)
    })
  })

  describe('getSuccessRate', () => {
    it('returns 0 when no repairs', () => {
      expect(useRepairStore.getState().getSuccessRate()).toBe(0)
    })

    it('calculates correct success rate', () => {
      useRepairStore.getState().addRepair({
        agentId: 'agent-1', errorType: 'network', errorMessage: 'err', analysis: '', repairAction: '', status: 'resolved',
      })
      useRepairStore.getState().addRepair({
        agentId: 'agent-1', errorType: 'auth', errorMessage: 'err', analysis: '', repairAction: '', status: 'failed',
      })
      useRepairStore.getState().addRepair({
        agentId: 'agent-1', errorType: 'network', errorMessage: 'err', analysis: '', repairAction: '', status: 'resolved',
      })
      expect(useRepairStore.getState().getSuccessRate()).toBeCloseTo(2 / 3)
    })
  })

  describe('clearRepairs', () => {
    it('clears all repairs', () => {
      useRepairStore.getState().addRepair({
        agentId: 'agent-1', errorType: 'network', errorMessage: 'err', analysis: '', repairAction: '', status: 'detected',
      })
      useRepairStore.getState().clearRepairs()
      expect(useRepairStore.getState().repairs).toHaveLength(0)
    })
  })
})
