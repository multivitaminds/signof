import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import CalloutNodeView from '../nodeViews/CalloutNodeView'

export const OriginACallout = Node.create({
  name: 'originaCallout',
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
    return [{ tag: 'div[data-type="origina-callout"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'origina-callout' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView)
  },
})
