import { useState, useCallback } from 'react'
import type { Issue, Member, Label, IssueSortField, GroupByOption } from '../../types'
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../../types'
import { useIssueFilters } from '../../hooks/useIssueFilters'
import IssueRow from '../IssueRow/IssueRow'
import './ListView.css'

interface ListViewProps {
  issues: Issue[]
  members: Member[]
  labels: Label[]
  onIssueClick: (id: string) => void
  onIssueUpdate: (id: string, updates: Partial<Issue>) => void
  selectedIssueId?: string
  focusedIndex?: number
}

interface ColumnDef {
  key: IssueSortField | 'identifier' | 'assignee' | 'labels'
  label: string
  sortable: boolean
}

const COLUMNS: ColumnDef[] = [
  { key: 'identifier', label: 'ID', sortable: false },
  { key: 'title', label: 'Title', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'priority', label: 'Priority', sortable: true },
  { key: 'assignee', label: 'Assignee', sortable: false },
  { key: 'labels', label: 'Labels', sortable: false },
  { key: 'updated', label: 'Updated', sortable: true },
]

function getGroupLabel(groupBy: GroupByOption, key: string, members: Member[]): string {
  switch (groupBy) {
    case 'status':
      return STATUS_CONFIG[key as keyof typeof STATUS_CONFIG]?.label ?? key
    case 'priority':
      return PRIORITY_CONFIG[key as keyof typeof PRIORITY_CONFIG]?.label ?? key
    case 'assignee': {
      if (key === 'unassigned') return 'Unassigned'
      const member = members.find((m) => m.id === key)
      return member?.name ?? key
    }
    default:
      return key
  }
}

export default function ListView({
  issues,
  members,
  labels,
  onIssueClick,
  onIssueUpdate,
  selectedIssueId,
  focusedIndex,
}: ListViewProps) {
  const [sortField, setSortField] = useState<IssueSortField>('created')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [groupBy, setGroupBy] = useState<GroupByOption>('none')
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const { filteredIssues, groupedIssues } = useIssueFilters(
    issues,
    {},
    { field: sortField, direction: sortDirection },
    groupBy
  )

  const handleSort = useCallback(
    (field: IssueSortField) => {
      if (sortField === field) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDirection('asc')
      }
    },
    [sortField]
  )

  const toggleGroup = useCallback((key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const handleGroupByChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setGroupBy(e.target.value as GroupByOption)
      setCollapsedGroups(new Set())
    },
    []
  )

  // Flatten for index tracking
  let globalIndex = -1

  const renderIssueRow = (issue: Issue) => {
    globalIndex++
    const currentIndex = globalIndex
    return (
      <IssueRow
        key={issue.id}
        issue={issue}
        members={members}
        labels={labels}
        onUpdate={onIssueUpdate}
        onClick={() => onIssueClick(issue.id)}
        selected={issue.id === selectedIssueId}
        focused={currentIndex === focusedIndex}
      />
    )
  }

  if (filteredIssues.length === 0) {
    return (
      <div className="list-view__empty">
        <p>No issues match the current filters.</p>
      </div>
    )
  }

  return (
    <div className="list-view">
      <div className="list-view__toolbar">
        <label className="list-view__group-label">
          Group by:
          <select
            className="list-view__group-select"
            value={groupBy}
            onChange={handleGroupByChange}
          >
            <option value="none">None</option>
            <option value="status">Status</option>
            <option value="priority">Priority</option>
            <option value="assignee">Assignee</option>
          </select>
        </label>
      </div>

      {/* Header */}
      <div className="list-view__header" role="row">
        {COLUMNS.map((col) => {
          const isSorted = col.sortable && sortField === col.key
          return (
            <div
              key={col.key}
              className={`list-view__header-cell ${isSorted ? 'list-view__header-cell--sorted' : ''} ${col.sortable ? 'list-view__header-cell--sortable' : ''}`}
              onClick={
                col.sortable
                  ? () => handleSort(col.key as IssueSortField)
                  : undefined
              }
              role={col.sortable ? 'button' : undefined}
              tabIndex={col.sortable ? 0 : undefined}
              onKeyDown={
                col.sortable
                  ? (e) => {
                      if (e.key === 'Enter')
                        handleSort(col.key as IssueSortField)
                    }
                  : undefined
              }
              aria-sort={
                isSorted
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : undefined
              }
            >
              {col.label}
              {isSorted && (
                <span className="list-view__sort-arrow">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Body */}
      <div className="list-view__body" role="table">
        {groupBy === 'none' ? (
          filteredIssues.map(renderIssueRow)
        ) : (
          Array.from(groupedIssues.entries()).map(([key, groupIssues]) => {
            const isCollapsed = collapsedGroups.has(key)
            const label = getGroupLabel(groupBy, key, members)
            return (
              <div key={key} className="list-view__group">
                <button
                  className="list-view__group-header"
                  onClick={() => toggleGroup(key)}
                  aria-expanded={!isCollapsed}
                >
                  <span className="list-view__group-toggle">
                    {isCollapsed ? '▶' : '▼'}
                  </span>
                  <span className="list-view__group-name">{label}</span>
                  <span className="list-view__group-count">
                    {groupIssues.length}
                  </span>
                </button>
                {!isCollapsed && groupIssues.map(renderIssueRow)}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
