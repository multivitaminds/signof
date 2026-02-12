import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/stores/useAuthStore'
import { AuthStatus } from '../../features/auth/types'
import ProtectedRoute from './ProtectedRoute'

function renderWithRouter(initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Dashboard</div>
            </ProtectedRoute>
          }
        />
        <Route path="/signup/plan" element={<div>Plan Selection</div>} />
        <Route path="/signup/payment" element={<div>Payment Page</div>} />
        <Route path="/onboarding" element={<div>Onboarding Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      status: AuthStatus.Unauthenticated,
      user: null,
      registrationStep: 'none',
      onboardingComplete: false,
      accountMode: 'demo',
    })
  })

  it('renders children for unauthenticated users (demo mode)', () => {
    renderWithRouter()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders children for fully registered users', () => {
    useAuthStore.setState({
      status: AuthStatus.Authenticated,
      registrationStep: 'complete',
    })
    renderWithRouter()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('redirects to plan selection when registrationStep is plan', () => {
    useAuthStore.setState({
      status: AuthStatus.Authenticated,
      registrationStep: 'plan',
    })
    renderWithRouter()
    expect(screen.getByText('Plan Selection')).toBeInTheDocument()
  })

  it('redirects to payment when registrationStep is payment', () => {
    useAuthStore.setState({
      status: AuthStatus.Authenticated,
      registrationStep: 'payment',
    })
    renderWithRouter()
    expect(screen.getByText('Payment Page')).toBeInTheDocument()
  })

  it('redirects to onboarding when registrationStep is onboarding', () => {
    useAuthStore.setState({
      status: AuthStatus.Authenticated,
      registrationStep: 'onboarding',
    })
    renderWithRouter()
    expect(screen.getByText('Onboarding Page')).toBeInTheDocument()
  })
})
