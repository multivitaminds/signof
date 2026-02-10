import EditableContent from '../EditableContent/EditableContent'
import type { BlockComponentProps } from './types'

export default function CalloutBlock({
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
  const color = block.properties.color ?? 'default'
  const icon = block.properties.calloutIcon ?? '💡'

  return (
    <div className={`block-callout block-callout--${color}`}>
      <span className="block-callout__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="block-callout__content">
        <EditableContent
          content={block.content}
          marks={block.marks}
          placeholder="Type something..."
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
    </div>
  )
}
