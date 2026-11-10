import { useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { getStores } from '../../mock/workspace'
import { ActiveStoreProvider } from '../../store/ActiveStoreProvider'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const stores = getStores()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [activeStoreId, setActiveStoreId] = useState(stores[0]?.id)

  const activeStore = useMemo(
    () => stores.find((store) => store.id === activeStoreId) ?? stores[0] ?? null,
    [stores, activeStoreId],
  )

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <ActiveStoreProvider
      value={{
        stores,
        activeStoreId: activeStore?.id ?? null,
        activeStore,
        setActiveStoreId,
      }}
    >
      <div className="flex min-h-full bg-midnight text-ink">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            onMenuClick={() => setMobileOpen(true)}
            activeStoreId={activeStore?.id}
            onStoreChange={setActiveStoreId}
          />
          <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 lg:px-6">
            <div className="mx-auto w-full max-w-[1400px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </ActiveStoreProvider>
  )
}
