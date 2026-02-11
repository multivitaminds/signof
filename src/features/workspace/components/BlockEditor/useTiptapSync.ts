import { useEffect, useRef, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'
import { tiptapDocToBlocks } from '../../lib/tiptapConversion'
import type { Block } from '../../types'

const SYNC_DEBOUNCE_MS = 300

export function useTiptapSync(
  editor: Editor | null,
  pageId: string
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSyncingFromStore = useRef(false)

  const syncToStore = useCallback(() => {
    if (!editor || isSyncingFromStore.current) return

    const doc = editor.getJSON()
    const blocks = tiptapDocToBlocks(doc)

    const state = useWorkspaceStore.getState()
    const page = state.pages[pageId]
    if (!page) return

    // Build updated blocks map and blockIds
    const newBlocks: Record<string, Block> = { ...state.blocks }
    const newBlockIds: string[] = []

    // Remove old page blocks
    for (const oldId of page.blockIds) {
      delete newBlocks[oldId]
    }

    // Add converted blocks
    for (const block of blocks) {
      newBlocks[block.id] = block
      newBlockIds.push(block.id)
    }

    // Update store
    useWorkspaceStore.setState({
      pages: {
        ...state.pages,
        [pageId]: {
          ...page,
          blockIds: newBlockIds,
          updatedAt: new Date().toISOString(),
        },
      },
      blocks: newBlocks,
    })

    // Track edit counts for auto-snapshot
    const editCount = (state.editCounts[pageId] ?? 0) + 1
    useWorkspaceStore.setState({
      editCounts: { ...state.editCounts, [pageId]: editCount },
    })

    if (editCount > 0 && editCount % 20 === 0) {
      state.autoSnapshot(pageId)
    }
  }, [editor, pageId])

  // Debounced sync on editor update
  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      if (isSyncingFromStore.current) return

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(syncToStore, SYNC_DEBOUNCE_MS)
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [editor, syncToStore])

  // Flush pending sync on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        syncToStore()
      }
    }
  }, [syncToStore])

  return { isSyncingFromStore }
}
