import { useMemo } from 'react'
import type { Issue, IssueFilters, IssueSort, GroupByOption } from '../types'
import { PRIORITY_ORDER, STATUS_ORDER } from '../types'

interface UseIssueFiltersResult {
  filteredIssues: Issue[]
  groupedIssues: Map<string, Issue[]>
  totalCount: number
  filteredCount: number
}

function matchesFilters(issue: Issue, filters: IssueFilters): boolean {
  if (filters.status && filters.status.length > 0) {
    if (!filters.status.includes(issue.status)) return false
  }
  if (filters.priority && filters.priority.length > 0) {
    if (!filters.priority.includes(issue.priority)) return false
  }
  if (filters.assigneeId && filters.assigneeId.length > 0) {
    if (!issue.assigneeId || !filters.assigneeId.includes(issue.assigneeId)) return false
  }
  if (filters.labelIds && filters.labelIds.length > 0) {
    if (!filters.labelIds.some((id) => issue.labelIds.includes(id))) return false
  }
  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase()
    const matchesTitle = issue.title.toLowerCase().includes(q)
    const matchesIdentifier = issue.identifier.toLowerCase().includes(q)
    const matchesDescription = issue.description.toLowerCase().includes(q)
    if (!matchesTitle && !matchesIdentifier && !matchesDescription) return false
  }
  return true
}

function compareIssues(a: Issue, b: Issue, sort: IssueSort): number {
  let result = 0

  switch (sort.field) {
    case 'created':
      result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      break
    case 'updated':
      result = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      break
    case 'priority': {
      const aIdx = PRIORITY_ORDER.indexOf(a.priority)
      const bIdx = PRIORITY_ORDER.indexOf(b.priority)
      result = aIdx - bIdx
      break
    }
    case 'status': {
      const aIdx = STATUS_ORDER.indexOf(a.status)
      const bIdx = STATUS_ORDER.indexOf(b.status)
      result = aIdx - bIdx
      break
    }
    case 'title':
      result = a.title.localeCompare(b.title)
      break
  }

  return sort.direction === 'desc' ? -result : result
}

function groupIssues(issues: Issue[], groupBy: GroupByOption): Map<string, Issue[]> {
  const groups = new Map<string, Issue[]>()

  if (groupBy === 'none') {
    groups.set('all', issues)
    return groups
  }

  for (const issue of issues) {
    let key: string
    switch (groupBy) {
      case 'status':
        key = issue.status
        break
      case 'priority':
        key = issue.priority
        break
      case 'assignee':
        key = issue.assigneeId ?? 'unassigned'
        break
    }
    const existing = groups.get(key)
    if (existing) {
      existing.push(issue)
    } else {
      groups.set(key, [issue])
    }
  }

  return groups
}

export function useIssueFilters(
  issues: Issue[],
  filters: IssueFilters,
  sort: IssueSort,
  groupBy: GroupByOption
): UseIssueFiltersResult {
  return useMemo(() => {
    const filtered = issues.filter((issue) => matchesFilters(issue, filters))
    const sorted = [...filtered].sort((a, b) => compareIssues(a, b, sort))
    const grouped = groupIssues(sorted, groupBy)

    return {
      filteredIssues: sorted,
      groupedIssues: grouped,
      totalCount: issues.length,
      filteredCount: sorted.length,
    }
  }, [issues, filters, sort, groupBy])
}
