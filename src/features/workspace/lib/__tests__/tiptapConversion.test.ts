import { blocksToTiptapDoc, tiptapDocToBlocks } from '../tiptapConversion'
import { BlockType, MarkType } from '../../types'
import type { Block, InlineMark } from '../../types'

function makeBlock(
  type: Block['type'],
  content: string,
  marks: InlineMark[] = [],
  properties: Block['properties'] = {},
  children: string[] = []
): Block {
  return {
    id: `test-${Math.random().toString(36).slice(2, 8)}`,
    type,
    content,
    marks,
    properties,
    children,
  }
}

describe('blocksToTiptapDoc', () => {
  it('converts a single paragraph block', () => {
    const blocks = [makeBlock(BlockType.Paragraph, 'Hello world')]
    const doc = blocksToTiptapDoc(blocks)

    expect(doc.type).toBe('doc')
    expect(doc.content).toHaveLength(1)
    expect(doc.content![0]!.type).toBe('paragraph')
    expect(doc.content![0]!.content![0]!.text).toBe('Hello world')
  })

  it('converts heading blocks with correct levels', () => {
    const blocks = [
      makeBlock(BlockType.Heading1, 'Title'),
      makeBlock(BlockType.Heading2, 'Subtitle'),
      makeBlock(BlockType.Heading3, 'Section'),
    ]
    const doc = blocksToTiptapDoc(blocks)

    expect(doc.content).toHaveLength(3)
    expect(doc.content![0]!.type).toBe('heading')
    expect(doc.content![0]!.attrs!.level).toBe(1)
    expect(doc.content![1]!.type).toBe('heading')
    expect(doc.content![1]!.attrs!.level).toBe(2)
    expect(doc.content![2]!.type).toBe('heading')
    expect(doc.content![2]!.attrs!.level).toBe(3)
  })

  it('groups consecutive bullet list items into one list', () => {
    const blocks = [
      makeBlock(BlockType.BulletList, 'Item 1'),
      makeBlock(BlockType.BulletList, 'Item 2'),
      makeBlock(BlockType.BulletList, 'Item 3'),
    ]
    const doc = blocksToTiptapDoc(blocks)

    expect(doc.content).toHaveLength(1)
    expect(doc.content![0]!.type).toBe('bulletList')
    expect(doc.content![0]!.content).toHaveLength(3)
    expect(doc.content![0]!.content![0]!.type).toBe('listItem')
  })

  it('groups consecutive numbered list items', () => {
    const blocks = [
      makeBlock(BlockType.NumberedList, 'First'),
      makeBlock(BlockType.NumberedList, 'Second'),
    ]
    const doc = blocksToTiptapDoc(blocks)

    expect(doc.content).toHaveLength(1)
    expect(doc.content![0]!.type).toBe('orderedList')
    expect(doc.content![0]!.content).toHaveLength(2)
  })

  it('does not group different list types together', () => {
    const blocks = [
      makeBlock(BlockType.BulletList, 'Bullet'),
      makeBlock(BlockType.NumberedList, 'Number'),
    ]
    const doc = blocksToTiptapDoc(blocks)

    expect(doc.content).toHaveLength(2)
    expect(doc.content![0]!.type).toBe('bulletList')
    expect(doc.content![1]!.type).toBe('orderedList')
  })

  it('converts todo list items with checked attribute', () => {
    const blocks = [
      makeBlock(BlockType.TodoList, 'Done task', [], { checked: true }),
      makeBlock(BlockType.TodoList, 'Pending task', [], { checked: false }),
    ]
    const doc = blocksToTiptapDoc(blocks)

    expect(doc.content).toHaveLength(1)
    expect(doc.content![0]!.type).toBe('taskList')
    expect(doc.content![0]!.content![0]!.attrs!.checked).toBe(true)
    expect(doc.content![0]!.content![1]!.attrs!.checked).toBe(false)
  })

  it('converts blockquote', () => {
    const blocks = [makeBlock(BlockType.Quote, 'A wise quote')]
    const doc = blocksToTiptapDoc(blocks)

    expect(doc.content![0]!.type).toBe('blockquote')
    expect(doc.content![0]!.content![0]!.type).toBe('paragraph')
  })

  it('converts code block with language', () => {
    const blocks = [makeBlock(BlockType.Code, 'const x = 1', [], { language: 'typescript' })]
    const doc = blocksToTiptapDoc(blocks)

    expect(doc.content![0]!.type).toBe('codeBlock')
    expect(doc.content![0]!.attrs!.language).toBe('typescript')
    expect(doc.content![0]!.content![0]!.text).toBe('const x = 1')
  })

  it('converts divider', () => {
    const blocks = [makeBlock(BlockType.Divider, '')]
    const doc = blocksToTiptapDoc(blocks)

    expect(doc.content![0]!.type).toBe('horizontalRule')
  })

  it('converts image block', () => {
    const blocks = [makeBlock(BlockType.Image, '', [], { imageUrl: 'https://example.com/img.png', caption: 'A photo' })]
    const doc = blocksToTiptapDoc(blocks)

    expect(doc.content![0]!.type).toBe('image')
    expect(doc.content![0]!.attrs!.src).toBe('https://example.com/img.png')
    expect(doc.content![0]!.attrs!.alt).toBe('A photo')
  })

  it('converts simple table', () => {
    const blocks = [makeBlock(BlockType.SimpleTable, '', [], { rows: [['A', 'B'], ['C', 'D']] })]
    const doc = blocksToTiptapDoc(blocks)

    expect(doc.content![0]!.type).toBe('table')
    expect(doc.content![0]!.content).toHaveLength(2) // 2 rows
    expect(doc.content![0]!.content![0]!.content).toHaveLength(2) // 2 cells per row
  })

  it('converts inline marks to Tiptap text nodes', () => {
    const marks: InlineMark[] = [
      { type: MarkType.Bold, from: 0, to: 5 },
      { type: MarkType.Italic, from: 6, to: 11 },
    ]
    const blocks = [makeBlock(BlockType.Paragraph, 'Hello World', marks)]
    const doc = blocksToTiptapDoc(blocks)

    const content = doc.content![0]!.content!
    // Should have text nodes with marks
    const boldNode = content.find((n) => n.marks?.some((m) => m.type === 'bold'))
    expect(boldNode).toBeDefined()
    expect(boldNode!.text).toBe('Hello')
  })

  it('converts link marks with href attrs', () => {
    const marks: InlineMark[] = [
      { type: MarkType.Link, from: 0, to: 4, attrs: { href: 'https://example.com' } },
    ]
    const blocks = [makeBlock(BlockType.Paragraph, 'Link', marks)]
    const doc = blocksToTiptapDoc(blocks)

    const content = doc.content![0]!.content!
    const linkNode = content.find((n) => n.marks?.some((m) => m.type === 'link'))
    expect(linkNode).toBeDefined()
    const linkMark = linkNode!.marks!.find((m) => m.type === 'link')
    expect(linkMark!.attrs!.href).toBe('https://example.com')
  })

  it('converts custom block types', () => {
    const callout = makeBlock(BlockType.Callout, 'Note text', [], { calloutIcon: '⚠️', color: 'yellow' })
    const doc = blocksToTiptapDoc([callout])

    expect(doc.content![0]!.type).toBe('orchestreeCallout')
    expect(doc.content![0]!.attrs!.icon).toBe('⚠️')
    expect(doc.content![0]!.attrs!.color).toBe('yellow')
  })

  it('produces at least one node for empty block list', () => {
    const doc = blocksToTiptapDoc([])

    expect(doc.content).toHaveLength(1)
    expect(doc.content![0]!.type).toBe('paragraph')
  })

  it('preserves block IDs as attrs', () => {
    const block = makeBlock(BlockType.Paragraph, 'Test')
    const doc = blocksToTiptapDoc([block])

    expect(doc.content![0]!.attrs!.blockId).toBe(block.id)
  })
})

describe('tiptapDocToBlocks', () => {
  it('converts paragraph node to block', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello' }],
      }],
    }
    const blocks = tiptapDocToBlocks(doc)

    expect(blocks).toHaveLength(1)
    expect(blocks[0]!.type).toBe(BlockType.Paragraph)
    expect(blocks[0]!.content).toBe('Hello')
  })

  it('converts heading nodes with correct types', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'H1' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'H2' }] },
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'H3' }] },
      ],
    }
    const blocks = tiptapDocToBlocks(doc)

    expect(blocks).toHaveLength(3)
    expect(blocks[0]!.type).toBe(BlockType.Heading1)
    expect(blocks[1]!.type).toBe(BlockType.Heading2)
    expect(blocks[2]!.type).toBe(BlockType.Heading3)
  })

  it('ungroups bullet list into individual blocks', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'bulletList',
        content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'B' }] }] },
        ],
      }],
    }
    const blocks = tiptapDocToBlocks(doc)

    expect(blocks).toHaveLength(2)
    expect(blocks[0]!.type).toBe(BlockType.BulletList)
    expect(blocks[0]!.content).toBe('A')
    expect(blocks[1]!.type).toBe(BlockType.BulletList)
    expect(blocks[1]!.content).toBe('B')
  })

  it('ungroups task list with checked status', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'taskList',
        content: [
          { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Done' }] }] },
          { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Todo' }] }] },
        ],
      }],
    }
    const blocks = tiptapDocToBlocks(doc)

    expect(blocks).toHaveLength(2)
    expect(blocks[0]!.type).toBe(BlockType.TodoList)
    expect(blocks[0]!.properties.checked).toBe(true)
    expect(blocks[1]!.properties.checked).toBe(false)
  })

  it('converts Tiptap marks to offset-based InlineMark[]', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Hello', marks: [{ type: 'bold' }] },
          { type: 'text', text: ' ' },
          { type: 'text', text: 'World', marks: [{ type: 'italic' }] },
        ],
      }],
    }
    const blocks = tiptapDocToBlocks(doc)

    expect(blocks[0]!.content).toBe('Hello World')
    expect(blocks[0]!.marks).toHaveLength(2)

    const boldMark = blocks[0]!.marks.find((m) => m.type === MarkType.Bold)
    expect(boldMark!.from).toBe(0)
    expect(boldMark!.to).toBe(5)

    const italicMark = blocks[0]!.marks.find((m) => m.type === MarkType.Italic)
    expect(italicMark!.from).toBe(6)
    expect(italicMark!.to).toBe(11)
  })

  it('merges adjacent marks of the same type', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [
          { type: 'text', text: 'He', marks: [{ type: 'bold' }] },
          { type: 'text', text: 'llo', marks: [{ type: 'bold' }] },
        ],
      }],
    }
    const blocks = tiptapDocToBlocks(doc)

    expect(blocks[0]!.content).toBe('Hello')
    expect(blocks[0]!.marks).toHaveLength(1)
    expect(blocks[0]!.marks[0]!.from).toBe(0)
    expect(blocks[0]!.marks[0]!.to).toBe(5)
  })

  it('converts link marks with href', () => {
    const doc = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Click', marks: [{ type: 'link', attrs: { href: 'https://example.com' } }] },
        ],
      }],
    }
    const blocks = tiptapDocToBlocks(doc)

    const linkMark = blocks[0]!.marks.find((m) => m.type === MarkType.Link)
    expect(linkMark).toBeDefined()
    expect(linkMark!.attrs!.href).toBe('https://example.com')
  })

  it('converts custom node types back to blocks', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'orchestreeCallout',
          attrs: { icon: '💡', color: 'blue', blockId: 'test-123' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Note' }] }],
        },
      ],
    }
    const blocks = tiptapDocToBlocks(doc)

    expect(blocks[0]!.type).toBe(BlockType.Callout)
    expect(blocks[0]!.content).toBe('Note')
    expect(blocks[0]!.properties.calloutIcon).toBe('💡')
    expect(blocks[0]!.properties.color).toBe('blue')
  })

  it('returns empty array for doc without content', () => {
    const blocks = tiptapDocToBlocks({ type: 'doc' })
    expect(blocks).toEqual([])
  })
})

describe('round-trip fidelity', () => {
  it('paragraph round-trips', () => {
    const original = [makeBlock(BlockType.Paragraph, 'Hello world')]
    const doc = blocksToTiptapDoc(original)
    const result = tiptapDocToBlocks(doc)

    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe(BlockType.Paragraph)
    expect(result[0]!.content).toBe('Hello world')
  })

  it('marked text round-trips', () => {
    const marks: InlineMark[] = [
      { type: MarkType.Bold, from: 0, to: 5 },
    ]
    const original = [makeBlock(BlockType.Paragraph, 'Hello world', marks)]
    const doc = blocksToTiptapDoc(original)
    const result = tiptapDocToBlocks(doc)

    expect(result[0]!.content).toBe('Hello world')
    const boldMark = result[0]!.marks.find((m) => m.type === MarkType.Bold)
    expect(boldMark).toBeDefined()
    expect(boldMark!.from).toBe(0)
    expect(boldMark!.to).toBe(5)
  })

  it('list items round-trip', () => {
    const original = [
      makeBlock(BlockType.BulletList, 'Item A'),
      makeBlock(BlockType.BulletList, 'Item B'),
    ]
    const doc = blocksToTiptapDoc(original)
    const result = tiptapDocToBlocks(doc)

    expect(result).toHaveLength(2)
    expect(result[0]!.type).toBe(BlockType.BulletList)
    expect(result[0]!.content).toBe('Item A')
    expect(result[1]!.type).toBe(BlockType.BulletList)
    expect(result[1]!.content).toBe('Item B')
  })

  it('headings round-trip', () => {
    const original = [
      makeBlock(BlockType.Heading1, 'Title'),
      makeBlock(BlockType.Heading2, 'Sub'),
    ]
    const doc = blocksToTiptapDoc(original)
    const result = tiptapDocToBlocks(doc)

    expect(result[0]!.type).toBe(BlockType.Heading1)
    expect(result[0]!.content).toBe('Title')
    expect(result[1]!.type).toBe(BlockType.Heading2)
    expect(result[1]!.content).toBe('Sub')
  })

  it('code block with language round-trips', () => {
    const original = [makeBlock(BlockType.Code, 'x = 1', [], { language: 'python' })]
    const doc = blocksToTiptapDoc(original)
    const result = tiptapDocToBlocks(doc)

    expect(result[0]!.type).toBe(BlockType.Code)
    expect(result[0]!.content).toBe('x = 1')
    expect(result[0]!.properties.language).toBe('python')
  })

  it('table round-trips', () => {
    const original = [makeBlock(BlockType.SimpleTable, '', [], { rows: [['A', 'B'], ['C', 'D']] })]
    const doc = blocksToTiptapDoc(original)
    const result = tiptapDocToBlocks(doc)

    expect(result[0]!.type).toBe(BlockType.SimpleTable)
    expect(result[0]!.properties.rows).toEqual([['A', 'B'], ['C', 'D']])
  })

  it('mixed content round-trips', () => {
    const original = [
      makeBlock(BlockType.Heading1, 'Title'),
      makeBlock(BlockType.Paragraph, 'Intro text'),
      makeBlock(BlockType.BulletList, 'Point 1'),
      makeBlock(BlockType.BulletList, 'Point 2'),
      makeBlock(BlockType.Divider, ''),
      makeBlock(BlockType.Quote, 'A wise saying'),
    ]
    const doc = blocksToTiptapDoc(original)
    const result = tiptapDocToBlocks(doc)

    expect(result).toHaveLength(6)
    expect(result[0]!.type).toBe(BlockType.Heading1)
    expect(result[1]!.type).toBe(BlockType.Paragraph)
    expect(result[2]!.type).toBe(BlockType.BulletList)
    expect(result[3]!.type).toBe(BlockType.BulletList)
    expect(result[4]!.type).toBe(BlockType.Divider)
    expect(result[5]!.type).toBe(BlockType.Quote)
  })
})
