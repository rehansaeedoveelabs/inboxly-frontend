import { useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import {
  PageHeader,
  Select,
  Badge,
  EmptyState,
  Card,
  Button,
} from '../../components/ui'
import { getLiveEvents } from '../../mock'
import { formatDateTime } from '../../lib/format'

const typeLabels = {
  viewed_product: 'Product view',
  added_to_cart: 'Added to cart',
  form_submit: 'Form submit',
  placed_order: 'Order',
  email_open: 'Email open',
}

export function LiveActivityPage() {
  const [filter, setFilter] = useState('all')
  const [showEmpty, setShowEmpty] = useState(false)
  const events = getLiveEvents()

  const rows = useMemo(() => {
    if (showEmpty) return []
    if (filter === 'all') return events
    return events.filter((event) => event.type === filter)
  }, [events, filter, showEmpty])

  return (
    <div>
      <PageHeader
        title="Live activity"
        description="Monitor recent storefront and engagement events. Prototype feed only."
        actions={
          <Button variant="secondary" size="sm" onClick={() => setShowEmpty((value) => !value)}>
            {showEmpty ? 'Show mock events' : 'Show empty state'}
          </Button>
        }
      />

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Tracking last 7 days of demo activity for the selected store.
        </p>
        <Select
          className="w-full sm:w-56"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter events"
        >
          <option value="all">All events ({events.length})</option>
          <option value="viewed_product">Product views</option>
          <option value="added_to_cart">Cart adds</option>
          <option value="form_submit">Form submits</option>
          <option value="placed_order">Orders</option>
          <option value="email_open">Email opens</option>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Still no contact activity"
          description="When storefront tracking is active, live events will appear here. This empty state is demoable in the prototype."
          actionLabel="Reset filter"
          onAction={() => {
            setFilter('all')
            setShowEmpty(false)
          }}
        />
      ) : (
        <Card padding={false}>
          <ul className="divide-y divide-line">
            {rows.map((event) => (
              <li key={event.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge tone="info">{typeLabels[event.type] || event.type}</Badge>
                    <span className="text-sm font-medium text-ink">{event.contact}</span>
                  </div>
                  <p className="text-sm text-muted">{event.detail}</p>
                </div>
                <p className="shrink-0 text-xs text-muted">{formatDateTime(event.at)}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
