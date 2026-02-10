import { useState, useCallback } from 'react'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import { BlockType } from '../../types'
import type { Block, BlockType as BlockTypeT } from '../../types'
import BlockRenderer from '../BlockRenderer/BlockRenderer'
import SlashMenu from '../SlashMenu/SlashMenu'
import InlineToolbar from '../InlineToolbar/InlineToolbar'
import { getMarksAtPosition } from '../../lib/markUtils'
import { toggleMark } from '../../lib/markUtils'
import './BlockEditor.css'

interface BlockEditorProps {
  pageId: string
  blockIds: string[]
  autoFocusBlockId?: string
}

export default function BlockEditor({ pageId, blockIds, autoFocusBlockId }: BlockEditorProps) {
  const blocks = useWorkspaceStore((s) => s.blocks)
  const updateBlockContent = useWorkspaceStore((s) => s.updateBlockContent)
  const updateBlockMarks = useWorkspaceStore((s) => s.updateBlockMarks)
  const splitBlock = useWorkspaceStore((s) => s.splitBlock)
  const mergeBlocks = useWorkspaceStore((s) => s.mergeBlocks)
  const addBlock = useWorkspaceStore((s) => s.addBlock)
  const convertBlockType = useWorkspaceStore((s) => s.convertBlockType)

  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(autoFocusBlockId ?? null)
  const [focusNextId, setFocusNextId] = useState<string | null>(null)
  const [slashMenu, setSlashMenu] = useState<{ blockId: string; position: { x: number; y: number } } | null>(null)
  const [inlineToolbar, setInlineToolbar] = useState<{ blockId: string; position: { x: number; y: number }; from: number; to: number } | null>(null)

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
    (blockId: string) => {
      // For now, simply split — the caret offset detection would require
      // reading from the DOM. Split at end (new empty paragraph).
      const block = blocks[blockId]
      if (!block) return

      const newId = splitBlock(pageId, blockId, block.content.length)
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
    (markType: Block['marks'][0]['type']) => {
      if (!inlineToolbar) return
      const block = blocks[inlineToolbar.blockId]
      if (!block) return

      const newMarks = toggleMark(block.marks, markType, inlineToolbar.from, inlineToolbar.to)
      updateBlockMarks(inlineToolbar.blockId, newMarks)
    },
    [inlineToolbar, blocks, updateBlockMarks]
  )

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
      {blockIds.map((blockId) => {
        const block = blocks[blockId]
        if (!block) return null

        return (
          <div key={blockId} className="block-editor__block">
            <BlockRenderer
              block={block}
              onContentChange={(content) => handleContentChange(blockId, content)}
              onMarksChange={(marks) => handleMarksChange(blockId, marks)}
              onEnter={() => handleEnter(blockId)}
              onBackspace={() => handleBackspace(blockId)}
              onArrowUp={() => handleArrowUp(blockId)}
              onArrowDown={() => handleArrowDown(blockId)}
              onSlash={(rect) => handleSlash(blockId, rect)}
              onSelectionChange={(from, to) => handleSelectionChange(blockId, from, to)}
              autoFocus={blockId === focusNextId || (blockId === focusedBlockId && blockId === autoFocusBlockId)}
              numberedIndex={numberedIndices.get(blockId)}
            />
          </div>
        )
      })}

      {/* Click area below blocks to add new block */}
      <div
        className="block-editor__empty-click"
        onClick={handleEmptyAreaClick}
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
    </div>
  )
}
