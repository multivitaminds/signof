import BlockEditor from '../BlockEditor/BlockEditor'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import type { Block } from '../../types'
import './ColumnLayoutBlock.css'

interface ColumnLayoutBlockProps {
  block: Block
  pageId: string
}

export default function ColumnLayoutBlock({
  block,
  pageId,
}: ColumnLayoutBlockProps) {
  const blocks = useWorkspaceStore((s) => s.blocks)

  const columns = block.children
    .map((childId) => blocks[childId])
    .filter((b): b is Block => !!b)

  if (columns.length === 0) {
    return (
      <div className="block-column-layout">
        <p className="block-column-layout__empty">
          No columns. Add child blocks to create columns.
        </p>
      </div>
    )
  }

  return (
    <div
      className="block-column-layout"
      style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
    >
      {columns.map((column) => (
        <div key={column.id} className="block-column-layout__column">
          <BlockEditor
            pageId={pageId}
            blockIds={column.children.length > 0 ? column.children : [column.id]}
          />
        </div>
      ))}
    </div>
  )
}
