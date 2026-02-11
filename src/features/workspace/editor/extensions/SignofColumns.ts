import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ColumnsNodeView from '../nodeViews/ColumnsNodeView'

export const SignofColumn = Node.create({
  name: 'signofColumn',
  group: 'signofColumnGroup',
  content: 'block+',

  addAttributes() {
    return {
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="signof-column"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'signof-column' }), 0]
  },
})

export const SignofColumns = Node.create({
  name: 'signofColumns',
  group: 'block',
  content: 'signofColumn{2,}',

  addAttributes() {
    return {
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="signof-columns"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'signof-columns' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnsNodeView)
  },
})
