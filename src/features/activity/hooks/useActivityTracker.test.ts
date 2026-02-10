import { renderHook, act } from '@testing-library/react'
import { useActivityTracker } from './useActivityTracker'
import { useActivityStore } from '../stores/useActivityStore'

describe('useActivityTracker', () => {
  beforeEach(() => {
    useActivityStore.setState({ activities: [] })
  })

  it('trackActivity adds an activity to the store', () => {
    const { result } = renderHook(() => useActivityTracker())

    act(() => {
      result.current.trackActivity({
        type: 'document',
        action: 'created',
        entityId: 'doc-1',
        entityTitle: 'My Document',
        entityPath: '/documents/doc-1',
      })
    })

    const activities = useActivityStore.getState().activities
    expect(activities).toHaveLength(1)
    const first = activities[0]
    expect(first).toBeDefined()
    if (!first) return
    expect(first.title).toBe('My Document')
    expect(first.type).toBe('document')
    expect(first.action).toBe('created')
    expect(first.userName).toBe('You')
  })

  it('trackDocumentSigned records a signed activity', () => {
    const { result } = renderHook(() => useActivityTracker())

    act(() => {
      result.current.trackDocumentSigned('doc-2', 'NDA Agreement', 'Jane Smith')
    })

    const activities = useActivityStore.getState().activities
    expect(activities).toHaveLength(1)
    const first = activities[0]
    expect(first).toBeDefined()
    if (!first) return
    expect(first.action).toBe('signed')
    expect(first.description).toContain('Jane Smith')
    expect(first.description).toContain('NDA Agreement')
  })

  it('trackPageCreated records a page creation', () => {
    const { result } = renderHook(() => useActivityTracker())

    act(() => {
      result.current.trackPageCreated('p-1', 'Sprint Notes')
    })

    const activities = useActivityStore.getState().activities
    expect(activities).toHaveLength(1)
    const first = activities[0]
    expect(first).toBeDefined()
    if (!first) return
    expect(first.type).toBe('page')
    expect(first.action).toBe('created')
    expect(first.title).toBe('Sprint Notes')
    expect(first.entityPath).toBe('/pages/p-1')
  })

  it('trackIssueStatusChanged records status change', () => {
    const { result } = renderHook(() => useActivityTracker())

    act(() => {
      result.current.trackIssueStatusChanged('i-100', 'Fix auth bug', 'In Progress')
    })

    const activities = useActivityStore.getState().activities
    expect(activities).toHaveLength(1)
    const first = activities[0]
    expect(first).toBeDefined()
    if (!first) return
    expect(first.type).toBe('issue')
    expect(first.action).toBe('updated')
    expect(first.description).toContain('In Progress')
  })

  it('trackDocumentCompleted uses System as userName', () => {
    const { result } = renderHook(() => useActivityTracker())

    act(() => {
      result.current.trackDocumentCompleted('doc-3', 'Service Agreement')
    })

    const activities = useActivityStore.getState().activities
    const first = activities[0]
    expect(first).toBeDefined()
    if (!first) return
    expect(first.userName).toBe('System')
    expect(first.action).toBe('completed')
  })

  it('generates unique timestamps for each activity', () => {
    const { result } = renderHook(() => useActivityTracker())

    act(() => {
      result.current.trackDocumentCreated('d1', 'Doc One')
      result.current.trackDocumentCreated('d2', 'Doc Two')
    })

    const activities = useActivityStore.getState().activities
    expect(activities).toHaveLength(2)
    expect(activities[0]?.id).not.toBe(activities[1]?.id)
  })
})
