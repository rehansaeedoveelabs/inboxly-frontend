import { Navigate, useLocation } from 'react-router-dom'
import { LoadingState } from '../components/ui'
import { resolveAuthGate } from './authGate'
import { useAuth } from './useAuth'

export function ProtectedRoute({ children }) {
  const { status } = useAuth()
  const location = useLocation()
  const gate = resolveAuthGate({ status, mode: 'protected' })

  if (gate === 'loading') {
    return (
      <div className="flex min-h-full items-center justify-center bg-midnight p-6">
        <LoadingState label="Checking your session…" />
      </div>
    )
  }

  if (gate === 'login') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
