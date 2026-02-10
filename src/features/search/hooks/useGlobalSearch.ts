import { useState, useCallback, useRef, useEffect } from 'react'
import { searchAll } from '../lib/searchEngine'
import type { SearchResult } from '../types'

const DEBOUNCE_MS = 150

interface UseGlobalSearchReturn {
  query: string
  results: SearchResult[]
  isSearching: boolean
  selectedIndex: number
  search: (query: string) => void
  clear: () => void
  selectNext: () => void
  selectPrev: () => void
  getSelected: () => SearchResult | null
}

export function useGlobalSearch(): UseGlobalSearchReturn {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery)
    setSelectedIndex(0)

    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current)
    }

    const trimmed = newQuery.trim()
    if (!trimmed) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    debounceRef.current = setTimeout(() => {
      const searchResults = searchAll(trimmed)
      setResults(searchResults)
      setIsSearching(false)
    }, DEBOUNCE_MS)
  }, [])

  const clear = useCallback(() => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current)
    }
    setQuery('')
    setResults([])
    setIsSearching(false)
    setSelectedIndex(0)
  }, [])

  const selectNext = useCallback(() => {
    setSelectedIndex((prev) => {
      if (results.length === 0) return 0
      return (prev + 1) % results.length
    })
  }, [results.length])

  const selectPrev = useCallback(() => {
    setSelectedIndex((prev) => {
      if (results.length === 0) return 0
      return (prev - 1 + results.length) % results.length
    })
  }, [results.length])

  const getSelected = useCallback((): SearchResult | null => {
    if (results.length === 0 || selectedIndex >= results.length) return null
    return results[selectedIndex] ?? null
  }, [results, selectedIndex])

  return {
    query,
    results,
    isSearching,
    selectedIndex,
    search,
    clear,
    selectNext,
    selectPrev,
    getSelected,
  }
}
