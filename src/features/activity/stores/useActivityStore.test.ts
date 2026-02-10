import { useActivityStore } from './useActivityStore'
import type { ActivityType, ActivityAction } from '../types'

describe('useActivityStore', () => {
  beforeEach(() => {
    useActivityStore.setState({ activities: [] })
  })

  it('starts with empty activities after reset', () => {
    expect(useActivityStore.getState().activities).toHaveLength(0)
  })

  it('adds an activity at the beginning of the list', () => {
    useActivityStore.getState().addActivity({
      type: 'document' as ActivityType,
      action: 'created' as ActivityAction,
      title: 'New Document',
      description: 'Created a new document',
      entityId: 'doc-1',
      entityPath: '/documents/doc-1',
      timestamp: new Date().toISOString(),
      userId: 'u-1',
      userName: 'Alice',
      icon: '\u{1F4C4}',
    })

    const activities = useActivityStore.getState().activities
    expect(activities).toHaveLength(1)
    const first = activities[0]
    expect(first).toBeDefined()
    if (!first) return
    expect(first.title).toBe('New Document')
    expect(first.id).toBeTruthy()
  })

  it('prepends new activities (most recent first)', () => {
    useActivityStore.getState().addActivity({
      type: 'document' as ActivityType,
      action: 'created' as ActivityAction,
      title: 'First',
      description: 'First activity',
      entityId: '1',
      entityPath: '/1',
      timestamp: new Date().toISOString(),
      userId: 'u-1',
      userName: 'Alice',
      icon: '\u{1F4C4}',
    })

    useActivityStore.getState().addActivity({
      type: 'page' as ActivityType,
      action: 'updated' as ActivityAction,
      title: 'Second',
      description: 'Second activity',
      entityId: '2',
      entityPath: '/2',
      timestamp: new Date().toISOString(),
      userId: 'u-2',
      userName: 'Bob',
      icon: '\u{1F4DD}',
    })

    const activities = useActivityStore.getState().activities
    expect(activities[0]?.title).toBe('Second')
    expect(activities[1]?.title).toBe('First')
  })

  it('getRecentActivities returns limited and sorted results', () => {
    for (let i = 0; i < 5; i++) {
      useActivityStore.getState().addActivity({
        type: 'document' as ActivityType,
        action: 'created' as ActivityAction,
        title: `Activity ${i}`,
        description: `Description ${i}`,
        entityId: `id-${i}`,
        entityPath: `/path/${i}`,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        userId: 'u-1',
        userName: 'Alice',
        icon: '\u{1F4C4}',
      })
    }

    const recent = useActivityStore.getState().getRecentActivities(3)
    expect(recent).toHaveLength(3)
    expect(recent[0]?.title).toBe('Activity 0')
  })

  it('getActivitiesByType filters correctly', () => {
    useActivityStore.getState().addActivity({
      type: 'document' as ActivityType,
      action: 'created' as ActivityAction,
      title: 'Doc Activity',
      description: 'A document',
      entityId: '1',
      entityPath: '/1',
      timestamp: new Date().toISOString(),
      userId: 'u-1',
      userName: 'Alice',
      icon: '\u{1F4C4}',
    })

    useActivityStore.getState().addActivity({
      type: 'page' as ActivityType,
      action: 'updated' as ActivityAction,
      title: 'Page Activity',
      description: 'A page',
      entityId: '2',
      entityPath: '/2',
      timestamp: new Date().toISOString(),
      userId: 'u-2',
      userName: 'Bob',
      icon: '\u{1F4DD}',
    })

    useActivityStore.getState().addActivity({
      type: 'document' as ActivityType,
      action: 'signed' as ActivityAction,
      title: 'Another Doc',
      description: 'Another document',
      entityId: '3',
      entityPath: '/3',
      timestamp: new Date().toISOString(),
      userId: 'u-1',
      userName: 'Alice',
      icon: '\u270D\uFE0F',
    })

    const docs = useActivityStore.getState().getActivitiesByType('document' as ActivityType)
    expect(docs).toHaveLength(2)
    expect(docs.every((a) => a.type === 'document')).toBe(true)
  })

  it('clearActivities removes all activities', () => {
    useActivityStore.getState().addActivity({
      type: 'document' as ActivityType,
      action: 'created' as ActivityAction,
      title: 'Activity',
      description: 'Desc',
      entityId: '1',
      entityPath: '/1',
      timestamp: new Date().toISOString(),
      userId: 'u-1',
      userName: 'Alice',
      icon: '\u{1F4C4}',
    })

    expect(useActivityStore.getState().activities).toHaveLength(1)

    useActivityStore.getState().clearActivities()

    expect(useActivityStore.getState().activities).toHaveLength(0)
  })

  it('generates unique IDs for each activity', () => {
    const baseActivity = {
      type: 'document' as ActivityType,
      action: 'created' as ActivityAction,
      title: 'Test',
      description: 'Test',
      entityId: '1',
      entityPath: '/1',
      timestamp: new Date().toISOString(),
      userId: 'u-1',
      userName: 'Alice',
      icon: '\u{1F4C4}',
    }

    useActivityStore.getState().addActivity(baseActivity)
    useActivityStore.getState().addActivity(baseActivity)

    const activities = useActivityStore.getState().activities
    expect(activities[0]?.id).not.toBe(activities[1]?.id)
  })
})
