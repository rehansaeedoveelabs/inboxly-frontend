import { useState } from 'react'
import { Bell, HelpCircle, Menu, UserRound } from 'lucide-react'
import { getCurrentUser, getStores } from '../../mock/workspace'
import { Button } from '../ui/Button'
import { Dropdown } from '../ui/Dropdown'
import { Badge } from '../ui/Badge'
import { ThemeSwitcher } from '../ui/ThemeSwitcher'

export function Header({ onMenuClick, activeStoreId, onStoreChange }) {
  const stores = getStores()
  const user = getCurrentUser()
  const [noticeOpen, setNoticeOpen] = useState(false)
  const activeStore = stores.find((store) => store.id === activeStoreId) || stores[0]

  return (
    <header className="relative sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-midnight/95 px-3 backdrop-blur sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu className="size-4" />
        </Button>

        <Dropdown
          label={
            <span className="flex max-w-[10rem] items-center gap-2 truncate sm:max-w-[14rem]">
              <span className="truncate">{activeStore.name}</span>
              <Badge tone="success">Mock</Badge>
            </span>
          }
          align="left"
          items={stores.map((store) => ({
            id: store.id,
            label: `${store.name} · ${store.domain}`,
          }))}
          onSelect={(item) => onStoreChange?.(item.id)}
        />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <ThemeSwitcher />
        <Button
          variant="ghost"
          size="sm"
          aria-label="Notifications"
          onClick={() => setNoticeOpen((value) => !value)}
        >
          <Bell className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" aria-label="Help" className="hidden sm:inline-flex">
          <HelpCircle className="size-4" />
        </Button>

        <Dropdown
          align="right"
          label={
            <span className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-secondary">
                <UserRound className="size-3.5 text-muted" aria-hidden />
              </span>
              <span className="hidden max-w-[8rem] truncate md:inline">{user.name}</span>
            </span>
          }
          items={[
            { id: 'profile', label: `${user.email}` },
            { id: 'role', label: `Role: ${user.role}` },
            { id: 'account', label: 'Account settings' },
          ]}
          onSelect={() => {}}
        />
      </div>

      {noticeOpen ? (
        <div className="absolute top-14 right-3 z-40 w-72 rounded-md border border-line bg-elevated p-3 shadow-lg sm:right-4">
          <p className="text-sm font-semibold text-ink">Prototype notices</p>
          <p className="mt-1 text-xs text-muted">
            Local UI only. No messages are synced from a backend.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => setNoticeOpen(false)}
          >
            Dismiss
          </Button>
        </div>
      ) : null}
    </header>
  )
}
