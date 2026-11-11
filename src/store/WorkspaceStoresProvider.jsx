import { useCallback, useEffect, useMemo, useState } from 'react'
import { getPrimaryWorkspace } from '../auth/backendStore'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../lib/api'
import { activateStore, createWorkspaceStore, listWorkspaceStores } from '../lib/storesApi'
import { ActiveStoreContext } from './activeStoreContext'

export function WorkspaceStoresProvider({ children }) {
  const { user, refreshUser, isAuthenticated } = useAuth()
  const workspace = useMemo(() => getPrimaryWorkspace(user), [user])

  const [stores, setStores] = useState([])
  const [activeStoreId, setActiveStoreId] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const refreshStores = useCallback(async () => {
    if (!isAuthenticated || !workspace?.id) {
      setStores([])
      setActiveStoreId(null)
      setStatus('ready')
      setError('')
      return []
    }

    setStatus('loading')
    setError('')
    try {
      const nextStores = await listWorkspaceStores(workspace.id)
      const realStores = nextStores.filter((store) => !store.is_demo)
      setStores(realStores)

      setActiveStoreId((current) => {
        if (workspace.active_store_id) {
          const match = realStores.find((store) => store.id === workspace.active_store_id)
          if (match) return match.id
        }
        if (current && realStores.some((store) => store.id === current)) {
          return current
        }
        return realStores[0]?.id ?? null
      })

      setStatus('ready')
      return realStores
    } catch (err) {
      setStores([])
      setActiveStoreId(null)
      setStatus('error')
      setError(err instanceof ApiError ? err.message : 'Unable to load stores.')
      return []
    }
  }, [isAuthenticated, workspace])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const next = await refreshStores()
      if (cancelled) return
      void next
    })()
    return () => {
      cancelled = true
    }
  }, [refreshStores])

  const selectStore = useCallback(
    async (storeId) => {
      if (!storeId) return
      const context = await activateStore(storeId)
      setActiveStoreId(context.active_store_id || storeId)
      await refreshUser()
      await refreshStores()
    },
    [refreshStores, refreshUser],
  )

  const createStore = useCallback(
    async ({ name, domain }) => {
      if (!workspace?.id) {
        throw new ApiError('Create a workspace before adding a store.', { status: 422 })
      }

      const store = await createWorkspaceStore(workspace.id, { name, domain })
      await activateStore(store.id)
      setActiveStoreId(store.id)
      await refreshUser()
      await refreshStores()
      return store
    },
    [refreshStores, refreshUser, workspace],
  )

  const activeStore = useMemo(
    () => stores.find((store) => store.id === activeStoreId) ?? null,
    [stores, activeStoreId],
  )

  const value = useMemo(
    () => ({
      workspace,
      stores,
      activeStoreId,
      activeStore,
      status,
      error,
      refreshStores,
      createStore,
      selectStore,
    }),
    [
      workspace,
      stores,
      activeStoreId,
      activeStore,
      status,
      error,
      refreshStores,
      createStore,
      selectStore,
    ],
  )

  return <ActiveStoreContext.Provider value={value}>{children}</ActiveStoreContext.Provider>
}
