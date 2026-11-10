import { cn } from '../../lib/cn'

export function Card({ children, className, padding = true, as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={cn(
        'rounded-lg border border-line bg-elevated',
        padding && 'p-4',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function MetricCard({ label, value, hint, trend, className }) {
  return (
    <Card className={cn('flex min-h-[5.5rem] flex-col justify-between', className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold tracking-tight text-ink">{value}</p>
        {trend ? <span className="text-xs text-cantaloupe">{trend}</span> : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </Card>
  )
}
