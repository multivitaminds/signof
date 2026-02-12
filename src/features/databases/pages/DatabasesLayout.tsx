import { Outlet } from 'react-router-dom'
import AIFeatureWidget from '../../ai/components/AIFeatureWidget/AIFeatureWidget'

export default function DatabasesLayout() {
  return (
    <>
      <Outlet />
      <AIFeatureWidget featureKey="databases" />
    </>
  )
}
