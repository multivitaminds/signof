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
    })

    it('creates a child page', () => {
      const parentId = useWorkspaceStore.getState().addPage('Parent')
      const childId = useWorkspaceStore.getState().addPage('Child', parentId)
      const child = useWorkspaceStore.getState().pages[childId]!
      expect(child.parentId).toBe(parentId)
    })
  })

  describe('deletePage', () => {
    it('removes a page and its blocks', () => {
      const id = useWorkspaceStore.getState().addPage('To Delete')
      const page = useWorkspaceStore.getState().pages[id]!
      const blockId = page.blockIds[0]!

      useWorkspaceStore.getState().deletePage(id)

      expect(useWorkspaceStore.getState().pages[id]).toBeUndefined()
      expect(useWorkspaceStore.getState().blocks[blockId]).toBeUndefined()
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
  })
})
