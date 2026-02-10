import type { Block, InlineMark } from '../../types'

export interface BlockComponentProps {
  block: Block
  onContentChange: (content: string) => void
  onMarksChange: (marks: InlineMark[]) => void
  onEnter: () => void
  onBackspace: () => void
  onArrowUp: () => void
  onArrowDown: () => void
  onSlash: (rect: DOMRect) => void
  onSelectionChange: (from: number, to: number) => void
  autoFocus?: boolean
}
