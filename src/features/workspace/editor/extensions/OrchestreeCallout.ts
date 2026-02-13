import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import CalloutNodeView from '../nodeViews/CalloutNodeView'

export const OrchestreeCallout = Node.create({
  name: 'orchestreeCallout',
  group: 'block',
  content: 'block+',

  addAttributes() {
    return {
      icon: { default: '💡' },
      color: { default: 'default' },
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="orchestree-callout"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'orchestree-callout' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView)
  },
})
