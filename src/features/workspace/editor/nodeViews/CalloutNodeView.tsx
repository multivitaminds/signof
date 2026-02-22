import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import MappedIcon from '../../../../lib/MappedIcon'
import { isEmojiIcon } from '../../../../lib/iconMap'
import './CalloutNodeView.css'

export default function CalloutNodeView({ node }: NodeViewProps) {
  const icon = (node.attrs.icon as string) ?? 'lightbulb'
  const color = (node.attrs.color as string) ?? 'default'

  return (
    <NodeViewWrapper className={`tiptap-callout tiptap-callout--${color}`} data-type="origina-callout">
      <span className="tiptap-callout__icon" contentEditable={false} aria-hidden="true">
        {isEmojiIcon(icon) ? icon : <MappedIcon name={icon} size={18} />}
      </span>
      <NodeViewContent className="tiptap-callout__content" />
    </NodeViewWrapper>
  )
}
