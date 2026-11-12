import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Cable, ExternalLink, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
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
import { startShopifyOAuth } from '../../lib/shopifyOAuth'
import {
  createShopifyOAuthReturnGate,
  hasHistoricalOrderAccess,
  resolveShopifyOAuthCallback,
  shopifyPermissionSummary,
} from '../../lib/shopifyScopes'
import { disconnectShopifyStore, storeStatusLabel, storeStatusTone } from '../../lib/storesApi'
import { getStorefrontIntegration } from '../../mock'
import { useActiveStore } from '../../store/useActiveStore'

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
  const initial = getStorefrontIntegration()
  const [integration, setIntegration] = useState(initial)
  const [checking, setChecking] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [disconnectFlash, setDisconnectFlash] = useState(null)
  const [oauthFlash, setOauthFlash] = useState(null)
  const oauthGateRef = useRef(createShopifyOAuthReturnGate())
  const selectedStoreIdRef = useRef(null)
  const { activeStore, stores, status, workspace, refreshStores } = useActiveStore()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    selectedStoreIdRef.current = activeStore?.id ?? null
  }, [activeStore?.id])

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
  const historicalOrders = hasHistoricalOrderAccess(activeStore)

  const embedOk = integration.appEmbedEnabled
  const trackingOk = integration.storefrontTracking === 'active'
  const formsOk = integration.signupFormsStatus === 'active'
  const popupOk = integration.popupStatus === 'active'

  const simulateEnable = () => {
    setChecking(true)
    window.setTimeout(() => {
      setIntegration((value) => ({
        ...value,
        appEmbedEnabled: true,
        storefrontTracking: 'active',
        signupFormsStatus: 'active',
        popupStatus: 'active',
        lastCheckedAt: new Date().toISOString(),
      }))
      setChecking(false)
    }, 900)
  }

  const simulateDisable = () => {
    setIntegration(initial)
  }

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

  const disconnectShopify = async () => {
    if (!storeConnected || !activeStore?.id || disconnecting) return
    const shopLabel = activeStore.shopify_shop_domain || activeStore.domain || activeStore.name
    const confirmed = window.confirm(
      [
        `Disconnect Shopify for ${activeStore.name}?`,
        '',
        'This uninstalls Inboxly from the Shopify store and clears the local Inboxly connection.',
        'Inboxly Audience data (contacts, tags, segments) will be preserved.',
        '',
        `Shop: ${shopLabel}`,
      ].join('\n'),
    )
    if (!confirmed) return

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
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Storefront integration"
        description="Connect a real Inboxly store to Shopify through OAuth."
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
                  onClick={disconnectShopify}
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
              <p className="mt-1 text-xs">
                The store stays connected. Reconnect Shopify and approve the missing scopes so
                Inboxly can sync commerce data in a later phase.
              </p>
              {permissions.missing.length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs">
                  {permissions.missing.map((scope) => (
                    <li key={scope.handle}>
                      <span className="font-medium">{scope.label}</span>
                      <span className="text-muted"> ({scope.handle})</span>
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

      {!embedOk ? (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-line bg-elevated px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-cantaloupe-ink" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-ink">App embed prototype</p>
              <p className="text-xs text-muted">
                Theme embed simulation only — it does not mean Shopify is connected. Use Connect
                Shopify above for the real OAuth flow.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                window.open(integration.themeEditorUrl, '_blank', 'noopener,noreferrer')
                simulateEnable()
              }}
            >
              Open theme editor
              <ExternalLink className="size-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={simulateEnable}>
              Mark embed done (local)
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-4 rounded-lg border border-line bg-elevated px-4 py-3 text-sm text-ink">
          App embed marked enabled locally. This prototype state is separate from Shopify OAuth.
        </div>
      )}

      <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">Connection health</h3>
            <p className="text-xs text-muted">Checked {formatDateTime(integration.lastCheckedAt)}</p>
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
              !storeConnected
                ? 'Not applicable'
                : needsReauth
                  ? 'Incomplete'
                  : 'Granted'
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
            label="App embed"
            value={embedOk ? 'Enabled (local)' : 'Disabled (local)'}
            ok={embedOk}
            detail="Prototype toggle only"
          />
          <StatusRow
            label="Storefront tracking"
            value={trackingOk ? 'Active (local)' : 'Inactive (local)'}
            ok={trackingOk}
            detail="Prototype status"
          />
          <StatusRow
            label="Signup forms"
            value={formsOk ? 'Active (local)' : 'Blocked (local)'}
            ok={formsOk}
            detail="Prototype status"
          />
          <StatusRow
            label="Popup forms"
            value={popupOk ? 'Active (local)' : 'Blocked (local)'}
            ok={popupOk}
            detail="Prototype status"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <Button variant="secondary" disabled={checking} onClick={simulateEnable}>
              {checking ? 'Checking…' : 'Simulate embed enabled'}
            </Button>
            <Button variant="ghost" onClick={simulateDisable}>
              Reset local prototype
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink">Local embed prototype</h3>
          <p className="mb-3 text-xs text-muted">
            Dawn theme references here are local UI only and do not imply a Shopify connection.
          </p>
          <div
            className={cn(
              'rounded-lg border p-4',
              embedOk ? 'border-success/40 bg-success/10' : 'border-line bg-midnight',
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Inboxly App embed</p>
              <Badge tone={embedOk ? 'success' : 'warning'}>{embedOk ? 'On' : 'Off'}</Badge>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={embedOk}
              aria-label="App embed mock toggle"
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                embedOk ? 'bg-electric' : 'bg-secondary',
              )}
              onClick={() => (embedOk ? simulateDisable() : simulateEnable())}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 size-5 rounded-full bg-ink transition-transform',
                  embedOk && 'translate-x-5',
                )}
              />
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
