import EditableContent from '../EditableContent/EditableContent'
import { BlockType } from '../../types'
import type { BlockComponentProps } from './types'

const TAG_MAP: Record<string, 'h1' | 'h2' | 'h3'> = {
  [BlockType.Heading1]: 'h1',
  [BlockType.Heading2]: 'h2',
  [BlockType.Heading3]: 'h3',
}

const PLACEHOLDER_MAP: Record<string, string> = {
  [BlockType.Heading1]: 'Heading 1',
  [BlockType.Heading2]: 'Heading 2',
  [BlockType.Heading3]: 'Heading 3',
}

export default function HeadingBlock({
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
  const tag = TAG_MAP[block.type] ?? 'h2'
  const placeholder = PLACEHOLDER_MAP[block.type] ?? 'Heading'

  return (
    <div className={`block-heading block-heading--${tag}`}>
      <EditableContent
        content={block.content}
        marks={block.marks}
        placeholder={placeholder}
        onContentChange={onContentChange}
        onEnter={onEnter}
        onBackspace={onBackspace}
        onArrowUp={onArrowUp}
        onArrowDown={onArrowDown}
        onSlash={onSlash}
        onSelectionChange={onSelectionChange}
        onFormatShortcut={onFormatShortcut}
        autoFocus={autoFocus}
        tag={tag}
      />
    </div>
  )
}
