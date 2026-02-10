// ─── Database Field Types (const object pattern) ─────────────────────

export const DbFieldType = {
  Text: 'text',
  Number: 'number',
  Select: 'select',
  MultiSelect: 'multi_select',
  Date: 'date',
  Checkbox: 'checkbox',
  Url: 'url',
  Email: 'email',
  Phone: 'phone',
  CreatedTime: 'created_time',
  LastEditedTime: 'last_edited_time',
  Attachment: 'attachment',
} as const

export type DbFieldType = (typeof DbFieldType)[keyof typeof DbFieldType]

// ─── View Types ──────────────────────────────────────────────────────

export const ViewType = {
  Grid: 'grid',
  Kanban: 'kanban',
  Calendar: 'calendar',
  Gallery: 'gallery',
  Form: 'form',
} as const

export type ViewType = (typeof ViewType)[keyof typeof ViewType]

// ─── Filter Operators ────────────────────────────────────────────────

export const FilterOperator = {
  Is: 'is',
  IsNot: 'is_not',
  Contains: 'contains',
  NotContains: 'not_contains',
  IsEmpty: 'is_empty',
  IsNotEmpty: 'is_not_empty',
  Gt: 'gt',
  Lt: 'lt',
} as const

export type FilterOperator = (typeof FilterOperator)[keyof typeof FilterOperator]

// ─── Data Types ──────────────────────────────────────────────────────

export interface FieldChoice {
  id: string
  name: string
  color: string
}

export interface DbField {
  id: string
  name: string
  type: DbFieldType
  options?: { choices: FieldChoice[] }
  required?: boolean
  width?: number
}

export interface Filter {
  id: string
  fieldId: string
  operator: FilterOperator
  value: string
}

export interface Sort {
  fieldId: string
  direction: 'asc' | 'desc'
}

export interface DbView {
  id: string
  name: string
  type: ViewType
  tableId: string
  filters: Filter[]
  sorts: Sort[]
  groupBy?: string
  hiddenFields: string[]
  fieldOrder: string[]
}

export type CellValue = string | number | boolean | string[] | null

export interface DbRow {
  id: string
  cells: Record<string, CellValue>
  createdAt: string
  updatedAt: string
}

export interface DbTable {
  id: string
  name: string
  icon: string
  fields: DbField[]
  rows: DbRow[]
  views: DbView[]
}

export interface Database {
  id: string
  name: string
  icon: string
  description: string
  tables: string[]
  createdAt: string
  updatedAt: string
}

// ─── Labels ──────────────────────────────────────────────────────────

export const FIELD_TYPE_LABELS: Record<DbFieldType, string> = {
  [DbFieldType.Text]: 'Text',
  [DbFieldType.Number]: 'Number',
  [DbFieldType.Select]: 'Select',
  [DbFieldType.MultiSelect]: 'Multi Select',
  [DbFieldType.Date]: 'Date',
  [DbFieldType.Checkbox]: 'Checkbox',
  [DbFieldType.Url]: 'URL',
  [DbFieldType.Email]: 'Email',
  [DbFieldType.Phone]: 'Phone',
  [DbFieldType.CreatedTime]: 'Created Time',
  [DbFieldType.LastEditedTime]: 'Last Edited',
  [DbFieldType.Attachment]: 'Attachment',
}

export const SELECT_COLORS = [
  '#4F46E5', '#059669', '#D97706', '#DC2626', '#7C3AED',
  '#0891B2', '#EA580C', '#DB2777', '#2563EB', '#65A30D',
] as const
