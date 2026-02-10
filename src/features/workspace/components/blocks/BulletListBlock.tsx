import EditableContent from '../EditableContent/EditableContent'
import type { BlockComponentProps } from './types'

export default function BulletListBlock({
  block,
  onContentChange,
  onEnter,
  onBackspace,
  onArrowUp,
  onArrowDown,
  onSlash,
  onSelectionChange,
  autoFocus,
}: BlockComponentProps) {
  return (
    <div className="block-bullet-list">
      <span className="block-bullet-list__marker" aria-hidden="true" />
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
