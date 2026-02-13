import { eventBus, EVENT_TYPES } from './eventBus'
import { useActivityStore } from '../features/activity/stores/useActivityStore'

export function initCrossModuleListeners(): () => void {
  const cleanups: (() => void)[] = []

  // Log document signed events to activity feed
  cleanups.push(
    eventBus.on(EVENT_TYPES.DOCUMENT_SIGNED, (...args: unknown[]) => {
      const detail = args[0] as { id: string; name: string } | undefined
      if (!detail) return
      useActivityStore.getState().addActivity({
        type: 'document',
        action: 'signed',
        title: `Document signed: ${detail.name}`,
        description: `${detail.name} was signed`,
        entityId: detail.id,
        entityPath: `/documents/${detail.id}`,
        timestamp: new Date().toISOString(),
        userId: 'u-system',
        userName: 'System',
        icon: '\u270D\uFE0F',
      })
    })
  )

  // Log agent completion events
  cleanups.push(
    eventBus.on(EVENT_TYPES.AGENT_COMPLETED, (...args: unknown[]) => {
      const detail = args[0] as { task: string; agentType: string } | undefined
      if (!detail) return
      useActivityStore.getState().addActivity({
        type: 'team',
        action: 'completed',
        title: `Agent completed: ${detail.task}`,
        description: `${detail.agentType} agent finished: ${detail.task}`,
        entityId: '',
        entityPath: '/copilot',
        timestamp: new Date().toISOString(),
        userId: 'u-system',
        userName: 'Copilot',
        icon: '\uD83E\uDD16',
      })
    })
  )

  // Log agent failure events
  cleanups.push(
    eventBus.on(EVENT_TYPES.AGENT_FAILED, (...args: unknown[]) => {
      const detail = args[0] as { task: string; agentType: string } | undefined
      if (!detail) return
      useActivityStore.getState().addActivity({
        type: 'team',
        action: 'updated',
        title: `Agent failed: ${detail.task}`,
        description: `${detail.agentType} agent failed: ${detail.task}`,
        entityId: '',
        entityPath: '/copilot',
        timestamp: new Date().toISOString(),
        userId: 'u-system',
        userName: 'Copilot',
        icon: '\uD83D\uDEA8',
      })
    })
  )

  // Log invoice paid events
  cleanups.push(
    eventBus.on(EVENT_TYPES.INVOICE_PAID, (...args: unknown[]) => {
      const detail = args[0] as { id: string; invoiceNumber: string; customerName: string } | undefined
      if (!detail) return
      useActivityStore.getState().addActivity({
        type: 'document',
        action: 'completed',
        title: `Invoice ${detail.invoiceNumber} paid`,
        description: `${detail.customerName} paid invoice ${detail.invoiceNumber}`,
        entityId: detail.id,
        entityPath: '/accounting/invoices',
        timestamp: new Date().toISOString(),
        userId: 'u-system',
        userName: 'System',
        icon: '\uD83D\uDCB0',
      })
    })
  )

  // Log tax filed events
  cleanups.push(
    eventBus.on(EVENT_TYPES.TAX_FILED, (...args: unknown[]) => {
      const detail = args[0] as { id: string; taxYear: string } | undefined
      if (!detail) return
      useActivityStore.getState().addActivity({
        type: 'document',
        action: 'completed',
        title: `Tax filing submitted for ${detail.taxYear}`,
        description: `Tax return for ${detail.taxYear} was filed`,
        entityId: detail.id,
        entityPath: '/tax',
        timestamp: new Date().toISOString(),
        userId: 'u-system',
        userName: 'System',
        icon: '\uD83D\uDCC4',
      })
    })
  )

  // Log database created events
  cleanups.push(
    eventBus.on(EVENT_TYPES.DATABASE_CREATED, (...args: unknown[]) => {
      const detail = args[0] as { id: string; name: string } | undefined
      if (!detail) return
      useActivityStore.getState().addActivity({
        type: 'database',
        action: 'created',
        title: `Database created: ${detail.name}`,
        description: `New database "${detail.name}" was created`,
        entityId: detail.id,
        entityPath: `/data/${detail.id}`,
        timestamp: new Date().toISOString(),
        userId: 'u-system',
        userName: 'System',
        icon: '\uD83D\uDDC4\uFE0F',
      })
    })
  )

  // Log page created events
  cleanups.push(
    eventBus.on(EVENT_TYPES.PAGE_CREATED, (...args: unknown[]) => {
      const detail = args[0] as { id: string; title: string } | undefined
      if (!detail) return
      useActivityStore.getState().addActivity({
        type: 'page',
        action: 'created',
        title: `Page created: ${detail.title}`,
        description: `New page "${detail.title}" was created`,
        entityId: detail.id,
        entityPath: `/pages/${detail.id}`,
        timestamp: new Date().toISOString(),
        userId: 'u-system',
        userName: 'System',
        icon: '\uD83D\uDCC4',
      })
    })
  )

  return () => cleanups.forEach((fn) => fn())
}
