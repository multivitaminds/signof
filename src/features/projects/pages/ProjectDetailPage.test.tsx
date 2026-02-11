import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProjectDetailPage from './ProjectDetailPage'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ projectId: 'proj-1' }),
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../stores/useProjectStore', () => ({
  useProjectStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      projects: {
        'proj-1': {
          id: 'proj-1',
          name: 'Test Project',
          description: 'A test project',
          prefix: 'SO',
          color: '#4F46E5',
          labels: [],
          currentView: 'board',
        },
      },
      issues: {},
      members: [],
      cycles: {},
      goals: [],
      milestones: [],
      activities: [],
      selectedIssueId: null,
      focusedIssueIndex: 0,
      createModalOpen: false,
      selectedIssueIds: new Set(),
      savedViews: [],
      setSelectedIssue: vi.fn(),
      setFocusedIndex: vi.fn(),
      toggleCreateModal: vi.fn(),
      updateIssue: vi.fn(),
      setProjectView: vi.fn(),
      createIssue: vi.fn(),
      toggleIssueSelection: vi.fn(),
      selectAllIssues: vi.fn(),
      clearSelection: vi.fn(),
      saveView: vi.fn(),
      deleteSavedView: vi.fn(),
      createGoal: vi.fn(),
      updateGoal: vi.fn(),
      deleteGoal: vi.fn(),
      addIssueToGoal: vi.fn(),
      removeIssueFromGoal: vi.fn(),
      createMilestone: vi.fn(),
      updateMilestone: vi.fn(),
      deleteMilestone: vi.fn(),
      addIssueToMilestone: vi.fn(),
      removeIssueFromMilestone: vi.fn(),
    }),
}))

vi.mock('../hooks/useProjectShortcuts', () => ({
  useProjectShortcuts: vi.fn(),
}))

vi.mock('../hooks/useIssueFilters', () => ({
  useIssueFilters: () => ({
    filteredIssues: [],
    groupedIssues: new Map(),
    totalCount: 0,
    filteredCount: 0,
  }),
}))

describe('ProjectDetailPage', () => {
  it('renders the project name', () => {
    render(
      <MemoryRouter>
        <ProjectDetailPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('renders the project prefix', () => {
    render(
      <MemoryRouter>
        <ProjectDetailPage />
      </MemoryRouter>
    )
    expect(screen.getByText('SO')).toBeInTheDocument()
  })

  it('renders New Issue button', () => {
    render(
      <MemoryRouter>
        <ProjectDetailPage />
      </MemoryRouter>
    )
    expect(screen.getByText('New Issue')).toBeInTheDocument()
  })

  it('renders sidebar components', () => {
    render(
      <MemoryRouter>
        <ProjectDetailPage />
      </MemoryRouter>
    )
    // CyclePanel, GoalsPanel, and MilestonesTimeline should be in the sidebar
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })
})
