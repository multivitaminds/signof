import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom'
import { CalendarDays, Clock, List, Link2, BarChart3, UserX } from 'lucide-react'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import SchedulingCopilotButton from '../components/SchedulingCopilotButton/SchedulingCopilotButton'
import SchedulingCopilotPanel from '../components/SchedulingCopilotPanel/SchedulingCopilotPanel'
import './SchedulingLayout.css'

const TABS = [
  { path: '/calendar/events', label: 'Event Types', icon: CalendarDays },
  { path: '/calendar/schedule', label: 'Calendar', icon: Clock },
  { path: '/calendar/bookings', label: 'Bookings', icon: List },
  { path: '/calendar/sync', label: 'Calendar Sync', icon: Link2 },
  { path: '/calendar/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/calendar/no-shows', label: 'No-Shows', icon: UserX },
]

export default function SchedulingLayout() {
  const location = useLocation()

  if (location.pathname === '/calendar' || location.pathname === '/calendar/') {
    return <Navigate to="/calendar/events" replace />
  }

  return (
    <div className="scheduling-layout">
      <ModuleHeader title="Calendar" subtitle="Schedule meetings and manage bookings" />

      <div className="scheduling-layout__header">
        <nav className="scheduling-layout__tabs">
          {TABS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `scheduling-layout__tab ${isActive ? 'scheduling-layout__tab--active' : ''}`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="scheduling-layout__content">
        <Outlet />
      </div>
      <SchedulingCopilotButton />
      <SchedulingCopilotPanel />
    </div>
  )
}
