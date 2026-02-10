import { useCallback } from 'react'
import EditableContent from '../EditableContent/EditableContent'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import type { BlockComponentProps } from './types'
import './TodoBlock.css'

export default function TodoBlock({
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
  const checked = block.properties.checked ?? false

  const handleToggle = useCallback(() => {
    useWorkspaceStore.setState((state) => {
      const existing = state.blocks[block.id]
      if (!existing) return state
      return {
        blocks: {
          ...state.blocks,
          [block.id]: {
            ...existing,
            properties: { ...existing.properties, checked: !checked },
          },
        },
      }
    })
  }, [block.id, checked])

  return (
    <div className={`block-todo ${checked ? 'block-todo--checked' : ''}`}>
      <label className="block-todo__checkbox-wrapper">
        <input
          type="checkbox"
          className="block-todo__checkbox"
          checked={checked}
          onChange={handleToggle}
          aria-label={checked ? 'Mark as incomplete' : 'Mark as complete'}
        />
        <span className="block-todo__checkmark" aria-hidden="true" />
      </label>
      <div className="block-todo__content">
        <EditableContent
          content={block.content}
          marks={block.marks}
          placeholder="To-do"
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
