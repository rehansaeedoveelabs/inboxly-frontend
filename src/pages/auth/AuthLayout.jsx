import { ThemeSwitcher } from '../../components/ui'

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-full flex-col bg-midnight text-ink">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 10% -10%, color-mix(in oklab, var(--inboxly-electric) 28%, transparent), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 0%, color-mix(in oklab, var(--inboxly-cantaloupe) 18%, transparent), transparent 50%), radial-gradient(circle at 50% 120%, color-mix(in oklab, var(--inboxly-electric) 12%, transparent), transparent 45%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--inboxly-canvas-dot) 1px, transparent 0)',
          backgroundSize: '22px 22px',
        }}
        aria-hidden
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <p className="font-semibold tracking-tight text-ink">
          Inbox<span className="text-electric">ly</span>
        </p>
        <ThemeSwitcher />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center sm:text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
          </div>

          <div className="rounded-lg border border-line bg-elevated/90 p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.7)] backdrop-blur sm:p-6">
            {children}
          </div>

          {footer ? <div className="mt-5 text-center text-sm text-muted">{footer}</div> : null}
        </div>
      </main>
    </div>
  )
}
