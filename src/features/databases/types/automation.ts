// ─── Automation Trigger (const object pattern) ──────────────────────

export const AutomationTrigger = {
  RecordCreated: 'record_created',
  RecordUpdated: 'record_updated',
  FieldChanged: 'field_changed',
  ScheduledTime: 'scheduled_time',
  StatusChanged: 'status_changed',
} as const

export type AutomationTrigger = (typeof AutomationTrigger)[keyof typeof AutomationTrigger]

// ─── Automation Action (const object pattern) ────────────────────────

export const AutomationAction = {
  SendNotification: 'send_notification',
  UpdateField: 'update_field',
  CreateRecord: 'create_record',
  MoveToView: 'move_to_view',
  SendWebhook: 'send_webhook',
} as const

export type AutomationAction = (typeof AutomationAction)[keyof typeof AutomationAction]

// ─── Automation Rule ─────────────────────────────────────────────────

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: AutomationTrigger
  triggerConfig: Record<string, string>
  action: AutomationAction
  actionConfig: Record<string, string>
  enabled: boolean
  createdAt: string
  lastRunAt: string | null
  runCount: number
}

// ─── Labels ──────────────────────────────────────────────────────────

export const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
  [AutomationTrigger.RecordCreated]: 'Record Created',
  [AutomationTrigger.RecordUpdated]: 'Record Updated',
  [AutomationTrigger.FieldChanged]: 'Field Changed',
  [AutomationTrigger.ScheduledTime]: 'Scheduled Time',
  [AutomationTrigger.StatusChanged]: 'Status Changed',
}

export const ACTION_LABELS: Record<AutomationAction, string> = {
  [AutomationAction.SendNotification]: 'Send Notification',
  [AutomationAction.UpdateField]: 'Update Field',
  [AutomationAction.CreateRecord]: 'Create Record',
  [AutomationAction.MoveToView]: 'Move to View',
  [AutomationAction.SendWebhook]: 'Send Webhook',
}

export const TRIGGER_DESCRIPTIONS: Record<AutomationTrigger, string> = {
  [AutomationTrigger.RecordCreated]: 'Runs when a new record is added to the table',
  [AutomationTrigger.RecordUpdated]: 'Runs when any field in a record is modified',
  [AutomationTrigger.FieldChanged]: 'Runs when a specific field value changes',
  [AutomationTrigger.ScheduledTime]: 'Runs at a scheduled time interval',
  [AutomationTrigger.StatusChanged]: 'Runs when a status field changes value',
}

export const ACTION_DESCRIPTIONS: Record<AutomationAction, string> = {
  [AutomationAction.SendNotification]: 'Send a notification message to specified users',
  [AutomationAction.UpdateField]: 'Update a field value in the triggering record',
  [AutomationAction.CreateRecord]: 'Create a new record with specified field values',
  [AutomationAction.MoveToView]: 'Move the record to a filtered view',
  [AutomationAction.SendWebhook]: 'Send an HTTP POST request to an external URL',
}
