import { useWorkspaceStore } from '../useWorkspaceStore'
import { BlockType } from '../../types'

describe('useWorkspaceStore', () => {
  beforeEach(() => {
    // Reset store to initial state with sample data
    useWorkspaceStore.setState(useWorkspaceStore.getInitialState())
  })

  describe('sample data', () => {
    it('has sample pages', () => {
      const pages = Object.values(useWorkspaceStore.getState().pages)
      expect(pages.length).toBeGreaterThanOrEqual(3)
    })

    it('has sample blocks', () => {
      const blocks = Object.values(useWorkspaceStore.getState().blocks)
      expect(blocks.length).toBeGreaterThan(0)
    })
  })

  describe('addPage', () => {
    it('creates a new page with default paragraph block', () => {
      const id = useWorkspaceStore.getState().addPage('Test Page')
      const page = useWorkspaceStore.getState().pages[id]!
      expect(page).toBeDefined()
      expect(page.title).toBe('Test Page')
      expect(page.blockIds).toHaveLength(1)
      expect(page.trashedAt).toBeNull()
      expect(page.properties).toEqual({})
    })

    it('creates a child page', () => {
      const parentId = useWorkspaceStore.getState().addPage('Parent')
      const childId = useWorkspaceStore.getState().addPage('Child', parentId)
      const child = useWorkspaceStore.getState().pages[childId]!
      expect(child.parentId).toBe(parentId)
    })
  })

  describe('deletePage', () => {
    it('soft-deletes a page by setting trashedAt', () => {
      const id = useWorkspaceStore.getState().addPage('To Delete')
      useWorkspaceStore.getState().deletePage(id)

      const page = useWorkspaceStore.getState().pages[id]
      expect(page).toBeDefined()
      expect(page!.trashedAt).not.toBeNull()
    })

    it('excludes soft-deleted pages from getRootPages', () => {
      const id = useWorkspaceStore.getState().addPage('To Delete')
      useWorkspaceStore.getState().deletePage(id)

      const roots = useWorkspaceStore.getState().getRootPages()
      expect(roots.find(p => p.id === id)).toBeUndefined()
    })
  })

  describe('restorePage', () => {
    it('restores a soft-deleted page', () => {
      const id = useWorkspaceStore.getState().addPage('To Restore')
      useWorkspaceStore.getState().deletePage(id)
      useWorkspaceStore.getState().restorePage(id)

      const page = useWorkspaceStore.getState().pages[id]!
      expect(page.trashedAt).toBeNull()
    })
  })

  describe('permanentlyDeletePage', () => {
    it('removes a page and its blocks permanently', () => {
      const id = useWorkspaceStore.getState().addPage('To Delete')
      const page = useWorkspaceStore.getState().pages[id]!
      const blockId = page.blockIds[0]!

      useWorkspaceStore.getState().permanentlyDeletePage(id)

      expect(useWorkspaceStore.getState().pages[id]).toBeUndefined()
      expect(useWorkspaceStore.getState().blocks[blockId]).toBeUndefined()
    })
  })

  describe('getTrashedPages', () => {
    it('returns only trashed pages', () => {
      const id = useWorkspaceStore.getState().addPage('Trashed')
      useWorkspaceStore.getState().deletePage(id)

      const trashed = useWorkspaceStore.getState().getTrashedPages()
      expect(trashed.find(p => p.id === id)).toBeDefined()
    })
  })

  describe('addBlock', () => {
    it('adds a block to a page', () => {
      const pageId = useWorkspaceStore.getState().addPage('Test')
      const blockId = useWorkspaceStore.getState().addBlock(pageId, BlockType.Paragraph)
      const page = useWorkspaceStore.getState().pages[pageId]!
      expect(page.blockIds).toContain(blockId)
    })

    it('inserts block after specified block', () => {
      const pageId = useWorkspaceStore.getState().addPage('Test')
      const firstBlockId = useWorkspaceStore.getState().pages[pageId]!.blockIds[0]!
      const newBlockId = useWorkspaceStore.getState().addBlock(pageId, BlockType.Heading1, firstBlockId)
      const page = useWorkspaceStore.getState().pages[pageId]!
      expect(page.blockIds.indexOf(newBlockId)).toBe(page.blockIds.indexOf(firstBlockId) + 1)
    })
  })

  describe('splitBlock', () => {
    it('splits a block into two', () => {
      const pageId = useWorkspaceStore.getState().addPage('Test')
      const blockId = useWorkspaceStore.getState().pages[pageId]!.blockIds[0]!
      useWorkspaceStore.getState().updateBlockContent(blockId, 'Hello World')

      const newId = useWorkspaceStore.getState().splitBlock(pageId, blockId, 5)
      const page = useWorkspaceStore.getState().pages[pageId]!
      expect(page.blockIds).toHaveLength(2)

      const original = useWorkspaceStore.getState().blocks[blockId]!
      const newBlock = useWorkspaceStore.getState().blocks[newId]!
      expect(original.content).toBe('Hello')
      expect(newBlock.content).toBe(' World')
    })
  })

  describe('mergeBlocks', () => {
    it('merges block with previous', () => {
      const pageId = useWorkspaceStore.getState().addPage('Test')
      const firstBlockId = useWorkspaceStore.getState().pages[pageId]!.blockIds[0]!
      useWorkspaceStore.getState().updateBlockContent(firstBlockId, 'Hello')
      const secondBlockId = useWorkspaceStore.getState().addBlock(pageId, BlockType.Paragraph)
      useWorkspaceStore.getState().updateBlockContent(secondBlockId, ' World')

      const mergedId = useWorkspaceStore.getState().mergeBlocks(pageId, secondBlockId)
      expect(mergedId).toBe(firstBlockId)

      const merged = useWorkspaceStore.getState().blocks[firstBlockId]!
      expect(merged.content).toBe('Hello World')

      const page = useWorkspaceStore.getState().pages[pageId]!
      expect(page.blockIds).not.toContain(secondBlockId)
    })

    it('returns null for first block', () => {
      const pageId = useWorkspaceStore.getState().addPage('Test')
      const firstBlockId = useWorkspaceStore.getState().pages[pageId]!.blockIds[0]!
      const result = useWorkspaceStore.getState().mergeBlocks(pageId, firstBlockId)
      expect(result).toBeNull()
    })
  })

  describe('convertBlockType', () => {
    it('changes block type', () => {
      const pageId = useWorkspaceStore.getState().addPage('Test')
      const blockId = useWorkspaceStore.getState().pages[pageId]!.blockIds[0]!
      useWorkspaceStore.getState().convertBlockType(blockId, BlockType.Heading1)
      const block = useWorkspaceStore.getState().blocks[blockId]!
      expect(block.type).toBe(BlockType.Heading1)
    })
  })

  describe('reorderBlock', () => {
    it('moves a block to a new position', () => {
      const pageId = useWorkspaceStore.getState().addPage('Test')
      const b1 = useWorkspaceStore.getState().pages[pageId]!.blockIds[0]!
      const b2 = useWorkspaceStore.getState().addBlock(pageId, BlockType.Heading1)
      const b3 = useWorkspaceStore.getState().addBlock(pageId, BlockType.Paragraph)

      // Move b3 to position 0
      useWorkspaceStore.getState().reorderBlock(pageId, b3, 0)
      const page = useWorkspaceStore.getState().pages[pageId]!
      expect(page.blockIds[0]).toBe(b3)
      expect(page.blockIds[1]).toBe(b1)
      expect(page.blockIds[2]).toBe(b2)
    })
  })

  describe('duplicateBlock', () => {
    it('creates a copy of a block', () => {
      const pageId = useWorkspaceStore.getState().addPage('Test')
      const blockId = useWorkspaceStore.getState().pages[pageId]!.blockIds[0]!
      useWorkspaceStore.getState().updateBlockContent(blockId, 'Original')

      const newId = useWorkspaceStore.getState().duplicateBlock(pageId, blockId)
      expect(newId).not.toBeNull()

      const page = useWorkspaceStore.getState().pages[pageId]!
      expect(page.blockIds).toHaveLength(2)

      const newBlock = useWorkspaceStore.getState().blocks[newId!]!
      expect(newBlock.content).toBe('Original')
      expect(newBlock.id).not.toBe(blockId)
    })
  })

  describe('duplicatePage', () => {
    it('creates a copy of a page with new blocks', () => {
      const id = useWorkspaceStore.getState().addPage('Original')
      useWorkspaceStore.getState().updateBlockContent(
        useWorkspaceStore.getState().pages[id]!.blockIds[0]!,
        'Content'
      )

      const newId = useWorkspaceStore.getState().duplicatePage(id)
      expect(newId).not.toBeNull()

      const newPage = useWorkspaceStore.getState().pages[newId!]!
      expect(newPage.title).toBe('Copy of Original')
      expect(newPage.blockIds).toHaveLength(1)
      expect(newPage.blockIds[0]).not.toBe(useWorkspaceStore.getState().pages[id]!.blockIds[0])
    })
  })

  describe('updatePageProperties', () => {
    it('sets page properties', () => {
      const id = useWorkspaceStore.getState().addPage('Test')
      useWorkspaceStore.getState().updatePageProperties(id, {
        status: { type: 'select', value: 'active', options: ['active', 'archived'] },
      })

      const page = useWorkspaceStore.getState().pages[id]!
      expect(page.properties.status).toEqual({
        type: 'select',
        value: 'active',
        options: ['active', 'archived'],
      })
    })
  })

  describe('insertBlocksAt', () => {
    it('inserts multiple blocks at a position', () => {
      const pageId = useWorkspaceStore.getState().addPage('Test')
      useWorkspaceStore.getState().insertBlocksAt(pageId, [
        { type: BlockType.Heading1, content: 'H1' },
        { type: BlockType.Paragraph, content: 'Para' },
      ], 0)

      const page = useWorkspaceStore.getState().pages[pageId]!
      expect(page.blockIds).toHaveLength(3) // 1 original + 2 inserted
    })
  })

  describe('version history', () => {
    it('creates and retrieves snapshots', () => {
      const pageId = useWorkspaceStore.getState().addPage('Test')
      useWorkspaceStore.getState().createSnapshot(pageId)

      const history = useWorkspaceStore.getState().getPageHistory(pageId)
      expect(history).toHaveLength(1)
      expect(history[0]!.pageId).toBe(pageId)
    })

    it('restores a snapshot', () => {
      const pageId = useWorkspaceStore.getState().addPage('Test')
      const blockId = useWorkspaceStore.getState().pages[pageId]!.blockIds[0]!
      useWorkspaceStore.getState().updateBlockContent(blockId, 'Before')
      useWorkspaceStore.getState().createSnapshot(pageId)

      useWorkspaceStore.getState().updateBlockContent(blockId, 'After')

      const history = useWorkspaceStore.getState().getPageHistory(pageId)
      useWorkspaceStore.getState().restoreSnapshot(history[0]!.id)

      const page = useWorkspaceStore.getState().pages[pageId]!
      const restoredBlock = useWorkspaceStore.getState().blocks[page.blockIds[0]!]!
      expect(restoredBlock.content).toBe('Before')
    })
  })

  describe('queries', () => {
    it('getRootPages returns pages without parents', () => {
      const roots = useWorkspaceStore.getState().getRootPages()
      expect(roots.every(p => p.parentId === null)).toBe(true)
    })

    it('getChildPages returns children', () => {
      const parentId = useWorkspaceStore.getState().addPage('Parent')
      useWorkspaceStore.getState().addPage('Child 1', parentId)
      useWorkspaceStore.getState().addPage('Child 2', parentId)
      const children = useWorkspaceStore.getState().getChildPages(parentId)
      expect(children).toHaveLength(2)
    })

    it('getPageBreadcrumbs returns ancestry', () => {
      const parentId = useWorkspaceStore.getState().addPage('Parent')
      const childId = useWorkspaceStore.getState().addPage('Child', parentId)
      const crumbs = useWorkspaceStore.getState().getPageBreadcrumbs(childId)
      expect(crumbs).toHaveLength(2)
      expect(crumbs[0]!.title).toBe('Parent')
      expect(crumbs[1]!.title).toBe('Child')
    })

    it('getAllPages excludes trashed pages', () => {
      const id = useWorkspaceStore.getState().addPage('To Trash')
      useWorkspaceStore.getState().deletePage(id)
      const all = useWorkspaceStore.getState().getAllPages()
      expect(all.find(p => p.id === id)).toBeUndefined()
    })

    it('getBacklinks finds pages linking to a page', () => {
      const pageA = useWorkspaceStore.getState().addPage('Page A')
      const pageB = useWorkspaceStore.getState().addPage('Page B')
      const blockId = useWorkspaceStore.getState().pages[pageB]!.blockIds[0]!

      // Add a link mark pointing to pageA
      useWorkspaceStore.getState().updateBlockMarks(blockId, [
        { type: 'link', from: 0, to: 5, attrs: { href: `/pages/${pageA}`, pageId: pageA } },
      ])
      useWorkspaceStore.getState().updateBlockContent(blockId, 'Page A')

      const backlinks = useWorkspaceStore.getState().getBacklinks(pageA)
      expect(backlinks).toHaveLength(1)
      expect(backlinks[0]!.pageId).toBe(pageB)
    })
  })
})
