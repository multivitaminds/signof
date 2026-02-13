import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import BookmarkNodeView from '../nodeViews/BookmarkNodeView'

export const OrchestreeBookmark = Node.create({
  name: 'orchestreeBookmark',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: '' },
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="orchestree-bookmark"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'orchestree-bookmark' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(BookmarkNodeView)
  },
})
