import { BlockType } from '../../types'
import type { BlockComponentProps } from '../blocks/types'
import type { MarkType, InlineMark } from '../../types'
import ParagraphBlock from '../blocks/ParagraphBlock'
import HeadingBlock from '../blocks/HeadingBlock'
import BulletListBlock from '../blocks/BulletListBlock'
import NumberedListBlock from '../blocks/NumberedListBlock'
import ToggleBlock from '../blocks/ToggleBlock'
import CalloutBlock from '../blocks/CalloutBlock'
import CodeBlock from '../blocks/CodeBlock'
import QuoteBlock from '../blocks/QuoteBlock'
import DividerBlock from '../blocks/DividerBlock'
import ImageBlock from '../blocks/ImageBlock'
import TodoBlock from '../blocks/TodoBlock'
import SimpleTableBlock from '../blocks/SimpleTableBlock'
import ColumnLayoutBlock from '../blocks/ColumnLayoutBlock'
import BookmarkBlock from '../blocks/BookmarkBlock'
import EmbedBlock from '../blocks/EmbedBlock'
import FileBlock from '../blocks/FileBlock'
import EquationBlock from '../blocks/EquationBlock'
import TableOfContentsBlock from '../blocks/TableOfContentsBlock'
import '../blocks/blocks.css'
import './BlockRenderer.css'

interface BlockRendererProps extends BlockComponentProps {
  numberedIndex?: number
  pageId?: string
  onMention?: (trigger: '@' | '[[', rect: DOMRect) => void
  onPasteBlocks?: (blocks: Array<{ type: string; content: string; marks?: InlineMark[] }>) => void
  onFormatShortcut?: (markType: MarkType) => void
}

export default function BlockRenderer(props: BlockRendererProps) {
  const { block, numberedIndex } = props

  return (
    <div className="block-renderer">
      {renderBlock(block.type, props, numberedIndex)}
    </div>
  )
}

function renderBlock(type: string, props: BlockRendererProps, numberedIndex?: number) {
  switch (type) {
    case BlockType.Heading1:
    case BlockType.Heading2:
    case BlockType.Heading3:
      return <HeadingBlock {...props} />

    case BlockType.BulletList:
      return <BulletListBlock {...props} />

    case BlockType.NumberedList:
      return <NumberedListBlock {...props} index={numberedIndex} />

    case BlockType.TodoList:
      return <TodoBlock {...props} />

    case BlockType.Toggle:
      return <ToggleBlock {...props} pageId={props.pageId} />

    case BlockType.Callout:
      return <CalloutBlock {...props} />

    case BlockType.Code:
      return <CodeBlock {...props} />

    case BlockType.Quote:
      return <QuoteBlock {...props} />

    case BlockType.Divider:
      return <DividerBlock onBackspace={props.onBackspace} autoFocus={props.autoFocus} />

    case BlockType.Image:
      return <ImageBlock {...props} />

    case BlockType.SimpleTable:
      return <SimpleTableBlock {...props} />

    case BlockType.ColumnLayout:
      return <ColumnLayoutBlock {...props} pageId={props.pageId ?? ''} />

    case BlockType.Bookmark:
      return <BookmarkBlock {...props} />

    case BlockType.Embed:
      return <EmbedBlock {...props} />

    case BlockType.FileAttachment:
      return <FileBlock {...props} />

    case BlockType.Equation:
      return <EquationBlock {...props} />

    case BlockType.TableOfContents:
      return <TableOfContentsBlock {...props} pageId={props.pageId ?? ''} />

    case BlockType.Paragraph:
    default:
      return <ParagraphBlock {...props} />
  }
}
