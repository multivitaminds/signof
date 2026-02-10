import { useRef, useEffect, useCallback } from 'react'
import type { InlineMark, MarkType } from '../../types'
import { MarkType as MT } from '../../types'
import { renderMarkedContent } from '../../lib/renderMarks'
import { createRoot } from 'react-dom/client'
import './EditableContent.css'

interface EditableContentProps {
  content: string
  marks: InlineMark[]
  placeholder?: string
  onContentChange: (content: string) => void
  onMarksChange?: (marks: InlineMark[]) => void
  onEnter: (offset: number) => void
  onBackspace: () => void
  onArrowUp: () => void
  onArrowDown: () => void
  onSlash?: (rect: DOMRect) => void
  onSelectionChange?: (from: number, to: number) => void
  onFormatShortcut?: (markType: MarkType) => void
  onMention?: (trigger: '@' | '[[', rect: DOMRect) => void
  onPasteBlocks?: (blocks: Array<{ type: string; content: string; marks?: InlineMark[] }>) => void
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
  onFormatShortcut,
  onMention,
  onPasteBlocks,
  autoFocus,
  tag: Tag = 'div',
}: EditableContentProps) {
  const ref = useRef<HTMLElement>(null)
  const lastContentRef = useRef(content)
  const isComposingRef = useRef(false)
  const lastTwoCharsRef = useRef('')

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

      const metaKey = e.metaKey || e.ctrlKey

      // Format shortcuts
      if (metaKey && onFormatShortcut) {
        if (e.key === 'b') {
          e.preventDefault()
          onFormatShortcut(MT.Bold)
          return
        }
        if (e.key === 'i') {
          e.preventDefault()
          onFormatShortcut(MT.Italic)
          return
        }
        if (e.key === 'u') {
          e.preventDefault()
          onFormatShortcut(MT.Underline)
          return
        }
        if (e.key === 'e') {
          e.preventDefault()
          onFormatShortcut(MT.Code)
          return
        }
        if (e.key === 'k') {
          e.preventDefault()
          onFormatShortcut(MT.Link)
          return
        }
        if (e.shiftKey && (e.key === 's' || e.key === 'S')) {
          e.preventDefault()
          onFormatShortcut(MT.Strikethrough)
          return
        }
        if (e.shiftKey && (e.key === 'h' || e.key === 'H')) {
          e.preventDefault()
          onFormatShortcut(MT.Highlight)
          return
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const offset = getCaretOffset(el)
        onEnter(offset)
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

      // Mention detection: track last two chars for [[ trigger
      if (onMention && e.key === '[') {
        const last = lastTwoCharsRef.current
        if (last.endsWith('[')) {
          setTimeout(() => {
            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0) {
              const range = sel.getRangeAt(0)
              const rect = range.getBoundingClientRect()
              onMention('[[', rect)
            }
          }, 0)
        }
      }

      // @ mention detection
      if (onMention && e.key === '@') {
        const offset = getCaretOffset(el)
        const textBefore = (el.textContent ?? '').slice(0, offset)
        if (textBefore.length === 0 || textBefore.endsWith(' ') || textBefore.endsWith('\n')) {
          setTimeout(() => {
            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0) {
              const range = sel.getRangeAt(0)
              const rect = range.getBoundingClientRect()
              onMention('@', rect)
            }
          }, 0)
        }
      }

      // Track last two chars for [[ detection
      if (e.key.length === 1) {
        lastTwoCharsRef.current = (lastTwoCharsRef.current + e.key).slice(-2)
      } else {
        lastTwoCharsRef.current = ''
      }
    },
    [onEnter, onBackspace, onArrowUp, onArrowDown, onSlash, onFormatShortcut, onMention]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (!onPasteBlocks) return

      const text = e.clipboardData.getData('text/plain')
      if (!text) return

      // Check if clipboard text looks like markdown
      const hasMarkdown =
        /^#{1,3}\s/.test(text) ||
        /^[-*]\s/.test(text) ||
        /^\d+\.\s/.test(text) ||
        /^>\s/.test(text) ||
        /^```/.test(text) ||
        /^---\s*$/.test(text) ||
        /^- \[[ x]\]\s/i.test(text)

      if (hasMarkdown) {
        e.preventDefault()
        // Dynamic import would be ideal but we pass raw text to handler
        // The BlockEditor will handle parsing via markdownParser
        onPasteBlocks([{ type: '__markdown__', content: text }])
      }
    },
    [onPasteBlocks]
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
      onPaste={handlePaste}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      spellCheck
    />
  )
}

export { getCaretOffset, setCaretOffset }
