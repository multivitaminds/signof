import { useBillingStore } from '../features/settings/stores/useBillingStore'
import { PLANS } from '../features/settings/lib/planData'
import { MODULE_ADD_ONS } from '../features/settings/lib/addOnData'

export function useFeatureGate() {
  const currentPlan = useBillingStore((s) => s.currentPlan)
  const activeAddOns = useBillingStore((s) => s.activeAddOns)

  const planData = PLANS.find((p) => p.id === currentPlan)

  function hasModule(moduleId: string): boolean {
    if (!planData) return false
    if (planData.includedModules.includes(moduleId)) return true
    for (const addOnId of activeAddOns) {
      const addOn = MODULE_ADD_ONS.find((a) => a.id === addOnId)
      if (addOn) return true
    }
    return false
  }

  function isWithinLimits(resource: 'documents' | 'storage' | 'members', current: number): boolean {
    if (!planData) return false
    const limitMap = {
      documents: planData.documentLimit,
      storage: planData.storageLimit,
      members: planData.memberLimit,
    }
    const limit = limitMap[resource]
    if (limit === null) return true
    return current < limit
  }

  function hasApiAccess(): boolean {
    return planData?.apiAccess ?? false
  }

  return { hasModule, isWithinLimits, hasApiAccess, currentPlan, planData }
}
