import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import DashboardGrid from './DashboardGrid'
import { useDashboardStore } from '../../stores/useDashboardStore'

// Mock all widget components
vi.mock('../widgets/QuickStatsWidget', () => ({
  default: () => <div data-testid="mock-quick-stats">QuickStats</div>,
}))
vi.mock('../widgets/RecentDocumentsWidget', () => ({
  default: () => <div data-testid="mock-recent-docs">RecentDocuments</div>,
}))
vi.mock('../widgets/ActiveProjectsWidget', () => ({
  default: () => <div data-testid="mock-active-projects">ActiveProjects</div>,
}))
vi.mock('../widgets/UpcomingEventsWidget', () => ({
  default: () => <div data-testid="mock-upcoming-events">UpcomingEvents</div>,
}))
vi.mock('../widgets/RecentActivityWidget', () => ({
  default: () => <div data-testid="mock-recent-activity">RecentActivity</div>,
}))
vi.mock('../widgets/AgentStatusWidget', () => ({
  default: () => <div data-testid="mock-agent-status">AgentStatus</div>,
}))
vi.mock('../widgets/TasksTodayWidget', () => ({
  default: () => <div data-testid="mock-tasks-today">TasksToday</div>,
}))
vi.mock('../widgets/InboxPreviewWidget', () => ({
  default: () => <div data-testid="mock-inbox-preview">InboxPreview</div>,
}))

function renderGrid() {
  return render(
    <MemoryRouter>
      <DashboardGrid />
    </MemoryRouter>
  )
}

describe('DashboardGrid', () => {
  beforeEach(() => {
    localStorage.clear()
    useDashboardStore.setState(useDashboardStore.getInitialState())
  })

  it('renders all visible widgets by default', () => {
    renderGrid()
    expect(screen.getByTestId('mock-quick-stats')).toBeInTheDocument()
    expect(screen.getByTestId('mock-recent-docs')).toBeInTheDocument()
    expect(screen.getByTestId('mock-active-projects')).toBeInTheDocument()
    expect(screen.getByTestId('mock-upcoming-events')).toBeInTheDocument()
    expect(screen.getByTestId('mock-recent-activity')).toBeInTheDocument()
    expect(screen.getByTestId('mock-agent-status')).toBeInTheDocument()
    expect(screen.getByTestId('mock-tasks-today')).toBeInTheDocument()
    expect(screen.getByTestId('mock-inbox-preview')).toBeInTheDocument()
  })

  it('hides widgets that are toggled off', () => {
    // Toggle off the quick stats widget before rendering
    const widgets = useDashboardStore.getState().widgets
    useDashboardStore.getState().toggleWidget(widgets[0]!.id)

    renderGrid()
    expect(screen.queryByTestId('mock-quick-stats')).not.toBeInTheDocument()
    // Other widgets should still be visible
    expect(screen.getByTestId('mock-recent-docs')).toBeInTheDocument()
  })

  it('shows empty state when all widgets are hidden', () => {
    const { widgets, toggleWidget } = useDashboardStore.getState()
    for (const w of widgets) {
      toggleWidget(w.id)
    }

    renderGrid()
    expect(screen.getByText(/No widgets visible/)).toBeInTheDocument()
  })

  it('shows customize panel when button is clicked', async () => {
    const user = userEvent.setup()
    renderGrid()

    const btn = screen.getByRole('button', { name: /customize dashboard/i })
    await user.click(btn)

    expect(screen.getByText('Customize Widgets')).toBeInTheDocument()
  })

  it('renders dashboard title', () => {
    renderGrid()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
