import { FieldType, type DocumentField } from '../../../types'
import type { FieldTypeConfig } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const FIELD_TYPE_CONFIGS: Record<FieldType, FieldTypeConfig> = {
  [FieldType.Signature]: {
    type: FieldType.Signature,
    label: 'Signature',
    icon: 'pen-tool',
    defaultWidth: 200,
    defaultHeight: 60,
    resizable: true,
    hasValue: true,
  },
  [FieldType.Initial]: {
    type: FieldType.Initial,
    label: 'Initials',
    icon: 'type',
    defaultWidth: 80,
    defaultHeight: 40,
    resizable: true,
    hasValue: true,
  },
  [FieldType.DateSigned]: {
    type: FieldType.DateSigned,
    label: 'Date Signed',
    icon: 'calendar',
    defaultWidth: 150,
    defaultHeight: 30,
    resizable: false,
    hasValue: false,
  },
  [FieldType.Text]: {
    type: FieldType.Text,
    label: 'Text',
    icon: 'text-cursor-input',
    defaultWidth: 200,
    defaultHeight: 30,
    resizable: true,
    hasValue: true,
  },
  [FieldType.Checkbox]: {
    type: FieldType.Checkbox,
    label: 'Checkbox',
    icon: 'check-square',
    defaultWidth: 24,
    defaultHeight: 24,
    resizable: false,
    hasValue: true,
  },
  [FieldType.Dropdown]: {
    type: FieldType.Dropdown,
    label: 'Dropdown',
    icon: 'chevron-down',
    defaultWidth: 200,
    defaultHeight: 30,
    resizable: true,
    hasValue: true,
  },
  [FieldType.Attachment]: {
    type: FieldType.Attachment,
    label: 'Attachment',
    icon: 'paperclip',
    defaultWidth: 100,
    defaultHeight: 40,
    resizable: true,
    hasValue: true,
  },
}

export function createDefaultField(
  type: FieldType,
  recipientId: string,
  page: number,
  x: number,
  y: number
): DocumentField {
  const config = FIELD_TYPE_CONFIGS[type]
  return {
    id: generateId(),
    type,
    recipientId,
    page,
    x,
    y,
    width: config.defaultWidth,
    height: config.defaultHeight,
    required: true,
    label: config.label,
    placeholder: `Enter ${config.label.toLowerCase()}`,
    options: type === FieldType.Dropdown ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
  }
}

export function getFieldTypeLabel(type: FieldType): string {
  return FIELD_TYPE_CONFIGS[type].label
}

export const FIELD_COLORS: string[] = [
  '#4F46E5', // indigo
  '#059669', // green
  '#D97706', // amber
  '#DC2626', // red
  '#7C3AED', // purple
  '#0891B2', // cyan
]
