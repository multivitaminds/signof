import { useDashboardStore, WidgetType } from './useDashboardStore'

describe('useDashboardStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useDashboardStore.setState(useDashboardStore.getInitialState())
  })

  it('initializes with all 8 widgets visible and ordered', () => {
    const { widgets } = useDashboardStore.getState()
    expect(widgets).toHaveLength(8)
    expect(widgets.every((w) => w.visible)).toBe(true)
    expect(widgets.map((w) => w.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })

  it('toggleWidget hides a visible widget', () => {
    const { toggleWidget, widgets } = useDashboardStore.getState()
    const targetId = widgets[0]!.id

    toggleWidget(targetId)

    const updated = useDashboardStore.getState().widgets
    const toggled = updated.find((w) => w.id === targetId)
    expect(toggled?.visible).toBe(false)
  })

  it('toggleWidget shows a hidden widget', () => {
    const { toggleWidget, widgets } = useDashboardStore.getState()
    const targetId = widgets[0]!.id

    // Hide then show
    toggleWidget(targetId)
    toggleWidget(targetId)

    const updated = useDashboardStore.getState().widgets
    const toggled = updated.find((w) => w.id === targetId)
    expect(toggled?.visible).toBe(true)
  })

  it('reorderWidgets moves widget from one position to another', () => {
    const { reorderWidgets } = useDashboardStore.getState()

    // Move first widget to third position
    reorderWidgets(0, 2)

    const updated = useDashboardStore.getState().widgets
    expect(updated[0]!.type).toBe(WidgetType.RecentDocuments)
    expect(updated[1]!.type).toBe(WidgetType.ActiveProjects)
    expect(updated[2]!.type).toBe(WidgetType.QuickStats)
    // Orders should be renumbered
    expect(updated.map((w) => w.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })

  it('resetLayout restores defaults', () => {
    const { toggleWidget, reorderWidgets, resetLayout, widgets } = useDashboardStore.getState()

    // Make changes
    toggleWidget(widgets[0]!.id)
    reorderWidgets(1, 3)

    // Reset
    resetLayout()

    const restored = useDashboardStore.getState().widgets
    expect(restored).toHaveLength(8)
    expect(restored.every((w) => w.visible)).toBe(true)
    expect(restored[0]!.type).toBe(WidgetType.QuickStats)
    expect(restored.map((w) => w.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
  })
})
