// ─── Block Types (const object pattern) ─────────────────────────────

export const BlockType = {
  Paragraph: 'paragraph',
  Heading1: 'heading1',
  Heading2: 'heading2',
  Heading3: 'heading3',
  BulletList: 'bullet_list',
  NumberedList: 'numbered_list',
  TodoList: 'todo_list',
  Toggle: 'toggle',
  Callout: 'callout',
  Code: 'code',
  Quote: 'quote',
  Divider: 'divider',
  Image: 'image',
  SimpleTable: 'simple_table',
  ColumnLayout: 'column_layout',
  Embed: 'embed',
  Bookmark: 'bookmark',
  FileAttachment: 'file',
  Equation: 'equation',
  TableOfContents: 'table_of_contents',
} as const

export type BlockType = (typeof BlockType)[keyof typeof BlockType]

// ─── Mark Types ─────────────────────────────────────────────────────

export const MarkType = {
  Bold: 'bold',
  Italic: 'italic',
  Underline: 'underline',
  Strikethrough: 'strikethrough',
  Code: 'code',
  Link: 'link',
  Highlight: 'highlight',
  TextColor: 'textColor',
} as const

export type MarkType = (typeof MarkType)[keyof typeof MarkType]

// ─── Inline Mark ────────────────────────────────────────────────────

export interface InlineMark {
  type: MarkType
  from: number
  to: number
  attrs?: Record<string, string>
}

// ─── Block Properties ───────────────────────────────────────────────

export interface BlockProperties {
  language?: string
  color?: string
  checked?: boolean
  imageUrl?: string
  caption?: string
  rows?: string[][]
  url?: string
  embedUrl?: string
  fileName?: string
  fileDataUrl?: string
  calloutIcon?: string
}

// ─── Block ──────────────────────────────────────────────────────────

export interface Block {
  id: string
  type: BlockType
  content: string
  marks: InlineMark[]
  properties: BlockProperties
  children: string[]
  syncedBlockId?: string
}

// ─── Page Property ──────────────────────────────────────────────────

export interface PagePropertyValue {
  type: 'text' | 'select' | 'date' | 'url'
  value: string
  options?: string[]
}

// ─── Page ───────────────────────────────────────────────────────────

export interface Page {
  id: string
  title: string
  icon: string
  coverUrl: string
  parentId: string | null
  blockIds: string[]
  createdAt: string
  updatedAt: string
  isFavorite: boolean
  lastViewedAt: string | null
  trashedAt: string | null
  properties: Record<string, PagePropertyValue>
}

// ─── Page Snapshot (Version History) ────────────────────────────────

export interface PageSnapshot {
  id: string
  pageId: string
  title: string
  blockData: Array<{ id: string; type: string; content: string; properties: Record<string, unknown> }>
  timestamp: string
  editCount: number
}

// ─── Undo Snapshot ─────────────────────────────────────────────────

export interface UndoSnapshot {
  pageId: string
  page: Page
  blocks: Record<string, Block>
}

// ─── Slash Command Item ─────────────────────────────────────────────

export interface SlashCommandItem {
  id: string
  label: string
  description: string
  icon: string
  type: BlockType
  keywords: string[]
}

// ─── Comments ───────────────────────────────────────────────────────

export interface CommentReply {
  id: string
  content: string
  authorName: string
  authorId: string
  createdAt: string
}

export interface BlockComment {
  id: string
  blockId: string
  pageId: string
  content: string
  authorName: string
  authorId: string
  createdAt: string
  updatedAt: string
  resolved: boolean
  replies: CommentReply[]
}

// ─── Page Template ──────────────────────────────────────────────────

export interface PageTemplate {
  id: string
  title: string
  icon: string
  description: string
  blocks: Array<{ type: BlockType; content: string }>
  variables?: Record<string, string>
}
