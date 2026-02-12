import { Outlet } from 'react-router-dom'
import { FolderKanban } from 'lucide-react'
import AIFeatureWidget from '../../ai/components/AIFeatureWidget/AIFeatureWidget'
import './ProjectsLayout.css'

export default function ProjectsLayout() {
  return (
    <div className="projects-layout">
      <div className="projects-layout__header">
        <FolderKanban size={24} className="projects-layout__icon" />
        <h1 className="projects-layout__title">Projects</h1>
      </div>

      <div className="projects-layout__content">
        <Outlet />
      </div>
      <AIFeatureWidget featureKey="projects" />
    </div>
  )
}
