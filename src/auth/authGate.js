/**
 * Pure auth gate helper (testable without React).
 *
 * @param {{ status: 'loading' | 'authenticated' | 'unauthenticated', mode: 'protected' | 'guest' }} input
 * @returns {'loading' | 'allow' | 'login' | 'app'}
 */
export function resolveAuthGate({ status, mode }) {
  if (status === 'loading') return 'loading'

  if (mode === 'protected') {
    return status === 'authenticated' ? 'allow' : 'login'
  }

  // guest pages (login / register)
  return status === 'authenticated' ? 'app' : 'allow'
}
