import { useRef, useEffect, useCallback } from 'react'
import type { InlineMark } from '../../types'
import { renderMarkedContent } from '../../lib/renderMarks'
import { createRoot } from 'react-dom/client'
import './EditableContent.css'

interface EditableContentProps {
  content: string
  marks: InlineMark[]
  placeholder?: string
  onContentChange: (content: string) => void
  onMarksChange?: (marks: InlineMark[]) => void
  onEnter: () => void
  onBackspace: () => void
  onArrowUp: () => void
  onArrowDown: () => void
  onSlash?: (rect: DOMRect) => void
  onSelectionChange?: (from: number, to: number) => void
  autoFocus?: boolean
  tag?: 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'li' | 'pre' | 'blockquote'
}

function getCaretOffset(element: HTMLElement): number {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return 0

  const range = sel.getRangeAt(0)
  const preRange = document.createRange()
  preRange.selectNodeContents(element)
  preRange.setEnd(range.startContainer, range.startOffset)
  return preRange.toString().length
}

function setCaretOffset(element: HTMLElement, offset: number) {
  const sel = window.getSelection()
  if (!sel) return

  const textWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  let currentOffset = 0
  let node: Node | null = null

  while ((node = textWalker.nextNode())) {
    const nodeLen = node.textContent?.length ?? 0
    if (currentOffset + nodeLen >= offset) {
      const range = document.createRange()
      range.setStart(node, offset - currentOffset)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
      return
    }
    currentOffset += nodeLen
  }

  // If offset exceeds content, place at end
  const range = document.createRange()
  range.selectNodeContents(element)
  range.collapse(false)
  sel.removeAllRanges()
  sel.addRange(range)
}

export default function EditableContent({
  content,
  marks,
  placeholder = "Type '/' for commands...",
  onContentChange,
  onEnter,
  onBackspace,
  onArrowUp,
  onArrowDown,
  onSlash,
  onSelectionChange,
  autoFocus,
  tag: Tag = 'div',
}: EditableContentProps) {
  const ref = useRef<HTMLElement>(null)
  const lastContentRef = useRef(content)
  const isComposingRef = useRef(false)

  // Sync content from React → DOM only when content changes externally
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const domText = el.textContent ?? ''
    if (domText !== content) {
      lastContentRef.current = content
      if (marks.length > 0) {
        // Render with marks
        const container = document.createElement('span')
        const root = createRoot(container)
        root.render(<>{renderMarkedContent(content, marks)}</>)
        // Use setTimeout to let React render
        setTimeout(() => {
          if (ref.current) {
            ref.current.innerHTML = container.innerHTML
            root.unmount()
          }
        }, 0)
      } else {
        el.textContent = content
      }
    }
  }, [content, marks])

  // Auto-focus
  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus()
      // Place cursor at end
      setCaretOffset(ref.current, content.length)
    }
  }, [autoFocus]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = useCallback(() => {
    if (isComposingRef.current) return
    const el = ref.current
    if (!el) return

    const newContent = el.textContent ?? ''
    if (newContent !== lastContentRef.current) {
      lastContentRef.current = newContent
      onContentChange(newContent)
    }
  }, [onContentChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const el = ref.current
      if (!el) return

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onEnter()
        return
      }

      if (e.key === 'Backspace') {
        const offset = getCaretOffset(el)
        if (offset === 0 && (el.textContent?.length === 0 || window.getSelection()?.isCollapsed)) {
          e.preventDefault()
          onBackspace()
          return
        }
      }

      if (e.key === 'ArrowUp') {
        const offset = getCaretOffset(el)
        if (offset === 0) {
          e.preventDefault()
          onArrowUp()
          return
        }
      }

      if (e.key === 'ArrowDown') {
        const offset = getCaretOffset(el)
        const len = el.textContent?.length ?? 0
        if (offset >= len) {
          e.preventDefault()
          onArrowDown()
          return
        }
      }

      // Slash command detection
      if (e.key === '/' && onSlash) {
        const offset = getCaretOffset(el)
        const textBefore = (el.textContent ?? '').slice(0, offset)
        // Trigger if at start or after whitespace
        if (textBefore.length === 0 || textBefore.endsWith(' ') || textBefore.endsWith('\n')) {
          setTimeout(() => {
            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0) {
              const range = sel.getRangeAt(0)
              const rect = range.getBoundingClientRect()
              onSlash(rect)
            }
          }, 0)
        }
      }
    },
    [onEnter, onBackspace, onArrowUp, onArrowDown, onSlash]
  )

  // Selection change tracking
  useEffect(() => {
    if (!onSelectionChange) return

    const handleSelectionChange = () => {
      const el = ref.current
      if (!el) return

      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) return
      if (!el.contains(sel.anchorNode)) return

      const range = sel.getRangeAt(0)
      const preStart = document.createRange()
      preStart.selectNodeContents(el)
      preStart.setEnd(range.startContainer, range.startOffset)
      const from = preStart.toString().length

      const preEnd = document.createRange()
      preEnd.selectNodeContents(el)
      preEnd.setEnd(range.endContainer, range.endOffset)
      const to = preEnd.toString().length

      onSelectionChange(from, to)
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [onSelectionChange])

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true
  }, [])

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false
    handleInput()
  }, [handleInput])

  return (
    <Tag
      ref={ref as never}
      className="editable-content"
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      spellCheck
    />
  )
}

export { getCaretOffset, setCaretOffset }
