import { useEffect } from 'react'
import { eventBus, EVENT_TYPES } from '../../../lib/eventBus'
import { useNotificationStore } from '../stores/useNotificationStore'
import { NotificationType } from '../types'

export function useNotificationListener() {
  const addNotification = useNotificationStore((s) => s.addNotification)

  useEffect(() => {
    const unsubDocSigned = eventBus.on(EVENT_TYPES.DOCUMENT_SIGNED, (...args: unknown[]) => {
      const name = typeof args[0] === 'string' ? args[0] : 'a document'
      addNotification({
        type: NotificationType.DocumentSigned,
        title: 'Document signed',
        body: `${name} has been signed`,
        module: 'documents',
        entityId: typeof args[1] === 'string' ? args[1] : null,
        entityPath: '/documents',
        icon: 'file-signature',
      })
    })

    const unsubAgentCompleted = eventBus.on(EVENT_TYPES.AGENT_COMPLETED, (...args: unknown[]) => {
      const taskName = typeof args[0] === 'string' ? args[0] : 'a task'
      addNotification({
        type: NotificationType.AgentCompleted,
        title: 'Agent task completed',
        body: `Agent finished "${taskName}"`,
        module: 'copilot',
        entityId: typeof args[1] === 'string' ? args[1] : null,
        entityPath: '/copilot',
        icon: 'sparkles',
      })
    })

    const unsubAgentFailed = eventBus.on(EVENT_TYPES.AGENT_FAILED, (...args: unknown[]) => {
      const taskName = typeof args[0] === 'string' ? args[0] : 'a task'
      addNotification({
        type: NotificationType.AgentFailed,
        title: 'Agent encountered an error',
        body: `Agent failed on "${taskName}"`,
        module: 'copilot',
        entityId: typeof args[1] === 'string' ? args[1] : null,
        entityPath: '/copilot',
        icon: 'alert-triangle',
      })
    })

    const unsubInvoicePaid = eventBus.on(EVENT_TYPES.INVOICE_PAID, (...args: unknown[]) => {
      const invoiceLabel = typeof args[0] === 'string' ? args[0] : 'An invoice'
      addNotification({
        type: NotificationType.InvoicePaid,
        title: 'Invoice payment received',
        body: `${invoiceLabel} was paid`,
        module: 'accounting',
        entityId: typeof args[1] === 'string' ? args[1] : null,
        entityPath: '/accounting/invoices',
        icon: 'dollar-sign',
      })
    })

    const unsubFleetAlert = eventBus.on(EVENT_TYPES.FLEET_ALERT, (...args: unknown[]) => {
      const message = typeof args[0] === 'string' ? args[0] : 'A system alert was triggered'
      addNotification({
        type: NotificationType.SystemAlert,
        title: 'System alert',
        body: message,
        module: 'system',
        entityId: null,
        entityPath: null,
        icon: 'alert-circle',
      })
    })

    return () => {
      unsubDocSigned()
      unsubAgentCompleted()
      unsubAgentFailed()
      unsubInvoicePaid()
      unsubFleetAlert()
    }
  }, [addNotification])
}
