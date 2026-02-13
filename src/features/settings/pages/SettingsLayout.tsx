import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom'
import { Settings, Users, Bell, Palette, Plug, CreditCard } from 'lucide-react'
import ModuleHeader from '../../../components/ui/ModuleHeader'
import './SettingsLayout.css'

const SETTINGS_NAV = [
  { path: '/settings/general', label: 'General', icon: Settings },
  { path: '/settings/members', label: 'Members', icon: Users },
  { path: '/settings/notifications', label: 'Notifications', icon: Bell },
  { path: '/settings/appearance', label: 'Appearance', icon: Palette },
  { path: '/settings/integrations', label: 'Integrations', icon: Plug },
  { path: '/settings/billing', label: 'Billing', icon: CreditCard },
]

export default function SettingsLayout() {
  const location = useLocation()

  if (location.pathname === '/settings' || location.pathname === '/settings/') {
    return <Navigate to="/settings/general" replace />
  }

  return (
    <div className="settings-layout">
      <ModuleHeader title="Settings" subtitle="Workspace preferences and team management" />
      <nav className="settings-layout__nav">
        {SETTINGS_NAV.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `settings-layout__nav-item ${isActive ? 'settings-layout__nav-item--active' : ''}`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="settings-layout__content">
        <Outlet />
      </div>
    </div>
  )
}
