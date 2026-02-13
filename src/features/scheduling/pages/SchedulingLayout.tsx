import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom'
import { CalendarDays, Clock, List, Link2, BarChart3, UserX } from 'lucide-react'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import { DemoVideoSection } from '../../../components/ui/DemoVideo'
import AIFeatureWidget from '../../ai/components/AIFeatureWidget/AIFeatureWidget'
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

      <DemoVideoSection videos={[
        { title: 'Setting Up Event Types', description: 'Configure meeting types with custom durations and rules.', duration: '3:00' },
        { title: 'Managing Your Calendar', description: 'View, create, and manage all your scheduled events.', duration: '2:50' },
        { title: 'Booking Page Walkthrough', description: 'See how attendees book time on your calendar.', duration: '3:30' },
      ]} />

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
      <AIFeatureWidget featureKey="scheduling" />
    </div>
  )
}
