import { Search } from 'lucide-react'
import { cn } from '../../lib/cn'

export function SearchInput({ className, ...props }) {
  return (
    <div className={cn('relative', className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        type="search"
        className="h-9 w-full rounded-md border border-line bg-midnight py-2 pr-3 pl-9 text-sm text-ink placeholder:text-muted/70 focus:border-electric focus:outline-none"
        {...props}
      />
    </div>
  )
}
