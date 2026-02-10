import EditableContent from '../EditableContent/EditableContent'
import type { BlockComponentProps } from './types'

export default function QuoteBlock({
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
    <div className="block-quote">
      <EditableContent
        content={block.content}
        marks={block.marks}
        placeholder="Quote"
        onContentChange={onContentChange}
        onEnter={onEnter}
        onBackspace={onBackspace}
        onArrowUp={onArrowUp}
        onArrowDown={onArrowDown}
        onSlash={onSlash}
        onSelectionChange={onSelectionChange}
        autoFocus={autoFocus}
        tag="blockquote"
      />
    </div>
  )
}
