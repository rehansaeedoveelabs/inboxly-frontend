import { cn } from '../../lib/cn'

const fieldBase =
  'w-full rounded-md border border-line bg-midnight px-3 py-2 text-sm text-ink placeholder:text-muted/70 transition-colors focus:border-electric focus:outline-none'

export function Input({ className, ...props }) {
  return <input className={cn(fieldBase, 'h-9', className)} {...props} />
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn(fieldBase, 'min-h-[5.5rem] resize-y', className)} {...props} />
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(fieldBase, 'h-9 pr-8', className)} {...props}>
      {children}
    </select>
  )
}

export function FormField({ label, htmlFor, hint, error, children, className }) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)} htmlFor={htmlFor}>
      {label ? <span className="text-sm font-medium text-ink">{label}</span> : null}
      {children}
      {hint && !error ? <span className="text-xs text-muted">{hint}</span> : null}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  )
}
