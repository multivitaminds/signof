import { BlockType } from '../../types'
import type { BlockComponentProps } from '../blocks/types'
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
import '../blocks/blocks.css'
import './BlockRenderer.css'

interface BlockRendererProps extends BlockComponentProps {
  numberedIndex?: number
}

export default function BlockRenderer(props: BlockRendererProps) {
  const { block, numberedIndex } = props

  return (
    <div className="block-renderer">
      {renderBlock(block.type, props, numberedIndex)}
    </div>
  )
}

function renderBlock(type: BlockType, props: BlockRendererProps, numberedIndex?: number) {
  switch (type) {
    case BlockType.Heading1:
    case BlockType.Heading2:
    case BlockType.Heading3:
      return <HeadingBlock {...props} />

    case BlockType.BulletList:
      return <BulletListBlock {...props} />

    case BlockType.NumberedList:
      return <NumberedListBlock {...props} index={numberedIndex} />

    case BlockType.Toggle:
      return <ToggleBlock {...props} />

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

    case BlockType.Paragraph:
    default:
      return <ParagraphBlock {...props} />
  }
}
