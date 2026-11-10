import { cn } from '../../lib/cn'

export function LoadingState({ label = 'Loading…', className }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3 rounded-lg border border-line bg-elevated px-4 py-10 text-sm text-muted',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className="size-4 animate-spin rounded-full border-2 border-line border-t-electric"
        aria-hidden
      />
      {label}
    </div>
  )
}
