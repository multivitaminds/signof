import EditableContent from '../EditableContent/EditableContent'
import type { BlockComponentProps } from './types'

export default function ParagraphBlock({
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
    <EditableContent
      content={block.content}
      marks={block.marks}
      onContentChange={onContentChange}
      onEnter={onEnter}
      onBackspace={onBackspace}
      onArrowUp={onArrowUp}
      onArrowDown={onArrowDown}
      onSlash={onSlash}
      onSelectionChange={onSelectionChange}
      autoFocus={autoFocus}
      tag="p"
    />
  )
}
