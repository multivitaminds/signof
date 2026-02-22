import { useState, useCallback } from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import './ToggleNodeView.css'

export default function ToggleNodeView(_props: NodeViewProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return (
    <NodeViewWrapper className="tiptap-toggle" data-type="origina-toggle">
      <button
        className={`tiptap-toggle__chevron ${isOpen ? 'tiptap-toggle__chevron--open' : ''}`}
        onClick={handleToggle}
        contentEditable={false}
        aria-label={isOpen ? 'Collapse' : 'Expand'}
        tabIndex={-1}
      >
        ▸
      </button>
      <div className={`tiptap-toggle__body ${isOpen ? 'tiptap-toggle__body--open' : ''}`}>
        <NodeViewContent className="tiptap-toggle__content" />
      </div>
    </NodeViewWrapper>
  )
}
