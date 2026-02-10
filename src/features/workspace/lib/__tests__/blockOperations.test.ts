import { splitBlock, mergeBlocks, adjustMarksForInsert, adjustMarksForDelete } from '../blockOperations'
import { BlockType, MarkType } from '../../types'
import type { Block, InlineMark } from '../../types'

function makeBlock(content: string, marks: InlineMark[] = []): Block {
  return {
    id: 'test-block',
    type: BlockType.Paragraph,
    content,
    marks,
    properties: {},
    children: [],
  }
}

describe('blockOperations', () => {
  describe('splitBlock', () => {
    it('splits content at offset', () => {
      const block = makeBlock('Hello World')
      const { before, after } = splitBlock(block, 5)
      expect(before.content).toBe('Hello')
      expect(after.content).toBe(' World')
    })

    it('splits at start', () => {
      const block = makeBlock('Hello')
      const { before, after } = splitBlock(block, 0)
      expect(before.content).toBe('')
      expect(after.content).toBe('Hello')
    })

    it('splits at end', () => {
      const block = makeBlock('Hello')
      const { before, after } = splitBlock(block, 5)
      expect(before.content).toBe('Hello')
      expect(after.content).toBe('')
    })

    it('creates new ID for after block', () => {
      const block = makeBlock('Hello')
      const { before, after } = splitBlock(block, 3)
      expect(before.id).toBe('test-block')
      expect(after.id).not.toBe('test-block')
    })

    it('splits marks correctly', () => {
      const block = makeBlock('Hello World', [
        { type: MarkType.Bold, from: 0, to: 5 },
        { type: MarkType.Italic, from: 6, to: 11 },
      ])
      const { before, after } = splitBlock(block, 5)
      expect(before.marks).toEqual([{ type: MarkType.Bold, from: 0, to: 5 }])
      expect(after.marks).toEqual([{ type: MarkType.Italic, from: 1, to: 6 }])
    })

    it('splits spanning mark', () => {
      const block = makeBlock('Hello World', [
        { type: MarkType.Bold, from: 3, to: 8 },
      ])
      const { before, after } = splitBlock(block, 5)
      expect(before.marks).toEqual([{ type: MarkType.Bold, from: 3, to: 5 }])
      expect(after.marks).toEqual([{ type: MarkType.Bold, from: 0, to: 3 }])
    })
  })

  describe('mergeBlocks', () => {
    it('merges two blocks', () => {
      const first = makeBlock('Hello')
      const second = makeBlock(' World')
      const merged = mergeBlocks(first, second)
      expect(merged.content).toBe('Hello World')
      expect(merged.id).toBe(first.id)
    })

    it('shifts second block marks', () => {
      const first = makeBlock('Hello')
      const second = makeBlock(' World', [{ type: MarkType.Bold, from: 1, to: 6 }])
      const merged = mergeBlocks(first, second)
      expect(merged.marks).toEqual([{ type: MarkType.Bold, from: 6, to: 11 }])
    })

    it('combines marks from both blocks', () => {
      const first = makeBlock('Hello', [{ type: MarkType.Bold, from: 0, to: 5 }])
      const second = makeBlock(' World', [{ type: MarkType.Italic, from: 0, to: 6 }])
      const merged = mergeBlocks(first, second)
      expect(merged.marks).toHaveLength(2)
    })
  })

  describe('adjustMarksForInsert', () => {
    it('shifts marks after insertion point', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 5, to: 10 }]
      const result = adjustMarksForInsert(marks, 3, 2)
      expect(result[0]).toEqual({ type: MarkType.Bold, from: 7, to: 12 })
    })

    it('extends mark that contains insertion point', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 2, to: 8 }]
      const result = adjustMarksForInsert(marks, 5, 3)
      expect(result[0]).toEqual({ type: MarkType.Bold, from: 2, to: 11 })
    })

    it('leaves marks before insertion point unchanged', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 0, to: 3 }]
      const result = adjustMarksForInsert(marks, 5, 2)
      expect(result[0]).toEqual({ type: MarkType.Bold, from: 0, to: 3 })
    })
  })

  describe('adjustMarksForDelete', () => {
    it('removes marks entirely within deletion range', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 3, to: 7 }]
      const result = adjustMarksForDelete(marks, 2, 8)
      expect(result).toHaveLength(0)
    })

    it('shifts marks after deletion range', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 8, to: 12 }]
      const result = adjustMarksForDelete(marks, 2, 5)
      expect(result[0]).toEqual({ type: MarkType.Bold, from: 5, to: 9 })
    })

    it('trims mark overlapping start of deletion', () => {
      const marks: InlineMark[] = [{ type: MarkType.Bold, from: 2, to: 7 }]
      const result = adjustMarksForDelete(marks, 5, 10)
      expect(result[0]).toEqual({ type: MarkType.Bold, from: 2, to: 5 })
    })
  })
})
