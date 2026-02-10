import EditableContent from '../EditableContent/EditableContent'
import type { BlockComponentProps } from './types'

export default function CodeBlock({
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
  const language = block.properties.language ?? ''

  return (
    <div className="block-code">
      {language && (
        <div className="block-code__language">{language}</div>
      )}
      <EditableContent
        content={block.content}
        marks={[]}
        placeholder="Code"
        onContentChange={onContentChange}
        onEnter={onEnter}
        onBackspace={onBackspace}
        onArrowUp={onArrowUp}
        onArrowDown={onArrowDown}
        onSlash={onSlash}
        onSelectionChange={onSelectionChange}
        autoFocus={autoFocus}
        tag="pre"
      />
    </div>
  )
}
