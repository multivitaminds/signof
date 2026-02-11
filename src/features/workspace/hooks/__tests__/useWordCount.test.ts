import { renderHook } from '@testing-library/react'
import useWordCount from '../useWordCount'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'

describe('useWordCount', () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      blocks: {
        'b1': {
          id: 'b1',
          type: 'paragraph',
          content: 'Hello world',
          marks: [],
          properties: {},
          children: [],
        },
        'b2': {
          id: 'b2',
          type: 'paragraph',
          content: 'This is a test of the word count feature',
          marks: [],
          properties: {},
          children: [],
        },
        'b3': {
          id: 'b3',
          type: 'heading1',
          content: 'Title',
          marks: [],
          properties: {},
          children: [],
        },
      },
    })
  })

  it('calculates word count from blocks', () => {
    const { result } = renderHook(() => useWordCount(['b1', 'b2']))
    // "Hello world" = 2 words, "This is a test of the word count feature" = 9 words = 11 total
    expect(result.current.wordCount).toBe(11)
  })

  it('calculates reading time at 200 wpm', () => {
    const { result } = renderHook(() => useWordCount(['b1', 'b2']))
    // 11 words / 200 wpm = ceil(0.055) = 1 min
    expect(result.current.readingTime).toBe(1)
  })

  it('generates proper reading time label', () => {
    const { result } = renderHook(() => useWordCount(['b1', 'b2']))
    expect(result.current.readingTimeLabel).toContain('11 words')
    expect(result.current.readingTimeLabel).toContain('1 min read')
  })

  it('returns 0 for empty block list', () => {
    const { result } = renderHook(() => useWordCount([]))
    expect(result.current.wordCount).toBe(0)
    expect(result.current.readingTimeLabel).toBe('0 words')
  })

  it('counts characters correctly', () => {
    const { result } = renderHook(() => useWordCount(['b3']))
    expect(result.current.charCount).toBe(5) // "Title"
    expect(result.current.wordCount).toBe(1)
  })

  it('handles missing blocks gracefully', () => {
    const { result } = renderHook(() => useWordCount(['nonexistent-block']))
    expect(result.current.wordCount).toBe(0)
  })
})
