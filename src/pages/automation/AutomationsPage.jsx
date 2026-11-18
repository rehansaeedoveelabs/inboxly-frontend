import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Workflow } from 'lucide-react'
import {
  PageHeader,
  Button,
  SearchInput,
  Table,
  Badge,
  Tabs,
  EmptyState,
} from '../../components/ui'
import { useActiveStore } from '../../store/useActiveStore'
import { ApiError } from '../../lib/api'
import { getAutomationsSummary, listStoreAutomations } from '../../lib/automationsApi'
import { formatDateTime, formatNumber, statusLabel, statusTone } from '../../lib/format'

export function AutomationsPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id
  const storeLoading = storeStatus === 'loading'

  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!storeId) {
      setRows([])
      setSummary(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const params = { limit: 50 }
      if (query.trim()) params.q = query.trim()
      if (tab !== 'all') params.status = tab

      const [page, summaryPayload] = await Promise.all([
        listStoreAutomations(storeId, params),
        getAutomationsSummary(storeId),
      ])
      setRows(page.data || [])
      setSummary(summaryPayload)
    } catch (err) {
      setRows([])
      setSummary(null)
      setError(err instanceof ApiError ? err.message : 'Unable to load automations.')
    } finally {
      setLoading(false)
    }
  }, [storeId, query, tab])

  useEffect(() => {
    load()
  }, [load])

  const columns = [
    {
      key: 'name',
      label: 'Automation',
      render: (row) => (
        <Link to={`/automation/${row.id}`} className="font-medium text-ink hover:text-electric">
          {row.name}
        </Link>
      ),
    },
    {
      key: 'trigger_type',
      label: 'Trigger',
      render: (row) => row.trigger_type || '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>,
    },
    {
      key: 'enrollments_count',
      label: 'Enrolled',
      render: (row) => formatNumber(row.enrollments_count ?? 0),
    },
    {
      key: 'updated_at',
      label: 'Updated',
      render: (row) => formatDateTime(row.updated_at),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Automation"
        description={
          activeStore
            ? `Welcome and lifecycle workflows for ${activeStore.name}.`
            : 'Select a store to manage automations.'
        }
        actions={
          <Button disabled={!storeId} onClick={() => navigate('/automation/new')}>
            <Plus className="size-4" />
            Create welcome automation
          </Button>
        }
      />

      {summary && (
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          {[
            ['Total', summary.total],
            ['Draft', summary.draft],
            ['Active', summary.active],
            ['Paused', summary.paused],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line bg-panel px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
              <p className="text-lg font-semibold text-ink">{formatNumber(value ?? 0)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'paused', label: 'Paused' },
            { value: 'draft', label: 'Draft' },
            { value: 'archived', label: 'Archived' },
          ]}
        />
        <SearchInput
          className="w-full sm:w-72"
          placeholder="Search automations"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {storeLoading || loading ? (
        <p className="text-sm text-muted">Loading automations…</p>
      ) : error ? (
        <EmptyState
          icon={Workflow}
          title="Unable to load automations"
          description={error}
          actionLabel="Retry"
          onAction={load}
        />
      ) : !storeId ? (
        <EmptyState
          icon={Workflow}
          title="No store selected"
          description="Choose an active store to view automations."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="No automations yet"
          description="Create a welcome automation that sends when a contact subscribes to email."
          actionLabel="Create welcome automation"
          onAction={() => navigate('/automation/new')}
        />
      ) : (
        <Table columns={columns} rows={rows} />
      )}
    </div>
  )
}
