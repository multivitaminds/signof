import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom'
import { CalendarDays, Clock, List, Link2, BarChart3 } from 'lucide-react'
import './SchedulingLayout.css'

const TABS = [
  { path: '/calendar/events', label: 'Event Types', icon: CalendarDays },
  { path: '/calendar/schedule', label: 'Calendar', icon: Clock },
  { path: '/calendar/bookings', label: 'Bookings', icon: List },
  { path: '/calendar/sync', label: 'Calendar Sync', icon: Link2 },
  { path: '/calendar/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function SchedulingLayout() {
  const location = useLocation()

  if (location.pathname === '/calendar' || location.pathname === '/calendar/') {
    return <Navigate to="/calendar/events" replace />
  }

  return (
    <div className="scheduling-layout">
      <div className="scheduling-layout__header">
        <h1 className="scheduling-layout__title">Scheduling</h1>
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
    </div>
  )
}
