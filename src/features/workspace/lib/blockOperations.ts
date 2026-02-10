import type { Block, InlineMark } from '../types'
import { BlockType } from '../types'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/**
 * Adjust mark positions after text insertion at a given position.
 */
export function adjustMarksForInsert(
  marks: InlineMark[],
  position: number,
  length: number
): InlineMark[] {
  return marks.map((mark) => {
    if (mark.to <= position) return mark
    if (mark.from >= position) {
      return { ...mark, from: mark.from + length, to: mark.to + length }
    }
    // Mark spans the insertion point — extend it
    return { ...mark, to: mark.to + length }
  })
}

/**
 * Adjust mark positions after text deletion in range [from, to).
 */
export function adjustMarksForDelete(
  marks: InlineMark[],
  from: number,
  to: number
): InlineMark[] {
  const deleteLen = to - from
  return marks
    .map((mark) => {
      // Entirely before deletion
      if (mark.to <= from) return mark
      // Entirely after deletion
      if (mark.from >= to) {
        return { ...mark, from: mark.from - deleteLen, to: mark.to - deleteLen }
      }
      // Entirely within deletion — remove
      if (mark.from >= from && mark.to <= to) return null
      // Overlaps start of deletion
      if (mark.from < from && mark.to <= to) {
        return { ...mark, to: from }
      }
      // Overlaps end of deletion
      if (mark.from >= from && mark.to > to) {
        return { ...mark, from, to: mark.to - deleteLen }
      }
      // Spans entire deletion
      return { ...mark, to: mark.to - deleteLen }
    })
    .filter((m): m is InlineMark => m !== null && m.from < m.to)
}

/**
 * Split a block at the given offset, producing two blocks.
 * The first block keeps content before offset, the second gets content after.
 */
export function splitBlock(
  block: Block,
  offset: number
): { before: Block; after: Block } {
  const beforeContent = block.content.slice(0, offset)
  const afterContent = block.content.slice(offset)

  const beforeMarks: InlineMark[] = []
  const afterMarks: InlineMark[] = []

  for (const mark of block.marks) {
    // Mark entirely in first half
    if (mark.to <= offset) {
      beforeMarks.push(mark)
    }
    // Mark entirely in second half
    else if (mark.from >= offset) {
      afterMarks.push({
        ...mark,
        from: mark.from - offset,
        to: mark.to - offset,
      })
    }
    // Mark spans the split point
    else {
      beforeMarks.push({ ...mark, to: offset })
      afterMarks.push({
        ...mark,
        from: 0,
        to: mark.to - offset,
      })
    }
  }

  const before: Block = {
    ...block,
    content: beforeContent,
    marks: beforeMarks,
  }

  const after: Block = {
    id: generateId(),
    type: BlockType.Paragraph,
    content: afterContent,
    marks: afterMarks,
    properties: {},
    children: [],
  }

  return { before, after }
}

/**
 * Merge two blocks into one. The second block's content is appended to the first.
 * Returns the merged block (using first block's id and type).
 */
export function mergeBlocks(first: Block, second: Block): Block {
  const joinOffset = first.content.length
  const shiftedMarks = second.marks.map((mark) => ({
    ...mark,
    from: mark.from + joinOffset,
    to: mark.to + joinOffset,
  }))

  return {
    ...first,
    content: first.content + second.content,
    marks: [...first.marks, ...shiftedMarks],
  }
}
