import { useMemo } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import './TOCNodeView.css'

interface HeadingEntry {
  level: number
  text: string
  pos: number
}

export default function TOCNodeView({ editor }: NodeViewProps) {
  const headings = useMemo<HeadingEntry[]>(() => {
    const entries: HeadingEntry[] = []
    if (!editor) return entries

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        entries.push({
          level: node.attrs.level as number,
          text: node.textContent,
          pos,
        })
      }
    })

    return entries
  }, [editor])

  const handleClick = (pos: number) => {
    editor?.chain().focus().setTextSelection(pos + 1).run()
  }

  return (
    <NodeViewWrapper className="tiptap-toc" data-type="origina-toc" contentEditable={false}>
      <div className="tiptap-toc__header">Table of Contents</div>
      {headings.length === 0 ? (
        <div className="tiptap-toc__empty">Add headings to populate the table of contents.</div>
      ) : (
        <nav className="tiptap-toc__list">
          {headings.map((h, i) => (
            <button
              key={i}
              className={`tiptap-toc__item tiptap-toc__item--level-${h.level}`}
              onClick={() => handleClick(h.pos)}
            >
              {h.text || 'Untitled'}
            </button>
          ))}
        </nav>
      )}
    </NodeViewWrapper>
  )
}
