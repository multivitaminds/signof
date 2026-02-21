import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../lib/messageCategorizer'
import type { MessageCategory } from '../../lib/messageCategorizer'
import './MessageCategoryLabel.css'

interface MessageCategoryLabelProps {
  category: MessageCategory
}

export default function MessageCategoryLabel({ category }: MessageCategoryLabelProps) {
  const label = CATEGORY_LABELS[category]
  const color = CATEGORY_COLORS[category]

  return (
    <span
      className="chorus-category-label"
      style={{ '--category-color': color } as React.CSSProperties}
      aria-label={`Category: ${label}`}
    >
      {label}
    </span>
  )
}
