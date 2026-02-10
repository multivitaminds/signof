import type { Project } from '../../types'
import './ProjectCard.css'

interface ProjectCardProps {
  project: Project
  issueCount: number
  completedCount: number
  onClick: () => void
}

export default function ProjectCard({
  project,
  issueCount,
  completedCount,
  onClick,
}: ProjectCardProps) {
  const progressPercent =
    issueCount > 0 ? (completedCount / issueCount) * 100 : 0

  return (
    <button
      className="project-card"
      onClick={onClick}
      type="button"
      aria-label={`Open project ${project.name}`}
    >
      <div
        className="project-card__stripe"
        style={{ backgroundColor: project.color }}
      />

      <div className="project-card__body">
        <div className="project-card__header">
          <h3 className="project-card__name">{project.name}</h3>
          <span className="project-card__prefix">{project.prefix}</span>
        </div>

        {project.description && (
          <p className="project-card__description">{project.description}</p>
        )}

        <div className="project-card__progress">
          <div
            className="project-card__progress-fill"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: project.color,
            }}
          />
        </div>

        <span className="project-card__stats">
          {issueCount} {issueCount === 1 ? 'issue' : 'issues'} &middot;{' '}
          {completedCount} completed
        </span>
      </div>
    </button>
  )
}
