import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ColumnsNodeView from '../nodeViews/ColumnsNodeView'

export const OriginAColumn = Node.create({
  name: 'originaColumn',
  group: 'originaColumnGroup',
  content: 'block+',

  addAttributes() {
    return {
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="origina-column"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'origina-column' }), 0]
  },
})

export const OriginAColumns = Node.create({
  name: 'originaColumns',
  group: 'block',
  content: 'originaColumn{2,}',

  addAttributes() {
    return {
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="origina-columns"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'origina-columns' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnsNodeView)
  },
})
