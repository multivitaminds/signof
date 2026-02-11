import { useCallback, useState } from 'react'
import type { Issue, Member, Label, IssueStatus } from '../../types'
import { BOARD_STATUSES, STATUS_CONFIG } from '../../types'
import IssueCard from '../IssueCard/IssueCard'
import IssueQuickCreate from '../IssueQuickCreate/IssueQuickCreate'
import './BoardView.css'

interface BoardViewProps {
  issues: Issue[]
  members: Member[]
  labels: Label[]
  projectId: string
  onIssueClick: (id: string) => void
  onStatusChange: (issueId: string, status: IssueStatus) => void
  onQuickCreate: (data: { projectId: string; title: string; status?: IssueStatus }) => void
  selectedIssueId?: string
  focusedIndex?: number
  selectedIssueIds?: Set<string>
  onToggleSelection?: (issueId: string) => void
}

function BoardView({
  issues,
  members,
  labels,
  projectId,
  onIssueClick,
  onStatusChange,
  onQuickCreate,
  selectedIssueId,
  focusedIndex,
  selectedIssueIds,
  onToggleSelection,
}: BoardViewProps) {
  const [dragOverStatus, setDragOverStatus] = useState<IssueStatus | null>(null)

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, status: IssueStatus) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverStatus(status)
    },
    [],
  )

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>, status: IssueStatus) => {
      const related = e.relatedTarget as Node | null
      const current = e.currentTarget as Node
      if (related && current.contains(related)) return
      if (dragOverStatus === status) {
        setDragOverStatus(null)
      }
    },
    [dragOverStatus],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, status: IssueStatus) => {
      e.preventDefault()
      const issueId = e.dataTransfer.getData('text/plain')
      if (issueId) {
        onStatusChange(issueId, status)
      }
      setDragOverStatus(null)
    },
    [onStatusChange],
  )

  // Build a map of status -> issues for efficient lookup
  const issuesByStatus = new Map<IssueStatus, Issue[]>()
  for (const status of BOARD_STATUSES) {
    issuesByStatus.set(status, [])
  }
  for (const issue of issues) {
    const bucket = issuesByStatus.get(issue.status)
    if (bucket) {
      bucket.push(issue)
    }
  }

  // Track a global index across all columns for focusedIndex
  let globalIndex = 0

  return (
    <div className="board-view">
      <div className="board-view__columns">
        {BOARD_STATUSES.map((status) => {
          const config = STATUS_CONFIG[status]
          const columnIssues = issuesByStatus.get(status) ?? []
          const isDragOver = dragOverStatus === status
          const columnClass = [
            'board-view__column',
            isDragOver ? 'board-view__column--drag-over' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div
              key={status}
              className={columnClass}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={(e) => handleDragLeave(e, status)}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="board-view__column-header">
                <span
                  className="board-view__column-dot"
                  style={{ backgroundColor: config.color }}
                />
                <span className="board-view__column-title">{config.label}</span>
                <span className="board-view__column-count">{columnIssues.length}</span>
              </div>
              <div className="board-view__cards">
                {columnIssues.length === 0 ? (
                  <p className="board-view__empty">No issues</p>
                ) : (
                  columnIssues.map((issue) => {
                    const currentIndex = globalIndex++
                    return (
                      <IssueCard
                        key={issue.id}
                        issue={issue}
                        members={members}
                        labels={labels}
                        onClick={() => onIssueClick(issue.id)}
                        selected={selectedIssueId === issue.id}
                        focused={focusedIndex === currentIndex}
                        checked={selectedIssueIds?.has(issue.id)}
                        onCheckChange={onToggleSelection}
                      />
                    )
                  })
                )}
              </div>
              <IssueQuickCreate
                projectId={projectId}
                defaultStatus={status}
                onCreateIssue={onQuickCreate}
                variant="board"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BoardView
