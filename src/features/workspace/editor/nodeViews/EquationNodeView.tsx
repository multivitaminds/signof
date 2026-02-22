import { useState, useCallback } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import './EquationNodeView.css'

export default function EquationNodeView({ node, updateAttributes }: NodeViewProps) {
  const content = (node.attrs.content as string) ?? ''
  const [editing, setEditing] = useState(!content)
  const [editValue, setEditValue] = useState(content)

  const handleSave = useCallback(() => {
    updateAttributes({ content: editValue })
    setEditing(false)
  }, [editValue, updateAttributes])

  if (editing) {
    return (
      <NodeViewWrapper className="tiptap-equation" data-type="origina-equation" contentEditable={false}>
        <div className="tiptap-equation__editor">
          <input
            className="tiptap-equation__input"
            type="text"
            placeholder="Enter equation (LaTeX)..."
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') setEditing(false)
            }}
            autoFocus
          />
          <button className="btn-primary tiptap-equation__btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="tiptap-equation" data-type="origina-equation" contentEditable={false}>
      <div
        className="tiptap-equation__display"
        onClick={() => setEditing(true)}
        role="button"
        tabIndex={0}
      >
        <span className="tiptap-equation__formula">{content || 'Empty equation'}</span>
      </div>
    </NodeViewWrapper>
  )
}
