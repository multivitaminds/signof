import { BlockType } from '../types'
import type { BlockType as BlockTypeT } from '../types'

interface ParsedBlock {
  type: BlockTypeT
  content: string
  properties?: Record<string, unknown>
}

export function parseMarkdown(text: string): ParsedBlock[] {
  const lines = text.split('\n')
  const blocks: ParsedBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]!

    // Code block (triple backtick)
    if (line.trimStart().startsWith('`' + '`' + '`')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i]!.trimStart().startsWith('`' + '`' + '`')) {
        codeLines.push(lines[i]!)
        i++
      }
      if (i < lines.length) {
        i++
      }
      blocks.push({ type: BlockType.Code, content: codeLines.join('\n') })
      continue
    }

    // Divider
    if (/^---+\s*$/.test(line)) {
      blocks.push({ type: BlockType.Divider, content: '' })
      i++
      continue
    }

    // Heading 3
    if (/^###\s+/.test(line)) {
      blocks.push({ type: BlockType.Heading3, content: line.replace(/^###\s+/, '') })
      i++
      continue
    }

    // Heading 2
    if (/^##\s+/.test(line)) {
      blocks.push({ type: BlockType.Heading2, content: line.replace(/^##\s+/, '') })
      i++
      continue
    }

    // Heading 1
    if (/^#\s+/.test(line)) {
      blocks.push({ type: BlockType.Heading1, content: line.replace(/^#\s+/, '') })
      i++
      continue
    }

    // Todo list (must be checked before bullet list)
    if (/^[-*]\s+\[[ xX]\]\s/.test(line)) {
      const checked = /^[-*]\s+\[[xX]\]/.test(line)
      const content = line.replace(/^[-*]\s+\[[ xX]\]\s+/, '')
      blocks.push({
        type: BlockType.TodoList,
        content,
        properties: { checked },
      })
      i++
      continue
    }

    // Bullet list
    if (/^[-*]\s+/.test(line)) {
      blocks.push({ type: BlockType.BulletList, content: line.replace(/^[-*]\s+/, '') })
      i++
      continue
    }

    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      blocks.push({ type: BlockType.NumberedList, content: line.replace(/^\d+\.\s+/, '') })
      i++
      continue
    }

    // Quote
    if (/^>\s+/.test(line)) {
      blocks.push({ type: BlockType.Quote, content: line.replace(/^>\s+/, '') })
      i++
      continue
    }

    // Empty lines are skipped
    if (line.trim() === '') {
      i++
      continue
    }

    // Everything else is a paragraph
    blocks.push({ type: BlockType.Paragraph, content: line })
    i++
  }

  return blocks
}
