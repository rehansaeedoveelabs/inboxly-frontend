import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FormInput, Plus } from 'lucide-react'
import {
  PageHeader,
  Button,
  Tabs,
  SearchInput,
  Table,
  Badge,
  MetricCard,
  EmptyState,
  Modal,
  LoadingState,
  ErrorState,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import {
  createStoreForm,
  defaultFormDefinition,
  getStoreFormsSummary,
  listStoreForms,
} from '../../lib/formsApi'
import { formatDateTime, formatNumber, statusLabel, statusTone } from '../../lib/format'
import { useActiveStore } from '../../store/useActiveStore'

const PAGE_LIMIT = 50

export function FormsPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const [forms, setForms] = useState([])
  const [summary, setSummary] = useState({ total: 0, enabled: 0, draft: 0 })
  const [listLoading, setListLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [refreshNonce, setRefreshNonce] = useState(0)
  const listRequestId = useRef(0)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250)
    return () => window.clearTimeout(timer)
  }, [query])

  const reload = useCallback(() => setRefreshNonce((n) => n + 1), [])

  const listParams = useMemo(() => {
    const params = { q: debouncedQuery || null, limit: PAGE_LIMIT }
    if (['popup', 'embedded', 'landing_page', 'flyout', 'fullscreen'].includes(tab)) {
      params.type = tab
    }
    if (tab === 'enabled' || tab === 'draft') params.status = tab
    return params
  }, [debouncedQuery, tab])

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId) return undefined

    const requestId = ++listRequestId.current
    setListLoading(true)
    setLoadError('')

    Promise.all([
      listStoreForms(storeId, listParams),
      getStoreFormsSummary(storeId),
    ])
      .then(([page, stats]) => {
        if (listRequestId.current !== requestId) return
        setForms(page.data)
        setSummary(stats)
      })
      .catch((error) => {
        if (listRequestId.current !== requestId) return
        setForms([])
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load forms.')
      })
      .finally(() => {
        if (listRequestId.current === requestId) setListLoading(false)
      })

    return undefined
  }, [storeId, storeStatus, listParams, refreshNonce])

  const createBlank = async (type) => {
    if (!storeId || creating) return
    setCreating(true)
    setActionError('')
    try {
      const labels = {
        popup: 'New popup form',
        embedded: 'New embedded form',
        landing_page: 'New landing page form',
        flyout: 'New flyout form',
        fullscreen: 'New fullscreen form',
      }
      const created = await createStoreForm(storeId, {
        name: labels[type] || 'New form',
        type,
        definition: defaultFormDefinition(),
      })
      setCreateOpen(false)
      navigate(`/forms/${created.id}`)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : 'Unable to create the form.')
    } finally {
      setCreating(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Form',
      render: (row) => (
        <Link to={`/forms/${row.id}`} className="font-medium text-ink hover:text-electric">
          {row.name}
        </Link>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => <Badge tone="info">{row.type}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>,
    },
    {
      key: 'submissions',
      label: 'Submissions',
      render: (row) => formatNumber(row.submissions_count ?? 0),
    },
    {
      key: 'updatedAt',
      label: 'Updated',
      render: (row) => formatDateTime(row.updated_at),
    },
  ]

  if (storeStatus === 'loading') {
    return <LoadingState label="Loading store…" />
  }

  if (!storeId) {
    return (
      <EmptyState
        title="Select a store"
        description="Forms are scoped to a store."
        actionLabel="Go to Store settings"
        onAction={() => navigate('/settings/store')}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Forms"
        description={`Popups, embeds, landing pages, and gamified captures for ${activeStore?.name || 'your store'}.`}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/forms/templates')}>
              Browse templates
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Create form
            </Button>
          </>
        }
      />

      {actionError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Total forms" value={summary.total} />
        <MetricCard label="Enabled" value={summary.enabled} />
        <MetricCard label="Drafts" value={summary.draft} />
      </div>

      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'all', label: 'All' },
            { value: 'popup', label: 'Popup' },
            { value: 'embedded', label: 'Embedded' },
            { value: 'landing_page', label: 'Landing' },
            { value: 'flyout', label: 'Flyout' },
            { value: 'fullscreen', label: 'Fullscreen' },
            { value: 'enabled', label: 'Enabled' },
            { value: 'draft', label: 'Draft' },
          ]}
        />
        <SearchInput
          className="w-full sm:w-72"
          placeholder="Search forms"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {listLoading ? (
        <LoadingState label="Loading forms…" />
      ) : loadError ? (
        <ErrorState title="Unable to load forms" description={loadError} onRetry={reload} />
      ) : forms.length === 0 ? (
        <EmptyState
          icon={FormInput}
          title="No forms yet"
          description="Pick a template or start blank to collect subscribers."
          actionLabel="Browse templates"
          onAction={() => navigate('/forms/templates')}
        />
      ) : (
        <Table columns={columns} rows={forms} />
      )}

      <Modal
        open={createOpen}
        onClose={() => {
          if (creating) return
          setCreateOpen(false)
        }}
        title="Create form"
        footer={null}
      >
        <div className="space-y-3">
          <button
            type="button"
            disabled={creating}
            onClick={() => {
              setCreateOpen(false)
              navigate('/forms/templates')
            }}
            className="w-full rounded-xl border border-electric/40 bg-electric/10 p-4 text-left transition hover:border-electric disabled:opacity-60"
          >
            <p className="font-semibold text-ink">Choose a template</p>
            <p className="mt-1 text-sm text-muted">
              Browse 100+ popup, embedded, landing, flyout, and fullscreen templates.
            </p>
          </button>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['popup', 'Popup', 'Overlay after delay or exit intent.'],
              ['embedded', 'Embedded', 'Inline block for pages and footers.'],
              ['landing_page', 'Landing page', 'Dedicated full-page signup.'],
              ['flyout', 'Flyout', 'Discreet side panel offer.'],
              ['fullscreen', 'Fullscreen', 'Immersive takeover capture.'],
            ].map(([type, label, hint]) => (
              <button
                key={type}
                type="button"
                disabled={creating}
                onClick={() => createBlank(type)}
                className="rounded-xl border border-line bg-elevated p-4 text-left transition hover:border-electric/50 disabled:opacity-60"
              >
                <p className="font-semibold text-ink">{label}</p>
                <p className="mt-1 text-sm text-muted">{hint}</p>
              </button>
            ))}
          </div>
        </div>
        {creating ? <p className="mt-3 text-sm text-muted">Creating…</p> : null}
      </Modal>
    </div>
  )
}
