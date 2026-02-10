import { useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { Issue, IssueStatus, ViewType as VT } from '../types'
import { ViewType } from '../types'
import { useProjectStore } from '../stores/useProjectStore'
import { useProjectShortcuts } from '../hooks/useProjectShortcuts'
import BoardView from '../components/BoardView/BoardView'
import ListView from '../components/ListView/ListView'
import ViewToggle from '../components/ViewToggle/ViewToggle'
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
  const selectedIssueId = useProjectStore((s) => s.selectedIssueId)
  const focusedIssueIndex = useProjectStore((s) => s.focusedIssueIndex)
  const createModalOpen = useProjectStore((s) => s.createModalOpen)

  const setSelectedIssue = useProjectStore((s) => s.setSelectedIssue)
  const setFocusedIndex = useProjectStore((s) => s.setFocusedIndex)
  const toggleCreateModal = useProjectStore((s) => s.toggleCreateModal)
  const updateIssue = useProjectStore((s) => s.updateIssue)
  const setProjectView = useProjectStore((s) => s.setProjectView)

  // Filter issues for this project
  const projectIssues = useMemo(() => {
    if (!projectId) return []
    return Object.values(allIssues).filter((i) => i.projectId === projectId)
  }, [allIssues, projectId])

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

      {/* Content */}
      <div className={contentClass}>
        <div className="project-detail__main">
          {project.currentView === ViewType.Board ? (
            <BoardView
              issues={projectIssues}
              members={members}
              labels={project.labels}
              onIssueClick={handleIssueClick}
              onStatusChange={handleStatusChange}
              selectedIssueId={selectedIssueId ?? undefined}
              focusedIndex={focusedIssueIndex}
            />
          ) : (
            <ListView
              issues={projectIssues}
              members={members}
              labels={project.labels}
              onIssueClick={handleIssueClick}
              onIssueUpdate={handleIssueUpdate}
              selectedIssueId={selectedIssueId ?? undefined}
              focusedIndex={focusedIssueIndex}
            />
          )}
        </div>

        {/* Cycle sidebar */}
        <aside className="project-detail__sidebar">
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
