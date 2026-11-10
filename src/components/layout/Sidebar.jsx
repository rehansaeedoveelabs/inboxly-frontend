import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { navGroups } from '../../navigation/navConfig'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'

export function Sidebar({
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapsed,
}) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-overlay transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onMobileClose}
        aria-hidden={!mobileOpen}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-line bg-elevated transition-all duration-200',
          'lg:static lg:translate-x-0',
          collapsed ? 'lg:w-[4.5rem]' : 'lg:w-64',
          mobileOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full',
        )}
        aria-label="Primary"
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-line px-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-electric text-sm font-bold text-ink">
              In
            </div>
            {!collapsed || mobileOpen ? (
              <div className="min-w-0 lg:block">
                <p className="truncate text-sm font-semibold text-ink">Inboxly</p>
                <p className="truncate text-[11px] text-muted">Marketing OS</p>
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:inline-flex"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={onToggleCollapsed}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              aria-label="Close navigation"
              onClick={onMobileClose}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.id} className="mb-4">
              {(!collapsed || mobileOpen) && (
                <p className="mb-1.5 px-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                      <NavLink
                        to={item.to}
                        end={item.to === '/'}
                        onClick={onMobileClose}
                        title={collapsed ? item.label : undefined}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                            isActive
                              ? 'bg-electric/15 text-ink'
                              : 'text-muted hover:bg-secondary hover:text-ink',
                            collapsed && !mobileOpen && 'justify-center px-0',
                          )
                        }
                      >
                        <Icon className="size-4 shrink-0" aria-hidden />
                        {(!collapsed || mobileOpen) && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line px-3 py-3">
          <p
            className={cn(
              'text-[11px] text-muted',
              collapsed && !mobileOpen && 'text-center',
            )}
          >
            {collapsed && !mobileOpen ? 'P' : 'Prototype data'}
          </p>
        </div>
      </aside>
    </>
  )
}
