import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import {
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  registerRequest,
} from './authApi'

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading')
  const [user, setUser] = useState(null)

  const refreshUser = useCallback(async () => {
    try {
      const nextUser = await fetchCurrentUser()
      if (nextUser) {
        setUser(nextUser)
        setStatus('authenticated')
        return nextUser
      }
      setUser(null)
      setStatus('unauthenticated')
      return null
    } catch {
      setUser(null)
      setStatus('unauthenticated')
      return null
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const nextUser = await fetchCurrentUser()
        if (cancelled) return
        if (nextUser) {
          setUser(nextUser)
          setStatus('authenticated')
        } else {
          setUser(null)
          setStatus('unauthenticated')
        }
      } catch {
        if (cancelled) return
        setUser(null)
        setStatus('unauthenticated')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const nextUser = await loginRequest(credentials)
    setUser(nextUser)
    setStatus('authenticated')
    return nextUser
  }, [])

  const register = useCallback(async (payload) => {
    const nextUser = await registerRequest(payload)
    setUser(nextUser)
    setStatus('authenticated')
    return nextUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const value = useMemo(
    () => ({
      status,
      user,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
    }),
    [status, user, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
