import { Node, mergeAttributes } from '@tiptap/core'

export const OriginAMention = Node.create({
  name: 'mention',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: { default: null },
      label: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-type="mention"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        { 'data-type': 'mention', class: 'mention' },
        HTMLAttributes,
      ),
      `@${HTMLAttributes.label ?? ''}`,
    ]
  },
})
