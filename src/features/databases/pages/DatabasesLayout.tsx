import { Outlet } from 'react-router-dom'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import DatabaseCopilotButton from '../components/DatabaseCopilotButton/DatabaseCopilotButton'
import DatabaseCopilotPanel from '../components/DatabaseCopilotPanel/DatabaseCopilotPanel'

export default function DatabasesLayout() {
  return (
    <>
      <ModuleHeader title="Databases" subtitle="Build powerful relational databases" />

      <Outlet />
      <DatabaseCopilotButton />
      <DatabaseCopilotPanel />
    </>
  )
}
