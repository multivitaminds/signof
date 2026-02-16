import { Outlet } from 'react-router-dom'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import { DemoVideoSection } from '../../../components/ui/DemoVideo'
import AIFeatureWidget from '../../ai/components/AIFeatureWidget/AIFeatureWidget'
import ProjectCopilotButton from '../components/ProjectCopilotButton/ProjectCopilotButton'
import ProjectCopilotPanel from '../components/ProjectCopilotPanel/ProjectCopilotPanel'
import './ProjectsLayout.css'

export default function ProjectsLayout() {
  return (
    <div className="projects-layout">
      <ModuleHeader title="Projects" subtitle="Track issues, sprints, and milestones" />

      <DemoVideoSection videos={[
        { title: 'Managing Projects & Sprints', description: 'Create projects, plan sprints, and track progress.', duration: '4:30' },
        { title: 'Board vs List Views', description: 'Switch between kanban boards and list views.', duration: '2:45' },
        { title: 'Setting Goals & OKRs', description: 'Define objectives and track key results.', duration: '3:20' },
      ]} />

      <div className="projects-layout__content">
        <Outlet />
      </div>
      <AIFeatureWidget featureKey="projects" />
      <ProjectCopilotButton />
      <ProjectCopilotPanel />
    </div>
  )
}
