import { describe, it, expect } from 'vitest'
import { evaluateFormula } from './formulaEngine'
import type { DbRow, DbField, DbFieldType } from '../types'

function makeRow(cells: Record<string, string | number | boolean | null>): DbRow {
  return {
    id: 'row1',
    cells,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  }
}

function makeFields(defs: Array<{ id: string; name: string; type: string }>): DbField[] {
  return defs.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type as DbFieldType,
    width: 160,
  }))
}

const sampleFields = makeFields([
  { id: 'f1', name: 'Price', type: 'number' },
  { id: 'f2', name: 'Quantity', type: 'number' },
  { id: 'f3', name: 'Name', type: 'text' },
  { id: 'f4', name: 'Active', type: 'checkbox' },
])

describe('formulaEngine', () => {
  describe('math operations', () => {
    it('evaluates basic arithmetic: +, -, *, /', () => {
      const row = makeRow({ f1: 10, f2: 3 })
      expect(evaluateFormula('{Price} + {Quantity}', row, sampleFields)).toBe(13)
      expect(evaluateFormula('{Price} - {Quantity}', row, sampleFields)).toBe(7)
      expect(evaluateFormula('{Price} * {Quantity}', row, sampleFields)).toBe(30)
      expect(evaluateFormula('{Price} / {Quantity}', row, sampleFields)).toBeCloseTo(3.333, 2)
    })

    it('evaluates modulo operator', () => {
      const row = makeRow({ f1: 10, f2: 3 })
      expect(evaluateFormula('{Price} % {Quantity}', row, sampleFields)).toBe(1)
    })

    it('respects operator precedence', () => {
      const row = makeRow({ f1: 2, f2: 3 })
      // 2 + 3 * 2 = 8, not 10
      expect(evaluateFormula('{Price} + {Quantity} * 2', row, sampleFields)).toBe(8)
    })
  })

  describe('string functions', () => {
    it('evaluates CONCAT', () => {
      const row = makeRow({ f3: 'Hello' })
      expect(evaluateFormula("CONCAT({Name}, ' ', 'World')", row, sampleFields)).toBe('Hello World')
    })

    it('evaluates UPPER and LOWER', () => {
      const row = makeRow({ f3: 'Hello' })
      expect(evaluateFormula('UPPER({Name})', row, sampleFields)).toBe('HELLO')
      expect(evaluateFormula('LOWER({Name})', row, sampleFields)).toBe('hello')
    })

    it('evaluates LEN and TRIM', () => {
      const row = makeRow({ f3: '  Hello  ' })
      expect(evaluateFormula('LEN({Name})', row, sampleFields)).toBe(9)
      expect(evaluateFormula('TRIM({Name})', row, sampleFields)).toBe('Hello')
    })
  })

  describe('IF/AND/OR logic', () => {
    it('evaluates IF with comparison', () => {
      const row = makeRow({ f1: 150, f2: 5 })
      expect(evaluateFormula("IF({Price} > 100, 'High', 'Low')", row, sampleFields)).toBe('High')
    })

    it('evaluates IF returning Low', () => {
      const row = makeRow({ f1: 50, f2: 5 })
      expect(evaluateFormula("IF({Price} > 100, 'High', 'Low')", row, sampleFields)).toBe('Low')
    })

    it('evaluates AND and OR', () => {
      const row = makeRow({ f1: 10, f2: 5 })
      expect(evaluateFormula('AND({Price} > 5, {Quantity} > 3)', row, sampleFields)).toBe(true)
      expect(evaluateFormula('AND({Price} > 5, {Quantity} > 10)', row, sampleFields)).toBe(false)
      expect(evaluateFormula('OR({Price} > 100, {Quantity} > 3)', row, sampleFields)).toBe(true)
    })

    it('evaluates NOT', () => {
      const row = makeRow({ f4: true })
      expect(evaluateFormula('NOT({Active})', row, sampleFields)).toBe(false)
    })
  })

  describe('field references', () => {
    it('resolves field references correctly', () => {
      const row = makeRow({ f1: 25, f3: 'Widget' })
      expect(evaluateFormula('{Price}', row, sampleFields)).toBe(25)
      expect(evaluateFormula('{Name}', row, sampleFields)).toBe('Widget')
    })

    it('returns error for unknown field', () => {
      const row = makeRow({})
      const result = evaluateFormula('{NonExistent}', row, sampleFields)
      expect(typeof result).toBe('string')
      expect(String(result)).toContain('#ERROR')
    })
  })

  describe('division by zero', () => {
    it('returns error on division by zero', () => {
      const row = makeRow({ f1: 10, f2: 0 })
      const result = evaluateFormula('{Price} / {Quantity}', row, sampleFields)
      expect(typeof result).toBe('string')
      expect(String(result)).toContain('#ERROR')
      expect(String(result)).toContain('Division by zero')
    })
  })

  describe('nested functions', () => {
    it('evaluates nested function calls', () => {
      const row = makeRow({ f3: 'hello' })
      expect(evaluateFormula('LEN(UPPER({Name}))', row, sampleFields)).toBe(5)
    })

    it('evaluates IF with nested math', () => {
      const row = makeRow({ f1: 10, f2: 5 })
      expect(evaluateFormula('IF({Price} * {Quantity} > 40, SUM({Price}, {Quantity}), 0)', row, sampleFields)).toBe(15)
    })
  })

  describe('date functions', () => {
    it('NOW() returns an ISO date string', () => {
      const row = makeRow({})
      const result = evaluateFormula('NOW()', row, sampleFields)
      expect(typeof result).toBe('string')
      // Should be a valid ISO date
      expect(new Date(String(result)).toISOString()).toBe(result)
    })

    it('TODAY() returns a date string (YYYY-MM-DD)', () => {
      const row = makeRow({})
      const result = evaluateFormula('TODAY()', row, sampleFields)
      expect(typeof result).toBe('string')
      expect(String(result)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('DAYS() computes difference between dates', () => {
      const row = makeRow({})
      const result = evaluateFormula("DAYS('2025-01-10', '2025-01-01')", row, sampleFields)
      expect(result).toBe(9)
    })
  })

  describe('invalid expressions', () => {
    it('returns error for malformed expression', () => {
      const row = makeRow({})
      const result = evaluateFormula('+ + +', row, sampleFields)
      expect(typeof result).toBe('string')
      expect(String(result)).toContain('#ERROR')
    })

    it('returns null for empty expression', () => {
      const row = makeRow({})
      expect(evaluateFormula('', row, sampleFields)).toBe(null)
    })
  })

  describe('math functions', () => {
    it('evaluates SUM, ABS, ROUND, FLOOR, CEIL', () => {
      const row = makeRow({ f1: -3.7, f2: 2.3 })
      expect(evaluateFormula('ABS({Price})', row, sampleFields)).toBeCloseTo(3.7)
      expect(evaluateFormula('ROUND({Price}, 0)', row, sampleFields)).toBe(-4)
      expect(evaluateFormula('FLOOR({Quantity})', row, sampleFields)).toBe(2)
      expect(evaluateFormula('CEIL({Quantity})', row, sampleFields)).toBe(3)
      expect(evaluateFormula('SUM({Price}, {Quantity}, 5)', row, sampleFields)).toBeCloseTo(3.6)
    })
  })
})
