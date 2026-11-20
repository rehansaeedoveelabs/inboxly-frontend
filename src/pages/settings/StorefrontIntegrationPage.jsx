import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Cable, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import {
  PageHeader,
  Card,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  LoadingState,
} from '../../components/ui'
import { ApiError } from '../../lib/api'
import { cn } from '../../lib/cn'
import { startShopifyOAuth } from '../../lib/shopifyOAuth'
import {
  createShopifyOAuthReturnGate,
  hasHistoricalOrderAccess,
  resolveShopifyOAuthCallback,
  shopifyBlocksCommerceSync,
  shopifyPermissionSummary,
} from '../../lib/shopifyScopes'
import {
  getShopifyCommerceSync,
  isShopifySyncInFlight,
  shopifySyncStatusLabel,
  shopifySyncStatusTone,
  startShopifyCommerceSync,
} from '../../lib/shopifySyncApi'
import { disconnectShopifyStore, storeStatusLabel, storeStatusTone } from '../../lib/storesApi'
import { useActiveStore } from '../../store/useActiveStore'

const SHOPIFY_SYNC_POLL_MS = 2500

function StatusRow({ label, value, ok, detail, tone }) {
  const resolvedTone = tone ?? (ok ? 'success' : 'danger')
  const Icon =
    resolvedTone === 'success'
      ? CheckCircle2
      : resolvedTone === 'warning'
        ? AlertTriangle
        : resolvedTone === 'neutral'
          ? CheckCircle2
          : XCircle
  const iconClass =
    resolvedTone === 'success'
      ? 'text-success'
      : resolvedTone === 'warning'
        ? 'text-cantaloupe-ink'
        : resolvedTone === 'neutral'
          ? 'text-muted'
          : 'text-danger'

  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-line bg-midnight px-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {detail ? <p className="mt-0.5 text-xs text-muted">{detail}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Icon className={cn('size-4', iconClass)} aria-hidden />
        <Badge tone={resolvedTone}>{value}</Badge>
      </div>
    </div>
  )
}

function canConnectStore(store) {
  if (!store || store.is_demo) return false
  return ['pending', 'disconnected', 'error'].includes(store.connection_status)
}

function canReconnectStore(store) {
  if (!store || store.is_demo) return false
  return Boolean(store.is_connected || store.connection_status === 'connected')
}

export function StorefrontIntegrationPage() {
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [disconnectFlash, setDisconnectFlash] = useState(null)
  const [oauthFlash, setOauthFlash] = useState(null)
  const [syncStatus, setSyncStatus] = useState(null)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncStarting, setSyncStarting] = useState(false)
  const [syncError, setSyncError] = useState('')
  const [syncNotice, setSyncNotice] = useState('')
  const oauthGateRef = useRef(createShopifyOAuthReturnGate())
  const selectedStoreIdRef = useRef(null)
  const { activeStore, stores, status, workspace, refreshStores } = useActiveStore()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    selectedStoreIdRef.current = activeStore?.id ?? null
  }, [activeStore?.id])

  const loadShopifySync = useCallback(async () => {
    if (!activeStore?.id || !activeStore?.is_connected) {
      setSyncStatus(null)
      setSyncError('')
      return null
    }

    setSyncLoading(true)
    setSyncError('')
    try {
      const data = await getShopifyCommerceSync(activeStore.id)
      if (selectedStoreIdRef.current !== activeStore.id) return null
      setSyncStatus(data)
      return data
    } catch (error) {
      if (selectedStoreIdRef.current !== activeStore.id) return null
      const message =
        error instanceof ApiError
          ? error.message
          : 'Unable to load Shopify commerce sync status.'
      setSyncError(message)
      return null
    } finally {
      if (selectedStoreIdRef.current === activeStore.id) {
        setSyncLoading(false)
      }
    }
  }, [activeStore?.id, activeStore?.is_connected])

  useEffect(() => {
    loadShopifySync()
  }, [loadShopifySync])

  useEffect(() => {
    if (!isShopifySyncInFlight(syncStatus)) return undefined

    let cancelled = false
    const tick = async () => {
      if (cancelled) return
      await loadShopifySync()
    }

    const interval = window.setInterval(tick, SHOPIFY_SYNC_POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [syncStatus, loadShopifySync])

  useEffect(() => {
    const shopify = searchParams.get('shopify')
    if (!shopify) return

    const reason = searchParams.get('reason')
    const callbackStoreId = searchParams.get('store_id')
    const handleKey = `${shopify}:${reason ?? ''}:${callbackStoreId ?? ''}`
    const gate = oauthGateRef.current
    const begin = gate.begin(handleKey)
    if (begin !== 'run') return

    let abandoned = false

    ;(async () => {
      setConnectError('')
      setDisconnectFlash(null)

      let refreshFailed = false
      let refreshedStores = []
      try {
        const result = await refreshStores()
        if (result && typeof result === 'object' && Array.isArray(result.stores)) {
          refreshedStores = result.stores
          refreshFailed = result.ok === false
        } else {
          // Unexpected return shape — do not treat as a verified store list.
          refreshFailed = true
          refreshedStores = []
        }
      } catch {
        refreshFailed = true
        refreshedStores = []
      }

      if (abandoned) {
        gate.abandon(handleKey)
        return
      }

      const outcome = resolveShopifyOAuthCallback({
        shopify,
        reason,
        callbackStoreId,
        stores: refreshedStores,
        refreshFailed,
        selectedStoreId: selectedStoreIdRef.current,
      })

      if (abandoned) {
        gate.abandon(handleKey)
        return
      }

      if (outcome.flash) {
        setOauthFlash(outcome.flash)
      }

      gate.complete(handleKey)

      if (outcome.clearUrl) {
        navigate('/settings/storefront', { replace: true })
      }
    })()

    return () => {
      // activeStore changes must not permanently suppress retry: abandon only
      // clears in-flight. Completion is recorded after flash/URL handling.
      abandoned = true
      gate.abandon(handleKey)
    }
  }, [searchParams, refreshStores, navigate])

  const statusFlash = disconnectFlash || oauthFlash

  const storeConnected = Boolean(activeStore?.is_connected)
  const canStartOAuth = canConnectStore(activeStore)
  const canReconnect = canReconnectStore(activeStore)
  const permissions = shopifyPermissionSummary(activeStore)
  const needsReauth = permissions.state === 'needs_reauth'
  const blocksCommerceSync = shopifyBlocksCommerceSync(activeStore)
  const historicalOrders = hasHistoricalOrderAccess(activeStore)
  const syncRunStatus =
    syncStatus?.latest_run?.status ?? syncStatus?.summary?.status ?? activeStore?.shopify_sync?.status ?? null
  const syncCounts = syncStatus?.counts ?? {
    customer_identities: Number(activeStore?.shopify_sync?.customers_synced) || 0,
    products: Number(activeStore?.shopify_sync?.products_synced) || 0,
    orders: Number(activeStore?.shopify_sync?.orders_synced) || 0,
  }
  const syncFinishedAt =
    syncStatus?.latest_run?.finished_at ??
    syncStatus?.summary?.finished_at ??
    activeStore?.shopify_sync?.finished_at ??
    null

  const connectShopify = async ({ reconnect = false } = {}) => {
    const allowed = reconnect ? canReconnect : canStartOAuth
    if (!allowed || !activeStore?.id) return
    setConnectError('')
    setOauthFlash(null)
    setConnecting(true)
    try {
      await startShopifyOAuth({ storeId: activeStore.id })
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : reconnect
            ? 'Network error while starting Shopify reconnection.'
            : 'Network error while starting Shopify connection.'
      setConnectError(message)
      setConnecting(false)
    }
  }

  const startCommerceSync = async () => {
    if (!activeStore?.id || syncStarting || blocksCommerceSync) return
    setSyncStarting(true)
    setSyncError('')
    setSyncNotice('')
    try {
      await startShopifyCommerceSync(activeStore.id)
      setSyncNotice('Commerce sync queued. Status updates automatically.')
      await loadShopifySync()
      await refreshStores()
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setSyncError('A sync is already in progress for this store.')
        await loadShopifySync()
      } else {
        setSyncError(
          error instanceof ApiError ? error.message : 'Unable to start Shopify commerce sync.',
        )
      }
    } finally {
      setSyncStarting(false)
    }
  }

  const disconnectShopify = async () => {
    if (!storeConnected || !activeStore?.id || disconnecting) return

    setConnectError('')
    setOauthFlash(null)
    setDisconnectFlash(null)
    setDisconnecting(true)
    try {
      const result = await disconnectShopifyStore(activeStore.id)
      await refreshStores()

      if (result.remote_revoked === true) {
        setDisconnectFlash({
          tone: 'success',
          message:
            'Inboxly was uninstalled from Shopify and the local connection was cleared. Audience data was preserved.',
        })
      } else {
        setDisconnectFlash({
          tone: 'warning',
          message:
            'Inboxly disconnected locally, but Shopify may still show the app as installed. Uninstall Inboxly from Shopify admin if it still appears there. Audience data was preserved.',
        })
      }
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Network error while disconnecting Shopify.'
      setConnectError(message)
      setDisconnectFlash(null)
      throw error instanceof Error ? error : new Error(message)
    } finally {
      setDisconnecting(false)
    }
  }

  const shopLabel = activeStore
    ? activeStore.shopify_shop_domain || activeStore.domain || activeStore.name
    : ''

  return (
    <div>
      <PageHeader
        title="Storefront integration"
        description="New merchants connect Shopify during signup. Use this page to review permissions, reconnect, or run commerce sync."
        actions={<Badge tone="accent">Shopify OAuth</Badge>}
      />

      {statusFlash ? (
        <div
          role="status"
          className={cn(
            'mb-3 rounded-md border px-3 py-2 text-sm',
            statusFlash.tone === 'success'
              ? 'border-success/40 bg-success/10 text-success'
              : statusFlash.tone === 'warning'
                ? 'border-cantaloupe/40 bg-cantaloupe/10 text-cantaloupe-ink'
                : 'border-danger/40 bg-danger/10 text-danger',
          )}
        >
          {statusFlash.message}
        </div>
      ) : null}

      <Card className="mb-4 space-y-3">
        {status === 'loading' ? <LoadingState label="Loading stores…" /> : null}

        {status !== 'loading' && stores.length === 0 ? (
          <EmptyState
            title="No real store to connect"
            description="Create a pending store with your *.myshopify.com domain first. Mock storefronts are not used for OAuth."
            actionLabel="Go to Store settings"
            onAction={() => navigate('/settings/store')}
          />
        ) : null}

        {status !== 'loading' && stores.length > 0 && !activeStore ? (
          <p className="text-sm text-muted">Select a real store from the header before connecting.</p>
        ) : null}

        {activeStore ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">
                {storeConnected ? 'Shopify connected' : 'Connect Shopify'}
              </h3>
              <p className="mt-1 text-xs text-muted">
                Store <span className="text-ink">{activeStore.name}</span> ·{' '}
                <span className="font-mono text-ink">{activeStore.domain}</span>
                {workspace?.name ? <> · workspace {workspace.name}</> : null}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={storeStatusTone(activeStore.connection_status)}>
                  {storeStatusLabel(activeStore.connection_status)}
                </Badge>
                {needsReauth ? <Badge tone="warning">Permissions incomplete</Badge> : null}
              </div>
            </div>
            {canStartOAuth ? (
              <Button onClick={() => connectShopify()} disabled={connecting || disconnecting}>
                <Cable className="size-4" />
                {connecting ? 'Redirecting to Shopify…' : 'Connect Shopify'}
              </Button>
            ) : canReconnect ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="success">Connected</Badge>
                <Button
                  variant={needsReauth ? 'primary' : 'secondary'}
                  onClick={() => connectShopify({ reconnect: true })}
                  disabled={connecting || disconnecting}
                >
                  <Cable className="size-4" />
                  {connecting
                    ? 'Redirecting to Shopify…'
                    : needsReauth
                      ? 'Reconnect Shopify'
                      : 'Reconnect'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setConfirmDisconnect(true)}
                  disabled={disconnecting || connecting}
                >
                  {disconnecting ? 'Disconnecting…' : 'Disconnect'}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted">This store cannot start OAuth in its current state.</p>
            )}
          </div>
        ) : null}

        {stores.length === 0 ? null : (
          <p className="text-xs text-muted">
            Need another store?{' '}
            <Link className="text-electric hover:underline" to="/settings/store">
              Create one in Store settings
            </Link>
            .
          </p>
        )}

        {connectError ? (
          <div
            role="alert"
            className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {connectError}
          </div>
        ) : null}
      </Card>

      {storeConnected ? (
        <Card className="mb-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">Shopify permissions</h3>
              <p className="mt-1 text-xs text-muted">
                Connection status and permission status are separate. Granted scopes come from
                Shopify after OAuth or reconnect — Inboxly never invents them.
              </p>
            </div>
            <Badge tone={needsReauth ? 'warning' : 'success'}>{permissions.label}</Badge>
          </div>

          {needsReauth ? (
            <div
              role="status"
              className="rounded-md border border-cantaloupe/40 bg-cantaloupe/10 px-3 py-3 text-sm text-cantaloupe-ink"
            >
              <p className="font-medium">Additional Shopify permissions are required</p>
              <p className="mt-1 text-xs">{permissions.detail}</p>
              {permissions.missing.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs">
                  {permissions.missing.map((scope) => (
                    <li key={scope.handle}>
                      <span className="font-medium">{scope.label}</span>
                      <span className="text-muted"> ({scope.handle})</span>
                      {scope.reason ? (
                        <span className="mt-0.5 block text-muted">{scope.reason}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
              {canReconnect ? (
                <div className="mt-3">
                  <Button
                    size="sm"
                    onClick={() => connectShopify({ reconnect: true })}
                    disabled={connecting || disconnecting}
                  >
                    <Cable className="size-3.5" />
                    {connecting ? 'Redirecting to Shopify…' : 'Reconnect Shopify'}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-muted">{permissions.detail}</p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-md border border-line bg-midnight px-3 py-3">
              <p className="text-xs font-medium text-ink">Historical order access</p>
              <p className="mt-1 text-xs text-muted">
                {historicalOrders
                  ? 'Granted — both read_orders and read_all_orders are present.'
                  : 'Not granted — requires both read_orders and read_all_orders from Shopify.'}
              </p>
            </div>
            <div className="rounded-md border border-line bg-midnight px-3 py-3">
              <p className="text-xs font-medium text-ink">Protected customer data</p>
              <p className="mt-1 text-xs text-muted">
                Not claimed here. Shopify protected customer data is a separate Partner approval
                and is not implied by these commerce scopes.
              </p>
            </div>
          </div>

          {permissions.granted.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-medium text-ink">Granted scopes</p>
              <ul className="flex flex-wrap gap-2">
                {permissions.granted.map((scope) => (
                  <li key={scope.handle}>
                    <Badge tone="neutral" title={scope.handle}>
                      {scope.label}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-muted">No granted scopes are recorded for this connection yet.</p>
          )}
        </Card>
      ) : null}

      {storeConnected ? (
        <Card className="mb-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">Commerce sync</h3>
              <p className="mt-1 text-xs text-muted">
                Pull customers, products, and orders into Inboxly. Customers appear under Audience
                with name, email, and phone when Shopify provides them.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={shopifySyncStatusTone(syncRunStatus)}>
                {shopifySyncStatusLabel(syncRunStatus)}
              </Badge>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => loadShopifySync()}
                disabled={syncLoading || syncStarting}
              >
                <RefreshCw className={cn('size-3.5', syncLoading ? 'animate-spin' : '')} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => startCommerceSync()}
                disabled={
                  syncStarting ||
                  syncLoading ||
                  blocksCommerceSync ||
                  isShopifySyncInFlight(syncStatus)
                }
              >
                {syncStarting || isShopifySyncInFlight(syncStatus)
                  ? 'Syncing…'
                  : 'Sync now'}
              </Button>
            </div>
          </div>

          {blocksCommerceSync ? (
            <p className="text-xs text-cantaloupe-ink">
              Approve missing Shopify read permissions before starting a commerce sync.
            </p>
          ) : needsReauth ? (
            <p className="text-xs text-muted">
              Commerce sync can run with your current read scopes. Reconnect to approve write_customers
              for contact write-back.
            </p>
          ) : null}

          {syncNotice ? (
            <div
              role="status"
              className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
            >
              {syncNotice}
            </div>
          ) : null}

          {syncError ? (
            <div
              role="alert"
              className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {syncError}
            </div>
          ) : null}

          {syncLoading && !syncStatus ? (
            <LoadingState label="Loading sync status…" />
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-md border border-line bg-midnight px-3 py-3">
                  <p className="text-xs text-muted">Customer IDs</p>
                  <p className="mt-1 text-lg font-semibold text-ink">
                    {syncCounts.customer_identities}
                  </p>
                </div>
                <div className="rounded-md border border-line bg-midnight px-3 py-3">
                  <p className="text-xs text-muted">Products</p>
                  <p className="mt-1 text-lg font-semibold text-ink">{syncCounts.products}</p>
                </div>
                <div className="rounded-md border border-line bg-midnight px-3 py-3">
                  <p className="text-xs text-muted">Orders</p>
                  <p className="mt-1 text-lg font-semibold text-ink">{syncCounts.orders}</p>
                </div>
              </div>
              {syncFinishedAt ? (
                <p className="text-xs text-muted">
                  Last finished {new Date(syncFinishedAt).toLocaleString()}
                </p>
              ) : (
                <p className="text-xs text-muted">No completed sync yet for this store.</p>
              )}
            </>
          )}
        </Card>
      ) : null}

      <Card className="mb-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-ink">Connection health</h3>
            <p className="mt-1 text-xs text-muted">Updated from the current store session</p>
          </div>
        </div>

        <StatusRow
          label="Store connection"
          value={storeConnected ? 'Connected' : 'Not connected'}
          ok={storeConnected}
          detail={
            activeStore
              ? `${activeStore.name} · ${storeStatusLabel(activeStore.connection_status)}`
              : 'No real store selected'
          }
        />
        <StatusRow
          label="Shopify permissions"
          value={
            !storeConnected ? 'Not applicable' : needsReauth ? 'Incomplete' : 'Granted'
          }
          ok={storeConnected && !needsReauth}
          tone={!storeConnected ? 'neutral' : needsReauth ? 'warning' : 'success'}
          detail={
            !storeConnected
              ? 'Connect Shopify to review commerce permissions'
              : needsReauth
                ? `${permissions.missing.length} missing scope${permissions.missing.length === 1 ? '' : 's'}`
                : 'Based on scopes returned by Shopify'
          }
        />
        <StatusRow
          label="Commerce sync"
          value={!storeConnected ? 'Not applicable' : shopifySyncStatusLabel(syncRunStatus)}
          ok={storeConnected && syncRunStatus === 'succeeded'}
          tone={
            !storeConnected
              ? 'neutral'
              : shopifySyncStatusTone(syncRunStatus)
          }
          detail={
            !storeConnected
              ? 'Connect Shopify to sync commerce data'
              : syncRunStatus
                ? `${syncCounts.customer_identities} customers · ${syncCounts.products} products · ${syncCounts.orders} orders`
                : 'Run Sync now after permissions are granted'
          }
        />
      </Card>

      <ConfirmDialog
        open={confirmDisconnect}
        onClose={() => setConfirmDisconnect(false)}
        title={`Disconnect Shopify for ${activeStore?.name || 'this store'}?`}
        description="This uninstalls Inboxly from the Shopify store and clears the local Inboxly connection. Inboxly Audience data (contacts, tags, segments) will be preserved."
        confirmLabel="Disconnect"
        tone="danger"
        onConfirm={disconnectShopify}
      >
        {shopLabel ? <p className="mt-2 text-sm text-muted">Shop: {shopLabel}</p> : null}
      </ConfirmDialog>
    </div>
  )
}
