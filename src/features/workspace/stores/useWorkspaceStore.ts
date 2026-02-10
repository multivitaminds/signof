import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Block, Page, BlockType, InlineMark } from '../types'
import { BlockType as BT } from '../types'
import { splitBlock as splitBlockOp, mergeBlocks as mergeBlocksOp } from '../lib/blockOperations'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function now(): string {
  return new Date().toISOString()
}

function createBlock(type: BlockType, content: string = ''): Block {
  return {
    id: generateId(),
    type,
    content,
    marks: [],
    properties: {},
    children: [],
  }
}

// ─── Sample Data ────────────────────────────────────────────────────

function createSampleData(): { pages: Record<string, Page>; blocks: Record<string, Block> } {
  const blocks: Record<string, Block> = {}
  const pages: Record<string, Page> = {}

  // Page 1: Getting Started
  const b1 = createBlock(BT.Heading1, 'Welcome to SignOf Pages')
  const b2 = createBlock(BT.Paragraph, 'This is your workspace for notes, docs, and wikis. Start typing to add content.')
  const b3 = createBlock(BT.Paragraph, 'Try pressing "/" to see the block menu, or use keyboard shortcuts like Cmd+B for bold.')
  blocks[b1.id] = b1
  blocks[b2.id] = b2
  blocks[b3.id] = b3

  const page1: Page = {
    id: 'page-getting-started',
    title: 'Getting Started',
    icon: '🚀',
    coverUrl: '',
    parentId: null,
    blockIds: [b1.id, b2.id, b3.id],
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    isFavorite: false,
    lastViewedAt: null,
  }
  pages[page1.id] = page1

  // Page 2: Meeting Notes
  const b4 = createBlock(BT.Heading1, 'Team Standup')
  const b5 = createBlock(BT.Paragraph, 'Weekly sync on project updates and blockers.')
  const b6 = createBlock(BT.BulletList, 'Review sprint progress')
  const b7 = createBlock(BT.BulletList, 'Discuss upcoming milestones')
  blocks[b4.id] = b4
  blocks[b5.id] = b5
  blocks[b6.id] = b6
  blocks[b7.id] = b7

  const page2: Page = {
    id: 'page-meeting-notes',
    title: 'Meeting Notes',
    icon: '📝',
    coverUrl: '',
    parentId: null,
    blockIds: [b4.id, b5.id, b6.id, b7.id],
    createdAt: '2026-02-03T09:00:00Z',
    updatedAt: '2026-02-03T09:00:00Z',
    isFavorite: false,
    lastViewedAt: null,
  }
  pages[page2.id] = page2

  // Page 3: Project Ideas (child of Getting Started)
  const b8 = createBlock(BT.Paragraph, 'Brainstorm ideas for the next quarter.')
  const b9 = createBlock(BT.Paragraph, 'Focus on user-facing features and performance improvements.')
  blocks[b8.id] = b8
  blocks[b9.id] = b9

  const page3: Page = {
    id: 'page-project-ideas',
    title: 'Project Ideas',
    icon: '💡',
    coverUrl: '',
    parentId: 'page-getting-started',
    blockIds: [b8.id, b9.id],
    createdAt: '2026-02-05T14:00:00Z',
    updatedAt: '2026-02-05T14:00:00Z',
    isFavorite: false,
    lastViewedAt: null,
  }
  pages[page3.id] = page3

  return { pages, blocks }
}

// ─── Store Interface ────────────────────────────────────────────────

interface WorkspaceState {
  pages: Record<string, Page>
  blocks: Record<string, Block>

  // Page CRUD
  addPage: (title: string, parentId?: string | null) => string
  addPageWithBlocks: (title: string, icon: string, blocksData: Array<{ type: BlockType; content: string }>, parentId?: string | null) => string
  updatePage: (id: string, updates: Partial<Pick<Page, 'title' | 'icon' | 'coverUrl' | 'isFavorite' | 'lastViewedAt'>>) => void
  deletePage: (id: string) => void
  movePage: (id: string, newParentId: string | null) => void

  // Block CRUD
  addBlock: (pageId: string, type: BlockType, afterBlockId?: string) => string
  updateBlockContent: (blockId: string, content: string) => void
  updateBlockMarks: (blockId: string, marks: InlineMark[]) => void
  deleteBlock: (pageId: string, blockId: string) => void
  convertBlockType: (blockId: string, newType: BlockType) => void
  splitBlock: (pageId: string, blockId: string, offset: number) => string
  mergeBlocks: (pageId: string, blockId: string) => string | null

  // Queries
  getRootPages: () => Page[]
  getChildPages: (parentId: string) => Page[]
  getPageBreadcrumbs: (pageId: string) => Page[]
  getPage: (id: string) => Page | undefined
  getBlock: (id: string) => Block | undefined
  getAllPages: () => Page[]
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => {
      const sample = createSampleData()

      return {
        pages: sample.pages,
        blocks: sample.blocks,

        // ─── Page CRUD ────────────────────────────────────────────

        addPage: (title, parentId = null) => {
          const block = createBlock(BT.Paragraph)
          const page: Page = {
            id: generateId(),
            title: title || 'Untitled',
            icon: '',
            coverUrl: '',
            parentId: parentId ?? null,
            blockIds: [block.id],
            createdAt: now(),
            updatedAt: now(),
            isFavorite: false,
            lastViewedAt: null,
          }

          set((state) => ({
            pages: { ...state.pages, [page.id]: page },
            blocks: { ...state.blocks, [block.id]: block },
          }))

          return page.id
        },

        addPageWithBlocks: (title, icon, blocksData, parentId = null) => {
          const newBlocks: Record<string, Block> = {}
          const blockIds: string[] = []

          if (blocksData.length === 0) {
            const emptyBlock = createBlock(BT.Paragraph)
            newBlocks[emptyBlock.id] = emptyBlock
            blockIds.push(emptyBlock.id)
          } else {
            for (const bd of blocksData) {
              const block = createBlock(bd.type, bd.content)
              newBlocks[block.id] = block
              blockIds.push(block.id)
            }
          }

          const page: Page = {
            id: generateId(),
            title: title || 'Untitled',
            icon,
            coverUrl: '',
            parentId: parentId ?? null,
            blockIds,
            createdAt: now(),
            updatedAt: now(),
            isFavorite: false,
            lastViewedAt: null,
          }

          set((state) => ({
            pages: { ...state.pages, [page.id]: page },
            blocks: { ...state.blocks, ...newBlocks },
          }))

          return page.id
        },

        updatePage: (id, updates) => {
          set((state) => {
            const page = state.pages[id]
            if (!page) return state
            return {
              pages: {
                ...state.pages,
                [id]: { ...page, ...updates, updatedAt: now() },
              },
            }
          })
        },

        deletePage: (id) => {
          set((state) => {
            const page = state.pages[id]
            if (!page) return state

            const newPages = { ...state.pages }
            const newBlocks = { ...state.blocks }

            // Delete page's blocks
            for (const blockId of page.blockIds) {
              delete newBlocks[blockId]
            }

            // Reparent children to deleted page's parent
            for (const p of Object.values(newPages)) {
              if (p.parentId === id) {
                newPages[p.id] = { ...p, parentId: page.parentId }
              }
            }

            delete newPages[id]

            return { pages: newPages, blocks: newBlocks }
          })
        },

        movePage: (id, newParentId) => {
          set((state) => {
            const page = state.pages[id]
            if (!page) return state
            return {
              pages: {
                ...state.pages,
                [id]: { ...page, parentId: newParentId, updatedAt: now() },
              },
            }
          })
        },

        // ─── Block CRUD ───────────────────────────────────────────

        addBlock: (pageId, type, afterBlockId) => {
          const block = createBlock(type)

          set((state) => {
            const page = state.pages[pageId]
            if (!page) return state

            const newBlockIds = [...page.blockIds]
            if (afterBlockId) {
              const idx = newBlockIds.indexOf(afterBlockId)
              if (idx >= 0) {
                newBlockIds.splice(idx + 1, 0, block.id)
              } else {
                newBlockIds.push(block.id)
              }
            } else {
              newBlockIds.push(block.id)
            }

            return {
              pages: {
                ...state.pages,
                [pageId]: { ...page, blockIds: newBlockIds, updatedAt: now() },
              },
              blocks: { ...state.blocks, [block.id]: block },
            }
          })

          return block.id
        },

        updateBlockContent: (blockId, content) => {
          set((state) => {
            const block = state.blocks[blockId]
            if (!block) return state
            return {
              blocks: { ...state.blocks, [blockId]: { ...block, content } },
            }
          })
        },

        updateBlockMarks: (blockId, marks) => {
          set((state) => {
            const block = state.blocks[blockId]
            if (!block) return state
            return {
              blocks: { ...state.blocks, [blockId]: { ...block, marks } },
            }
          })
        },

        deleteBlock: (pageId, blockId) => {
          set((state) => {
            const page = state.pages[pageId]
            if (!page) return state

            const newBlockIds = page.blockIds.filter((id) => id !== blockId)
            // Don't delete last block
            if (newBlockIds.length === 0) return state

            const newBlocks = { ...state.blocks }
            delete newBlocks[blockId]

            return {
              pages: {
                ...state.pages,
                [pageId]: { ...page, blockIds: newBlockIds, updatedAt: now() },
              },
              blocks: newBlocks,
            }
          })
        },

        convertBlockType: (blockId, newType) => {
          set((state) => {
            const block = state.blocks[blockId]
            if (!block) return state
            return {
              blocks: {
                ...state.blocks,
                [blockId]: { ...block, type: newType },
              },
            }
          })
        },

        splitBlock: (pageId, blockId, offset) => {
          const state = get()
          const block = state.blocks[blockId]
          const page = state.pages[pageId]
          if (!block || !page) return blockId

          const { before, after } = splitBlockOp(block, offset)

          set((s) => {
            const idx = page.blockIds.indexOf(blockId)
            const newBlockIds = [...page.blockIds]
            newBlockIds.splice(idx + 1, 0, after.id)

            return {
              pages: {
                ...s.pages,
                [pageId]: { ...page, blockIds: newBlockIds, updatedAt: now() },
              },
              blocks: {
                ...s.blocks,
                [blockId]: before,
                [after.id]: after,
              },
            }
          })

          return after.id
        },

        mergeBlocks: (pageId, blockId) => {
          const state = get()
          const page = state.pages[pageId]
          if (!page) return null

          const idx = page.blockIds.indexOf(blockId)
          if (idx <= 0) return null

          const prevBlockId = page.blockIds[idx - 1]
          if (!prevBlockId) return null
          const prevBlock = state.blocks[prevBlockId]
          const currentBlock = state.blocks[blockId]
          if (!prevBlock || !currentBlock) return null

          const merged = mergeBlocksOp(prevBlock, currentBlock)

          set((s) => {
            const newBlockIds = page.blockIds.filter((id) => id !== blockId)
            const newBlocks = { ...s.blocks }
            newBlocks[prevBlockId] = merged
            delete newBlocks[blockId]

            return {
              pages: {
                ...s.pages,
                [pageId]: { ...page, blockIds: newBlockIds, updatedAt: now() },
              },
              blocks: newBlocks,
            }
          })

          return prevBlockId
        },

        // ─── Queries ──────────────────────────────────────────────

        getRootPages: () => {
          const state = get()
          return Object.values(state.pages)
            .filter((p) => p.parentId === null)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        },

        getChildPages: (parentId) => {
          const state = get()
          return Object.values(state.pages)
            .filter((p) => p.parentId === parentId)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        },

        getPageBreadcrumbs: (pageId) => {
          const state = get()
          const crumbs: Page[] = []
          let current = state.pages[pageId]
          while (current) {
            crumbs.unshift(current)
            current = current.parentId ? state.pages[current.parentId] : undefined
          }
          return crumbs
        },

        getPage: (id) => get().pages[id],
        getBlock: (id) => get().blocks[id],

        getAllPages: () => {
          return Object.values(get().pages).sort(
            (a, b) => b.updatedAt.localeCompare(a.updatedAt)
          )
        },
      }
    },
    {
      name: 'signof-workspace-storage',
      partialize: (state) => ({
        pages: state.pages,
        blocks: state.blocks,
      }),
    }
  )
)
