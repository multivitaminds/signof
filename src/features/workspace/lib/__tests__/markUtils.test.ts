import { addMark, removeMark, toggleMark, hasMarkInRange, getMarksAtPosition, resolveOverlaps } from '../markUtils'
import { MarkType } from '../../types'
import type { InlineMark } from '../../types'

describe('markUtils', () => {
  describe('addMark', () => {
    it('adds a new mark', () => {
      const result = addMark([], { type: MarkType.Bold, from: 0, to: 5 })
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ type: MarkType.Bold, from: 0, to: 5 })
    })

    it('merges overlapping same-type marks', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 0, to: 5 }]
      const result = addMark(marks, { type: MarkType.Bold, from: 3, to: 8 })
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ type: MarkType.Bold, from: 0, to: 8 })
    })

    it('keeps different types separate', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 0, to: 5 }]
      const result = addMark(marks, { type: MarkType.Italic, from: 0, to: 5 })
      expect(result).toHaveLength(2)
    })
  })

  describe('removeMark', () => {
    it('removes mark from range', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 0, to: 10 }]
      const result = removeMark(marks, MarkType.Bold, 0, 10)
      expect(result).toHaveLength(0)
    })

    it('trims mark at edges', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 0, to: 10 }]
      const result = removeMark(marks, MarkType.Bold, 3, 7)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ type: MarkType.Bold, from: 0, to: 3 })
      expect(result[1]).toEqual({ type: MarkType.Bold, from: 7, to: 10 })
    })

    it('only removes specified type', () => {
      const marks: InlineMark[] = [
        { type: MarkType.Bold, from: 0, to: 5 },
        { type: MarkType.Italic, from: 0, to: 5 },
      ]
      const result = removeMark(marks, MarkType.Bold, 0, 5)
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe(MarkType.Italic)
    })
  })

  describe('toggleMark', () => {
    it('adds mark when not present', () => {
      const result = toggleMark([], MarkType.Bold, 0, 5)
      expect(result).toHaveLength(1)
    })

    it('removes mark when fully present', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 0, to: 10 }]
      const result = toggleMark(marks, MarkType.Bold, 0, 10)
      expect(result).toHaveLength(0)
    })
  })

  describe('hasMarkInRange', () => {
    it('returns true when range is fully covered', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 0, to: 10 }]
      expect(hasMarkInRange(marks, MarkType.Bold, 2, 8)).toBe(true)
    })

    it('returns false when range is not covered', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 0, to: 5 }]
      expect(hasMarkInRange(marks, MarkType.Bold, 3, 8)).toBe(false)
    })

    it('returns false for wrong type', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 0, to: 10 }]
      expect(hasMarkInRange(marks, MarkType.Italic, 0, 5)).toBe(false)
    })
  })

  describe('getMarksAtPosition', () => {
    it('returns marks at position', () => {
      const marks: InlineMark[] = [
        { type: MarkType.Bold, from: 0, to: 5 },
        { type: MarkType.Italic, from: 3, to: 8 },
      ]
      const result = getMarksAtPosition(marks, 4)
      expect(result).toHaveLength(2)
    })

    it('returns empty for position outside marks', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 0, to: 5 }]
      expect(getMarksAtPosition(marks, 6)).toHaveLength(0)
    })
  })

  describe('resolveOverlaps', () => {
    it('merges overlapping same-type marks', () => {
      const marks: InlineMark[] = [
        { type: MarkType.Bold, from: 0, to: 5 },
        { type: MarkType.Bold, from: 3, to: 8 },
      ]
      const result = resolveOverlaps(marks)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ type: MarkType.Bold, from: 0, to: 8 })
    })

    it('merges adjacent same-type marks', () => {
      const marks: InlineMark[] = [
        { type: MarkType.Bold, from: 0, to: 5 },
        { type: MarkType.Bold, from: 5, to: 10 },
      ]
      const result = resolveOverlaps(marks)
      expect(result).toHaveLength(1)
    })

    it('keeps non-overlapping marks separate', () => {
      const marks: InlineMark[] = [
        { type: MarkType.Bold, from: 0, to: 3 },
        { type: MarkType.Bold, from: 6, to: 9 },
      ]
      const result = resolveOverlaps(marks)
      expect(result).toHaveLength(2)
    })
  })
})
