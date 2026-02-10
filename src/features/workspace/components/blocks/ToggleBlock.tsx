import { useState, useCallback } from 'react'
import { ChevronRight } from 'lucide-react'
import EditableContent from '../EditableContent/EditableContent'
import type { BlockComponentProps } from './types'
import BlockEditor from '../BlockEditor/BlockEditor'

export default function ToggleBlock({
  block,
  onContentChange,
  onEnter,
  onBackspace,
  onArrowUp,
  onArrowDown,
  onSlash,
  onSelectionChange,
  onFormatShortcut,
  autoFocus,
  pageId,
}: BlockComponentProps & { pageId?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return (
    <div className="block-toggle">
      <div className="block-toggle__header">
        <button
          className={`block-toggle__chevron ${isOpen ? 'block-toggle__chevron--open' : ''}`}
          onClick={handleToggle}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
          tabIndex={-1}
        >
          <ChevronRight size={16} />
        </button>
        <EditableContent
          content={block.content}
          marks={block.marks}
          placeholder="Toggle heading"
          onContentChange={onContentChange}
          onEnter={onEnter}
          onBackspace={onBackspace}
          onArrowUp={onArrowUp}
          onArrowDown={onArrowDown}
          onSlash={onSlash}
          onSelectionChange={onSelectionChange}
          onFormatShortcut={onFormatShortcut}
          autoFocus={autoFocus}
        />
      </div>
      {isOpen && (
        <div className="block-toggle__content">
          {block.children.length > 0 && pageId ? (
            <BlockEditor
              pageId={pageId}
              blockIds={block.children}
            />
          ) : (
            <p className="block-toggle__empty">Click to add content inside toggle</p>
          )}
        </div>
      )}
    </div>
  )
}
