import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import WorkspaceAllPages from '../WorkspaceAllPages'
import WorkspaceLayout from '../WorkspaceLayout'
import { useWorkspaceStore } from '../../stores/useWorkspaceStore'

describe('Workspace Route Render', () => {
  beforeEach(() => {
    useWorkspaceStore.setState(useWorkspaceStore.getInitialState())
  })

  it('renders WorkspaceAllPages without crash', () => {
    render(
      <BrowserRouter>
        <WorkspaceAllPages />
      </BrowserRouter>
    )
    expect(screen.getByText('All Pages')).toBeInTheDocument()
  })

  it('renders WorkspaceLayout without crash', () => {
    render(
      <BrowserRouter>
        <WorkspaceLayout />
      </BrowserRouter>
    )
    expect(screen.getAllByText('Pages').length).toBeGreaterThanOrEqual(1)
  })

  it('renders sample pages in WorkspaceAllPages', () => {
    render(
      <BrowserRouter>
        <WorkspaceAllPages />
      </BrowserRouter>
    )
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Meeting Notes')).toBeInTheDocument()
  })
})
