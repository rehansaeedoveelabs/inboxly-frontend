import { useMemo, useState } from 'react'
import { Package, RefreshCw, Search } from 'lucide-react'
import { Button, Input } from '../ui'
import { cn } from '../../lib/cn'

/**
 * Pick a synced Shopify product for an email Product block.
 */
export function EmailProductPicker({
  products = [],
  value = null,
  loading = false,
  error = '',
  onSelect,
  onRefresh,
  onSearch,
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((row) => {
      const hay = `${row.title || ''} ${row.handle || ''} ${row.vendor || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [products, query])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" />
          <Input
            className="h-9 pl-8"
            value={query}
            onChange={(event) => {
              const next = event.target.value
              setQuery(next)
              onSearch?.(next)
            }}
            placeholder="Search products…"
          />
        </div>
        {onRefresh ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={onRefresh}
            aria-label="Refresh products"
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="text-[11px] text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {loading && products.length === 0 ? (
        <p className="text-[11px] text-muted">Loading products…</p>
      ) : null}

      {!loading && filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-midnight/40 px-3 py-4 text-center">
          <Package className="mx-auto size-5 text-muted" />
          <p className="mt-2 text-[11px] text-muted">
            No synced products yet. Connect Shopify and run Commerce sync from Storefront settings.
          </p>
        </div>
      ) : (
        <ul className="max-h-56 space-y-1.5 overflow-y-auto pr-0.5 scrollbar-thin">
          {filtered.map((product) => {
            const selected = value === product.id
            return (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => onSelect?.(product)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg border px-2 py-2 text-left transition',
                    selected
                      ? 'border-electric bg-electric/10'
                      : 'border-line bg-midnight/40 hover:border-electric/40',
                  )}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-elevated">
                    {product.featured_image_url ? (
                      <img
                        src={product.featured_image_url}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <Package className="size-4 text-muted" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold text-ink">
                      {product.title || 'Untitled product'}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-muted">
                      {[
                        product.currency_code && product.price_min
                          ? `${product.currency_code} ${product.price_min}`
                          : null,
                        product.handle || product.status || 'Product',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
