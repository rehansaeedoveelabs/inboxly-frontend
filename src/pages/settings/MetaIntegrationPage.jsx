import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Cable, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import {
  PageHeader,
  Card,
  Badge,
  Button,
  EmptyState,
  LoadingState,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import { cn } from '../../lib/cn'
import {
  discoverMetaPages,
  disconnectMetaConnection,
  getMetaConnection,
  removeMetaPage,
  selectMetaPages,
  setDefaultMetaPage,
  startMetaOAuth,
} from '../../lib/metaApi'
import { useActiveStore } from '../../store/useActiveStore'

function statusTone(status) {
  if (status === 'connected') return 'success'
  if (status === 'needs_reauth') return 'warning'
  return 'neutral'
}

function statusLabel(status) {
  if (status === 'connected') return 'Connected'
  if (status === 'needs_reauth') return 'Reauthentication required'
  return 'Not connected'
}

export function MetaIntegrationPage() {
  const { activeStore, status: storeStatus } = useActiveStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState(null)
  const [connectionPayload, setConnectionPayload] = useState(null)
  const [discovered, setDiscovered] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [discovering, setDiscovering] = useState(false)

  const oauthFlash = useMemo(() => {
    const meta = searchParams.get('meta')
    if (meta === 'connected') {
      return { tone: 'success', message: 'Meta connection completed for the selected store.' }
    }
    if (meta === 'error') {
      const reason = searchParams.get('reason') || 'unknown'
      return {
        tone: 'danger',
        message: `Meta connection did not complete (${reason}). Reconnect when ready.`,
      }
    }
    return null
  }, [searchParams])

  const loadConnection = useCallback(async () => {
    if (!activeStore?.id) {
      setConnectionPayload(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await getMetaConnection(activeStore.id)
      setConnectionPayload(data)
      const pages = Array.isArray(data.pages) ? data.pages : []
      setSelectedIds(pages.map((page) => page.meta_page_id).filter(Boolean))
    } catch (err) {
      setConnectionPayload(null)
      setError(err instanceof ApiError ? err.message : 'Unable to load Meta connection.')
    } finally {
      setLoading(false)
    }
  }, [activeStore?.id])

  useEffect(() => {
    loadConnection()
  }, [loadConnection])

  const connected = Boolean(connectionPayload?.connected)
  const connection = connectionPayload?.connection
  const pages = Array.isArray(connectionPayload?.pages) ? connectionPayload.pages : []
  const needsReauth = connection?.status === 'needs_reauth'

  const onConnect = async ({ reconnect = false } = {}) => {
    if (!activeStore?.id) return
    setBusy(true)
    setError('')
    try {
      await startMetaOAuth({ storeId: activeStore.id })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : reconnect
            ? 'Network error while starting Meta reconnection.'
            : 'Network error while starting Meta connection.',
      )
      setBusy(false)
    }
  }

  const onDisconnect = async () => {
    if (!activeStore?.id) return
    if (!window.confirm('Disconnect Meta from this store? Selected Page tokens will be removed.')) {
      return
    }
    setBusy(true)
    setError('')
    try {
      await disconnectMetaConnection(activeStore.id)
      setFlash({ tone: 'success', message: 'Meta disconnected for this store.' })
      setDiscovered([])
      await loadConnection()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to disconnect Meta.')
    } finally {
      setBusy(false)
    }
  }

  const onDiscover = async () => {
    if (!activeStore?.id) return
    setDiscovering(true)
    setError('')
    try {
      const list = await discoverMetaPages(activeStore.id)
      setDiscovered(list)
      setSelectedIds((current) => {
        const available = new Set(list.map((page) => page.id))
        const kept = current.filter((id) => available.has(id))
        return kept.length > 0 ? kept : list.filter((p) => p.already_selected).map((p) => p.id)
      })
    } catch (err) {
      setDiscovered([])
      setError(err instanceof ApiError ? err.message : 'Unable to discover Facebook Pages.')
    } finally {
      setDiscovering(false)
    }
  }

  const toggleDiscovered = (pageId) => {
    setSelectedIds((current) =>
      current.includes(pageId) ? current.filter((id) => id !== pageId) : [...current, pageId],
    )
  }

  const onSaveSelection = async () => {
    if (!activeStore?.id || selectedIds.length === 0) return
    setBusy(true)
    setError('')
    try {
      const defaultExisting = pages.find((page) => page.is_default)?.meta_page_id
      const defaultPageId = selectedIds.includes(defaultExisting) ? defaultExisting : selectedIds[0]
      await selectMetaPages(activeStore.id, { pageIds: selectedIds, defaultPageId })
      setFlash({ tone: 'success', message: 'Selected Facebook Pages were saved.' })
      setDiscovered([])
      await loadConnection()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to save Page selection.')
    } finally {
      setBusy(false)
    }
  }

  const onSetDefault = async (pageRowId) => {
    if (!activeStore?.id) return
    setBusy(true)
    setError('')
    try {
      await setDefaultMetaPage(activeStore.id, pageRowId)
      await loadConnection()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to set default Page.')
    } finally {
      setBusy(false)
    }
  }

  const onRemovePage = async (pageRowId) => {
    if (!activeStore?.id) return
    if (!window.confirm('Remove this Facebook Page from the store?')) return
    setBusy(true)
    setError('')
    try {
      await removeMetaPage(activeStore.id, pageRowId)
      await loadConnection()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to remove Page.')
    } finally {
      setBusy(false)
    }
  }

  const statusFlash = flash || oauthFlash

  if (storeStatus === 'loading' || loading) {
    return <LoadingState label="Loading Meta integration…" />
  }

  if (!activeStore) {
    return (
      <EmptyState
        title="Select a store"
        description="Choose an active store to connect Meta / Facebook Pages."
        actionLabel="Store settings"
        onAction={() => navigate('/settings/store')}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Meta integration"
        description={`Connect Facebook Pages for ${activeStore.name}. Publishing campaigns to Pages arrives in a later phase.`}
        actions={
          <>
            <Badge tone={statusTone(connection?.status)}>
              {statusLabel(connected ? connection?.status : null)}
            </Badge>
            {!connected || needsReauth ? (
              <Button disabled={busy || activeStore.is_demo} onClick={() => onConnect({ reconnect: needsReauth })}>
                {needsReauth ? 'Reconnect Meta' : 'Connect Meta'}
              </Button>
            ) : null}
            {connected ? (
              <Button variant="danger" disabled={busy} onClick={onDisconnect}>
                Disconnect
              </Button>
            ) : null}
          </>
        }
      />

      {statusFlash ? (
        <p
          className={cn(
            'mb-3 rounded-md border px-3 py-2 text-sm',
            statusFlash.tone === 'success'
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-danger/30 bg-danger/10 text-danger',
          )}
          role="status"
        >
          {statusFlash.message}
        </p>
      ) : null}

      {error ? (
        <p className="mb-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {activeStore.is_demo ? (
        <p className="mb-3 rounded-md border border-line bg-midnight px-3 py-2 text-sm text-muted">
          Demo stores cannot connect to Meta.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-start gap-3">
            <Cable className="mt-0.5 size-5 text-electric" aria-hidden />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-ink">Connection</h2>
              <p className="mt-1 text-sm text-muted">
                Store-scoped Meta Login. Access tokens stay on the server and are never shown here.
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Status</dt>
                  <dd className="text-ink">{statusLabel(connected ? connection?.status : null)}</dd>
                </div>
                {connection?.meta_user_id ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Meta user</dt>
                    <dd className="truncate text-ink">{connection.meta_user_id}</dd>
                  </div>
                ) : null}
                {connection?.connected_at ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Connected</dt>
                    <dd className="text-ink">{formatDateTime(connection.connected_at)}</dd>
                  </div>
                ) : null}
                {connection?.user_token_expires_at ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">User token expires</dt>
                    <dd className="text-ink">{formatDateTime(connection.user_token_expires_at)}</dd>
                  </div>
                ) : null}
                {connection?.data_access_expires_at ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Data access expires</dt>
                    <dd className="text-ink">{formatDateTime(connection.data_access_expires_at)}</dd>
                  </div>
                ) : null}
                {connection?.last_error_code ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Last error</dt>
                    <dd className="text-right text-ink">{connection.last_error_code}</dd>
                  </div>
                ) : null}
              </dl>
              {needsReauth ? (
                <p className="mt-3 flex items-start gap-2 text-sm text-warning">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {connection?.last_error_message ||
                    'Meta requires reauthentication before Pages can be refreshed or used.'}
                </p>
              ) : null}
              {!connected ? (
                <p className="mt-3 text-sm text-muted">
                  Admins can connect Meta for this store. With the fake driver, connection completes
                  against Inboxly&apos;s simulated provider (not a real Facebook account).
                </p>
              ) : null}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Selected Pages</h2>
          <p className="mt-1 text-sm text-muted">
            Only explicitly selected Pages store access tokens. Discover Pages, choose which to keep,
            then set a default publishing destination.
          </p>

          {pages.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No Pages selected yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {pages.map((page) => (
                <li
                  key={page.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-line bg-midnight px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{page.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{page.meta_page_id}</p>
                    {page.is_default ? <Badge tone="info">Default</Badge> : null}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    {!page.is_default ? (
                      <Button variant="secondary" disabled={busy} onClick={() => onSetDefault(page.id)}>
                        Make default
                      </Button>
                    ) : null}
                    <Button variant="danger" disabled={busy} onClick={() => onRemovePage(page.id)}>
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {connected && !needsReauth ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" disabled={busy || discovering} onClick={onDiscover}>
                {discovering ? 'Discovering…' : 'Discover Pages'}
              </Button>
              {discovered.length > 0 ? (
                <Button disabled={busy || selectedIds.length === 0} onClick={onSaveSelection}>
                  Save selection
                </Button>
              ) : null}
            </div>
          ) : null}
        </Card>
      </div>

      {discovered.length > 0 ? (
        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-ink">Discovered Pages</h2>
          <p className="mt-1 text-sm text-muted">
            Choose Pages to keep. Tokens for unselected Pages are not stored.
          </p>
          <ul className="mt-4 space-y-2">
            {discovered.map((page) => {
              const checked = selectedIds.includes(page.id)
              return (
                <li key={page.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-midnight px-3 py-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={() => toggleDiscovered(page.id)}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">{page.name}</span>
                      <span className="mt-0.5 block text-xs text-muted">{page.id}</span>
                      {Array.isArray(page.tasks) && page.tasks.length > 0 ? (
                        <span className="mt-1 block text-xs text-muted">Tasks: {page.tasks.join(', ')}</span>
                      ) : null}
                      {page.already_selected ? (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-success">
                          <CheckCircle2 className="size-3.5" aria-hidden /> Already selected
                        </span>
                      ) : null}
                    </span>
                    {checked ? (
                      <CheckCircle2 className="ml-auto size-4 shrink-0 text-success" aria-hidden />
                    ) : (
                      <XCircle className="ml-auto size-4 shrink-0 text-muted" aria-hidden />
                    )}
                  </label>
                </li>
              )
            })}
          </ul>
        </Card>
      ) : null}
    </div>
  )
}
