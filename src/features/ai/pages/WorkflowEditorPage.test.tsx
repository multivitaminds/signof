import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import useWorkflowStore from '../stores/useWorkflowStore'
import WorkflowEditorPage from './WorkflowEditorPage'

function renderEditor(workflowId: string) {
  return render(
    <MemoryRouter initialEntries={[`/copilot/workflows/${workflowId}`]}>
      <Routes>
        <Route path="/copilot/workflows/:workflowId" element={<WorkflowEditorPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('WorkflowEditorPage', () => {
  let wfId: string

  beforeEach(() => {
    useWorkflowStore.setState({ workflows: [], activeWorkflowId: null })
    wfId = useWorkflowStore.getState().createWorkflow('Test Flow', 'A test')
  })

  it('renders the workflow name in toolbar', () => {
    renderEditor(wfId)
    expect(screen.getByText('Test Flow')).toBeInTheDocument()
  })

  it('renders the canvas area', () => {
    renderEditor(wfId)
    expect(screen.getByText(/Drag nodes from the palette/i)).toBeInTheDocument()
  })

  it('renders the status bar with node count', () => {
    renderEditor(wfId)
    expect(screen.getByText('0 nodes')).toBeInTheDocument()
  })

  it('shows not-found state for invalid workflow id', () => {
    renderEditor('nonexistent')
    expect(screen.getByText('Workflow not found.')).toBeInTheDocument()
  })

  it('renders palette with node types header', () => {
    renderEditor(wfId)
    expect(screen.getByText('Node Palette')).toBeInTheDocument()
  })

  it('renders status bar with workflow status', () => {
    renderEditor(wfId)
    const drafts = screen.getAllByText('draft')
    expect(drafts.length).toBeGreaterThanOrEqual(1)
  })
})
