import { api } from '../lib/api'
import { useWorkspaceStore } from '../features/workspace/stores/useWorkspaceStore'
import type { Page, Block, BlockType } from '../features/workspace/types'

function isApiEnabled(): boolean {
  return Boolean(import.meta.env.VITE_API_URL)
}

export const workspaceService = {
  // ─── Page CRUD ─────────────────────────────────────────────────────

  async listPages(): Promise<Page[]> {
    if (!isApiEnabled()) {
      return useWorkspaceStore.getState().getAllPages()
    }
    const res = await api.get<Page[]>('/pages')
    return res.data
  },

  async getRootPages(): Promise<Page[]> {
    if (!isApiEnabled()) {
      return useWorkspaceStore.getState().getRootPages()
    }
    const res = await api.get<Page[]>('/pages?root=true')
    return res.data
  },

  async getPage(id: string): Promise<Page | undefined> {
    if (!isApiEnabled()) {
      return useWorkspaceStore.getState().getPage(id)
    }
    const res = await api.get<Page>(`/pages/${id}`)
    return res.data
  },

  async addPage(title: string, parentId?: string | null): Promise<string> {
    if (!isApiEnabled()) {
      return useWorkspaceStore.getState().addPage(title, parentId)
    }
    const res = await api.post<{ id: string }>('/pages', { title, parentId: parentId ?? null })
    return res.data.id
  },

  async addPageWithBlocks(
    title: string,
    icon: string,
    blocksData: Array<{ type: BlockType; content: string }>,
    parentId?: string | null,
  ): Promise<string> {
    if (!isApiEnabled()) {
      return useWorkspaceStore.getState().addPageWithBlocks(title, icon, blocksData, parentId)
    }
    const res = await api.post<{ id: string }>('/pages', {
      title,
      icon,
      blocks: blocksData,
      parentId: parentId ?? null,
    })
    return res.data.id
  },

  async updatePage(
    id: string,
    updates: Partial<Pick<Page, 'title' | 'icon' | 'coverUrl' | 'isFavorite' | 'lastViewedAt'>>,
  ): Promise<void> {
    if (!isApiEnabled()) {
      useWorkspaceStore.getState().updatePage(id, updates)
      return
    }
    await api.put(`/pages/${id}`, updates)
  },

  async deletePage(id: string): Promise<void> {
    if (!isApiEnabled()) {
      useWorkspaceStore.getState().deletePage(id)
      return
    }
    await api.del(`/pages/${id}`)
  },

  async movePage(id: string, newParentId: string | null): Promise<void> {
    if (!isApiEnabled()) {
      useWorkspaceStore.getState().movePage(id, newParentId)
      return
    }
    await api.put(`/pages/${id}/move`, { parentId: newParentId })
  },

  async duplicatePage(id: string): Promise<string | null> {
    if (!isApiEnabled()) {
      return useWorkspaceStore.getState().duplicatePage(id)
    }
    const res = await api.post<{ id: string }>(`/pages/${id}/duplicate`)
    return res.data.id
  },

  async restorePage(id: string): Promise<void> {
    if (!isApiEnabled()) {
      useWorkspaceStore.getState().restorePage(id)
      return
    }
    await api.post(`/pages/${id}/restore`)
  },

  async permanentlyDeletePage(id: string): Promise<void> {
    if (!isApiEnabled()) {
      useWorkspaceStore.getState().permanentlyDeletePage(id)
      return
    }
    await api.del(`/pages/${id}/permanent`)
  },

  // ─── Block CRUD ────────────────────────────────────────────────────

  async getBlock(id: string): Promise<Block | undefined> {
    if (!isApiEnabled()) {
      return useWorkspaceStore.getState().getBlock(id)
    }
    const res = await api.get<Block>(`/blocks/${id}`)
    return res.data
  },

  async addBlock(pageId: string, type: BlockType, afterBlockId?: string): Promise<string> {
    if (!isApiEnabled()) {
      return useWorkspaceStore.getState().addBlock(pageId, type, afterBlockId)
    }
    const res = await api.post<{ id: string }>(`/pages/${pageId}/blocks`, { type, afterBlockId })
    return res.data.id
  },

  async updateBlockContent(blockId: string, content: string): Promise<void> {
    if (!isApiEnabled()) {
      useWorkspaceStore.getState().updateBlockContent(blockId, content)
      return
    }
    await api.put(`/blocks/${blockId}`, { content })
  },

  async deleteBlock(pageId: string, blockId: string): Promise<void> {
    if (!isApiEnabled()) {
      useWorkspaceStore.getState().deleteBlock(pageId, blockId)
      return
    }
    await api.del(`/pages/${pageId}/blocks/${blockId}`)
  },

  async convertBlockType(blockId: string, newType: BlockType): Promise<void> {
    if (!isApiEnabled()) {
      useWorkspaceStore.getState().convertBlockType(blockId, newType)
      return
    }
    await api.put(`/blocks/${blockId}/type`, { type: newType })
  },

  async reorderBlock(pageId: string, blockId: string, newIndex: number): Promise<void> {
    if (!isApiEnabled()) {
      useWorkspaceStore.getState().reorderBlock(pageId, blockId, newIndex)
      return
    }
    await api.put(`/pages/${pageId}/blocks/${blockId}/reorder`, { index: newIndex })
  },

  // ─── Favorites & Recent ───────────────────────────────────────────

  async toggleFavorite(pageId: string): Promise<void> {
    if (!isApiEnabled()) {
      useWorkspaceStore.getState().toggleFavorite(pageId)
      return
    }
    await api.post(`/pages/${pageId}/favorite`)
  },

  async getFavoritePages(): Promise<Page[]> {
    if (!isApiEnabled()) {
      return useWorkspaceStore.getState().getFavoritePages()
    }
    const res = await api.get<Page[]>('/pages?favorites=true')
    return res.data
  },

  async getRecentPages(): Promise<Page[]> {
    if (!isApiEnabled()) {
      return useWorkspaceStore.getState().getRecentPages()
    }
    const res = await api.get<Page[]>('/pages?recent=true')
    return res.data
  },
}
