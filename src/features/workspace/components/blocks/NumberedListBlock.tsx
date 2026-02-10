import EditableContent from '../EditableContent/EditableContent'
import type { BlockComponentProps } from './types'

interface NumberedListBlockProps extends BlockComponentProps {
  index?: number
}

export default function NumberedListBlock({
  block,
  onContentChange,
  onEnter,
  onBackspace,
  onArrowUp,
  onArrowDown,
  onSlash,
  onSelectionChange,
  autoFocus,
  index = 1,
}: NumberedListBlockProps) {
  return (
    <div className="block-numbered-list">
      <span className="block-numbered-list__number" aria-hidden="true">
        {index}.
      </span>
      <EditableContent
        content={block.content}
        marks={block.marks}
        placeholder="List item"
        onContentChange={onContentChange}
        onEnter={onEnter}
        onBackspace={onBackspace}
        onArrowUp={onArrowUp}
        onArrowDown={onArrowDown}
        onSlash={onSlash}
        onSelectionChange={onSelectionChange}
        autoFocus={autoFocus}
      />
    </div>
  )
}
