import { useMemo, useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Highlight } from '@tiptap/extension-highlight'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Image } from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import { blocksToTiptapDoc } from '../../lib/tiptapConversion'
import {
  OrchestreeCallout,
  OrchestreeToggle,
  OrchestreeColumns,
  OrchestreeColumn,
  OrchestreeEmbed,
  OrchestreeBookmark,
  OrchestreeFile,
  OrchestreeEquation,
  OrchestreeTOC,
  OrchestreeMention,
} from '../../editor/extensions'
import { useTiptapSync } from './useTiptapSync'
import TiptapBubbleMenu from './TiptapBubbleMenu'
import TiptapSlashMenu from './TiptapSlashMenu'
import TiptapMentionMenu from './TiptapMentionMenu'
import TiptapPageLinkMenu from './TiptapPageLinkMenu'
import type { Block } from '../../types'
import './TiptapBlockEditor.css'

interface TiptapBlockEditorProps {
  pageId: string
  blockIds: string[]
}

export default function TiptapBlockEditor({ pageId, blockIds }: TiptapBlockEditorProps) {
  const blocks = useWorkspaceStore((s) => s.blocks)
  const [showBubbleMenu, setShowBubbleMenu] = useState(false)
  const [bubblePos, setBubblePos] = useState({ x: 0, y: 0 })

  // Build initial doc from store blocks
  const initialContent = useMemo(() => {
    const pageBlocks: Block[] = blockIds
      .map((id) => blocks[id])
      .filter((b): b is Block => b !== undefined)

    return blocksToTiptapDoc(pageBlocks, blocks)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only compute on mount

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Color,
      TextStyle,
      Link.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            pageId: {
              default: null,
              renderHTML(attributes) {
                if (!attributes.pageId) return {}
                return { 'data-page-id': attributes.pageId }
              },
              parseHTML(element) {
                return element.getAttribute('data-page-id')
              },
            },
          }
        },
      }).configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            const level = node.attrs.level as number
            return `Heading ${level}`
          }
          return 'Type "/" for commands...'
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image.configure({ allowBase64: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      // Custom extensions
      OrchestreeMention,
      OrchestreeCallout,
      OrchestreeToggle,
      OrchestreeColumns,
      OrchestreeColumn,
      OrchestreeEmbed,
      OrchestreeBookmark,
      OrchestreeFile,
      OrchestreeEquation,
      OrchestreeTOC,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'tiptap-editor__prose',
        'data-page-id': pageId,
      },
    },
  })

  // Sync editor state to Zustand store
  useTiptapSync(editor, pageId)

  // Track selection for bubble menu
  const updateBubbleMenu = useCallback(() => {
    if (!editor) return

    const { from, to, empty } = editor.state.selection
    if (!empty && to - from > 0) {
      const coords = editor.view.coordsAtPos(from)
      const endCoords = editor.view.coordsAtPos(to)
      setBubblePos({
        x: (coords.left + endCoords.right) / 2,
        y: coords.top,
      })
      setShowBubbleMenu(true)
    } else {
      setShowBubbleMenu(false)
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

    editor.on('selectionUpdate', updateBubbleMenu)
    editor.on('transaction', updateBubbleMenu)

    return () => {
      editor.off('selectionUpdate', updateBubbleMenu)
      editor.off('transaction', updateBubbleMenu)
    }
  }, [editor, updateBubbleMenu])

  if (!editor) return null

  return (
    <div className="tiptap-editor">
      {showBubbleMenu && (
        <div
          className="tiptap-editor__bubble-wrapper"
          style={{
            position: 'fixed',
            left: `${bubblePos.x}px`,
            top: `${bubblePos.y - 44}px`,
            transform: 'translateX(-50%)',
            zIndex: 50,
          }}
        >
          <TiptapBubbleMenu editor={editor} />
        </div>
      )}

      <TiptapSlashMenu editor={editor} />
      <TiptapMentionMenu editor={editor} />
      <TiptapPageLinkMenu editor={editor} />

      <EditorContent editor={editor} />

      {/* Click area below editor to focus end */}
      <div
        className="tiptap-editor__click-below"
        onClick={() => {
          editor.chain().focus('end').run()
        }}
        role="button"
        tabIndex={0}
        aria-label="Click to add content"
      />
    </div>
  )
}
