import type { Block, InlineMark, BlockProperties } from '../types'
import { BlockType, MarkType } from '../types'
import type { JSONContent } from '@tiptap/react'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Marks: Block[] InlineMark[] → Tiptap text nodes ──────────────

interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

function markTypeToTiptap(mt: string): string {
  switch (mt) {
    case MarkType.Bold: return 'bold'
    case MarkType.Italic: return 'italic'
    case MarkType.Underline: return 'underline'
    case MarkType.Strikethrough: return 'strike'
    case MarkType.Code: return 'code'
    case MarkType.Link: return 'link'
    case MarkType.Highlight: return 'highlight'
    case MarkType.TextColor: return 'textStyle'
    default: return mt
  }
}

function tiptapMarkToBlockMark(tm: TiptapMark): { type: string; attrs?: Record<string, string> } {
  switch (tm.type) {
    case 'bold': return { type: MarkType.Bold }
    case 'italic': return { type: MarkType.Italic }
    case 'underline': return { type: MarkType.Underline }
    case 'strike': return { type: MarkType.Strikethrough }
    case 'code': return { type: MarkType.Code }
    case 'link': return { type: MarkType.Link, attrs: { href: String(tm.attrs?.href ?? ''), ...(tm.attrs?.pageId ? { pageId: String(tm.attrs.pageId) } : {}) } }
    case 'highlight': return { type: MarkType.Highlight, attrs: { color: String(tm.attrs?.color ?? '#FEF08A') } }
    case 'textStyle': return { type: MarkType.TextColor, attrs: { color: String(tm.attrs?.color ?? 'inherit') } }
    default: return { type: tm.type }
  }
}

function mentionMarksToNodes(marks: InlineMark[]): { mentionNodes: JSONContent[]; remaining: InlineMark[] } {
  const mentionNodes: JSONContent[] = []
  const remaining: InlineMark[] = []

  for (const mark of marks) {
    if (mark.type === MarkType.Mention && mark.attrs) {
      mentionNodes.push({
        type: 'mention',
        attrs: {
          id: mark.attrs.id ?? null,
          label: mark.attrs.label ?? null,
        },
      })
    } else {
      remaining.push(mark)
    }
  }

  return { mentionNodes, remaining }
}

function inlineMarksToTiptapContent(content: string, marks: InlineMark[]): JSONContent[] {
  if (!content && marks.length === 0) return []

  // Extract mention marks — they become their own nodes, not text decorations
  const { mentionNodes, remaining } = mentionMarksToNodes(marks)

  if (!content && mentionNodes.length > 0) return mentionNodes
  if (!content) return []
  if (remaining.length === 0 && mentionNodes.length === 0) return [{ type: 'text', text: content }]

  // If there are only mention nodes and no text marks, return text + mentions
  if (remaining.length === 0) {
    return [{ type: 'text', text: content }, ...mentionNodes]
  }

  // Build boundary points from non-mention marks
  const points = new Set<number>()
  points.add(0)
  points.add(content.length)
  for (const mark of remaining) {
    points.add(Math.max(0, mark.from))
    points.add(Math.min(content.length, mark.to))
  }
  const sorted = [...points].sort((a, b) => a - b)

  const textNodes: JSONContent[] = []
  for (let i = 0; i < sorted.length - 1; i++) {
    const from = sorted[i]!
    const to = sorted[i + 1]!
    if (from === to) continue

    const text = content.slice(from, to)
    if (!text) continue

    const activeMarks: TiptapMark[] = []
    for (const mark of remaining) {
      const mFrom = Math.max(0, mark.from)
      const mTo = Math.min(content.length, mark.to)
      if (mFrom <= from && mTo >= to) {
        const tiptapMark: TiptapMark = { type: markTypeToTiptap(mark.type) }
        if (mark.type === MarkType.Link) {
          tiptapMark.attrs = { href: mark.attrs?.href ?? '' }
          if (mark.attrs?.pageId) {
            tiptapMark.attrs.pageId = mark.attrs.pageId
          }
        } else if (mark.type === MarkType.Highlight) {
          tiptapMark.attrs = { color: mark.attrs?.color ?? '#FEF08A' }
        } else if (mark.type === MarkType.TextColor) {
          tiptapMark.attrs = { color: mark.attrs?.color ?? 'inherit' }
        }
        activeMarks.push(tiptapMark)
      }
    }

    const node: JSONContent = { type: 'text', text }
    if (activeMarks.length > 0) {
      node.marks = activeMarks
    }
    textNodes.push(node)
  }

  const base = textNodes.length > 0 ? textNodes : [{ type: 'text', text: content }]
  return mentionNodes.length > 0 ? [...base, ...mentionNodes] : base
}

// ─── Tiptap text nodes → Block InlineMark[] ───────────────────────

function tiptapContentToInlineMarks(content: JSONContent[]): { text: string; marks: InlineMark[] } {
  let text = ''
  const inlineMarks: InlineMark[] = []

  for (const node of content) {
    // Handle mention nodes → store as mention marks
    if (node.type === 'mention') {
      const from = text.length
      inlineMarks.push({
        type: MarkType.Mention as InlineMark['type'],
        from,
        to: from,
        attrs: {
          id: String(node.attrs?.id ?? ''),
          label: String(node.attrs?.label ?? ''),
        },
      })
      continue
    }

    if (node.type === 'text' && node.text) {
      const from = text.length
      const to = from + node.text.length
      text += node.text

      if (node.marks) {
        for (const tm of node.marks) {
          const converted = tiptapMarkToBlockMark(tm as TiptapMark)
          const mark: InlineMark = {
            type: converted.type as InlineMark['type'],
            from,
            to,
          }
          if (converted.attrs) {
            mark.attrs = converted.attrs
          }
          inlineMarks.push(mark)
        }
      }
    }
  }

  // Merge adjacent marks of the same type+attrs
  const merged = mergeAdjacentMarks(inlineMarks)
  return { text, marks: merged }
}

function mergeAdjacentMarks(marks: InlineMark[]): InlineMark[] {
  if (marks.length <= 1) return marks

  const byType = new Map<string, InlineMark[]>()
  for (const mark of marks) {
    const key = mark.type + JSON.stringify(mark.attrs ?? {})
    const list = byType.get(key) ?? []
    list.push(mark)
    byType.set(key, list)
  }

  const result: InlineMark[] = []
  for (const [, typeMarks] of byType) {
    const sorted = [...typeMarks].sort((a, b) => a.from - b.from)
    const merged: InlineMark[] = []
    for (const mark of sorted) {
      const last = merged[merged.length - 1]
      if (last && last.to >= mark.from) {
        merged[merged.length - 1] = { ...last, to: Math.max(last.to, mark.to) }
      } else {
        merged.push({ ...mark })
      }
    }
    result.push(...merged)
  }

  return result.sort((a, b) => a.from - b.from)
}

// ─── blocksToTiptapDoc ────────────────────────────────────────────

export function blocksToTiptapDoc(
  blocks: Block[],
  allBlocks?: Record<string, Block>
): JSONContent {
  const doc: JSONContent = { type: 'doc', content: [] }

  let i = 0
  while (i < blocks.length) {
    const block = blocks[i]!
    const node = blockToTiptapNode(block, blocks, i, allBlocks)
    if (node.consumed !== undefined) {
      // List grouping consumed multiple blocks
      doc.content!.push(node.node)
      i += node.consumed
    } else {
      doc.content!.push(node.node)
      i++
    }
  }

  // Ensure doc has at least one node
  if (doc.content!.length === 0) {
    doc.content!.push({ type: 'paragraph' })
  }

  return doc
}

interface NodeResult {
  node: JSONContent
  consumed?: number
}

function blockToTiptapNode(
  block: Block,
  blocks: Block[],
  index: number,
  allBlocks?: Record<string, Block>
): NodeResult {
  const textContent = inlineMarksToTiptapContent(block.content, block.marks)

  switch (block.type) {
    case BlockType.Paragraph:
      return {
        node: {
          type: 'paragraph',
          attrs: { blockId: block.id },
          content: textContent.length > 0 ? textContent : undefined,
        },
      }

    case BlockType.Heading1:
    case BlockType.Heading2:
    case BlockType.Heading3: {
      const level = block.type === BlockType.Heading1 ? 1
        : block.type === BlockType.Heading2 ? 2 : 3
      return {
        node: {
          type: 'heading',
          attrs: { level, blockId: block.id },
          content: textContent.length > 0 ? textContent : undefined,
        },
      }
    }

    case BlockType.BulletList:
      return groupListBlocks(blocks, index, 'bulletList', 'listItem', allBlocks)

    case BlockType.NumberedList:
      return groupListBlocks(blocks, index, 'orderedList', 'listItem', allBlocks)

    case BlockType.TodoList:
      return groupTodoBlocks(blocks, index, allBlocks)

    case BlockType.Quote:
      return {
        node: {
          type: 'blockquote',
          attrs: { blockId: block.id },
          content: [{
            type: 'paragraph',
            content: textContent.length > 0 ? textContent : undefined,
          }],
        },
      }

    case BlockType.Code:
      return {
        node: {
          type: 'codeBlock',
          attrs: {
            language: block.properties.language ?? null,
            blockId: block.id,
          },
          content: block.content ? [{ type: 'text', text: block.content }] : undefined,
        },
      }

    case BlockType.Divider:
      return {
        node: {
          type: 'horizontalRule',
          attrs: { blockId: block.id },
        },
      }

    case BlockType.Image:
      return {
        node: {
          type: 'image',
          attrs: {
            src: block.properties.imageUrl ?? '',
            alt: block.properties.caption ?? '',
            title: block.properties.caption ?? null,
            blockId: block.id,
          },
        },
      }

    case BlockType.SimpleTable:
      return {
        node: tableBlockToTiptap(block),
      }

    case BlockType.Toggle:
      return {
        node: {
          type: 'signofToggle',
          attrs: {
            blockId: block.id,
          },
          content: toggleContent(block, allBlocks),
        },
      }

    case BlockType.Callout:
      return {
        node: {
          type: 'signofCallout',
          attrs: {
            icon: block.properties.calloutIcon ?? '💡',
            color: block.properties.color ?? 'default',
            blockId: block.id,
          },
          content: [{
            type: 'paragraph',
            content: textContent.length > 0 ? textContent : undefined,
          }],
        },
      }

    case BlockType.ColumnLayout:
      return {
        node: {
          type: 'signofColumns',
          attrs: { blockId: block.id },
          content: columnContent(block, allBlocks),
        },
      }

    case BlockType.Embed:
      return {
        node: {
          type: 'signofEmbed',
          attrs: {
            url: block.properties.embedUrl ?? '',
            blockId: block.id,
          },
        },
      }

    case BlockType.Bookmark:
      return {
        node: {
          type: 'signofBookmark',
          attrs: {
            url: block.properties.url ?? '',
            blockId: block.id,
          },
        },
      }

    case BlockType.FileAttachment:
      return {
        node: {
          type: 'signofFile',
          attrs: {
            fileName: block.properties.fileName ?? '',
            fileDataUrl: block.properties.fileDataUrl ?? '',
            blockId: block.id,
          },
        },
      }

    case BlockType.Equation:
      return {
        node: {
          type: 'signofEquation',
          attrs: {
            content: block.content,
            blockId: block.id,
          },
        },
      }

    case BlockType.TableOfContents:
      return {
        node: {
          type: 'signofTOC',
          attrs: { blockId: block.id },
        },
      }

    default:
      return {
        node: {
          type: 'paragraph',
          attrs: { blockId: block.id },
          content: textContent.length > 0 ? textContent : undefined,
        },
      }
  }
}

function groupListBlocks(
  blocks: Block[],
  startIndex: number,
  listType: string,
  itemType: string,
  _allBlocks?: Record<string, Block>
): NodeResult {
  const targetBlockType = blocks[startIndex]!.type
  const items: JSONContent[] = []
  let count = 0

  for (let i = startIndex; i < blocks.length; i++) {
    if (blocks[i]!.type !== targetBlockType) break
    const block = blocks[i]!
    const textContent = inlineMarksToTiptapContent(block.content, block.marks)
    items.push({
      type: itemType,
      attrs: { blockId: block.id },
      content: [{
        type: 'paragraph',
        content: textContent.length > 0 ? textContent : undefined,
      }],
    })
    count++
  }

  return {
    node: { type: listType, content: items },
    consumed: count,
  }
}

function groupTodoBlocks(
  blocks: Block[],
  startIndex: number,
  _allBlocks?: Record<string, Block>
): NodeResult {
  const items: JSONContent[] = []
  let count = 0

  for (let i = startIndex; i < blocks.length; i++) {
    if (blocks[i]!.type !== BlockType.TodoList) break
    const block = blocks[i]!
    const textContent = inlineMarksToTiptapContent(block.content, block.marks)
    items.push({
      type: 'taskItem',
      attrs: {
        checked: block.properties.checked ?? false,
        blockId: block.id,
      },
      content: [{
        type: 'paragraph',
        content: textContent.length > 0 ? textContent : undefined,
      }],
    })
    count++
  }

  return {
    node: { type: 'taskList', content: items },
    consumed: count,
  }
}

function toggleContent(block: Block, allBlocks?: Record<string, Block>): JSONContent[] {
  const textContent = inlineMarksToTiptapContent(block.content, block.marks)
  const heading: JSONContent = {
    type: 'paragraph',
    content: textContent.length > 0 ? textContent : undefined,
  }

  const children: JSONContent[] = [heading]
  if (block.children.length > 0 && allBlocks) {
    for (const childId of block.children) {
      const child = allBlocks[childId]
      if (child) {
        const childTextContent = inlineMarksToTiptapContent(child.content, child.marks)
        children.push({
          type: 'paragraph',
          attrs: { blockId: child.id },
          content: childTextContent.length > 0 ? childTextContent : undefined,
        })
      }
    }
  }

  return children
}

function columnContent(block: Block, allBlocks?: Record<string, Block>): JSONContent[] {
  if (block.children.length === 0) {
    return [
      { type: 'signofColumn', content: [{ type: 'paragraph' }] },
      { type: 'signofColumn', content: [{ type: 'paragraph' }] },
    ]
  }

  return block.children.map((childId) => {
    const child = allBlocks?.[childId]
    if (!child) {
      return { type: 'signofColumn', content: [{ type: 'paragraph' }] }
    }
    const textContent = inlineMarksToTiptapContent(child.content, child.marks)
    return {
      type: 'signofColumn',
      attrs: { blockId: child.id },
      content: [{
        type: 'paragraph',
        content: textContent.length > 0 ? textContent : undefined,
      }],
    }
  })
}

function tableBlockToTiptap(block: Block): JSONContent {
  const rows = block.properties.rows ?? [['', ''], ['', '']]

  return {
    type: 'table',
    attrs: { blockId: block.id },
    content: rows.map((row, rowIdx) => ({
      type: 'tableRow',
      content: row.map((cell) => ({
        type: rowIdx === 0 ? 'tableHeader' : 'tableCell',
        content: [{
          type: 'paragraph',
          content: cell ? [{ type: 'text', text: cell }] : undefined,
        }],
      })),
    })),
  }
}

// ─── tiptapDocToBlocks ────────────────────────────────────────────

export function tiptapDocToBlocks(doc: JSONContent): Block[] {
  if (!doc.content) return []
  const blocks: Block[] = []

  for (const node of doc.content) {
    const converted = tiptapNodeToBlocks(node)
    blocks.push(...converted)
  }

  return blocks
}

function tiptapNodeToBlocks(node: JSONContent): Block[] {
  switch (node.type) {
    case 'paragraph':
      return [paragraphNodeToBlock(node)]

    case 'heading':
      return [headingNodeToBlock(node)]

    case 'bulletList':
      return listNodeToBlocks(node, BlockType.BulletList)

    case 'orderedList':
      return listNodeToBlocks(node, BlockType.NumberedList)

    case 'taskList':
      return taskListNodeToBlocks(node)

    case 'blockquote':
      return [blockquoteNodeToBlock(node)]

    case 'codeBlock':
      return [codeBlockNodeToBlock(node)]

    case 'horizontalRule':
      return [makeBlock(BlockType.Divider, '', [], {}, node.attrs?.blockId as string | undefined)]

    case 'image':
      return [imageNodeToBlock(node)]

    case 'table':
      return [tableNodeToBlock(node)]

    case 'signofToggle':
      return [toggleNodeToBlock(node)]

    case 'signofCallout':
      return [calloutNodeToBlock(node)]

    case 'signofColumns':
      return [columnsNodeToBlock(node)]

    case 'signofEmbed':
      return [makeBlock(BlockType.Embed, '', [], {
        embedUrl: String(node.attrs?.url ?? ''),
      }, node.attrs?.blockId as string | undefined)]

    case 'signofBookmark':
      return [makeBlock(BlockType.Bookmark, '', [], {
        url: String(node.attrs?.url ?? ''),
      }, node.attrs?.blockId as string | undefined)]

    case 'signofFile':
      return [makeBlock(BlockType.FileAttachment, '', [], {
        fileName: String(node.attrs?.fileName ?? ''),
        fileDataUrl: String(node.attrs?.fileDataUrl ?? ''),
      }, node.attrs?.blockId as string | undefined)]

    case 'signofEquation':
      return [makeBlock(BlockType.Equation, String(node.attrs?.content ?? ''), [], {}, node.attrs?.blockId as string | undefined)]

    case 'signofTOC':
      return [makeBlock(BlockType.TableOfContents, '', [], {}, node.attrs?.blockId as string | undefined)]

    default:
      // Unknown node — treat as paragraph
      if (node.content) {
        const { text, marks } = tiptapContentToInlineMarks(node.content)
        return [makeBlock(BlockType.Paragraph, text, marks, {}, node.attrs?.blockId as string | undefined)]
      }
      return [makeBlock(BlockType.Paragraph, '', [], {}, node.attrs?.blockId as string | undefined)]
  }
}

function makeBlock(
  type: Block['type'],
  content: string,
  marks: InlineMark[],
  properties: BlockProperties,
  existingId?: string
): Block {
  return {
    id: existingId ?? generateId(),
    type,
    content,
    marks,
    properties,
    children: [],
  }
}

function paragraphNodeToBlock(node: JSONContent): Block {
  const { text, marks } = node.content
    ? tiptapContentToInlineMarks(node.content)
    : { text: '', marks: [] }
  return makeBlock(BlockType.Paragraph, text, marks, {}, node.attrs?.blockId as string | undefined)
}

function headingNodeToBlock(node: JSONContent): Block {
  const level = (node.attrs?.level as number) ?? 1
  const type = level === 1 ? BlockType.Heading1
    : level === 2 ? BlockType.Heading2
    : BlockType.Heading3

  const { text, marks } = node.content
    ? tiptapContentToInlineMarks(node.content)
    : { text: '', marks: [] }

  return makeBlock(type, text, marks, {}, node.attrs?.blockId as string | undefined)
}

function listNodeToBlocks(node: JSONContent, blockType: Block['type']): Block[] {
  if (!node.content) return []

  return node.content.map((item) => {
    // List item → paragraph inside
    const para = item.content?.find((c) => c.type === 'paragraph')
    const { text, marks } = para?.content
      ? tiptapContentToInlineMarks(para.content)
      : { text: '', marks: [] }

    return makeBlock(blockType, text, marks, {}, item.attrs?.blockId as string | undefined)
  })
}

function taskListNodeToBlocks(node: JSONContent): Block[] {
  if (!node.content) return []

  return node.content.map((item) => {
    const para = item.content?.find((c) => c.type === 'paragraph')
    const { text, marks } = para?.content
      ? tiptapContentToInlineMarks(para.content)
      : { text: '', marks: [] }

    return makeBlock(BlockType.TodoList, text, marks, {
      checked: (item.attrs?.checked as boolean) ?? false,
    }, item.attrs?.blockId as string | undefined)
  })
}

function blockquoteNodeToBlock(node: JSONContent): Block {
  // Quote wraps a paragraph
  const para = node.content?.find((c) => c.type === 'paragraph')
  const { text, marks } = para?.content
    ? tiptapContentToInlineMarks(para.content)
    : { text: '', marks: [] }

  return makeBlock(BlockType.Quote, text, marks, {}, node.attrs?.blockId as string | undefined)
}

function codeBlockNodeToBlock(node: JSONContent): Block {
  const text = node.content
    ?.filter((c) => c.type === 'text')
    .map((c) => c.text ?? '')
    .join('') ?? ''

  return makeBlock(BlockType.Code, text, [], {
    language: (node.attrs?.language as string) ?? undefined,
  }, node.attrs?.blockId as string | undefined)
}

function imageNodeToBlock(node: JSONContent): Block {
  return makeBlock(BlockType.Image, '', [], {
    imageUrl: String(node.attrs?.src ?? ''),
    caption: String(node.attrs?.alt ?? ''),
  }, node.attrs?.blockId as string | undefined)
}

function tableNodeToBlock(node: JSONContent): Block {
  const rows: string[][] = (node.content ?? []).map((row) =>
    (row.content ?? []).map((cell) => {
      const para = cell.content?.find((c) => c.type === 'paragraph')
      return para?.content
        ?.filter((c) => c.type === 'text')
        .map((c) => c.text ?? '')
        .join('') ?? ''
    })
  )

  return makeBlock(BlockType.SimpleTable, '', [], { rows }, node.attrs?.blockId as string | undefined)
}

function toggleNodeToBlock(node: JSONContent): Block {
  if (!node.content || node.content.length === 0) {
    return makeBlock(BlockType.Toggle, '', [], {}, node.attrs?.blockId as string | undefined)
  }

  // First child is heading paragraph
  const firstPara = node.content[0]
  const { text, marks } = firstPara?.content
    ? tiptapContentToInlineMarks(firstPara.content)
    : { text: '', marks: [] }

  const block = makeBlock(BlockType.Toggle, text, marks, {}, node.attrs?.blockId as string | undefined)

  // Remaining children become child blocks
  if (node.content.length > 1) {
    const childBlocks: Block[] = []
    for (let i = 1; i < node.content.length; i++) {
      const childNode = node.content[i]!
      const converted = tiptapNodeToBlocks(childNode)
      childBlocks.push(...converted)
    }
    block.children = childBlocks.map((b) => b.id)
  }

  return block
}

function calloutNodeToBlock(node: JSONContent): Block {
  const para = node.content?.find((c) => c.type === 'paragraph')
  const { text, marks } = para?.content
    ? tiptapContentToInlineMarks(para.content)
    : { text: '', marks: [] }

  return makeBlock(BlockType.Callout, text, marks, {
    calloutIcon: String(node.attrs?.icon ?? '💡'),
    color: String(node.attrs?.color ?? 'default'),
  }, node.attrs?.blockId as string | undefined)
}

function columnsNodeToBlock(node: JSONContent): Block {
  const block = makeBlock(BlockType.ColumnLayout, '', [], {}, node.attrs?.blockId as string | undefined)

  if (node.content) {
    const childIds: string[] = []
    for (const col of node.content) {
      if (col.type === 'signofColumn') {
        const para = col.content?.find((c) => c.type === 'paragraph')
        const { text, marks } = para?.content
          ? tiptapContentToInlineMarks(para.content)
          : { text: '', marks: [] }
        const childBlock = makeBlock(BlockType.Paragraph, text, marks, {}, col.attrs?.blockId as string | undefined)
        childIds.push(childBlock.id)
      }
    }
    block.children = childIds
  }

  return block
}
