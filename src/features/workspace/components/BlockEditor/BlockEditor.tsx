import { useState, useCallback } from 'react'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import { BlockType, MarkType as MT } from '../../types'
import type { Block, BlockType as BlockTypeT, MarkType, InlineMark } from '../../types'
import BlockRenderer from '../BlockRenderer/BlockRenderer'
import SlashMenu from '../SlashMenu/SlashMenu'
import InlineToolbar from '../InlineToolbar/InlineToolbar'
import CommentIndicator from '../CommentIndicator/CommentIndicator'
import CommentThread from '../CommentThread/CommentThread'
import { getMarksAtPosition, toggleMark } from '../../lib/markUtils'
import { parseMarkdown } from '../../lib/markdownParser'
import './BlockEditor.css'

interface BlockEditorProps {
  pageId: string
  blockIds: string[]
  autoFocusBlockId?: string
}

export default function BlockEditor({ pageId, blockIds, autoFocusBlockId }: BlockEditorProps) {
  const blocks = useWorkspaceStore((s) => s.blocks)
  const pages = useWorkspaceStore((s) => s.pages)
  const updateBlockContent = useWorkspaceStore((s) => s.updateBlockContent)
  const updateBlockMarks = useWorkspaceStore((s) => s.updateBlockMarks)
  const splitBlock = useWorkspaceStore((s) => s.splitBlock)
  const mergeBlocks = useWorkspaceStore((s) => s.mergeBlocks)
  const addBlock = useWorkspaceStore((s) => s.addBlock)
  const convertBlockType = useWorkspaceStore((s) => s.convertBlockType)
  const reorderBlock = useWorkspaceStore((s) => s.reorderBlock)
  const duplicateBlock = useWorkspaceStore((s) => s.duplicateBlock)
  const deleteBlock = useWorkspaceStore((s) => s.deleteBlock)
  const insertBlocksAt = useWorkspaceStore((s) => s.insertBlocksAt)

  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(autoFocusBlockId ?? null)
  const [focusNextId, setFocusNextId] = useState<string | null>(null)
  const [slashMenu, setSlashMenu] = useState<{ blockId: string; position: { x: number; y: number } } | null>(null)
  const [inlineToolbar, setInlineToolbar] = useState<{ blockId: string; position: { x: number; y: number }; from: number; to: number } | null>(null)
  const [linkPopover, setLinkPopover] = useState<{ blockId: string; from: number; to: number; position: { x: number; y: number } } | null>(null)
  const [mentionMenu, setMentionMenu] = useState<{ blockId: string; trigger: '@' | '[['; position: { x: number; y: number } } | null>(null)
  const [dragBlockId, setDragBlockId] = useState<string | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [blockActionsMenu, setBlockActionsMenu] = useState<{ blockId: string; position: { x: number; y: number } } | null>(null)
  const [commentThreadBlockId, setCommentThreadBlockId] = useState<string | null>(null)

  const handleContentChange = useCallback(
    (blockId: string, content: string) => {
      updateBlockContent(blockId, content)
    },
    [updateBlockContent]
  )

  const handleMarksChange = useCallback(
    (blockId: string, marks: Block['marks']) => {
      updateBlockMarks(blockId, marks)
    },
    [updateBlockMarks]
  )

  const handleEnter = useCallback(
    (blockId: string, offset: number) => {
      const block = blocks[blockId]
      if (!block) return

      const newId = splitBlock(pageId, blockId, offset)
      setFocusNextId(newId)
      setFocusedBlockId(newId)
    },
    [blocks, splitBlock, pageId]
  )

  const handleBackspace = useCallback(
    (blockId: string) => {
      const block = blocks[blockId]
      if (!block) return

      // If block is empty non-paragraph, convert to paragraph first
      if (block.type !== BlockType.Paragraph && block.content === '') {
        convertBlockType(blockId, BlockType.Paragraph)
        setFocusNextId(blockId)
        setFocusedBlockId(blockId)
        return
      }

      const prevId = mergeBlocks(pageId, blockId)
      if (prevId) {
        setFocusNextId(prevId)
        setFocusedBlockId(prevId)
      }
    },
    [blocks, mergeBlocks, convertBlockType, pageId]
  )

  const handleArrowUp = useCallback(
    (blockId: string) => {
      const idx = blockIds.indexOf(blockId)
      if (idx > 0) {
        const prevId = blockIds[idx - 1]!
        setFocusNextId(prevId)
        setFocusedBlockId(prevId)
      }
    },
    [blockIds]
  )

  const handleArrowDown = useCallback(
    (blockId: string) => {
      const idx = blockIds.indexOf(blockId)
      if (idx < blockIds.length - 1) {
        const nextId = blockIds[idx + 1]!
        setFocusNextId(nextId)
        setFocusedBlockId(nextId)
      }
    },
    [blockIds]
  )

  const handleSlash = useCallback(
    (blockId: string, rect: DOMRect) => {
      setSlashMenu({
        blockId,
        position: { x: rect.left, y: rect.bottom },
      })
    },
    []
  )

  const handleSlashSelect = useCallback(
    (type: BlockTypeT) => {
      if (!slashMenu) return
      const block = blocks[slashMenu.blockId]
      if (!block) return

      // Remove the "/" from content
      const content = block.content
      const slashIdx = content.lastIndexOf('/')
      if (slashIdx >= 0) {
        updateBlockContent(slashMenu.blockId, content.slice(0, slashIdx) + content.slice(slashIdx + 1))
      }

      convertBlockType(slashMenu.blockId, type)
      setSlashMenu(null)
      setFocusNextId(slashMenu.blockId)
      setFocusedBlockId(slashMenu.blockId)
    },
    [slashMenu, blocks, convertBlockType, updateBlockContent]
  )

  const handleSlashClose = useCallback(() => {
    setSlashMenu(null)
  }, [])

  const handleSelectionChange = useCallback(
    (blockId: string, from: number, to: number) => {
      if (from !== to) {
        // Get selection rect
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          setInlineToolbar({
            blockId,
            position: { x: rect.left + rect.width / 2, y: rect.top },
            from,
            to,
          })
        }
      } else {
        setInlineToolbar(null)
      }
    },
    []
  )

  const handleToggleMark = useCallback(
    (markType: MarkType) => {
      if (!inlineToolbar) return
      const block = blocks[inlineToolbar.blockId]
      if (!block) return

      if (markType === MT.Link) {
        // Open link popover instead of directly toggling
        setLinkPopover({
          blockId: inlineToolbar.blockId,
          from: inlineToolbar.from,
          to: inlineToolbar.to,
          position: inlineToolbar.position,
        })
        return
      }

      const newMarks = toggleMark(block.marks, markType, inlineToolbar.from, inlineToolbar.to)
      updateBlockMarks(inlineToolbar.blockId, newMarks)
    },
    [inlineToolbar, blocks, updateBlockMarks]
  )

  const handleFormatShortcut = useCallback(
    (blockId: string, markType: MarkType) => {
      const block = blocks[blockId]
      if (!block) return

      if (markType === MT.Link) {
        // For link, show popover if text is selected
        if (inlineToolbar && inlineToolbar.blockId === blockId) {
          setLinkPopover({
            blockId,
            from: inlineToolbar.from,
            to: inlineToolbar.to,
            position: inlineToolbar.position,
          })
        }
        return
      }

      // Use current selection from inline toolbar, or do nothing if no selection
      if (inlineToolbar && inlineToolbar.blockId === blockId) {
        const newMarks = toggleMark(block.marks, markType, inlineToolbar.from, inlineToolbar.to)
        updateBlockMarks(blockId, newMarks)
      }
    },
    [blocks, updateBlockMarks, inlineToolbar]
  )

  const handleLinkConfirm = useCallback(
    (url: string) => {
      if (!linkPopover) return
      const block = blocks[linkPopover.blockId]
      if (!block) return

      const newMarks = toggleMark(block.marks, MT.Link, linkPopover.from, linkPopover.to, { href: url })
      updateBlockMarks(linkPopover.blockId, newMarks)
      setLinkPopover(null)
    },
    [linkPopover, blocks, updateBlockMarks]
  )

  const handleMention = useCallback(
    (blockId: string, trigger: '@' | '[[', rect: DOMRect) => {
      setMentionMenu({
        blockId,
        trigger,
        position: { x: rect.left, y: rect.bottom },
      })
    },
    []
  )

  const handleMentionSelect = useCallback(
    (selectedPageId: string) => {
      if (!mentionMenu) return
      const block = blocks[mentionMenu.blockId]
      const selectedPage = pages[selectedPageId]
      if (!block || !selectedPage) return

      // Remove trigger chars from content
      const content = block.content
      const triggerLen = mentionMenu.trigger === '[[' ? 2 : 1
      const newContent = content.slice(0, content.length - triggerLen)
      const insertText = selectedPage.title
      const finalContent = newContent + insertText

      updateBlockContent(mentionMenu.blockId, finalContent)

      // Add page link mark
      const mark: InlineMark = {
        type: MT.Link,
        from: newContent.length,
        to: newContent.length + insertText.length,
        attrs: { href: `/pages/${selectedPageId}`, pageId: selectedPageId },
      }
      updateBlockMarks(mentionMenu.blockId, [...block.marks, mark])
      setMentionMenu(null)
    },
    [mentionMenu, blocks, pages, updateBlockContent, updateBlockMarks]
  )

  // Drag and drop handlers
  const handleDragStart = useCallback(
    (blockId: string) => {
      setDragBlockId(blockId)
    },
    []
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDropIndex(index)
    },
    []
  )

  const handleDragEnd = useCallback(() => {
    if (dragBlockId && dropIndex !== null) {
      reorderBlock(pageId, dragBlockId, dropIndex)
    }
    setDragBlockId(null)
    setDropIndex(null)
  }, [dragBlockId, dropIndex, reorderBlock, pageId])

  // Block actions menu handlers
  const handleBlockAction = useCallback(
    (action: string, blockId: string) => {
      switch (action) {
        case 'delete':
          deleteBlock(pageId, blockId)
          break
        case 'duplicate':
          duplicateBlock(pageId, blockId)
          break
        default:
          if (action.startsWith('turn_into:')) {
            const newType = action.slice('turn_into:'.length) as BlockTypeT
            convertBlockType(blockId, newType)
          }
          break
      }
      setBlockActionsMenu(null)
    },
    [deleteBlock, duplicateBlock, convertBlockType, pageId]
  )

  const handlePasteBlocks = useCallback(
    (blockId: string, pastedBlocks: Array<{ type: string; content: string; marks?: InlineMark[] }>) => {
      // Check for markdown paste
      if (pastedBlocks.length === 1 && pastedBlocks[0]?.type === '__markdown__') {
        const parsed = parseMarkdown(pastedBlocks[0].content)
        if (parsed.length > 0) {
          const idx = blockIds.indexOf(blockId)
          insertBlocksAt(pageId, parsed, idx + 1)
          return
        }
      }
    },
    [blockIds, insertBlocksAt, pageId]
  )

  const handleToggleCommentThread = useCallback(
    (blockId: string) => {
      setCommentThreadBlockId((prev) => (prev === blockId ? null : blockId))
    },
    []
  )

  const handleCloseCommentThread = useCallback(() => {
    setCommentThreadBlockId(null)
  }, [])

  const handleEmptyAreaClick = useCallback(() => {
    // Add a new paragraph at the end and focus it
    const lastBlockId = blockIds[blockIds.length - 1] as string | undefined
    const lastBlock = lastBlockId ? blocks[lastBlockId] : null

    // If last block is already empty, just focus it
    if (lastBlockId && lastBlock && lastBlock.content === '' && lastBlock.type === BlockType.Paragraph) {
      setFocusNextId(lastBlockId)
      setFocusedBlockId(lastBlockId)
      return
    }

    const newId = addBlock(pageId, BlockType.Paragraph, lastBlockId)
    setFocusNextId(newId)
    setFocusedBlockId(newId)
  }, [blockIds, blocks, addBlock, pageId])

  // Compute numbered list indices
  const numberedIndices = new Map<string, number>()
  let numberedCounter = 0
  for (const bid of blockIds) {
    const block = blocks[bid]
    if (block?.type === BlockType.NumberedList) {
      numberedCounter++
      numberedIndices.set(bid, numberedCounter)
    } else {
      numberedCounter = 0
    }
  }

  return (
    <div className="block-editor">
      {blockIds.map((blockId, index) => {
        const block = blocks[blockId]
        if (!block) return null

        return (
          <div
            key={blockId}
            data-block-id={blockId}
            className={`block-editor__block ${dragBlockId === blockId ? 'block-editor__block--dragging' : ''} ${dropIndex === index ? 'block-editor__block--drop-above' : ''}`}
            draggable
            onDragStart={() => handleDragStart(blockId)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div
              className="block-editor__handle"
              title="Drag to reorder / Click for actions"
              role="button"
              tabIndex={-1}
              aria-label="Block handle"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setBlockActionsMenu({ blockId, position: { x: rect.left, y: rect.bottom } })
              }}
            >
              <span className="block-editor__handle-dots">⋮⋮</span>
            </div>
            <div className="block-editor__content">
              <BlockRenderer
                block={block}
                onContentChange={(content) => handleContentChange(blockId, content)}
                onMarksChange={(marks) => handleMarksChange(blockId, marks)}
                onEnter={(offset) => handleEnter(blockId, offset)}
                onBackspace={() => handleBackspace(blockId)}
                onArrowUp={() => handleArrowUp(blockId)}
                onArrowDown={() => handleArrowDown(blockId)}
                onSlash={(rect) => handleSlash(blockId, rect)}
                onSelectionChange={(from, to) => handleSelectionChange(blockId, from, to)}
                onFormatShortcut={(markType) => handleFormatShortcut(blockId, markType)}
                onMention={(trigger, rect) => handleMention(blockId, trigger, rect)}
                onPasteBlocks={(pastedBlocks) => handlePasteBlocks(blockId, pastedBlocks)}
                autoFocus={blockId === focusNextId || (blockId === focusedBlockId && blockId === autoFocusBlockId)}
                numberedIndex={numberedIndices.get(blockId)}
                pageId={pageId}
              />
            </div>
            <div className="block-editor__comment-actions">
              <CommentIndicator
                pageId={pageId}
                blockId={blockId}
                onClick={() => handleToggleCommentThread(blockId)}
              />
            </div>
            {commentThreadBlockId === blockId && (
              <CommentThread
                pageId={pageId}
                blockId={blockId}
                position={{ top: 0, right: -340 }}
                onClose={handleCloseCommentThread}
              />
            )}
          </div>
        )
      })}

      {/* Drop indicator at end */}
      {dropIndex === blockIds.length && (
        <div className="block-editor__drop-indicator" />
      )}

      {/* Click area below blocks to add new block */}
      <div
        className="block-editor__empty-click"
        onClick={handleEmptyAreaClick}
        onDragOver={(e) => handleDragOver(e, blockIds.length)}
        role="button"
        tabIndex={0}
        aria-label="Click to add a block"
      />

      {/* Slash Menu */}
      {slashMenu && (
        <SlashMenu
          position={slashMenu.position}
          onSelect={handleSlashSelect}
          onClose={handleSlashClose}
        />
      )}

      {/* Inline Toolbar */}
      {inlineToolbar && (
        <InlineToolbar
          position={inlineToolbar.position}
          activeMarks={
            inlineToolbar
              ? getMarksAtPosition(
                  blocks[inlineToolbar.blockId]?.marks ?? [],
                  inlineToolbar.from
                ).map((m) => m.type)
              : []
          }
          onToggleMark={handleToggleMark}
          onClose={() => setInlineToolbar(null)}
        />
      )}

      {/* Link Popover */}
      {linkPopover && (
        <LinkPopover
          position={linkPopover.position}
          onConfirm={handleLinkConfirm}
          onClose={() => setLinkPopover(null)}
        />
      )}

      {/* Mention Menu */}
      {mentionMenu && (
        <MentionMenu
          position={mentionMenu.position}
          trigger={mentionMenu.trigger}
          pages={Object.values(pages).filter((p) => !p.trashedAt)}
          onSelect={handleMentionSelect}
          onClose={() => setMentionMenu(null)}
        />
      )}

      {/* Block Actions Menu */}
      {blockActionsMenu && (
        <BlockActionsMenu
          position={blockActionsMenu.position}
          onAction={(action) => handleBlockAction(action, blockActionsMenu.blockId)}
          onClose={() => setBlockActionsMenu(null)}
        />
      )}
    </div>
  )
}

// ─── Inline Sub-components ──────────────────────────────────────────

function LinkPopover({
  position,
  onConfirm,
  onClose,
}: {
  position: { x: number; y: number }
  onConfirm: (url: string) => void
  onClose: () => void
}) {
  const [url, setUrl] = useState('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (url.trim()) {
        onConfirm(url.trim())
      }
    },
    [url, onConfirm]
  )

  return (
    <div
      className="link-popover"
      style={{ left: `${position.x}px`, top: `${position.y + 8}px` }}
    >
      <form onSubmit={handleSubmit} className="link-popover__form">
        <input
          type="url"
          className="link-popover__input"
          placeholder="Paste link URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
          }}
          autoFocus
        />
        <button type="submit" className="link-popover__btn btn-primary" disabled={!url.trim()}>
          Link
        </button>
      </form>
    </div>
  )
}

function MentionMenu({
  position,
  trigger,
  pages,
  onSelect,
  onClose,
}: {
  position: { x: number; y: number }
  trigger: '@' | '[['
  pages: Array<{ id: string; title: string; icon: string }>
  onSelect: (pageId: string) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filtered = pages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = filtered[selectedIndex]
        if (selected) onSelect(selected.id)
      } else if (e.key === 'Escape') {
        onClose()
      }
    },
    [filtered, selectedIndex, onSelect, onClose]
  )

  return (
    <div
      className="mention-menu"
      style={{ left: `${position.x}px`, top: `${position.y + 4}px` }}
    >
      <div className="mention-menu__header">
        {trigger === '[[' ? 'Link to page' : 'Mention page'}
      </div>
      <input
        className="mention-menu__input"
        placeholder="Search pages..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setSelectedIndex(0)
        }}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <div className="mention-menu__list">
        {filtered.map((page, i) => (
          <button
            key={page.id}
            className={`mention-menu__item ${i === selectedIndex ? 'mention-menu__item--selected' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault()
              onSelect(page.id)
            }}
            onMouseEnter={() => setSelectedIndex(i)}
          >
            <span className="mention-menu__icon">{page.icon || '📄'}</span>
            <span className="mention-menu__title">{page.title}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="mention-menu__empty">No pages found</div>
        )}
      </div>
    </div>
  )
}

function BlockActionsMenu({
  position,
  onAction,
  onClose,
}: {
  position: { x: number; y: number }
  onAction: (action: string) => void
  onClose: () => void
}) {
  const [showTurnInto, setShowTurnInto] = useState(false)

  const turnIntoTypes: Array<{ type: BlockTypeT; label: string }> = [
    { type: BlockType.Paragraph, label: 'Text' },
    { type: BlockType.Heading1, label: 'Heading 1' },
    { type: BlockType.Heading2, label: 'Heading 2' },
    { type: BlockType.Heading3, label: 'Heading 3' },
    { type: BlockType.BulletList, label: 'Bulleted List' },
    { type: BlockType.NumberedList, label: 'Numbered List' },
    { type: BlockType.TodoList, label: 'To-do' },
    { type: BlockType.Toggle, label: 'Toggle' },
    { type: BlockType.Callout, label: 'Callout' },
    { type: BlockType.Code, label: 'Code' },
    { type: BlockType.Quote, label: 'Quote' },
  ]

  return (
    <div
      className="block-actions-menu"
      style={{ left: `${position.x}px`, top: `${position.y + 4}px` }}
    >
      {!showTurnInto ? (
        <>
          <button
            className="block-actions-menu__item"
            onMouseDown={(e) => { e.preventDefault(); onAction('delete') }}
          >
            Delete
          </button>
          <button
            className="block-actions-menu__item"
            onMouseDown={(e) => { e.preventDefault(); onAction('duplicate') }}
          >
            Duplicate
          </button>
          <button
            className="block-actions-menu__item"
            onMouseDown={(e) => { e.preventDefault(); setShowTurnInto(true) }}
          >
            Turn into →
          </button>
        </>
      ) : (
        <>
          <button
            className="block-actions-menu__item block-actions-menu__item--back"
            onMouseDown={(e) => { e.preventDefault(); setShowTurnInto(false) }}
          >
            ← Back
          </button>
          {turnIntoTypes.map((t) => (
            <button
              key={t.type}
              className="block-actions-menu__item"
              onMouseDown={(e) => { e.preventDefault(); onAction(`turn_into:${t.type}`) }}
            >
              {t.label}
            </button>
          ))}
        </>
      )}
      <div className="block-actions-menu__backdrop" onClick={onClose} />
    </div>
  )
}
