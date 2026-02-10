// ─── Block Types (const object pattern) ─────────────────────────────

export const BlockType = {
  Paragraph: 'paragraph',
  Heading1: 'heading1',
  Heading2: 'heading2',
  Heading3: 'heading3',
  BulletList: 'bullet_list',
  NumberedList: 'numbered_list',
  Toggle: 'toggle',
  Callout: 'callout',
  Code: 'code',
  Quote: 'quote',
  Divider: 'divider',
  Image: 'image',
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
}

// ─── Block ──────────────────────────────────────────────────────────

export interface Block {
  id: string
  type: BlockType
  content: string
  marks: InlineMark[]
  properties: BlockProperties
  children: string[]
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

// ─── Page Template ──────────────────────────────────────────────────

export interface PageTemplate {
  id: string
  title: string
  icon: string
  description: string
  blocks: Array<{ type: BlockType; content: string }>
}
