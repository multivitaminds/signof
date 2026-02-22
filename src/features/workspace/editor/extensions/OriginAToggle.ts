import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ToggleNodeView from '../nodeViews/ToggleNodeView'

export const OriginAToggle = Node.create({
  name: 'originaToggle',
  group: 'block',
  content: 'block+',

  addAttributes() {
    return {
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="origina-toggle"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'origina-toggle' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleNodeView)
  },
})
