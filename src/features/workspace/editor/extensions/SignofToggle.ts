import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ToggleNodeView from '../nodeViews/ToggleNodeView'

export const SignofToggle = Node.create({
  name: 'signofToggle',
  group: 'block',
  content: 'block+',

  addAttributes() {
    return {
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="signof-toggle"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'signof-toggle' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleNodeView)
  },
})
