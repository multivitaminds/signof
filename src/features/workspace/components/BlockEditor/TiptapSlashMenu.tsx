import { useState, useEffect, useCallback, useRef } from 'react'
import type { Editor } from '@tiptap/react'
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  ChevronRight,
  MessageSquare,
  Code,
  Quote as QuoteIcon,
  Minus,
  ImageIcon,
  Table,
  Columns,
  Globe,
  Bookmark,
  FileIcon,
  Sigma,
  ListTree,
} from 'lucide-react'
import './TiptapSlashMenu.css'

interface SlashItem {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ size?: number }>
  command: (editor: Editor) => void
  keywords: string[]
}

function getSlashItems(): SlashItem[] {
  return [
    {
      id: 'text',
      label: 'Text',
      description: 'Plain text block',
      icon: Type,
      command: (editor) => editor.chain().focus().setParagraph().run(),
      keywords: ['text', 'paragraph', 'plain'],
    },
    {
      id: 'heading1',
      label: 'Heading 1',
      description: 'Large heading',
      icon: Heading1,
      command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      keywords: ['h1', 'title', 'heading'],
    },
    {
      id: 'heading2',
      label: 'Heading 2',
      description: 'Medium heading',
      icon: Heading2,
      command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      keywords: ['h2', 'subtitle', 'heading'],
    },
    {
      id: 'heading3',
      label: 'Heading 3',
      description: 'Small heading',
      icon: Heading3,
      command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      keywords: ['h3', 'heading'],
    },
    {
      id: 'bullet',
      label: 'Bulleted List',
      description: 'Bulleted list item',
      icon: List,
      command: (editor) => editor.chain().focus().toggleBulletList().run(),
      keywords: ['bullet', 'unordered', 'list', 'ul'],
    },
    {
      id: 'numbered',
      label: 'Numbered List',
      description: 'Numbered list item',
      icon: ListOrdered,
      command: (editor) => editor.chain().focus().toggleOrderedList().run(),
      keywords: ['number', 'ordered', 'list', 'ol'],
    },
    {
      id: 'todo',
      label: 'To-do',
      description: 'Task with checkbox',
      icon: CheckSquare,
      command: (editor) => editor.chain().focus().toggleTaskList().run(),
      keywords: ['todo', 'task', 'checkbox'],
    },
    {
      id: 'toggle',
      label: 'Toggle',
      description: 'Collapsible content',
      icon: ChevronRight,
      command: (editor) => {
        editor.chain().focus().insertContent({
          type: 'signofToggle',
          content: [{ type: 'paragraph' }],
        }).run()
      },
      keywords: ['toggle', 'collapse', 'expand'],
    },
    {
      id: 'callout',
      label: 'Callout',
      description: 'Highlighted callout box',
      icon: MessageSquare,
      command: (editor) => {
        editor.chain().focus().insertContent({
          type: 'signofCallout',
          attrs: { icon: '💡', color: 'default' },
          content: [{ type: 'paragraph' }],
        }).run()
      },
      keywords: ['callout', 'info', 'note', 'warning'],
    },
    {
      id: 'code',
      label: 'Code',
      description: 'Code block',
      icon: Code,
      command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
      keywords: ['code', 'snippet', 'pre'],
    },
    {
      id: 'quote',
      label: 'Quote',
      description: 'Block quote',
      icon: QuoteIcon,
      command: (editor) => editor.chain().focus().toggleBlockquote().run(),
      keywords: ['quote', 'blockquote'],
    },
    {
      id: 'divider',
      label: 'Divider',
      description: 'Horizontal divider',
      icon: Minus,
      command: (editor) => editor.chain().focus().setHorizontalRule().run(),
      keywords: ['divider', 'hr', 'separator'],
    },
    {
      id: 'image',
      label: 'Image',
      description: 'Image block',
      icon: ImageIcon,
      command: (editor) => {
        editor.chain().focus().insertContent({
          type: 'image',
          attrs: { src: '' },
        }).run()
      },
      keywords: ['image', 'picture', 'photo'],
    },
    {
      id: 'table',
      label: 'Table',
      description: 'Simple table',
      icon: Table,
      command: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      keywords: ['table', 'grid'],
    },
    {
      id: 'columns',
      label: 'Columns',
      description: 'Column layout',
      icon: Columns,
      command: (editor) => {
        editor.chain().focus().insertContent({
          type: 'signofColumns',
          content: [
            { type: 'signofColumn', content: [{ type: 'paragraph' }] },
            { type: 'signofColumn', content: [{ type: 'paragraph' }] },
          ],
        }).run()
      },
      keywords: ['columns', 'layout', 'split'],
    },
    {
      id: 'embed',
      label: 'Embed',
      description: 'Embed external content',
      icon: Globe,
      command: (editor) => {
        editor.chain().focus().insertContent({
          type: 'signofEmbed',
          attrs: { url: '' },
        }).run()
      },
      keywords: ['embed', 'iframe'],
    },
    {
      id: 'bookmark',
      label: 'Bookmark',
      description: 'Save a web link',
      icon: Bookmark,
      command: (editor) => {
        editor.chain().focus().insertContent({
          type: 'signofBookmark',
          attrs: { url: '' },
        }).run()
      },
      keywords: ['bookmark', 'link', 'url'],
    },
    {
      id: 'file',
      label: 'File',
      description: 'Upload a file',
      icon: FileIcon,
      command: (editor) => {
        editor.chain().focus().insertContent({
          type: 'signofFile',
          attrs: { fileName: '', fileDataUrl: '' },
        }).run()
      },
      keywords: ['file', 'upload', 'attachment'],
    },
    {
      id: 'equation',
      label: 'Equation',
      description: 'Math equation',
      icon: Sigma,
      command: (editor) => {
        editor.chain().focus().insertContent({
          type: 'signofEquation',
          attrs: { content: '' },
        }).run()
      },
      keywords: ['equation', 'math', 'formula'],
    },
    {
      id: 'toc',
      label: 'Table of Contents',
      description: 'Auto-generated from headings',
      icon: ListTree,
      command: (editor) => {
        editor.chain().focus().insertContent({ type: 'signofTOC' }).run()
      },
      keywords: ['toc', 'table of contents', 'outline'],
    },
  ]
}

interface TiptapSlashMenuProps {
  editor: Editor
}

export default function TiptapSlashMenu({ editor }: TiptapSlashMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const slashPosRef = useRef<number | null>(null)

  const items = getSlashItems()
  const filtered = query
    ? items.filter((item) => {
        const q = query.toLowerCase()
        return (
          item.label.toLowerCase().includes(q) ||
          item.keywords.some((kw) => kw.includes(q))
        )
      })
    : items

  // Listen for "/" input
  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen) {
        // Check if we're at the start of an empty paragraph
        const { state } = editor
        const { from } = state.selection
        const $from = state.doc.resolve(from)
        const node = $from.parent

        if (node.type.name === 'paragraph' && node.textContent === '') {
          // Open slash menu
          const coords = editor.view.coordsAtPos(from)
          setPosition({ top: coords.bottom + 4, left: coords.left })
          setIsOpen(true)
          setQuery('')
          setSelectedIndex(0)
          slashPosRef.current = from
        }
      }
    }

    const handleTransaction = () => {
      if (!isOpen || slashPosRef.current === null) return

      // Check if cursor has moved away from the slash
      const { from } = editor.state.selection
      const $from = editor.state.doc.resolve(from)
      const textAfterSlash = $from.parent.textContent

      if (textAfterSlash.startsWith('/')) {
        setQuery(textAfterSlash.slice(1))
      } else {
        // Slash was deleted or cursor moved
        setIsOpen(false)
        slashPosRef.current = null
      }
    }

    editor.view.dom.addEventListener('keydown', handleKeyDown)
    editor.on('transaction', handleTransaction)

    return () => {
      editor.view.dom.removeEventListener('keydown', handleKeyDown)
      editor.off('transaction', handleTransaction)
    }
  }, [editor, isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % Math.max(filtered.length, 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1))
          break
        case 'Enter': {
          e.preventDefault()
          const item = filtered[selectedIndex]
          if (item) {
            handleSelect(item)
          }
          break
        }
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          slashPosRef.current = null
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, filtered, selectedIndex])

  const handleSelect = useCallback(
    (item: SlashItem) => {
      if (slashPosRef.current === null) return

      // Delete the slash + query text
      const { state } = editor
      const $from = state.doc.resolve(state.selection.from)
      const nodeStart = $from.start()
      const nodeEnd = nodeStart + $from.parent.nodeSize - 2

      editor
        .chain()
        .focus()
        .deleteRange({ from: nodeStart, to: nodeEnd })
        .run()

      // Execute the command
      item.command(editor)

      setIsOpen(false)
      slashPosRef.current = null
    },
    [editor]
  )

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        slashPosRef.current = null
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="tiptap-slash-menu"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="listbox"
      aria-label="Block type menu"
    >
      <div className="tiptap-slash-menu__list">
        {filtered.length === 0 ? (
          <div className="tiptap-slash-menu__empty">No results</div>
        ) : (
          filtered.map((item, i) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`tiptap-slash-menu__item ${i === selectedIndex ? 'tiptap-slash-menu__item--selected' : ''}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(i)}
                role="option"
                aria-selected={i === selectedIndex}
              >
                <div className="tiptap-slash-menu__item-icon">
                  <Icon size={18} />
                </div>
                <div className="tiptap-slash-menu__item-text">
                  <span className="tiptap-slash-menu__item-label">{item.label}</span>
                  <span className="tiptap-slash-menu__item-desc">{item.description}</span>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
