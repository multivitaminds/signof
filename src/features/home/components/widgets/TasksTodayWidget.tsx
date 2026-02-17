import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { useProjectStore } from '../../../projects/stores/useProjectStore'
import Card from '../../../../components/ui/Card'
import './TasksTodayWidget.css'

export default function TasksTodayWidget() {
  const issues = useProjectStore((s) => s.issues)

  const todayTasks = useMemo(() => {
    const all = Object.values(issues)
    return all
      .filter(
        (i) => i.status === 'in_progress' || i.status === 'in_review'
      )
      .sort((a, b) => {
        const priorityOrder = ['urgent', 'high', 'medium', 'low', 'none']
        return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
      })
      .slice(0, 5)
  }, [issues])

  return (
    <Card>
      <Card.Header>
        <Card.Title>Tasks Today</Card.Title>
      </Card.Header>
      <Card.Body>
        {todayTasks.length === 0 ? (
          <p className="tasks-today__empty">No active tasks</p>
        ) : (
          <ul className="tasks-today__list">
            {todayTasks.map((task) => {
              const isDone = task.status === 'done'
              return (
                <li key={task.id} className="tasks-today__item">
                  <Link to={`/projects/${task.projectId}`} className="tasks-today__link">
                    {isDone ? (
                      <CheckCircle2 size={16} className="tasks-today__check tasks-today__check--done" />
                    ) : (
                      <Circle size={16} className="tasks-today__check" />
                    )}
                    <span className={`tasks-today__title ${isDone ? 'tasks-today__title--done' : ''}`}>
                      {task.title}
                    </span>
                    <span className="tasks-today__identifier">{task.identifier}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Card.Body>
      <Card.Footer>
        <Link to="/projects" className="tasks-today__view-all">
          View all <ArrowRight size={14} />
        </Link>
      </Card.Footer>
    </Card>
  )
}
