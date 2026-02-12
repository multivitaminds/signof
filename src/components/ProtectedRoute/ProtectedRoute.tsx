import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/stores/useAuthStore'
import { AuthStatus } from '../../features/auth/types'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const status = useAuthStore((s) => s.status)
  const registrationStep = useAuthStore((s) => s.registrationStep)

  // Unauthenticated users see demo mode — no redirect
  if (status !== AuthStatus.Authenticated) {
    return <>{children}</>
  }

  // Authenticated users with incomplete registration get redirected
  switch (registrationStep) {
    case 'plan':
      return <Navigate to="/signup/plan" replace />
    case 'payment':
      return <Navigate to="/signup/payment" replace />
    case 'onboarding':
      return <Navigate to="/onboarding" replace />
    default:
      return <>{children}</>
  }
}
