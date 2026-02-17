import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelection } from './useSelection'

describe('useSelection', () => {
  it('starts with empty selection', () => {
    const { result } = renderHook(() => useSelection())
    expect(result.current.selectedCount).toBe(0)
    expect(result.current.selectedIds.size).toBe(0)
  })

  it('toggles an item in and out of selection', () => {
    const { result } = renderHook(() => useSelection())

    act(() => result.current.toggle('a'))
    expect(result.current.isSelected('a')).toBe(true)
    expect(result.current.selectedCount).toBe(1)

    act(() => result.current.toggle('a'))
    expect(result.current.isSelected('a')).toBe(false)
    expect(result.current.selectedCount).toBe(0)
  })

  it('selectAll replaces current selection with provided ids', () => {
    const { result } = renderHook(() => useSelection())

    act(() => result.current.toggle('x'))
    act(() => result.current.selectAll(['a', 'b', 'c']))

    expect(result.current.selectedCount).toBe(3)
    expect(result.current.isSelected('x')).toBe(false)
    expect(result.current.isSelected('a')).toBe(true)
    expect(result.current.isSelected('b')).toBe(true)
    expect(result.current.isSelected('c')).toBe(true)
  })

  it('deselectAll clears the selection', () => {
    const { result } = renderHook(() => useSelection())

    act(() => result.current.selectAll(['a', 'b']))
    act(() => result.current.deselectAll())

    expect(result.current.selectedCount).toBe(0)
  })

  it('isSelected returns correct boolean for given id', () => {
    const { result } = renderHook(() => useSelection())

    act(() => result.current.toggle('a'))

    expect(result.current.isSelected('a')).toBe(true)
    expect(result.current.isSelected('b')).toBe(false)
  })

  it('selectRange selects items between fromId and toId inclusive', () => {
    const { result } = renderHook(() => useSelection())
    const ids = ['a', 'b', 'c', 'd', 'e']

    act(() => result.current.selectRange(ids, 'b', 'd'))

    expect(result.current.isSelected('a')).toBe(false)
    expect(result.current.isSelected('b')).toBe(true)
    expect(result.current.isSelected('c')).toBe(true)
    expect(result.current.isSelected('d')).toBe(true)
    expect(result.current.isSelected('e')).toBe(false)
  })

  it('selectRange works when fromId comes after toId in the list', () => {
    const { result } = renderHook(() => useSelection())
    const ids = ['a', 'b', 'c', 'd', 'e']

    act(() => result.current.selectRange(ids, 'd', 'b'))

    expect(result.current.isSelected('b')).toBe(true)
    expect(result.current.isSelected('c')).toBe(true)
    expect(result.current.isSelected('d')).toBe(true)
  })

  it('selectRange merges with existing selection', () => {
    const { result } = renderHook(() => useSelection())
    const ids = ['a', 'b', 'c', 'd']

    act(() => result.current.toggle('a'))
    act(() => result.current.selectRange(ids, 'c', 'd'))

    expect(result.current.isSelected('a')).toBe(true)
    expect(result.current.isSelected('c')).toBe(true)
    expect(result.current.isSelected('d')).toBe(true)
    expect(result.current.selectedCount).toBe(3)
  })

  it('selectRange does nothing if fromId or toId not found', () => {
    const { result } = renderHook(() => useSelection())
    const ids = ['a', 'b', 'c']

    act(() => result.current.selectRange(ids, 'x', 'b'))

    expect(result.current.selectedCount).toBe(0)
  })
})
