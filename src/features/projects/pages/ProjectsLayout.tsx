import { Outlet } from 'react-router-dom'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import AIFeatureWidget from '../../ai/components/AIFeatureWidget/AIFeatureWidget'
import './ProjectsLayout.css'

export default function ProjectsLayout() {
  return (
    <div className="projects-layout">
      <ModuleHeader title="Projects" subtitle="Track issues, sprints, and milestones" />

      <div className="projects-layout__content">
        <Outlet />
      </div>
      <AIFeatureWidget featureKey="projects" />
    </div>
  )
}
