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
  Relation: 'relation',
  Lookup: 'lookup',
  Rollup: 'rollup',
  Formula: 'formula',
} as const

export type DbFieldType = (typeof DbFieldType)[keyof typeof DbFieldType]

// ─── View Types ──────────────────────────────────────────────────────

export const ViewType = {
  Grid: 'grid',
  Kanban: 'kanban',
  Calendar: 'calendar',
  Gallery: 'gallery',
  Form: 'form',
  Timeline: 'timeline',
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

// ─── Rollup Aggregation (const object pattern) ──────────────────────

export const RollupAggregation = {
  Count: 'count',
  Sum: 'sum',
  Avg: 'avg',
  Min: 'min',
  Max: 'max',
  PercentEmpty: 'percent_empty',
  PercentFilled: 'percent_filled',
} as const

export type RollupAggregation = (typeof RollupAggregation)[keyof typeof RollupAggregation]

// ─── Field Config Types ─────────────────────────────────────────────

export interface RelationConfig {
  targetTableId: string
  targetFieldId: string
  allowMultiple: boolean
}

export interface LookupConfig {
  relationFieldId: string
  targetFieldId: string
}

export interface RollupConfig {
  relationFieldId: string
  targetFieldId: string
  aggregation: RollupAggregation
}

export interface FormulaConfig {
  expression: string
}

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
  relationConfig?: RelationConfig
  lookupConfig?: LookupConfig
  rollupConfig?: RollupConfig
  formulaConfig?: FormulaConfig
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
  rowColorRules?: RowColorRule[]
  timelineStartFieldId?: string
  timelineEndFieldId?: string
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
  [DbFieldType.Relation]: 'Relation',
  [DbFieldType.Lookup]: 'Lookup',
  [DbFieldType.Rollup]: 'Rollup',
  [DbFieldType.Formula]: 'Formula',
}

export const SELECT_COLORS = [
  '#4F46E5', '#059669', '#D97706', '#DC2626', '#7C3AED',
  '#0891B2', '#EA580C', '#DB2777', '#2563EB', '#65A30D',
] as const

// ─── Row Color Rules ────────────────────────────────────────────────

export const RowColorOperator = {
  Equals: 'equals',
  NotEquals: 'not_equals',
  Contains: 'contains',
  Gt: 'gt',
  Lt: 'lt',
  IsEmpty: 'is_empty',
  IsNotEmpty: 'is_not_empty',
} as const

export type RowColorOperator = (typeof RowColorOperator)[keyof typeof RowColorOperator]

export interface RowColorRule {
  id: string
  fieldId: string
  operator: RowColorOperator
  value: string
  color: string
}

// ─── Field Stat Types ───────────────────────────────────────────────

export const FieldStatType = {
  Count: 'count',
  Empty: 'empty',
  Filled: 'filled',
  Sum: 'sum',
  Avg: 'avg',
  Min: 'min',
  Max: 'max',
  Earliest: 'earliest',
  Latest: 'latest',
  Range: 'range',
  Distribution: 'distribution',
} as const

export type FieldStatType = (typeof FieldStatType)[keyof typeof FieldStatType]

// ─── Row Color Rule Labels ──────────────────────────────────────────

export const ROW_COLOR_OPERATOR_LABELS: Record<RowColorOperator, string> = {
  [RowColorOperator.Equals]: 'equals',
  [RowColorOperator.NotEquals]: 'does not equal',
  [RowColorOperator.Contains]: 'contains',
  [RowColorOperator.Gt]: 'greater than',
  [RowColorOperator.Lt]: 'less than',
  [RowColorOperator.IsEmpty]: 'is empty',
  [RowColorOperator.IsNotEmpty]: 'is not empty',
}

export const ROW_COLOR_PALETTE = [
  '#FEE2E2', '#FEF3C7', '#D1FAE5', '#DBEAFE', '#EDE9FE',
  '#FCE7F3', '#FFF7ED', '#ECFDF5', '#F0F9FF', '#F5F3FF',
] as const
