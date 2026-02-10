import type { InlineMark, MarkType } from '../types'

/**
 * Resolve overlapping marks of the same type by merging them.
 */
export function resolveOverlaps(marks: InlineMark[]): InlineMark[] {
  if (marks.length <= 1) return marks

  const byType = new Map<MarkType, InlineMark[]>()
  for (const mark of marks) {
    const list = byType.get(mark.type) ?? []
    list.push(mark)
    byType.set(mark.type, list)
  }

  const result: InlineMark[] = []

  for (const [, typeMarks] of byType) {
    const sorted = [...typeMarks].sort((a, b) => a.from - b.from)
    const merged: InlineMark[] = []

    for (const mark of sorted) {
      const last = merged[merged.length - 1]
      if (last && last.to >= mark.from) {
        // Overlapping or adjacent — merge
        merged[merged.length - 1] = { ...last, to: Math.max(last.to, mark.to) }
      } else {
        merged.push({ ...mark })
      }
    }

    result.push(...merged)
  }

  return result.sort((a, b) => a.from - b.from)
}

/**
 * Add a mark, merging with overlapping same-type marks.
 */
export function addMark(marks: InlineMark[], mark: InlineMark): InlineMark[] {
  return resolveOverlaps([...marks, mark])
}

/**
 * Remove a mark of given type within the specified range.
 * Marks that partially overlap will be trimmed.
 */
export function removeMark(
  marks: InlineMark[],
  type: MarkType,
  from: number,
  to: number
): InlineMark[] {
  const result: InlineMark[] = []

  for (const mark of marks) {
    if (mark.type !== type) {
      result.push(mark)
      continue
    }

    // Entirely outside the removal range
    if (mark.to <= from || mark.from >= to) {
      result.push(mark)
      continue
    }

    // Part before the removal range
    if (mark.from < from) {
      result.push({ ...mark, to: from })
    }

    // Part after the removal range
    if (mark.to > to) {
      result.push({ ...mark, from: to })
    }

    // Entirely within — removed
  }

  return result
}

/**
 * Toggle a mark: if the entire range has the mark, remove it;
 * otherwise, add it.
 */
export function toggleMark(
  marks: InlineMark[],
  type: MarkType,
  from: number,
  to: number,
  attrs?: Record<string, string>
): InlineMark[] {
  if (hasMarkInRange(marks, type, from, to)) {
    return removeMark(marks, type, from, to)
  }
  return addMark(marks, { type, from, to, attrs })
}

/**
 * Check if a mark type fully covers a range.
 */
export function hasMarkInRange(
  marks: InlineMark[],
  type: MarkType,
  from: number,
  to: number
): boolean {
  const typeMarks = marks.filter((m) => m.type === type)
  // Check if every position in [from, to) is covered
  let pos = from
  const sorted = [...typeMarks].sort((a, b) => a.from - b.from)

  for (const mark of sorted) {
    if (mark.from > pos) return false
    if (mark.from <= pos && mark.to > pos) {
      pos = mark.to
    }
    if (pos >= to) return true
  }

  return pos >= to
}

/**
 * Get all marks that include a given position.
 */
export function getMarksAtPosition(
  marks: InlineMark[],
  position: number
): InlineMark[] {
  return marks.filter((m) => m.from <= position && m.to > position)
}
