import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import './CalloutNodeView.css'

export default function CalloutNodeView({ node }: NodeViewProps) {
  const icon = (node.attrs.icon as string) ?? '💡'
  const color = (node.attrs.color as string) ?? 'default'

  return (
    <NodeViewWrapper className={`tiptap-callout tiptap-callout--${color}`} data-type="orchestree-callout">
      <span className="tiptap-callout__icon" contentEditable={false} aria-hidden="true">
        {icon}
      </span>
      <NodeViewContent className="tiptap-callout__content" />
    </NodeViewWrapper>
  )
}
