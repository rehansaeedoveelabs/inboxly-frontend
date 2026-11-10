import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../theme/useTheme'
import { cn } from '../../lib/cn'

const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function ThemeSwitcher({ className, compact = false }) {
  const { preference, setPreference } = useTheme()

  return (
    <div
      role="group"
      aria-label="Theme preference"
      className={cn(
        'inline-flex items-center rounded-md border border-line bg-elevated p-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const Icon = option.icon
        const active = preference === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={`${option.label} theme`}
            title={option.label}
            onClick={() => setPreference(option.value)}
            className={cn(
              'inline-flex h-8 items-center justify-center gap-1.5 rounded-sm px-2 text-xs font-medium transition-colors',
              active
                ? 'bg-secondary text-ink'
                : 'text-muted hover:bg-secondary/60 hover:text-ink',
              compact ? 'min-w-8' : 'min-w-8 sm:min-w-[4.25rem]',
            )}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden />
            {!compact ? <span className="hidden sm:inline">{option.label}</span> : null}
          </button>
        )
      })}
    </div>
  )
}
