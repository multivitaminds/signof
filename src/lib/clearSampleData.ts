import { useDocumentStore } from '../stores/useDocumentStore'
import { useProjectStore } from '../features/projects/stores/useProjectStore'
import { useWorkspaceStore } from '../features/workspace/stores/useWorkspaceStore'
import { useSchedulingStore } from '../features/scheduling/stores/useSchedulingStore'
import { useDatabaseStore } from '../features/databases/stores/useDatabaseStore'
import { useInboxStore } from '../features/inbox/stores/useInboxStore'
import { useActivityStore } from '../features/activity/stores/useActivityStore'
import useAgentStore from '../features/ai/stores/useAgentStore'
import { useTaxStore } from '../features/tax/stores/useTaxStore'
import { useTaxDocumentStore } from '../features/tax/stores/useTaxDocumentStore'
import { useTaxFormStore } from '../features/tax/stores/useTaxFormStore'
import { useTaxFilingStore } from '../features/tax/stores/useTaxFilingStore'
import { useTeamStore } from '../features/settings/stores/useTeamStore'
import { useTemplateStore } from '../features/documents/stores/useTemplateStore'
import { useContactStore } from '../features/documents/stores/useContactStore'
import { useBillingStore } from '../features/settings/stores/useBillingStore'
import { useAccountingStore } from '../features/accounting/stores/useAccountingStore'
import { useInvoiceStore } from '../features/accounting/stores/useInvoiceStore'
import { useExpenseStore } from '../features/accounting/stores/useExpenseStore'
import { useAccountingContactStore } from '../features/accounting/stores/useAccountingContactStore'
import { usePayrollStore } from '../features/accounting/stores/usePayrollStore'

export function clearAllSampleData(): void {
  useDocumentStore.getState().clearData()
  useProjectStore.getState().clearData()
  useWorkspaceStore.getState().clearData()
  useSchedulingStore.getState().clearData()
  useDatabaseStore.getState().clearData()
  useInboxStore.getState().clearData()
  useActivityStore.getState().clearData()
  useAgentStore.getState().clearData()
  useTaxStore.getState().clearData()
  useTaxDocumentStore.getState().clearData()
  useTaxFormStore.getState().clearData()
  useTaxFilingStore.getState().clearData()
  useTeamStore.getState().clearData()
  useTemplateStore.getState().clearData()
  useContactStore.getState().clearData()
  useBillingStore.getState().clearSampleData()
  useAccountingStore.getState().clearData()
  useInvoiceStore.getState().clearData()
  useExpenseStore.getState().clearData()
  useAccountingContactStore.getState().clearData()
  usePayrollStore.getState().clearData()
}
