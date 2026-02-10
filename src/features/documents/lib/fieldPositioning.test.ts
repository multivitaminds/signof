import { describe, it, expect } from 'vitest'
import {
  isPointInField,
  doFieldsOverlap,
  snapToGrid,
  clampFieldPosition,
  getFieldBounds,
  findFieldAtPoint,
} from './fieldPositioning'
import { FieldType, type DocumentField } from '../../../types'

function makeField(overrides: Partial<DocumentField> = {}): DocumentField {
  return {
    id: 'f1',
    type: FieldType.Text,
    recipientId: 'r1',
    page: 1,
    x: 100,
    y: 100,
    width: 200,
    height: 30,
    required: true,
    ...overrides,
  }
}

describe('isPointInField', () => {
  const field = makeField()

  it('returns true for a point inside the field', () => {
    expect(isPointInField(150, 115, field)).toBe(true)
  })

  it('returns true for a point on the top-left corner', () => {
    expect(isPointInField(100, 100, field)).toBe(true)
  })

  it('returns true for a point on the bottom-right corner', () => {
    expect(isPointInField(300, 130, field)).toBe(true)
  })

  it('returns false for a point outside the field', () => {
    expect(isPointInField(50, 50, field)).toBe(false)
  })

  it('returns false for a point below the field', () => {
    expect(isPointInField(150, 200, field)).toBe(false)
  })
})

describe('doFieldsOverlap', () => {
  it('returns true for overlapping fields on the same page', () => {
    const a = makeField({ x: 100, y: 100, width: 200, height: 30 })
    const b = makeField({ id: 'f2', x: 200, y: 110, width: 200, height: 30 })
    expect(doFieldsOverlap(a, b)).toBe(true)
  })

  it('returns false for non-overlapping fields on the same page', () => {
    const a = makeField({ x: 100, y: 100, width: 50, height: 30 })
    const b = makeField({ id: 'f2', x: 200, y: 100, width: 50, height: 30 })
    expect(doFieldsOverlap(a, b)).toBe(false)
  })

  it('returns false for overlapping coordinates on different pages', () => {
    const a = makeField({ page: 1, x: 100, y: 100, width: 200, height: 30 })
    const b = makeField({ id: 'f2', page: 2, x: 100, y: 100, width: 200, height: 30 })
    expect(doFieldsOverlap(a, b)).toBe(false)
  })

  it('returns false when fields are exactly adjacent', () => {
    const a = makeField({ x: 100, y: 100, width: 100, height: 30 })
    const b = makeField({ id: 'f2', x: 200, y: 100, width: 100, height: 30 })
    expect(doFieldsOverlap(a, b)).toBe(false)
  })
})

describe('snapToGrid', () => {
  it('snaps to nearest grid line', () => {
    expect(snapToGrid(17, 10)).toBe(20)
    expect(snapToGrid(13, 10)).toBe(10)
    expect(snapToGrid(15, 10)).toBe(20)
  })

  it('returns the value unchanged for gridSize 0', () => {
    expect(snapToGrid(17, 0)).toBe(17)
  })

  it('snaps to 1px grid exactly', () => {
    expect(snapToGrid(17.3, 1)).toBe(17)
  })
})

describe('clampFieldPosition', () => {
  it('clamps field within container bounds', () => {
    const field = makeField({ x: 900, y: 900, width: 200, height: 30 })
    const result = clampFieldPosition(field, 800, 600)
    expect(result.x).toBe(600) // 800 - 200
    expect(result.y).toBe(570) // 600 - 30
  })

  it('clamps negative positions to zero', () => {
    const field = makeField({ x: -50, y: -20, width: 200, height: 30 })
    const result = clampFieldPosition(field, 800, 600)
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
  })

  it('does not change position already within bounds', () => {
    const field = makeField({ x: 100, y: 100, width: 200, height: 30 })
    const result = clampFieldPosition(field, 800, 600)
    expect(result.x).toBe(100)
    expect(result.y).toBe(100)
  })
})

describe('getFieldBounds', () => {
  it('returns correct bounds', () => {
    const field = makeField({ x: 50, y: 75, width: 200, height: 30 })
    const bounds = getFieldBounds(field)
    expect(bounds.left).toBe(50)
    expect(bounds.top).toBe(75)
    expect(bounds.right).toBe(250)
    expect(bounds.bottom).toBe(105)
  })
})

describe('findFieldAtPoint', () => {
  const fields = [
    makeField({ id: 'f1', x: 0, y: 0, width: 100, height: 50 }),
    makeField({ id: 'f2', x: 80, y: 30, width: 100, height: 50 }),
  ]

  it('returns the topmost field at a point', () => {
    // Point (90, 40) is inside both f1 and f2. f2 should win (later in array)
    const result = findFieldAtPoint(90, 40, fields)
    expect(result?.id).toBe('f2')
  })

  it('returns null when no field at point', () => {
    expect(findFieldAtPoint(500, 500, fields)).toBeNull()
  })

  it('returns the only matching field', () => {
    const result = findFieldAtPoint(10, 10, fields)
    expect(result?.id).toBe('f1')
  })

  it('returns null for empty array', () => {
    expect(findFieldAtPoint(10, 10, [])).toBeNull()
  })
})
