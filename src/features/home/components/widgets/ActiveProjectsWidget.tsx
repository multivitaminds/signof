import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useProjectStore } from '../../../projects/stores/useProjectStore'
import Card from '../../../../components/ui/Card'
import './ActiveProjectsWidget.css'

const PRIORITY_CLASSES: Record<string, string> = {
  urgent: 'active-projects__priority--urgent',
  high: 'active-projects__priority--high',
  medium: 'active-projects__priority--medium',
  low: 'active-projects__priority--low',
  none: 'active-projects__priority--none',
}

export default function ActiveProjectsWidget() {
  const issues = useProjectStore((s) => s.issues)
  const projects = useProjectStore((s) => s.projects)

  const openIssues = useMemo(() => {
    const all = Object.values(issues)
    return all
      .filter((i) => i.status !== 'done' && i.status !== 'cancelled')
      .sort((a, b) => {
        const priorityOrder = ['urgent', 'high', 'medium', 'low', 'none']
        return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
      })
      .slice(0, 5)
  }, [issues])

  return (
    <Card>
      <Card.Header>
        <Card.Title>Active Projects</Card.Title>
      </Card.Header>
      <Card.Body>
        {openIssues.length === 0 ? (
          <p className="active-projects__empty">No open issues</p>
        ) : (
          <ul className="active-projects__list">
            {openIssues.map((issue) => {
              const project = projects[issue.projectId]
              const priorityClass = PRIORITY_CLASSES[issue.priority] ?? ''
              return (
                <li key={issue.id} className="active-projects__item">
                  <Link to={`/projects/${issue.projectId}`} className="active-projects__link">
                    <span className="active-projects__title">{issue.title}</span>
                    <span className="active-projects__project">
                      {project?.name ?? 'Project'}
                    </span>
                    <span className={`active-projects__priority ${priorityClass}`}>
                      {issue.priority}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card.Body>
      <Card.Footer>
        <Link to="/projects" className="active-projects__view-all">
          View all <ArrowRight size={14} />
        </Link>
      </Card.Footer>
    </Card>
  )
}
