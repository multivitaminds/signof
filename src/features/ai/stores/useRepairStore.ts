import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RepairRecord, RepairStatus } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export interface RepairState {
  repairs: RepairRecord[]

  addRepair: (record: Omit<RepairRecord, 'id' | 'timestamp' | 'resolvedAt'>) => string
  updateRepair: (id: string, updates: Partial<Pick<RepairRecord, 'status' | 'analysis' | 'repairAction' | 'resolvedAt'>>) => void
  getRepairsByAgent: (agentId: string) => RepairRecord[]
  getRepairsByStatus: (status: RepairStatus) => RepairRecord[]
  getRecentRepairs: (limit?: number) => RepairRecord[]
  getSuccessRate: () => number
  clearRepairs: () => void
}

const useRepairStore = create<RepairState>()(
  persist(
    (set, get) => ({
      repairs: [],

      addRepair: (record) => {
        const id = generateId()
        const repair: RepairRecord = {
          ...record,
          id,
          timestamp: new Date().toISOString(),
          resolvedAt: null,
        }
        set((state) => ({
          repairs: [...state.repairs, repair],
        }))
        return id
      },

      updateRepair: (id, updates) => {
        set((state) => ({
          repairs: state.repairs.map((r) =>
            r.id === id ? { ...r, ...updates } : r,
          ),
        }))
      },

      getRepairsByAgent: (agentId) => {
        return get().repairs.filter((r) => r.agentId === agentId)
      },

      getRepairsByStatus: (status) => {
        return get().repairs.filter((r) => r.status === status)
      },

      getRecentRepairs: (limit = 20) => {
        return [...get().repairs]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit)
      },

      getSuccessRate: () => {
        const all = get().repairs
        if (all.length === 0) return 0
        const resolved = all.filter((r) => r.status === 'resolved').length
        return resolved / all.length
      },

      clearRepairs: () => {
        set({ repairs: [] })
      },
    }),
    {
      name: 'origina-repair-storage',
    },
  ),
)

export default useRepairStore
