import { cn } from '../../lib/cn'

const tones = {
  neutral: 'bg-secondary text-muted border-line',
  info: 'bg-electric/15 text-electric border-electric/30',
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
  accent: 'bg-cantaloupe/15 text-cantaloupe-ink border-cantaloupe/30',
}

export function Badge({ children, tone = 'neutral', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
