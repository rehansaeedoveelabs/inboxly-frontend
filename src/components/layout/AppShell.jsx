import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { WorkspaceStoresProvider } from '../../store/WorkspaceStoresProvider'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <WorkspaceStoresProvider>
      {/* Viewport-locked shell: sidebar stays put; only <main> scrolls. */}
      <div className="flex h-dvh max-h-dvh overflow-hidden bg-midnight text-ink">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setMobileOpen(true)} />
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 scrollbar-thin sm:px-5 lg:px-6">
            <div className="mx-auto w-full max-w-[1400px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </WorkspaceStoresProvider>
  )
}
