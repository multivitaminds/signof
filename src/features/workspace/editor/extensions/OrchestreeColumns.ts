import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ColumnsNodeView from '../nodeViews/ColumnsNodeView'

export const OrchestreeColumn = Node.create({
  name: 'orchestreeColumn',
  group: 'orchestreeColumnGroup',
  content: 'block+',

  addAttributes() {
    return {
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="orchestree-column"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'orchestree-column' }), 0]
  },
})

export const OrchestreeColumns = Node.create({
  name: 'orchestreeColumns',
  group: 'block',
  content: 'orchestreeColumn{2,}',

  addAttributes() {
    return {
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="orchestree-columns"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'orchestree-columns' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnsNodeView)
  },
})
