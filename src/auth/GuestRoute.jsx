import { Navigate } from 'react-router-dom'
import { LoadingState } from '../components/ui'
import { resolveAuthGate } from './authGate'
import { useAuth } from './useAuth'

export function GuestRoute({ children }) {
  const { status } = useAuth()
  const gate = resolveAuthGate({ status, mode: 'guest' })

  if (gate === 'loading') {
    return (
      <div className="flex min-h-full items-center justify-center bg-midnight p-6">
        <LoadingState label="Checking your session…" />
      </div>
    )
  }

  if (gate === 'app') {
    return <Navigate to="/" replace />
  }

  return children
}
