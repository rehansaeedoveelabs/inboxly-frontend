import { cn } from '../../lib/cn'

export function ChartContainer({ title, actions, children, className, height = 260 }) {
  return (
    <div className={cn('rounded-lg border border-line bg-elevated p-4', className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        {title ? <h3 className="text-sm font-semibold text-ink">{title}</h3> : <span />}
        {actions}
      </div>
      <div style={{ height }} className="w-full">
        {children}
      </div>
    </div>
  )
}
