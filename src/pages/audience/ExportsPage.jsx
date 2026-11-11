import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import {
  PageHeader,
  Button,
  Table,
  Badge,
  Modal,
  FormField,
  Input,
  Select,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import {
  canDownloadExport,
  downloadContactExport,
  formatExportFilters,
  getContactExport,
  isExportExpired,
  isExportTerminal,
  listStoreContactExports,
  saveBlobAsFile,
  startContactExport,
} from '../../lib/exportsApi'
import { formatDateTime, statusLabel, statusTone } from '../../lib/format'
import { listStoreTags } from '../../lib/tagsApi'
import { useActiveStore } from '../../store/useActiveStore'

const PAGE_LIMIT = 25
const POLL_INTERVAL_MS = 2000

function upsertExport(list, record) {
  const without = list.filter((item) => item.id !== record.id)
  return [record, ...without]
}

function mergeById(existing, incoming) {
  const map = new Map(existing.map((item) => [item.id, item]))
  for (const item of incoming) {
    map.set(item.id, item)
  }
  return Array.from(map.values()).sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    if (bTime !== aTime) return bTime - aTime
    return String(b.id).localeCompare(String(a.id))
  })
}

export function ExportsPage() {
  const navigate = useNavigate()
  const { activeStore, status: storeStatus } = useActiveStore()
  const storeId = activeStore?.id

  const [exports, setExports] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [listLoading, setListLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [loadMoreError, setLoadMoreError] = useState('')
  const [refreshNonce, setRefreshNonce] = useState(0)
  const [loadedStoreId, setLoadedStoreId] = useState(null)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [tagSlug, setTagSlug] = useState('')
  const [consentEmail, setConsentEmail] = useState('')
  const [tags, setTags] = useState([])
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [banner, setBanner] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)
  const [actionError, setActionError] = useState('')

  const loadMoreInFlight = useRef(false)
  const pollInFlight = useRef(false)
  const listRequestId = useRef(0)

  const openIds = useMemo(
    () =>
      exports
        .filter((item) => !isExportTerminal(item.status))
        .map((item) => item.id)
        .join(','),
    [exports],
  )

  const reloadFirstPage = useCallback(() => {
    setLoadMoreError('')
    setActionError('')
    setRefreshNonce((value) => value + 1)
  }, [])

  useEffect(() => {
    if (storeStatus === 'loading' || !storeId) return undefined

    const requestId = ++listRequestId.current
    let cancelled = false
    setListLoading(true)
    setLoadError('')

    listStoreContactExports(storeId, { limit: PAGE_LIMIT })
      .then((page) => {
        if (cancelled || requestId !== listRequestId.current) return
        setExports(page.data)
        setNextCursor(page.nextCursor)
        setLoadedStoreId(storeId)
        setLoadError('')
      })
      .catch((error) => {
        if (cancelled || requestId !== listRequestId.current) return
        setExports([])
        setNextCursor(null)
        setLoadedStoreId(null)
        setLoadError(error instanceof ApiError ? error.message : 'Unable to load exports.')
      })
      .finally(() => {
        if (!cancelled && requestId === listRequestId.current) {
          setListLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [storeId, storeStatus, refreshNonce])

  useEffect(() => {
    if (!storeId || !openIds) return undefined

    let cancelled = false

    const refreshOpen = async () => {
      if (pollInFlight.current) return
      pollInFlight.current = true
      const ids = openIds.split(',').filter(Boolean)
      try {
        for (const id of ids) {
          if (cancelled) return
          try {
            const latest = await getContactExport(id)
            if (cancelled) return
            setExports((current) => {
              const existing = current.find((item) => item.id === id)
              if (!existing) return current
              return current.map((item) => (item.id === id ? latest : item))
            })
          } catch {
            // Keep prior status on transient poll errors.
          }
        }
      } finally {
        pollInFlight.current = false
      }
    }

    refreshOpen()
    const interval = window.setInterval(refreshOpen, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [storeId, openIds])

  useEffect(() => {
    if (!open || !storeId) return undefined
    let cancelled = false
    listStoreTags(storeId)
      .then((items) => {
        if (!cancelled) setTags(Array.isArray(items) ? items : [])
      })
      .catch(() => {
        if (!cancelled) setTags([])
      })
    return () => {
      cancelled = true
    }
  }, [open, storeId])

  const loadMore = async () => {
    if (!storeId || !nextCursor || loadMoreInFlight.current) return
    loadMoreInFlight.current = true
    setLoadingMore(true)
    setLoadMoreError('')
    try {
      const page = await listStoreContactExports(storeId, {
        cursor: nextCursor,
        limit: PAGE_LIMIT,
      })
      setExports((current) => mergeById(current, page.data))
      setNextCursor(page.nextCursor)
    } catch (error) {
      setLoadMoreError(error instanceof ApiError ? error.message : 'Unable to load more exports.')
    } finally {
      loadMoreInFlight.current = false
      setLoadingMore(false)
    }
  }

  const startExport = async () => {
    if (!storeId || submitting) return
    setFormError('')
    setSubmitting(true)
    try {
      const started = await startContactExport(storeId, {
        q: query,
        tag: tagSlug || undefined,
        consent_email: consentEmail || undefined,
      })
      setExports((current) => upsertExport(current, started))
      setOpen(false)
      setQuery('')
      setTagSlug('')
      setConsentEmail('')
      setBanner('Export started. Status updates automatically while processing.')
      setActionError('')
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)
      } else {
        setFormError('Unable to start the export.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const onDownload = async (row) => {
    if (!canDownloadExport(row) || downloadingId) return
    setDownloadingId(row.id)
    setActionError('')
    try {
      const { blob, filename } = await downloadContactExport(row.id, {
        filenameHint: row.original_filename,
      })
      saveBlobAsFile(blob, filename)
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : 'Unable to download the export.',
      )
      if (error instanceof ApiError && (error.status === 410 || error.status === 404)) {
        try {
          const latest = await getContactExport(row.id)
          setExports((current) => current.map((item) => (item.id === row.id ? latest : item)))
        } catch {
          // Keep row as-is if refresh fails.
        }
      }
    } finally {
      setDownloadingId(null)
    }
  }

  const columns = [
    {
      key: 'original_filename',
      label: 'Export',
      render: (row) => (
        <div>
          <div className="font-medium text-ink">{row.original_filename || 'contacts-export.csv'}</div>
          <div className="text-xs text-muted">{formatExportFilters(row.filters)}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <div className="space-y-1">
          <Badge tone={statusTone(row.status)}>{statusLabel(row.status)}</Badge>
          {row.status === 'completed' && isExportExpired(row) && !row.download_available ? (
            <div className="text-xs text-muted">Expired</div>
          ) : null}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (row) => formatDateTime(row.created_at),
    },
    {
      key: 'processed_rows',
      label: 'Rows',
      render: (row) => {
        if (row.status === 'pending') return '—'
        if (row.status === 'processing') {
          return row.processed_rows != null ? `${row.processed_rows}…` : '…'
        }
        if (row.total_rows != null) {
          return row.processed_rows != null
            ? `${row.processed_rows}/${row.total_rows}`
            : String(row.total_rows)
        }
        return '—'
      },
    },
    {
      key: 'expires_at',
      label: 'Expires',
      render: (row) => formatDateTime(row.expires_at),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => {
        if (canDownloadExport(row)) {
          return (
            <Button
              size="sm"
              variant="secondary"
              disabled={downloadingId === row.id}
              onClick={() => onDownload(row)}
            >
              <Download className="size-3.5" />
              {downloadingId === row.id ? 'Downloading…' : 'Download'}
            </Button>
          )
        }
        if (row.status === 'failed') {
          return <span className="text-xs text-danger">Failed</span>
        }
        if (row.status === 'completed' && !row.download_available) {
          return <span className="text-xs text-muted">Unavailable</span>
        }
        if (!isExportTerminal(row.status)) {
          return <span className="text-xs text-muted">Processing…</span>
        }
        return null
      },
    },
  ]

  const missingStore = storeStatus !== 'loading' && !storeId
  const showTable = storeId && exports.length > 0
  const showEmpty =
    storeId && !listLoading && !loadError && loadedStoreId === storeId && exports.length === 0

  return (
    <div>
      <PageHeader
        title="Exports"
        description={
          activeStore
            ? `CSV exports for ${activeStore.name}. Files are generated in the background and stay private until you download them.`
            : 'Export contacts for the active store.'
        }
        actions={
          <Button onClick={() => setOpen(true)} disabled={!storeId}>
            <Download className="size-4" />
            New export
          </Button>
        }
      />

      {banner ? (
        <p className="mb-3 text-sm text-muted" role="status">
          {banner}
        </p>
      ) : null}

      {actionError ? (
        <p className="mb-3 text-sm text-danger" role="alert">
          {actionError}
        </p>
      ) : null}

      {storeStatus === 'loading' ? <LoadingState label="Loading store…" /> : null}

      {missingStore ? (
        <EmptyState
          icon={Download}
          title="Select a store"
          description="Exports are scoped to a store."
          actionLabel="Go to Store settings"
          onAction={() => navigate('/settings/store')}
        />
      ) : null}

      {storeId && listLoading && exports.length === 0 ? (
        <LoadingState label="Loading exports…" />
      ) : null}

      {storeId && loadError ? (
        <ErrorState title="Unable to load exports" description={loadError} onRetry={reloadFirstPage} />
      ) : null}

      {showEmpty ? (
        <EmptyState
          icon={Download}
          title="No exports yet"
          description="Create an export with optional search, tag, and email-consent filters. Processing runs on the server."
          actionLabel="New export"
          onAction={() => setOpen(true)}
        />
      ) : null}

      {showTable ? (
        <>
          <Table columns={columns} rows={exports} />
          {exports.some((row) => row.error_summary) ? (
            <div className="mt-3 space-y-2">
              {exports
                .filter((row) => row.error_summary)
                .map((row) => (
                  <ErrorState
                    key={`${row.id}-errors`}
                    title={`${row.original_filename || 'Export'} failed`}
                    description={row.error_summary}
                  />
                ))}
            </div>
          ) : null}
          {nextCursor ? (
            <div className="mt-3 flex items-center gap-3">
              <Button variant="secondary" disabled={loadingMore} onClick={loadMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
              {loadMoreError ? (
                <span className="text-sm text-danger" role="alert">
                  {loadMoreError}
                </span>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}

      <Modal
        open={open}
        onClose={() => {
          if (!submitting) setOpen(false)
        }}
        title="Export contacts"
        footer={
          <>
            <Button variant="ghost" disabled={submitting} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={submitting || !storeId} onClick={startExport}>
              {submitting ? 'Starting…' : 'Start export'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {formError ? (
            <p className="text-sm text-danger" role="alert">
              {formError}
            </p>
          ) : null}
          <p className="text-sm text-muted">
            Leave filters empty to export all active contacts for this store. Soft-deleted contacts
            are not included.
          </p>
          <FormField label="Email search" hint="Optional prefix match on email (same as Contacts).">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              disabled={submitting}
              placeholder="e.g. jane@"
            />
          </FormField>
          <FormField label="Tag" hint="Optional tag slug filter.">
            <Select
              value={tagSlug}
              onChange={(event) => setTagSlug(event.target.value)}
              disabled={submitting}
            >
              <option value="">Any tag</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.slug}>
                  {tag.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Email consent">
            <Select
              value={consentEmail}
              onChange={(event) => setConsentEmail(event.target.value)}
              disabled={submitting}
            >
              <option value="">Any status</option>
              <option value="subscribed">Subscribed</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="nonsubscribed">Nonsubscribed</option>
            </Select>
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
