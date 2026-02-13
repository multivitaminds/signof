import { useState, useEffect, useCallback, useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { FileText } from 'lucide-react'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import { getIconComponent, isEmojiIcon } from '../../../../lib/iconMap'
import './TiptapPageLinkMenu.css'

interface TiptapPageLinkMenuProps {
  editor: Editor
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function TiptapPageLinkMenu({ editor }: TiptapPageLinkMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerPosRef = useRef<number | null>(null)

  const getAllPages = useWorkspaceStore((s) => s.getAllPages)
  const pages = getAllPages()

  const filtered = (
    query
      ? pages.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
      : pages
  ).slice(0, 8)

  // Listen for "[[" input
  useEffect(() => {
    if (!editor) return

    let dom: HTMLElement | null = null
    try {
      dom = editor.view.dom
    } catch {
      return
    }

    const handleInput = () => {
      if (isOpen) return

      const { state } = editor
      const { from } = state.selection
      const $from = state.doc.resolve(from)
      const textBefore = $from.parent.textBetween(
        0,
        $from.parentOffset,
        undefined,
        '\ufffc',
      )

      // Check if "[[" was just typed
      if (textBefore.endsWith('[[')) {
        try {
          const coords = editor.view.coordsAtPos(from)
          setPosition({ top: coords.bottom + 4, left: coords.left })
          setIsOpen(true)
          setQuery('')
          setSelectedIndex(0)
          triggerPosRef.current = from - 2 // Position of first "["
        } catch {
          // View not available
        }
      }
    }

    const handleTransaction = () => {
      if (!isOpen || triggerPosRef.current === null) return

      const { from } = editor.state.selection
      const $from = editor.state.doc.resolve(from)
      const textBefore = $from.parent.textBetween(
        0,
        $from.parentOffset,
        undefined,
        '\ufffc',
      )

      // Find "[[" in the text
      const bracketIdx = textBefore.lastIndexOf('[[')
      if (bracketIdx === -1) {
        setIsOpen(false)
        triggerPosRef.current = null
        return
      }

      const queryText = textBefore.slice(bracketIdx + 2)
      // Close if there's a "]]" or newline in the query
      if (queryText.includes(']]') || queryText.includes('\n')) {
        setIsOpen(false)
        triggerPosRef.current = null
        return
      }

      setQuery(queryText)
    }

    dom.addEventListener('input', handleInput)
    editor.on('transaction', handleTransaction)

    return () => {
      dom?.removeEventListener('input', handleInput)
      editor.off('transaction', handleTransaction)
    }
  }, [editor, isOpen])

  // Keyboard navigation
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
          setSelectedIndex((prev) =>
            (prev - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1),
          )
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
          triggerPosRef.current = null
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, filtered, selectedIndex])

  const handleSelect = useCallback(
    (page: { id: string; title: string }) => {
      if (triggerPosRef.current === null) return

      const { state } = editor
      const { from } = state.selection
      const $from = state.doc.resolve(from)
      const textBefore = $from.parent.textBetween(
        0,
        $from.parentOffset,
        undefined,
        '\ufffc',
      )
      const bracketIdx = textBefore.lastIndexOf('[[')
      if (bracketIdx === -1) return

      // Calculate absolute positions
      const nodeStart = $from.start()
      const deleteFrom = nodeStart + bracketIdx
      const deleteTo = from

      // Delete "[[" + query, then insert linked text
      editor
        .chain()
        .focus()
        .deleteRange({ from: deleteFrom, to: deleteTo })
        .insertContentAt(deleteFrom, {
          type: 'text',
          text: page.title,
          marks: [
            {
              type: 'link',
              attrs: {
                href: `/pages/${page.id}`,
                pageId: page.id,
                'data-page-id': page.id,
              },
            },
          ],
        })
        .run()

      setIsOpen(false)
      triggerPosRef.current = null
    },
    [editor],
  )

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        triggerPosRef.current = null
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="tiptap-page-link-menu"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="listbox"
      aria-label="Link to a page"
    >
      <div className="tiptap-page-link-menu__header">Link to page</div>
      <div className="tiptap-page-link-menu__list">
        {filtered.length === 0 ? (
          <div className="tiptap-page-link-menu__empty">No pages found</div>
        ) : (
          filtered.map((page, i) => (
            <button
              key={page.id}
              className={`tiptap-page-link-menu__item ${i === selectedIndex ? 'tiptap-page-link-menu__item--selected' : ''}`}
              onClick={() => handleSelect(page)}
              onMouseEnter={() => setSelectedIndex(i)}
              role="option"
              aria-selected={i === selectedIndex}
            >
              <div className="tiptap-page-link-menu__item-icon">
                {page.icon
                  ? (() => {
                      if (isEmojiIcon(page.icon)) return page.icon
                      const IC = getIconComponent(page.icon)
                      return IC ? <IC size={14} /> : page.icon
                    })()
                  : <FileText size={14} />}
              </div>
              <div className="tiptap-page-link-menu__item-text">
                <span className="tiptap-page-link-menu__item-title">
                  {page.title || 'Untitled'}
                </span>
                <span className="tiptap-page-link-menu__item-date">
                  Updated {formatDate(page.updatedAt)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
