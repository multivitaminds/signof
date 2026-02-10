import { useState } from 'react'
import EditableContent from '../EditableContent/EditableContent'
import type { BlockComponentProps } from './types'

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css',
  'sql', 'bash', 'json', 'yaml', 'markdown', 'plaintext',
]

export default function CodeBlock({
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
  const language = block.properties.language ?? ''
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="block-code">
      <button
        className="block-code__language"
        onClick={() => setShowPicker(!showPicker)}
        title="Change language"
      >
        {language || 'plain text'}
      </button>
      {showPicker && (
        <div className="block-code__language-picker">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              className={`block-code__language-option ${lang === language ? 'block-code__language-option--active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault()
                setShowPicker(false)
              }}
            >
              {lang}
            </button>
          ))}
        </div>
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
        onFormatShortcut={onFormatShortcut}
        autoFocus={autoFocus}
        tag="pre"
      />
    </div>
  )
}
