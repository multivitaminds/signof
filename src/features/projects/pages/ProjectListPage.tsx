import { useMemo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BarChart3 } from 'lucide-react'
import { useProjectStore } from '../stores/useProjectStore'
import { IssueStatus } from '../types'
import ProjectCard from '../components/ProjectCard/ProjectCard'
import ProjectAnalytics from '../components/ProjectAnalytics/ProjectAnalytics'
import './ProjectListPage.css'

export default function ProjectListPage() {
  const projects = useProjectStore((s) => s.projects)
  const issues = useProjectStore((s) => s.issues)
  const navigate = useNavigate()
  const [showAnalytics, setShowAnalytics] = useState(false)

  const projectList = useMemo(
    () =>
      Object.values(projects).sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [projects]
  )

  const issueCounts = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {}
    for (const issue of Object.values(issues)) {
      const existing = counts[issue.projectId]
      if (!existing) {
        counts[issue.projectId] = { total: 1, completed: issue.status === IssueStatus.Done ? 1 : 0 }
      } else {
        existing.total++
        if (issue.status === IssueStatus.Done) {
          existing.completed++
        }
      }
    }
    return counts
  }, [issues])

  const handleProjectClick = useCallback(
    (projectId: string) => {
      navigate(`/projects/${projectId}`)
    },
    [navigate]
  )

  const handleNewProject = useCallback(() => {
    navigate('/projects/new')
  }, [navigate])

  const handleToggleAnalytics = useCallback(() => {
    setShowAnalytics((prev) => !prev)
  }, [])

  if (projectList.length === 0) {
    return (
      <div className="project-list__empty">
        <p>No projects yet. Create one to get started.</p>
        <button className="btn-primary" onClick={handleNewProject} type="button">
          New Project
        </button>
      </div>
    )
  }

  return (
    <div className="project-list">
      <div className="project-list__header">
        <button
          className={`project-list__analytics-toggle ${showAnalytics ? 'project-list__analytics-toggle--active' : ''}`}
          onClick={handleToggleAnalytics}
          type="button"
          aria-pressed={showAnalytics}
          aria-label={showAnalytics ? 'Hide analytics' : 'Show analytics'}
        >
          <BarChart3 size={16} />
          <span>{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}</span>
        </button>
      </div>

      {showAnalytics && <ProjectAnalytics />}

      <div className="project-list__grid">
        {projectList.map((project) => {
          const counts = issueCounts[project.id] ?? { total: 0, completed: 0 }
          return (
            <ProjectCard
              key={project.id}
              project={project}
              issueCount={counts.total}
              completedCount={counts.completed}
              onClick={() => handleProjectClick(project.id)}
            />
          )
        })}

        <button
          className="project-list__cta"
          onClick={handleNewProject}
          type="button"
          aria-label="Create new project"
        >
          <Plus size={24} />
          <span>New Project</span>
        </button>
      </div>
    </div>
  )
}
