import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import './ColumnsNodeView.css'

export default function ColumnsNodeView(_props: NodeViewProps) {
  return (
    <NodeViewWrapper className="tiptap-columns" data-type="signof-columns">
      <NodeViewContent className="tiptap-columns__inner" />
    </NodeViewWrapper>
  )
}
