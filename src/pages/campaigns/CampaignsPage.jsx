import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
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
  formatCampaignAudience,
  getCampaignsSummary,
  listStoreCampaigns,
} from '../../lib/campaignsApi'
import { listStoreSegments } from '../../lib/segmentsApi'
import { formatDateTime, statusLabel, statusTone } from '../../lib/format'
import { useActiveStore } from '../../store/useActiveStore'

const PAGE_LIMIT = 25

export function CampaignsPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [tab, setTab] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)

  const [campaigns, setCampaigns] = useState([])
  const [summary, setSummary] = useState({ total: 0, draft: 0, scheduled: 0 })
  const [segmentNames, setSegmentNames] = useState(() => new Map())
  const [nextCursor, setNextCursor] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [loadedStoreId, setLoadedStoreId] = useState(null)
  const [failedStoreId, setFailedStoreId] = useState(null)
  const [listLoading, setListLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshNonce, setRefreshNonce] = useState(0)

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(query.trim()), 250)
    return () => window.clearTimeout(handle)
  }, [query])

  const reload = useCallback(() => {
    setLoadedStoreId(null)
    setFailedStoreId(null)
    setRefreshNonce((n) => n + 1)
  }, [])

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId) return undefined
    let cancelled = false
    setListLoading(true)

    const status = tab === 'all' ? null : tab
    Promise.all([
      listStoreCampaigns(storeId, {
        q: debouncedQuery || null,
        status,
        limit: PAGE_LIMIT,
      }),
      getCampaignsSummary(storeId),
      listStoreSegments(storeId),
    ])
      .then(([page, nextSummary, segments]) => {
        if (cancelled) return
        setCampaigns(page.data)
        setNextCursor(page.nextCursor)
        setSummary(nextSummary)
        setSegmentNames(new Map(segments.map((segment) => [segment.id, segment.name])))
        setLoadError('')
        setFailedStoreId(null)
        setLoadedStoreId(storeId)
      })
      .catch((error) => {
        if (cancelled) return
        setCampaigns([])
        setNextCursor(null)
        setSummary({ total: 0, draft: 0, scheduled: 0 })
        setLoadedStoreId(null)
        setFailedStoreId(storeId)
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load campaigns.')
      })
      .finally(() => {
        if (!cancelled) setListLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [storeId, storeStatus, tab, debouncedQuery, refreshNonce])

  const loadMore = async () => {
    if (!storeId || !nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await listStoreCampaigns(storeId, {
        q: debouncedQuery || null,
        status: tab === 'all' ? null : tab,
        cursor: nextCursor,
        limit: PAGE_LIMIT,
      })
      setCampaigns((current) => [...current, ...page.data])
      setNextCursor(page.nextCursor)
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : 'Unable to load more campaigns.')
    } finally {
      setLoadingMore(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Campaign',
        render: (row) => (
          <Link to={`/campaigns/${row.id}`} className="font-medium text-ink hover:text-electric">
            {row.name}
          </Link>
        ),
      },
      {
        key: 'channel',
        label: 'Channel',
        render: (row) => <Badge tone="info">{String(row.channel || '').toUpperCase()}</Badge>,
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>,
      },
      {
        key: 'audience',
        label: 'Audience',
        render: (row) => formatCampaignAudience(row, segmentNames),
      },
      {
        key: 'scheduled_at',
        label: 'Send time',
        render: (row) => formatDateTime(row.scheduled_at),
      },
    ],
    [segmentNames],
  )

  const missingStore = storeStatus !== 'loading' && !storeId
  const ready = Boolean(storeId) && loadedStoreId === storeId
  const failed = Boolean(storeId) && failedStoreId === storeId && !ready
  const showEmpty = ready && !listLoading && campaigns.length === 0

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description={
          activeStore
            ? `Compose and schedule email or SMS campaigns for ${activeStore.name}. Delivery is not connected yet.`
            : 'Compose and schedule email or SMS campaigns. Delivery is not connected yet.'
        }
        actions={
          <Button onClick={() => setCreateOpen(true)} disabled={!storeId}>
            <Plus className="size-4" />
            Create campaign
          </Button>
        }
      />

      {storeStatus === 'loading' ? <LoadingState label="Loading store…" /> : null}

      {missingStore ? (
        <EmptyState
          title="Select a store"
          description="Campaigns are scoped to a store."
          actionLabel="Go to Store settings"
          onAction={() => navigate('/settings/store')}
        />
      ) : null}

      {storeId ? (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <MetricCard label="Total" value={summary.total} />
            <MetricCard label="Drafts" value={summary.draft} />
            <MetricCard label="Scheduled" value={summary.scheduled} />
          </div>

          <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { value: 'all', label: 'All' },
                { value: 'draft', label: 'Draft' },
                { value: 'scheduled', label: 'Scheduled' },
              ]}
            />
            <SearchInput
              className="w-full sm:w-72"
              placeholder="Search campaigns"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </>
      ) : null}

      {storeId && listLoading && campaigns.length === 0 ? (
        <LoadingState label="Loading campaigns…" />
      ) : null}

      {failed ? (
        <ErrorState title="Unable to load campaigns" description={loadError} onRetry={reload} />
      ) : null}

      {showEmpty ? (
        <EmptyState
          title="No campaigns match"
          description="Create an email or SMS campaign to get started."
          actionLabel="Create campaign"
          onAction={() => setCreateOpen(true)}
        />
      ) : null}

      {ready && campaigns.length > 0 ? (
        <>
          <Table columns={columns} rows={campaigns} />
          {nextCursor ? (
            <div className="mt-3 flex justify-center">
              <Button variant="secondary" disabled={loadingMore} onClick={loadMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Choose campaign type"
        footer={
          <Button variant="ghost" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-lg border border-line bg-midnight p-4 text-left hover:border-electric"
            onClick={() => navigate('/campaigns/new/email')}
          >
            <p className="font-semibold text-ink">Email campaign</p>
            <p className="mt-1 text-sm text-muted">Subject, content, audience and schedule.</p>
          </button>
          <button
            type="button"
            className="rounded-lg border border-line bg-midnight p-4 text-left hover:border-cantaloupe"
            onClick={() => navigate('/campaigns/new/sms')}
          >
            <p className="font-semibold text-ink">SMS campaign</p>
            <p className="mt-1 text-sm text-muted">Short message, audience and send time.</p>
          </button>
        </div>
      </Modal>
    </div>
  )
}
