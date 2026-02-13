import { Outlet } from 'react-router-dom'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import AIFeatureWidget from '../../ai/components/AIFeatureWidget/AIFeatureWidget'

export default function DatabasesLayout() {
  return (
    <>
      <ModuleHeader title="Databases" subtitle="Build powerful relational databases" />
      <Outlet />
      <AIFeatureWidget featureKey="databases" />
    </>
  )
}
