import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import {
  PageHeader,
  Select,
  Badge,
  EmptyState,
  Card,
  Button,
  LoadingState,
  ErrorState,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import { getStoreInsightsActivity } from '../../lib/insightsApi'
import { formatDateTime } from '../../lib/format'
import { useActiveStore } from '../../store/useActiveStore'

const typeLabels = {
  form_submit: 'Form submit',
  contact_created: 'New contact',
  subscribed: 'Subscribed',
  consent_change: 'Consent change',
}

export function LiveActivityPage() {
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id
  const [filter, setFilter] = useState('all')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!storeId) {
      setEvents([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await getStoreInsightsActivity(storeId)
      setEvents(result.data || [])
    } catch (err) {
      setEvents([])
      setError(err instanceof ApiError ? err.message : 'Unable to load live activity.')
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    if (storeStatus === 'loading') return
    load()
  }, [storeStatus, load])

  const rows = useMemo(() => {
    if (filter === 'all') return events
    return events.filter((event) => event.type === filter)
  }, [events, filter])

  if (storeStatus === 'loading' || loading) {
    return <LoadingState label="Loading live activity…" />
  }

  if (!storeId) {
    return (
      <EmptyState
        title="Select a store"
        description="Live activity is scoped to the active store."
      />
    )
  }

  if (error) {
    return (
      <ErrorState title="Unable to load activity" description={error} onRetry={load} />
    )
  }

  return (
    <div>
      <PageHeader
        title="Live activity"
        description={`Recent contacts, form submits, and consent changes for ${activeStore.name}.`}
        actions={
          <Button variant="secondary" size="sm" onClick={load}>
            Refresh
          </Button>
        }
      />

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Last 7 days · {events.length} events</p>
        <Select
          className="w-full sm:w-56"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter events"
        >
          <option value="all">All events ({events.length})</option>
          <option value="form_submit">Form submits</option>
          <option value="contact_created">New contacts</option>
          <option value="subscribed">Subscriptions</option>
          <option value="consent_change">Consent changes</option>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Still no contact activity"
          description="When contacts join, submit forms, or change consent, events appear here."
          actionLabel="Reset filter"
          onAction={() => setFilter('all')}
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
