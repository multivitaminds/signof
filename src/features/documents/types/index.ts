// ─── Re-exports from core types ─────────────────────────────────────
export type {
  DocumentField,
  FieldType,
  Template,
  RecipientRole,
  Contact,
  ContactSigningHistory,
  Folder,
} from '../../../types'

export { FieldType as FieldTypeEnum } from '../../../types'

// ─── Module-specific types ──────────────────────────────────────────

export interface FieldTypeConfig {
  type: import('../../../types').FieldType
  label: string
  icon: string
  defaultWidth: number
  defaultHeight: number
  resizable: boolean
  hasValue: boolean
}

export interface DragState {
  isDragging: boolean
  fieldType: import('../../../types').FieldType | null
  startX: number
  startY: number
}

export interface FieldSelection {
  selectedFieldId: string | null
  hoveredFieldId: string | null
}
