import EditableContent from '../EditableContent/EditableContent'
import type { BlockComponentProps } from './types'
import './EquationBlock.css'

export default function EquationBlock({
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
}: BlockComponentProps) {
  return (
    <div className="block-equation">
      <EditableContent
        content={block.content}
        marks={[]}
        placeholder="Enter an equation..."
        onContentChange={onContentChange}
        onEnter={onEnter}
        onBackspace={onBackspace}
        onArrowUp={onArrowUp}
        onArrowDown={onArrowDown}
        onSlash={onSlash}
        onSelectionChange={onSelectionChange}
        onFormatShortcut={onFormatShortcut}
        autoFocus={autoFocus}
        tag="pre"
      />
    </div>
  )
}
