import { AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from './Button'

export function ErrorState({
  title = 'Something went wrong',
  description = 'This is a prototype error state. No backend request was made.',
  onRetry,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-5',
        className,
      )}
      role="alert"
    >
      <div className="flex items-center gap-2 text-danger">
        <AlertTriangle className="size-4" aria-hidden />
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="text-sm text-muted">{description}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}
