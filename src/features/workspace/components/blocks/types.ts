import type { Block, InlineMark, MarkType } from '../../types'

export interface BlockComponentProps {
  block: Block
  onContentChange: (content: string) => void
  onMarksChange: (marks: InlineMark[]) => void
  onEnter: (offset: number) => void
  onBackspace: () => void
  onArrowUp: () => void
  onArrowDown: () => void
  onSlash: (rect: DOMRect) => void
  onSelectionChange: (from: number, to: number) => void
  onFormatShortcut?: (markType: MarkType) => void
  autoFocus?: boolean
}
