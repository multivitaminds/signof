import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SettingsLayout from './SettingsLayout'

function renderSettings(initialPath = '/settings/general') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/settings" element={<SettingsLayout />}>
          <Route path="general" element={<div>General Content</div>} />
          <Route path="members" element={<div>Members Content</div>} />
          <Route path="notifications" element={<div>Notifications Content</div>} />
          <Route path="appearance" element={<div>Appearance Content</div>} />
          <Route path="integrations" element={<div>Integrations Content</div>} />
          <Route path="billing" element={<div>Billing Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('SettingsLayout', () => {
  it('renders the Settings navigation title', () => {
    renderSettings()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders all navigation items', () => {
    renderSettings()
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Members')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Integrations')).toBeInTheDocument()
    expect(screen.getByText('Billing')).toBeInTheDocument()
  })

  it('renders the outlet content for the active route', () => {
    renderSettings('/settings/general')
    expect(screen.getByText('General Content')).toBeInTheDocument()
  })

  it('renders members content for members route', () => {
    renderSettings('/settings/members')
    expect(screen.getByText('Members Content')).toBeInTheDocument()
  })

  it('redirects /settings to /settings/general', () => {
    renderSettings('/settings')
    expect(screen.getByText('General Content')).toBeInTheDocument()
  })

  it('redirects /settings/ (trailing slash) to /settings/general', () => {
    renderSettings('/settings/')
    expect(screen.getByText('General Content')).toBeInTheDocument()
  })
})
