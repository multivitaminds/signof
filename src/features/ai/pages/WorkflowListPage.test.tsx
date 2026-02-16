import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import useWorkflowStore from '../stores/useWorkflowStore'
import WorkflowListPage from './WorkflowListPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <WorkflowListPage />
    </MemoryRouter>
  )
}

describe('WorkflowListPage', () => {
  beforeEach(() => {
    useWorkflowStore.setState({ workflows: [], activeWorkflowId: null })
    mockNavigate.mockClear()
  })

  it('renders the title and new workflow button', () => {
    renderPage()
    expect(screen.getByText('Workflows')).toBeInTheDocument()
    expect(screen.getByText('+ New Workflow')).toBeInTheDocument()
  })

  it('shows empty state when no workflows', () => {
    renderPage()
    expect(screen.getByText('No workflows yet')).toBeInTheDocument()
    expect(screen.getByText('Create Workflow')).toBeInTheDocument()
  })

  it('creates a workflow and navigates on New Workflow click', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByText('+ New Workflow'))
    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockNavigate.mock.calls[0]![0]).toMatch(/^\/copilot\/workflows\//)
  })

  it('renders workflow cards when workflows exist', () => {
    useWorkflowStore.setState({
      workflows: [
        {
          id: 'wf-1',
          name: 'Test Workflow',
          description: 'A test workflow',
          nodes: [{ id: 'n1', type: 'trigger', label: 'Start', x: 0, y: 0, data: {}, status: 'idle', output: null }],
          connections: [],
          status: 'active',
          runCount: 5,
          lastRunAt: '2026-02-10T10:00:00Z',
          viewport: { x: 0, y: 0, zoom: 1 },
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-02-10T10:00:00Z',
        },
      ],
    })
    renderPage()
    expect(screen.getByText('Test Workflow')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('1 nodes')).toBeInTheDocument()
    expect(screen.getByText('5 runs')).toBeInTheDocument()
    expect(screen.getByText('Duplicate')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('navigates to workflow editor on card click', async () => {
    const user = userEvent.setup()
    useWorkflowStore.setState({
      workflows: [
        {
          id: 'wf-1', name: 'My Flow', description: '', nodes: [], connections: [],
          status: 'draft', runCount: 0, lastRunAt: null,
          viewport: { x: 0, y: 0, zoom: 1 }, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
    })
    renderPage()
    await user.click(screen.getByText('My Flow'))
    expect(mockNavigate).toHaveBeenCalledWith('/copilot/workflows/wf-1')
  })

  it('duplicates a workflow when Duplicate is clicked', async () => {
    const user = userEvent.setup()
    const duplicateSpy = vi.fn().mockReturnValue('wf-dup')
    useWorkflowStore.setState({
      workflows: [
        {
          id: 'wf-1', name: 'Flow', description: '', nodes: [], connections: [],
          status: 'draft', runCount: 0, lastRunAt: null,
          viewport: { x: 0, y: 0, zoom: 1 }, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
      duplicateWorkflow: duplicateSpy,
    })
    renderPage()
    await user.click(screen.getByText('Duplicate'))
    expect(duplicateSpy).toHaveBeenCalledWith('wf-1')
  })

  it('deletes a workflow when Delete is clicked and confirmed', async () => {
    const user = userEvent.setup()
    const deleteSpy = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    useWorkflowStore.setState({
      workflows: [
        {
          id: 'wf-1', name: 'Flow', description: '', nodes: [], connections: [],
          status: 'draft', runCount: 0, lastRunAt: null,
          viewport: { x: 0, y: 0, zoom: 1 }, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
      deleteWorkflow: deleteSpy,
    })
    renderPage()
    await user.click(screen.getByText('Delete'))
    expect(deleteSpy).toHaveBeenCalledWith('wf-1')
    vi.restoreAllMocks()
  })
})
