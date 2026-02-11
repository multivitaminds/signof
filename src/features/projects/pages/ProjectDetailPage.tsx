import { useCallback, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { Issue, IssueStatus, ViewType as VT, IssueFilters, SavedView } from '../types'
import { ViewType } from '../types'
import { useProjectStore } from '../stores/useProjectStore'
import { useProjectShortcuts } from '../hooks/useProjectShortcuts'
import { useIssueFilters } from '../hooks/useIssueFilters'
import BoardView from '../components/BoardView/BoardView'
import ListView from '../components/ListView/ListView'
import ViewToggle from '../components/ViewToggle/ViewToggle'
import FilterBar from '../components/FilterBar/FilterBar'
import BulkActionBar from '../components/BulkActionBar/BulkActionBar'
import BurndownChart from '../components/BurndownChart/BurndownChart'
import CreateIssueModal from '../components/CreateIssueModal/CreateIssueModal'
import IssueDetailPanel from '../components/IssueDetailPanel/IssueDetailPanel'
import CyclePanel from '../components/CyclePanel/CyclePanel'
import GoalsPanel from '../components/GoalsPanel/GoalsPanel'
import MilestonesTimeline from '../components/MilestonesTimeline/MilestonesTimeline'
import './ProjectDetailPage.css'

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const project = useProjectStore((s) =>
    projectId ? s.projects[projectId] : undefined
  )
  const allIssues = useProjectStore((s) => s.issues)
  const members = useProjectStore((s) => s.members)
  const cycles = useProjectStore((s) => s.cycles)
  const selectedIssueId = useProjectStore((s) => s.selectedIssueId)
  const focusedIssueIndex = useProjectStore((s) => s.focusedIssueIndex)
  const createModalOpen = useProjectStore((s) => s.createModalOpen)
  const selectedIssueIds = useProjectStore((s) => s.selectedIssueIds)

  const setSelectedIssue = useProjectStore((s) => s.setSelectedIssue)
  const setFocusedIndex = useProjectStore((s) => s.setFocusedIndex)
  const toggleCreateModal = useProjectStore((s) => s.toggleCreateModal)
  const updateIssue = useProjectStore((s) => s.updateIssue)
  const setProjectView = useProjectStore((s) => s.setProjectView)
  const createIssue = useProjectStore((s) => s.createIssue)

  // Bulk actions
  const toggleIssueSelection = useProjectStore((s) => s.toggleIssueSelection)
  const selectAllIssues = useProjectStore((s) => s.selectAllIssues)
  const clearSelection = useProjectStore((s) => s.clearSelection)

  // Saved views
  const savedViews = useProjectStore((s) => s.savedViews)
  const saveView = useProjectStore((s) => s.saveView)
  const deleteSavedView = useProjectStore((s) => s.deleteSavedView)

  // Filters state
  const [filters, setFilters] = useState<IssueFilters>({})
  const [activeViewId, setActiveViewId] = useState<string | null>(null)

  // Filter issues for this project
  const projectIssuesAll = useMemo(() => {
    if (!projectId) return []
    return Object.values(allIssues).filter((i) => i.projectId === projectId)
  }, [allIssues, projectId])

  // Apply filters
  const { filteredIssues: projectIssues } = useIssueFilters(
    projectIssuesAll,
    filters,
    { field: 'created', direction: 'desc' },
    'none'
  )

  const projectSavedViews = useMemo(
    () => savedViews.filter((v) => v.projectId === projectId),
    [savedViews, projectId]
  )

  // Active cycle for burndown
  const activeCycle = useMemo(() => {
    if (!projectId) return undefined
    return Object.values(cycles).find(
      (c) => c.projectId === projectId && c.status === 'active'
    )
  }, [cycles, projectId])

  const cycleIssues = useMemo(() => {
    if (!activeCycle) return []
    return Object.values(allIssues).filter((i) => i.cycleId === activeCycle.id)
  }, [allIssues, activeCycle])

  const handleViewChange = useCallback(
    (view: VT) => {
      if (projectId) setProjectView(projectId, view)
    },
    [projectId, setProjectView]
  )

  const handleIssueClick = useCallback(
    (issueId: string) => {
      setSelectedIssue(issueId)
    },
    [setSelectedIssue]
  )

  const handleStatusChange = useCallback(
    (issueId: string, status: IssueStatus) => {
      updateIssue(issueId, { status })
    },
    [updateIssue]
  )

  const handleIssueUpdate = useCallback(
    (issueId: string, updates: Partial<Issue>) => {
      updateIssue(issueId, updates)
    },
    [updateIssue]
  )

  const handleQuickCreate = useCallback(
    (data: { projectId: string; title: string; status?: IssueStatus }) => {
      createIssue(data)
    },
    [createIssue]
  )

  const handleClosePanel = useCallback(() => {
    setSelectedIssue(null)
  }, [setSelectedIssue])

  const handleMoveDown = useCallback(() => {
    setFocusedIndex(
      Math.min(focusedIssueIndex + 1, projectIssues.length - 1)
    )
  }, [focusedIssueIndex, projectIssues.length, setFocusedIndex])

  const handleMoveUp = useCallback(() => {
    setFocusedIndex(Math.max(focusedIssueIndex - 1, 0))
  }, [focusedIssueIndex, setFocusedIndex])

  const handlePreviewIssue = useCallback(() => {
    const issue = projectIssues[focusedIssueIndex]
    if (issue) {
      setSelectedIssue(
        selectedIssueId === issue.id ? null : issue.id
      )
    }
  }, [focusedIssueIndex, projectIssues, selectedIssueId, setSelectedIssue])

  const handleOpenIssue = useCallback(() => {
    const issue = projectIssues[focusedIssueIndex]
    if (issue) {
      setSelectedIssue(issue.id)
    }
  }, [focusedIssueIndex, projectIssues, setSelectedIssue])

  // Filter handlers
  const handleFiltersChange = useCallback((newFilters: IssueFilters) => {
    setFilters(newFilters)
    setActiveViewId(null)
  }, [])

  const handleSaveView = useCallback(
    (name: string) => {
      if (!projectId) return
      const id = saveView({ projectId, name, filters })
      setActiveViewId(id)
    },
    [projectId, filters, saveView]
  )

  const handleLoadSavedView = useCallback((view: SavedView) => {
    setFilters(view.filters)
    setActiveViewId(view.id)
  }, [])

  const handleDeleteSavedView = useCallback(
    (viewId: string) => {
      deleteSavedView(viewId)
      if (activeViewId === viewId) {
        setActiveViewId(null)
      }
    },
    [deleteSavedView, activeViewId]
  )

  // Keyboard shortcuts
  useProjectShortcuts({
    onCreateIssue: toggleCreateModal,
    onMoveDown: handleMoveDown,
    onMoveUp: handleMoveUp,
    onPreviewIssue: handlePreviewIssue,
    onOpenIssue: handleOpenIssue,
    onClosePanel: handleClosePanel,
    enabled: !!project,
  })

  if (!project || !projectId) {
    return (
      <div className="project-detail__not-found">
        <p>Project not found</p>
        <Link to="/projects" className="btn-secondary">
          Back to Projects
        </Link>
      </div>
    )
  }

  const contentClass = `project-detail__content ${
    selectedIssueId ? 'project-detail__content--panel-open' : ''
  }`

  return (
    <div className="project-detail">
      {/* Header */}
      <div className="project-detail__header">
        <div className="project-detail__header-left">
          <div
            className="project-detail__color"
            style={{ backgroundColor: project.color }}
          />
          <h2 className="project-detail__name">{project.name}</h2>
          <span className="project-detail__prefix">{project.prefix}</span>
        </div>
        <div className="project-detail__header-right">
          <ViewToggle
            value={project.currentView}
            onChange={handleViewChange}
          />
          <button
            className="btn-primary project-detail__new-btn"
            onClick={toggleCreateModal}
          >
            <Plus size={16} />
            <span>New Issue</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        members={members}
        labels={project.labels}
        savedViews={projectSavedViews}
        onSaveView={handleSaveView}
        onDeleteSavedView={handleDeleteSavedView}
        onLoadSavedView={handleLoadSavedView}
        activeViewId={activeViewId}
      />

      {/* Bulk Action Bar */}
      <BulkActionBar members={members} />

      {/* Content */}
      <div className={contentClass}>
        <div className="project-detail__main">
          {project.currentView === ViewType.Board ? (
            <BoardView
              issues={projectIssues}
              members={members}
              labels={project.labels}
              projectId={projectId}
              onIssueClick={handleIssueClick}
              onStatusChange={handleStatusChange}
              onQuickCreate={handleQuickCreate}
              selectedIssueId={selectedIssueId ?? undefined}
              focusedIndex={focusedIssueIndex}
              selectedIssueIds={selectedIssueIds}
              onToggleSelection={toggleIssueSelection}
            />
          ) : (
            <ListView
              issues={projectIssues}
              members={members}
              labels={project.labels}
              projectId={projectId}
              onIssueClick={handleIssueClick}
              onIssueUpdate={handleIssueUpdate}
              onQuickCreate={handleQuickCreate}
              selectedIssueId={selectedIssueId ?? undefined}
              focusedIndex={focusedIssueIndex}
              selectedIssueIds={selectedIssueIds}
              onToggleSelection={toggleIssueSelection}
              onSelectAll={selectAllIssues}
              onClearSelection={clearSelection}
            />
          )}
        </div>

        {/* Sidebar */}
        <aside className="project-detail__sidebar">
          {activeCycle && cycleIssues.length > 0 && (
            <BurndownChart cycle={activeCycle} issues={cycleIssues} />
          )}
          <CyclePanel projectId={projectId} />
          <GoalsPanel projectId={projectId} />
          <MilestonesTimeline projectId={projectId} />
        </aside>
      </div>

      {/* Issue Detail Panel */}
      <IssueDetailPanel
        issueId={selectedIssueId}
        onClose={handleClosePanel}
      />

      {/* Create Issue Modal */}
      <CreateIssueModal
        projectId={projectId}
        open={createModalOpen}
        onClose={toggleCreateModal}
      />
    </div>
  )
}
