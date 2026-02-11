import { useMemo } from 'react'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'

interface WordCountResult {
  wordCount: number
  charCount: number
  readingTime: number // in minutes
  readingTimeLabel: string
}

const WORDS_PER_MINUTE = 200

export default function useWordCount(blockIds: string[]): WordCountResult {
  const blocks = useWorkspaceStore((s) => s.blocks)

  return useMemo(() => {
    let totalText = ''

    for (const blockId of blockIds) {
      const block = blocks[blockId]
      if (!block) continue

      const content = block.content.trim()
      if (content) {
        totalText += content + ' '
      }

      // Also count children content
      for (const childId of block.children) {
        const child = blocks[childId]
        if (child && child.content.trim()) {
          totalText += child.content.trim() + ' '
        }
      }
    }

    totalText = totalText.trim()
    const charCount = totalText.length
    const words = totalText ? totalText.split(/\s+/).filter((w) => w.length > 0) : []
    const wordCount = words.length
    const readingTime = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))

    let readingTimeLabel: string
    if (wordCount === 0) {
      readingTimeLabel = '0 words'
    } else {
      readingTimeLabel = `${wordCount.toLocaleString()} word${wordCount === 1 ? '' : 's'} · ${readingTime} min read`
    }

    return {
      wordCount,
      charCount,
      readingTime,
      readingTimeLabel,
    }
  }, [blockIds, blocks])
}
