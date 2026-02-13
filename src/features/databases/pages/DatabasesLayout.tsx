import { Outlet } from 'react-router-dom'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import { DemoVideoSection } from '../../../components/ui/DemoVideo'
import AIFeatureWidget from '../../ai/components/AIFeatureWidget/AIFeatureWidget'

export default function DatabasesLayout() {
  return (
    <>
      <ModuleHeader title="Databases" subtitle="Build powerful relational databases" />

      <DemoVideoSection videos={[
        { title: 'Building Your First Database', description: 'Create a database with custom fields and records.', duration: '3:45' },
        { title: 'Multiple Views Explained', description: 'Grid, kanban, calendar, and gallery views.', duration: '4:20' },
        { title: 'Using Formulas', description: 'Add computed fields with the formula editor.', duration: '3:50' },
      ]} />

      <Outlet />
      <AIFeatureWidget featureKey="databases" />
    </>
  )
}
