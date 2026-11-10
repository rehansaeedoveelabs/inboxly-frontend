import { cn } from '../../lib/cn'

const variants = {
  primary:
    'bg-electric text-white hover:bg-electric/90 border border-electric',
  secondary:
    'bg-secondary text-ink hover:bg-secondary/80 border border-line',
  accent:
    'bg-cantaloupe/15 text-cantaloupe-ink hover:bg-cantaloupe/25 border border-cantaloupe/40',
  ghost:
    'bg-transparent text-muted hover:text-ink hover:bg-secondary/60 border border-transparent',
  danger:
    'bg-danger/15 text-danger hover:bg-danger/25 border border-danger/40',
}

const sizes = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-10 px-4 text-sm gap-2',
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
