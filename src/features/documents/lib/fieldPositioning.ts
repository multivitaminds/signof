import type { DocumentField } from '../../../types'

export function isPointInField(x: number, y: number, field: DocumentField): boolean {
  return (
    x >= field.x &&
    x <= field.x + field.width &&
    y >= field.y &&
    y <= field.y + field.height
  )
}

export function doFieldsOverlap(a: DocumentField, b: DocumentField): boolean {
  if (a.page !== b.page) return false
  const aRight = a.x + a.width
  const aBottom = a.y + a.height
  const bRight = b.x + b.width
  const bBottom = b.y + b.height
  return a.x < bRight && aRight > b.x && a.y < bBottom && aBottom > b.y
}

export function snapToGrid(value: number, gridSize: number): number {
  if (gridSize <= 0) return value
  return Math.round(value / gridSize) * gridSize
}

export function clampFieldPosition(
  field: DocumentField,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  const x = Math.max(0, Math.min(field.x, containerWidth - field.width))
  const y = Math.max(0, Math.min(field.y, containerHeight - field.height))
  return { x, y }
}

export function getFieldBounds(field: DocumentField): {
  left: number
  top: number
  right: number
  bottom: number
} {
  return {
    left: field.x,
    top: field.y,
    right: field.x + field.width,
    bottom: field.y + field.height,
  }
}

export function findFieldAtPoint(
  x: number,
  y: number,
  fields: DocumentField[]
): DocumentField | null {
  // Search in reverse so top-most (last rendered) field wins
  for (let i = fields.length - 1; i >= 0; i--) {
    const field = fields[i]!
    if (isPointInField(x, y, field)) {
      return field
    }
  }
  return null
}
