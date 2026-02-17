import { useState, useCallback, useMemo } from 'react'

export function useSelection<T extends string = string>() {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set())

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds])

  const isSelected = useCallback(
    (id: T) => selectedIds.has(id),
    [selectedIds],
  )

  const toggle = useCallback((id: T) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback((ids: T[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const selectRange = useCallback((ids: T[], fromId: T, toId: T) => {
    const fromIndex = ids.indexOf(fromId)
    const toIndex = ids.indexOf(toId)
    if (fromIndex === -1 || toIndex === -1) return

    const start = Math.min(fromIndex, toIndex)
    const end = Math.max(fromIndex, toIndex)
    const rangeIds = ids.slice(start, end + 1)

    setSelectedIds(prev => {
      const next = new Set(prev)
      for (const id of rangeIds) {
        next.add(id)
      }
      return next
    })
  }, [])

  return {
    selectedIds,
    selectedCount,
    isSelected,
    toggle,
    selectAll,
    deselectAll,
    selectRange,
  }
}
