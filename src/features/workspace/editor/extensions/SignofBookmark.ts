import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import BookmarkNodeView from '../nodeViews/BookmarkNodeView'

export const SignofBookmark = Node.create({
  name: 'signofBookmark',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: '' },
      blockId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="signof-bookmark"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'signof-bookmark' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(BookmarkNodeView)
  },
})
