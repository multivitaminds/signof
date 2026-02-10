import { useMemo } from 'react'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import { BlockType } from '../../types'
import type { BlockType as BlockTypeT } from '../../types'
import './TableOfContentsBlock.css'

interface TableOfContentsBlockProps {
  pageId: string
}

const HEADING_TYPES: Set<BlockTypeT> = new Set([BlockType.Heading1, BlockType.Heading2, BlockType.Heading3])

export default function TableOfContentsBlock({
  pageId,
}: TableOfContentsBlockProps) {
  const pages = useWorkspaceStore((s) => s.pages)
  const blocks = useWorkspaceStore((s) => s.blocks)

  const headings = useMemo(() => {
    const page = pages[pageId]
    if (!page) return []

    return page.blockIds
      .map((id) => blocks[id])
      .filter((b): b is NonNullable<typeof b> => !!b && HEADING_TYPES.has(b.type))
      .map((b) => ({
        id: b.id,
        content: b.content || 'Untitled',
        level: b.type === BlockType.Heading1 ? 1 : b.type === BlockType.Heading2 ? 2 : 3,
      }))
  }, [pageId, pages, blocks])

  const handleClick = (blockId: string) => {
    const el = document.querySelector(`[data-block-id="${blockId}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (headings.length === 0) {
    return (
      <div className="block-toc">
        <p className="block-toc__empty">
          No headings found. Add headings to generate a table of contents.
        </p>
      </div>
    )
  }

  return (
    <nav className="block-toc" aria-label="Table of contents">
      <ul className="block-toc__list">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`block-toc__item block-toc__item--level-${heading.level}`}
          >
            <button
              className="block-toc__link"
              onClick={() => handleClick(heading.id)}
              type="button"
            >
              {heading.content}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
