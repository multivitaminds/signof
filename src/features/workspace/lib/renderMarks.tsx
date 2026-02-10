import type { InlineMark, MarkType } from '../types'
import { MarkType as MT } from '../types'

interface Segment {
  text: string
  marks: Set<MarkType>
  attrs: Record<string, Record<string, string>>
}

/**
 * Render content with inline marks as React elements.
 */
export function renderMarkedContent(
  content: string,
  marks: InlineMark[]
): React.ReactNode[] {
  if (!content) return []
  if (marks.length === 0) return [content]

  // Build per-character mark sets
  const charMarks: Array<{ marks: Set<MarkType>; attrs: Record<string, Record<string, string>> }> = []
  for (let i = 0; i < content.length; i++) {
    charMarks.push({ marks: new Set(), attrs: {} })
  }

  for (const mark of marks) {
    const from = Math.max(0, mark.from)
    const to = Math.min(content.length, mark.to)
    for (let i = from; i < to; i++) {
      const cm = charMarks[i]
      if (cm) {
        cm.marks.add(mark.type)
        if (mark.attrs) {
          cm.attrs[mark.type] = mark.attrs
        }
      }
    }
  }

  // Group consecutive characters with identical mark sets
  const segments: Segment[] = []
  let current: Segment | null = null

  for (let i = 0; i < content.length; i++) {
    const cm = charMarks[i]
    if (!cm) continue
    const ch = content[i] ?? ''
    if (current && sameMarks(current.marks, cm.marks)) {
      current.text += ch
    } else {
      current = { text: ch, marks: cm.marks, attrs: cm.attrs }
      segments.push(current)
    }
  }

  return segments.map((seg, i) => wrapWithMarks(seg.text, seg.marks, seg.attrs, i))
}

function sameMarks(a: Set<MarkType>, b: Set<MarkType>): boolean {
  if (a.size !== b.size) return false
  for (const m of a) {
    if (!b.has(m)) return false
  }
  return true
}

function wrapWithMarks(
  text: string,
  marks: Set<MarkType>,
  attrs: Record<string, Record<string, string>>,
  key: number
): React.ReactNode {
  if (marks.size === 0) return text

  let node: React.ReactNode = text

  // Apply marks in consistent order
  const ordered: MarkType[] = [MT.Code, MT.Strikethrough, MT.Underline, MT.Italic, MT.Bold, MT.Link, MT.Highlight, MT.TextColor]

  for (const markType of ordered) {
    if (!marks.has(markType)) continue

    switch (markType) {
      case MT.Bold:
        node = <strong key={`${key}-b`}>{node}</strong>
        break
      case MT.Italic:
        node = <em key={`${key}-i`}>{node}</em>
        break
      case MT.Underline:
        node = <u key={`${key}-u`}>{node}</u>
        break
      case MT.Strikethrough:
        node = <s key={`${key}-s`}>{node}</s>
        break
      case MT.Code:
        node = <code key={`${key}-c`}>{node}</code>
        break
      case MT.Link: {
        const href = attrs[MT.Link]?.href ?? '#'
        node = (
          <a key={`${key}-a`} href={href} target="_blank" rel="noopener noreferrer">
            {node}
          </a>
        )
        break
      }
      case MT.Highlight: {
        const bgColor = attrs[MT.Highlight]?.color ?? '#FEF08A'
        node = (
          <mark key={`${key}-hl`} style={{ backgroundColor: bgColor, borderRadius: '2px', padding: '0 2px' }}>
            {node}
          </mark>
        )
        break
      }
      case MT.TextColor: {
        const textColor = attrs[MT.TextColor]?.color ?? 'inherit'
        node = (
          <span key={`${key}-tc`} style={{ color: textColor }}>
            {node}
          </span>
        )
        break
      }
    }
  }

  return <span key={key}>{node}</span>
}
