import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom'
import { Settings, Users, Bell, Palette, Plug, CreditCard } from 'lucide-react'
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
      <nav className="settings-layout__nav">
        <h2 className="settings-layout__nav-title">Settings</h2>
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
